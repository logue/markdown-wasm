import init from './markdown.js';

/** @type {import('../src/markdown').MarkdownModule} Markdown Wasm Module */
let Module;
/** @type {number} used by strFromUTF8Ptr as a temporary address-sized integer */
let tmpPtr = 0;

/** Initialize Markdown Wasm */
export const ready = async () => {
  Module = await init();

  Module.addOnPostRun(() => {
    tmpPtr = Module._wrealloc(0, 4);
  });

  return await Module.ready;
};

/** @type {Record<string, number>} - ParseFlags */
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

  /** Default flags */
  DEFAULT: 0x0001 | 0x0002 | 0x0004 | 0x0200 | 0x0100 | 0x0800,
  // COLLAPSE_WHITESPACE
  // PERMISSIVE_ATX_HEADERS
  // PERMISSIVE_URL_AUTO_LINKS
  // STRIKETHROUGH
  // TABLES
  // TASK_LISTS

  /** No HTML */
  NO_HTML: 0x0020 | 0x0040, // NO_HTML_BLOCKS | NO_HTML_SPANS

  /** Commonmark Comply */
  COMMONMARK: 0,
  /** Github Style */
  GITHUB: 0x0004 | 0x0100 | 0x0200 | 0x0800, // PERMISSIVE_URL_AUTO_LINKS | TABLES | STRIKETHROUGH | TASK_LISTS
};

/** @type {Record<string, number>} these should be in sync with "OutputFlags" in common.h */
const OutputFlags = {
  /** Output HTML */
  HTML: 1 << 0,
  /** Output XHTML (only has effect with HTML flag set)  */
  XHTML: 1 << 1,
  /** Allow "javascript:" URIs */
  AllowJSURI: 1 << 2,
  /** Disable anchor tag in headlines. */
  DisableHeadlineAnchors: 1 << 3,
};

/**
 * Parse markdown
 *
 * @param {string | Uint8Array} source - markdown text
 * @param {import('../markdown').ParseOptions} options - Parser options
 *
 * @return {string | Uint8Array | null}
 */
export function parse(source, options = {}) {
  if (!Module) {
    throw new Error(
      '[markdown-wasm] markdown-wasm does not initialized. Use `await ready();` before `parse()` function.'
    );
  }
  /** @type {number} */
  const parseFlags =
    options.parseFlags === undefined ? ParseFlags.DEFAULT : options.parseFlags;

  /** @type {number} */
  let outputFlags = options.allowJSURIs ? OutputFlags.AllowJSURI : 0;

  switch (options.format) {
    case 'xhtml':
      outputFlags |= OutputFlags.HTML | OutputFlags.XHTML;
      break;

    case 'html':
    case undefined:
    case null:
      outputFlags |= OutputFlags.HTML;
      break;

    default:
      throw new Error(`[markdown-wasm] invalid format "${options.format}"`);
  }

  if (options.disableHeadlineAnchors) {
    outputFlags |= OutputFlags.DisableHeadlineAnchors;
  }

  /** @type {number} */
  const onCodeBlockPtr = options.onCodeBlock
    ? create_onCodeBlock_fn(options.onCodeBlock)
    : 0;

  /** @type {Uint8Array} */
  const buf = as_byte_array(source);
  /** @type {Uint8Array} */
  const outbuf = withOutPtr(outptr =>
    withTmpBytePtr(buf, (inptr, inlen) =>
      Module._parseUTF8(
        inptr,
        inlen,
        parseFlags,
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
function create_onCodeBlock_fn(onCodeBlock) {
  const fnptr = Module.addFunction((metaptr, metalen, inptr, inlen, outptr) => {
    try {
      // lang is the "language" tag, if any, provided with the code block
      const lang =
        metalen > 0
          ? new TextDecoder('utf-8').decode(
              Module.HEAPU8.subarray(metaptr, metaptr + metalen)
            )
          : '';

      /** @type {Uint8Array} body is a view into heap memory of the segment of source (UTF8 bytes) */
      const body = Module.HEAPU8.subarray(inptr, inptr + inlen);

      /** result from the onCodeBlock function */
      const result = onCodeBlock(lang, new TextDecoder('utf-8').decode(body));

      if (result === null || result === undefined) {
        // Callback indicates that it does not wish to filter.
        // The md.c implementation will html-encode the body.
        return -1;
      }

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
 * @param {Function} fn
 *
 * @return {Uint8Array & {heapAddr: numer}}
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
function error_from_wasm() {
  /** @type {number} */
  const code = Module._WErrGetCode();
  if (code !== 0) {
    /** @type {string} */
    const msgptr = Module._WErrGetMsg();
    const message =
      msgptr !== '' ? Module.UTF8ArrayToString(Module.HEAPU8, msgptr) : '';
    Module._WErrClear();
    return new WError(code, message);
  }
}

function werrCheck() {
  const err = error_from_wasm();
  if (err) {
    throw err;
  }
}
