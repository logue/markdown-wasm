import type { MarkdownModule } from '@/generated/markdown';
import init from '@/generated/markdown.js';
import type { HeapData } from '@/types/HeapData';
import type { MarkdownOutput } from '@/types/MarkdownOutput';
import { ParseFlags } from '@/types/ParseFlags';
import type { ParseOptions } from '@/types/ParseOptions';

export { type MarkdownModule, ParseFlags };

/** Markdown Wasm Module */
let Module: MarkdownModule;
/** used by withOutPtr as a temporary address-sized integer */
let tmpPtr = 0;

/**
 * Initialize the underlying WebAssembly module.
 *
 * This MUST be awaited before calling {@link parse}. Subsequent calls are cheap and
 * will return the same readiness promise once initialization has started.
 *
 * Lifecycle:
 *  - Loads and instantiates the wasm binary (network or file system depending on env)
 *  - Allocates a small scratch pointer used by helper functions
 *
 * @example
 * import { ready, parse } from '@logue/markdown-wasm';
 * await ready();
 * const html = parse('# Hello');
 *
 * @returns Resolves when the wasm runtime is ready.
 */
export const ready = async (): Promise<MarkdownModule> => {
  const initWithOptions = init as (
    moduleArg?: Record<string, unknown>,
  ) => Promise<MarkdownModule>;

  Module = await initWithOptions({
    locateFile: (filename: string) => {
      if (filename === 'markdown.wasm') {
        return new URL(`./generated/${filename}`, import.meta.url).href;
      }
      return filename;
    },
  });

  Module.addOnPostRun(() => {
    tmpPtr = Module._wrealloc(0, 4);
  });

  return await Module.ready;
};

/**
 * Internal output flags (not exported) mapped to the C side. They influence renderer
 * behavior such as XHTML formatting and entity escaping. Maintained in sync with
 * common.h (OutputFlags enum). Modifying these requires a corresponding C update.
 */
const OutputFlags: Record<string, number> = {
  /** Output DebugLog */
  Debug: 1 << 0,
  /** Use entity reference character */
  VerbatimEntities: 1 << 1,
  /** Remove UTF-8 BOM */
  SkipUtf8Bom: 1 << 2,
  /** Output XHTML (only has effect with HTML flag set)  */
  XHTML: 1 << 3,
  /** Allow "javascript:" URIs */
  AllowJSURI: 1 << 4,
  /** Disable anchor tag in headlines. */
  DisableHeadlineAnchors: 1 << 5,
};

/**
 * Convert a markdown string (or UTF-8 byte array) into HTML.
 *
 * Thread-safety: The underlying wasm instance is single-threaded. Avoid calling parse
 * concurrently from multiple workers sharing the same module without external locking.
 *
 * Memory: When `options.bytes=true`, the returned Uint8Array references wasm memory and
 * becomes invalid after the next parse call. Copy it (e.g. `out.slice()`) if you need to
 * retain it.
 *
 * Error Handling: Throws if the module is not initialized or if the wasm layer reports
 * an internal error (exposed as WError).
 *
 * @param source Markdown source text.
 * @param options Parser options (partial override of defaults).
 * @returns HTML string (default), a transient Uint8Array (when bytes=true), or null on empty output.
 */
export function parse(
  source: string | Uint8Array,
  options?: Partial<ParseOptions>,
): MarkdownOutput {
  if (!Module) {
    throw new Error(
      '[markdown-wasm] markdown-wasm does not initialized. Use `await ready();` before `parse()` function.',
    );
  }

  // Defaults, overridden by caller-supplied options
  const opt: ParseOptions = {
    allowJSURIs: false,
    verbatimEntities: true,
    parseFlags: ParseFlags.DEFAULT,
    xhtml: true,
    disableHeadlineAnchors: false,
    debug: false,
    bytes: false,
    ...options,
  };

  let outputFlags: number = OutputFlags.SkipUtf8Bom;

  // Allow javascript Uri
  outputFlags |= opt.allowJSURIs ? OutputFlags.AllowJSURI : 0;

  // Output special characters as entity reference characters
  outputFlags |= opt.verbatimEntities ? OutputFlags.VerbatimEntities : 0;

  // Output as Xhtml
  outputFlags |= opt.xhtml === true ? OutputFlags.XHTML : 0;

  // Disable headline anchors
  outputFlags |= opt.disableHeadlineAnchors
    ? OutputFlags.DisableHeadlineAnchors
    : 0;

  let outbuf: HeapData | undefined;
  const buf: Uint8Array = as_byte_array(source);

  if (options?.onCodeBlock) {
    const onCodeBlockPtr = createOnCodeBlockFunction(options.onCodeBlock);
    outbuf = withOutPtr((outptr) =>
      withTmpBytePtr(buf, (inptr, inlen) =>
        Module._parseUTF8(
          inptr,
          inlen,
          opt.parseFlags ?? ParseFlags.DEFAULT,
          outputFlags,
          outptr,
          onCodeBlockPtr,
        ),
      ),
    );

    Module.removeFunction(onCodeBlockPtr);
  } else {
    outbuf = withOutPtr((outptr) =>
      withTmpBytePtr(buf, (inptr, inlen) =>
        Module._parseUTF8(
          inptr,
          inlen,
          opt.parseFlags ?? ParseFlags.DEFAULT,
          outputFlags,
          outptr,
          0,
        ),
      ),
    );
  }

  // check for error and throw if needed
  werrCheck();

  if (!outbuf) {
    return null;
  }

  return options?.bytes ? outbuf : new TextDecoder('utf-8').decode(outbuf);
}

