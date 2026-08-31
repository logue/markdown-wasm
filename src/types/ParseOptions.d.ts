import type { MarkdownOutput } from './MarkdownOutput';
import type { ParseFlags } from './ParseFlags';

/** Options for the parse function */
export type ParseOptions = {
  /** Customize parsing. Defaults to ParseFlags.DEFAULT */
  parseFlags?: ParseFlags | number;

  /** Enable Debug log. default is false */
  debug?: boolean;

  /** Use xhtml format. Default is true. */
  xhtml?: boolean;

  /** Output special characters as entity reference characters */
  verbatimEntities?: boolean;

  /** Allow "javascript:" in links */
  allowJSURIs?: boolean;

  /** Disable anchor tag in headlines. Defaults to `false` */
  disableHeadlineAnchors?: boolean;

  /**
   * bytes=true causes parse() to return the result as a Uint8Array instead of a string.
   *
   * The returned Uint8Array is only valid until the next call to parse().
   * If you need to keep the returned data around, call Uint8Array.slice() to make a copy,
   * as each call to parse() uses the same underlying memory.
   *
   * This only provides a performance benefit when you never need to convert the output
   * to a string. In most cases you're better off leaving this unset or false.
   */
  bytes?: boolean;

  /**
   * Optional callback invoked for every fenced code block.
   *
   * Parameters:
   *  - langname: The info string / language tag (empty string if none)
   *  - body: UTF-8 decoded string content of the code block (or raw bytes depending on internal implementation).
   *
   * Return value:
   *  - If you return a string or Uint8Array, it will be injected verbatim (NOT HTML-escaped) into output.
   *  - Return null/undefined/empty string to fall back to the default HTML-escaped rendering.
   *
   * Performance: Using this callback incurs a WASM ↔ JS boundary crossing per code block.
   */
  onCodeBlock?: (langname: string, body: string | Uint8Array) => MarkdownOutput;
};
