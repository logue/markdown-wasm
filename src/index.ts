import init from './markdown.js';

import type { MarkdownModule, ParseOptions } from '../markdown.js';

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
  Module = await init();

  Module.addOnPostRun(() => {
    tmpPtr = Module._wrealloc(0, 4);
  });

  return await Module.ready;
};

/**
 * Bit flags controlling markdown parsing features.
 * Can be OR-ed together and passed as {@link ParseOptions.parseFlags}.
 * Dialect presets (DIALECT_*) are provided for convenience.
 *
 * NOTE: Changing flags affects performance (extra feature logic) and output semantics.
 * Keep the DEFAULT set unless you explicitly need extra extensions.
 */
export const ParseFlags: Record<string, number> = {
  /** In TEXT, collapse non-trivial whitespace into single ' ' */
  COLLAPSE_WHITESPACE: 0x0001,
  /** Do not require space in ATX headers ( ###header ) */
  PERMISSIVE_ATX_HEADERS: 0x0002,
  /** Recognize URLs as links even without <...> */
  PERMISSIVE_URL_AUTO_LINKS: 0x0004,
  /** Recognize e-mails as links even without <...> */
  PERMISSIVE_EMAIL_AUTO_LINKS: 0x0008,
  /** Disable indented code blocks. (Only fenced code works) */
  NO_INDENTED_CODE_BLOCKS: 0x0010,
  /** Disable raw HTML blocks. */
  NO_HTML_BLOCKS: 0x0020,
  /** Disable raw HTML (inline). */
  NO_HTML_SPANS: 0x0040,
  /** Enable tables extension. */
  TABLES: 0x0100,
  /** Enable strikethrough extension. */
  STRIKETHROUGH: 0x0200,
  /** Enable WWW autolinks (without proto; just 'www.') */
  PERMISSIVE_WWW_AUTOLINKS: 0x0400,
  /** Enable task list extension. */
  TASK_LISTS: 0x0800,
  /** Enable $ and $$ containing LaTeX equations. */
  LATEX_MATH_SPANS: 0x1000,
  /** Enable wiki links extension. */
  WIKI_LINKS: 0x2000,
  /** Enable underline extension (disables '_' for emphasis) */
  UNDERLINE: 0x4000,

  PERMISSIVE_AUTOLINKS: 0x0008 | 0x0004 | 0x400, // PERMISSIVE_EMAIL_AUTO_LINKS | PERMISSIVE_URL_AUTO_LINKS | PERMISSIVE_WWW_AUTOLINKS
  NO_HTML: 0x0020 | 0x0040, // NO_HTML_BLOCKS | NO_HTML_SPANS

  /** Default flags */
  DEFAULT: 0x0001 | 0x0002 | 0x0004 | 0x0200 | 0x0100 | 0x0800, //  COLLAPSE_WHITESPACE | PERMISSIVE_ATX_HEADERS | PERMISSIVE_URL_AUTO_LINKS | STRIKETHROUGH | TABLES | TASK_LISTS

  /* Convenient sets of flags corresponding to well-known Markdown dialects.
   *
   * Note we may only support subset of features of the referred dialect.
   * The constant just enables those extensions which bring us as close as
   * possible given what features we implement.
   *
   * ABI compatibility note: Meaning of these can change in time as new
   * extensions, bringing the dialect closer to the original, are implemented.
   */
  DIALECT_COMMONMARK: 0,
  /** Github Style */
  DIALECT_GITHUB: 0x0008 | 0x0004 | 0x400 | 0x0100 | 0x0200 | 0x0800, // PERMISSIVE_AUTO_LINKS | TABLES | STRIKETHROUGH | TASK_LISTS
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

/** A view into wasm heap memory returned by {@link withOutPtr}. */
type HeapData = Uint8Array & { heapAddr: number };

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
  options: Partial<ParseOptions> = {}
): string | Uint8Array | null {
  if (!Module) {
    throw new Error(
      '[markdown-wasm] markdown-wasm does not initialized. Use `await ready();` before `parse()` function.'
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

  const onCodeBlockPtr: number = options.onCodeBlock
    ? createOnCodeBlockFunction(options.onCodeBlock)
    : 0;

  const buf: Uint8Array = as_byte_array(source);
  const outbuf: HeapData | null = withOutPtr(outptr =>
    withTmpBytePtr(buf, (inptr, inlen) =>
      Module._parseUTF8(
        inptr,
        inlen,
        opt.parseFlags ?? ParseFlags.DEFAULT,
        outputFlags,
        outptr,
        onCodeBlockPtr
      )
    )
  );

  if (options.onCodeBlock) {
    Module.removeFunction(onCodeBlockPtr);
  }

  // check for error and throw if needed
  werrCheck();

  if (!outbuf) {
    return null;
  }

  return options.bytes ? outbuf : new TextDecoder('utf-8').decode(outbuf);
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
  onCodeBlock: NonNullable<ParseOptions['onCodeBlock']>
): number {
  const fnptr = Module.addFunction(
    (
      metaptr: number,
      metalen: number,
      inptr: number,
      inlen: number,
      outptr: number
    ): number => {
      try {
        /** lang is the "language" tag, if any, provided with the code block */
        const lang: string =
          metalen > 0
            ? new TextDecoder('utf-8').decode(
                Module.HEAPU8.subarray(metaptr, metaptr + metalen)
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
      } catch (err) {
        console.error(
          `[markdown-wasm] error in markdown onCodeBlock callback: ${
            err instanceof Error ? err.stack : err
          }`
        );
        return -1;
      }
    },
    'iiiiii'
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
  fn: (ptr: number, size: number) => T
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