/**
 * Wrap the user supplied onCodeBlock callback into a wasm-callable function pointer.
 * Ensures exceptions are caught and converted to a sentinel (-1) so that the C side
 * can gracefully fallback.
 *
 * Function's C type: JSTextFilterFun
 * (metaptr ptr, metalen ptr, inptr ptr, inlen ptr, outptr ptr) -> outlen int
 *
 * @see {@link https://emscripten.org/docs/porting/connecting_cpp_and_javascript/ Interacting with code}
 *
 * @param onCodeBlock user supplied callback
 * @returns Function pointer registered in the wasm table.
 * @internal
 */
function createOnCodeBlockFunction(
  onCodeBlock: NonNullable<ParseOptions['onCodeBlock']>,
): number {
  const fnptr = Module.addFunction(
    (
      metaptr: number,
      metalen: number,
      inptr: number,
      inlen: number,
      outptr: number,
    ): number => {
      try {
        /** lang is the "language" tag, if any, provided with the code block */
        const lang: string =
          metalen > 0
            ? new TextDecoder('utf-8').decode(
                Module.HEAPU8.subarray(metaptr, metaptr + metalen),
              )
            : '';

        /** body is a view into heap memory of the segment of source (UTF8 bytes) */
        const body = Module.HEAPU8.subarray(inptr, inptr + inlen);

        /** result from the onCodeBlock function */
        const result = onCodeBlock(lang, new TextDecoder('utf-8').decode(body));

        if (!result) {
          // Callback indicates that it does not wish to filter.
          // The md.c implementation will html-encode the body.
          return -1;
        }

        const resbuf: Uint8Array = as_byte_array(result);

        if (resbuf.length > 0) {
          // copy resbuf to WASM heap memory
          const resptr = mallocbuf(resbuf, resbuf.length);
          // write pointer value
          Module.HEAPU32[outptr >> 2 /* == outptr / 4 */] = resptr;
          // Note: fmt_html.c calls free(resptr)
        }

        return resbuf.length;
      } catch (error) {
        console.error(
          `[markdown-wasm] error in markdown onCodeBlock callback: ${
            error instanceof Error ? error.stack : error
          }`,
        );
        return -1;
      }
    },
    'iiiiii',
  );
  return fnptr;
}

/**
 * Normalize various input forms into a Uint8Array (UTF-8 for strings).
 * Accepts string | Uint8Array | number[] (treated as byte values).
 *
 * @param something value to convert
 * @internal
 */
function as_byte_array(something: Uint8Array | string | number[]): Uint8Array {
  if (typeof something === 'string') {
    return new TextEncoder().encode(something);
  } else if (something instanceof Uint8Array) {
    return something;
  }
  return new Uint8Array(something);
}

/**
 * Utility to interact with C functions that write data to a freshly allocated region
 * and return its length via direct return while placing the pointer at an out param.
 *
 * It temporarily reuses a single 4-byte heap slot (tmpPtr) allocated during init.
 *
 * @example
 *    // WASM module, in C:
 *    typedef struct Color_ { char r, g, b; } Color;
 *    size_t newColor(const Color** outp) {
 *      Color* c = (Color*)malloc(sizeof(Color));
 *      c->r = 0xFF;
 *      c->g = 0xCA;
 *      c->b = 0x0;
 *      *outp = c;
 *      return sizeof(Color);
 *    }
 *    void freeColor(const Color* p) {
 *      free(p);
 *   }
 *
 *    // JavaScript
 *    let color = withOutPtr(_newColor)
 *    console.log("RGB:", color[0], color[1], color[2])
 *   _freeColor(color.heapAddr)
 *
 * @param fn Function that writes pointer (*outptr) and returns length
 * @returns View over wasm memory or null if pointer is 0.
 * @internal
 */
function withOutPtr(fn: (outptr: number) => number): HeapData | null {
  const len = fn(tmpPtr);
  const addr = Module.HEAP32[tmpPtr >> 2];
  if (addr === 0) {
    return null;
  }
  const buf = Module.HEAPU8.subarray(addr, addr + len) as HeapData;
  buf.heapAddr = addr;
  return buf;
}

/**
 * Copy a buffer into wasm memory (malloc), invoke callback, then free it.
 *
 * @param buf Source buffer
 * @param fn Callback receiving pointer & size
 * @returns Return value of callback
 * @internal
 */
function withTmpBytePtr<T>(
  buf: Uint8Array,
  fn: (ptr: number, size: number) => T,
): T {
  const size = buf.length;
  const ptr = mallocbuf(buf, size);
  const r = fn(ptr, size);
  Module._wfree(ptr);
  return r;
}

/**
 * Allocate `length` bytes and copy contents of `byteArray` into wasm memory.
 *
 * @param byteArray Source byte array
 * @param length Number of bytes to copy (<= byteArray.length)
 * @returns Pointer to allocated memory
 * @internal
 */
function mallocbuf(byteArray: Uint8Array, length: number): number {
  const offs = Module._wrealloc(0, length);
  Module.HEAPU8.set(byteArray, offs);
  return offs;
}

/**
 * WError represents an error from a wasm module
 */
class WError extends Error {
  code: number;

  constructor(code: number, message?: string) {
    super(message);
    this.name = 'WError';
    this.code = code;
  }
}

/**
 * Read last error from wasm (if any) and clear it.
 *
 * @internal
 */
function errorFromWasm(): WError | undefined {
  const code = Module._WErrGetCode();
  if (code !== 0) {
    const msgptr = Module._WErrGetMsg();
    const message =
      msgptr === 0 ? '' : Module.UTF8ArrayToString(Module.HEAPU8, msgptr);
    Module._WErrClear();
    return new WError(code, message);
  }
}

/**
 * Throw if an error was reported by the wasm layer since last check.
 * @internal
 */
function werrCheck(): void {
  const err = errorFromWasm();
  if (err) {
    throw err;
  }
}
