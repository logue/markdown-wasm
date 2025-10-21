'use strict';

import init from './markdown.js';

/**
 * @typedef {import('../markdown').ParseOptions } ParseOptions
 * @typedef {import('../markdown').MarkdownModule } MarkdownModule
 */

/** @type {MarkdownModule} Markdown Wasm Module */
let Module;
/** @type {number} used by strFromUTF8Ptr as a temporary address-sized integer */
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
 * @returns {Promise<MarkdownModule>} Resolves when the wasm runtime is ready.
 */
export const ready = async () => {
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
 * @type {Record<string, number>}
 */
export const ParseFlags = {
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
 * @type {Record<string, number>}
 */
const OutputFlags = {
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
 * @param {string | Uint8Array} source Markdown source text.
 * @param {ParseOptions} [options] Parser options (partial override of defaults).
 * @returns {string | Uint8Array | null} HTML string (default), a transient Uint8Array (when bytes=true), or null on empty output.
 */
export function parse(source, options = {}) {
  if (!Module) {
    throw new Error(
      '[markdown-wasm] markdown-wasm does not initialized. Use `await ready();` before `parse()` function.'
    );
  }

  /** @type {import('../markdown').ParseOptions} Override default config */
  const opt = {
    // Defaults
    ...{
      allowJSURIs: false,
      verbatimEntities: true,
      parseFlags: ParseFlags.DEFAULT,
      xhtml: true,
      disableHeadlineAnchors: false,
      debug: false,
      bytes: false,
    },
    // Override options
    ...options,
  };

  /** @type {number} */
  let outputFlags = OutputFlags.SkipUtf8Bom;

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

  /** @type {number} */
  const onCodeBlockPtr = options.onCodeBlock
    ? createOnCodeBlockFunction(options.onCodeBlock)
    : 0;

  /** @type {Uint8Array} */
  const buf = as_byte_array(source);
  /** @type {Uint8Array} */
  const outbuf = withOutPtr(outptr =>
    withTmpBytePtr(buf, (inptr, inlen) =>
      Module._parseUTF8(
        inptr,
        inlen,
        opt.parseFlags,
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
 * Function's C type: JSTextFilterFun
 * (metaptr ptr, metalen ptr, inptr ptr, inlen ptr, outptr ptr) -> outlen int
 *
 * Interacting-with-code.html#calling-javascript-functions-as-function-pointers-from-c
 * @see {@link https://emscripten.org/docs/porting/connecting_cpp_and_javascript/}
 *
 * @param {Function} onCodeBlock
 * @return {number}
 */
/**
 * Wrap the user supplied onCodeBlock callback into a wasm-callable function pointer.
 * Ensures exceptions are caught and converted to a sentinel (-1) so that the C side
 * can gracefully fallback.
 *
 * @param {(lang: string, body: string) => (string|Uint8Array|null|undefined)} onCodeBlock
 * @returns {number} Function pointer registered in the wasm table.
 * @internal
 */
function createOnCodeBlockFunction(onCodeBlock) {
  const fnptr = Module.addFunction((metaptr, metalen, inptr, inlen, outptr) => {
    try {
      /** @type {string} lang is the "language" tag, if any, provided with the code block */
      const lang =
        metalen > 0
          ? new TextDecoder('utf-8').decode(
              Module.HEAPU8.subarray(metaptr, metaptr + metalen)
            )
          : '';

      /** @type {Uint8Array} body is a view into heap memory of the segment of source (UTF8 bytes) */
      const body = Module.HEAPU8.subarray(inptr, inptr + inlen);

      /** @type {string?} result from the onCodeBlock function */
      const result = onCodeBlock(lang, new TextDecoder('utf-8').decode(body));

      if (!result) {
        // Callback indicates that it does not wish to filter.
        // The md.c implementation will html-encode the body.
        return -1;
      }

      /** @type {Uint8Array} */
      const resbuf = as_byte_array(result);

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
          err.stack || err
        }`
      );
      return -1;
    }
  }, 'iiiiii');
  return fnptr;
}

/**
 * to Byte Array
 *
 * @param {Uint8Array | string | number[]} something
 *
 * @return {Uint8Array}
 */
/**
 * Normalize various input forms into a Uint8Array (UTF-8 for strings).
 * Accepts string | Uint8Array | number[] (treated as byte values).
 *
 * @param {Uint8Array | string | number[]} something
 * @returns {Uint8Array}
 * @internal
 */
function as_byte_array(something) {
  if (typeof something === 'string') {
    return new TextEncoder().encode(something);
  } else if (something instanceof Uint8Array) {
    return something;
  }
  return new Uint8Array(something);
}

/**
 * withOutPtr facilitates the following:
 * 1. calls fn with an address to memory that fits a pointer.
 *     fn(outptr) is expected to:
 *     a. Write some data into heap memory
 *     b. Write the address of that data at outptr (i.e. *outptr = heapaddr)
 *     c. Return the length of data written
 *
 *  2. withOutPtr reads the address from outptr
 *     a. If the address is 0 (NULL), returns null
 *     b. Else a slice of the heap memory is created, starting at *outptr
 *        and ending at ((*outptr) + length_returned_by_fn).
 *        A free() function is added to the buffer and it is returned.
 *
 *  It is important to free() the memory of the returned buffer when the caller is done.
 *  This is implementation specific, so this function can not help you with that.
 *
 *  The return type is as follows:
 *    interface HeapData extends Uint8Array {
 *      readonly heapAddr :number  // address in heap == *outptr
 *    }
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
 * @param {CallbackGlobal} fn
 * @return {Uint8Array}
 */
/**
 * Utility to interact with C functions that write data to a freshly allocated region
 * and return its length via direct return while placing the pointer at an out param.
 *
 * It temporarily reuses a single 4-byte heap slot (tmpPtr) allocated during init.
 *
 * @template T
 * @param {(outptr:number)=>number} fn Function that writes pointer (*outptr) and returns length
 * @returns {Uint8Array|null} View over wasm memory or null if pointer is 0.
 * @internal
 */
function withOutPtr(fn) {
  const len = fn(tmpPtr);
  const addr = Module.HEAP32[tmpPtr >> 2];
  if (addr === 0) {
    return null;
  }
  const buf = Module.HEAPU8.subarray(addr, addr + len);
  buf.heapAddr = addr;
  return buf;
}

/**
 * withTmpBytePtr takes an ArrayBuffer or Uint8Array and:
 * 1. copies it into the WASM module memory
 * 2. calls fn(pointer, size)
 * 3. calls free(pointer)
 *
 * @param {Uint8Array} buf
 * @param {Function} fn
 *
 * @return {number}
 */
/**
 * Copy a buffer into wasm memory (malloc), invoke callback, then free it.
 *
 * @param {Uint8Array} buf Source buffer
 * @param {(ptr:number,size:number)=>any} fn Callback receiving pointer & size
 * @returns {any} Return value of callback
 * @internal
 */
function withTmpBytePtr(buf, fn) {
  const size = buf.length;
  const ptr = mallocbuf(buf, size);
  const r = fn(ptr, size);
  Module._wfree(ptr);
  return r;
}

/**
 * mallocbuf allocates memory in the WASM heap and copies length bytes
 * from byteArray into the allocated location.
 * Returns the address to the allocated memory.
 *
 * @param {Uint8Array} byteArray
 * @param {number} length
 * @return {number}
 */
/**
 * Allocate `length` bytes and copy contents of `byteArray` into wasm memory.
 *
 * @param {Uint8Array} byteArray Source byte array
 * @param {number} length Number of bytes to copy (<= byteArray.length)
 * @returns {number} Pointer to allocated memory
 * @internal
 */
function mallocbuf(byteArray, length) {
  const offs = Module._wrealloc(0, length);
  Module.HEAPU8.set(byteArray, offs);
  return offs;
}

/**
 * WError represents an error from a wasm module
 */
class WError extends Error {
  /**
   * @constructor
   * @param {number} code
   * @param {string} message
   * @param {string} file
   * @param {number} line
   */
  constructor(code, message, file, line) {
    super(message, file || 'wasm', line || 0);
    this.name = 'WError';
    this.code = code;
  }
}

/**
 * Get & clear last WErr. Returns null if there was no error.
 * Uses a descriptive name so to help in stack traces.
 *
 * @return {WError | undefined}
 */
/**
 * Read last error from wasm (if any) and clear it.
 *
 * @returns {WError | undefined}
 * @internal
 */
function errorFromWasm() {
  /** @type {number} */
  const code = Module._WErrGetCode();
  if (code !== 0) {
    /** @type {string} */
    const msgptr = Module._WErrGetMsg();
    const message =
      msgptr === '' ? '' : Module.UTF8ArrayToString(Module.HEAPU8, msgptr);
    Module._WErrClear();
    return new WError(code, message);
  }
}

/** Error from wasm check */
/**
 * Throw if an error was reported by the wasm layer since last check.
 * @internal
 */
function werrCheck() {
  const err = errorFromWasm();
  if (err) {
    throw err;
  }
}
