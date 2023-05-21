import { MarkdownModule } from './src/markdown.d.ts';

/** Load Markdown wasm */
export function ready(): Promise<MarkdownModule>;

type MarkdownOutput = Uint8Array | string | null;
/**
 * parse reads markdown source at s and converts it to HTML.
 * When output is a byte array, it will be a reference.
 *
 * @param source - markdown source text
 * @param options - parse options
 */
export function parse(
  source: string | Uint8Array,
  options?: Partial<ParseOptions>
): MarkdownOutput;

/** ParseFlag type */
export type ParseFlagsType = (typeof ParseFlags)[keyof typeof ParseFlags];

/** Options for the parse function */
export interface ParseOptions {
  /** Customize parsing. Defaults to ParseFlags.DEFAULT */
  parseFlags: ParseFlagsType | number;

  /** Enable Debug log. default is false */
  debug: boolean;

  /** Use xhtml format. Default is true. */
  xhtml: boolean;

  /** Output special characters as entity reference characters */
  verbatimEntities: boolean;

  /** Allow "javascript:" in links */
  allowJSURIs: boolean;

  /** Disable anchor tag in headlines. Defaults to `false` */
  disableHeadlineAnchors: boolean;

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
  bytes: boolean;

  /**
   * Optional callback which if provided is called for each code block.
   * langname holds the "language tag", if any, of the block.
   *
   * The returned value is inserted into the resulting HTML verbatim, without HTML escaping.
   * Thus, you should take care of properly escaping any special HTML characters.
   *
   * If the function returns null or undefined, or an exception occurs, the body will be
   * included as-is after going through HTML escaping.
   *
   * Note that use of this callback has an adverse impact on performance as it casues
   * calls and data to be bridged between WASM and JS on every invocation.
   */
  onCodeBlock: (langname: string, body: Uint8Array) => MarkdownOutput;
}

/** ParseFlags */
export declare const ParseFlags: {
  /** In TEXT, collapse non-trivial whitespace into single ' ' */
  readonly COLLAPSE_WHITESPACE: 0x0001;
  /** Do not require space in ATX headers ( ###header ) */
  readonly PERMISSIVE_ATX_HEADERS: 0x0002;
  /** Recognize URLs as links even without <...> */
  readonly PERMISSIVE_URL_AUTO_LINKS: 0x0004;
  /** Recognize e-mails as links even without <...> */
  readonly PERMISSIVE_EMAIL_AUTO_LINKS: 0x0008;
  /** Disable indented code blocks. (Only fenced code works) */
  readonly NO_INDENTED_CODE_BLOCKS: 0x0010;
  /** Disable raw HTML blocks. */
  readonly NO_HTML_BLOCKS: 0x0020;
  /** Disable raw HTML (inline). */
  readonly NO_HTML_SPANS: 0x0040;
  /** Enable tables extension. */
  readonly TABLES: 0x0100;
  /** Enable strikethrough extension. */
  readonly STRIKETHROUGH: 0x0200;
  /** Enable WWW autolinks (without proto; just 'www.') */
  readonly PERMISSIVE_WWW_AUTOLINKS: 0x0400;
  /** Enable task list extension. */
  readonly TASK_LISTS: 0x0800;
  /** Enable $ and $$ containing LaTeX equations. */
  readonly LATEX_MATH_SPANS: 0x1000;
  /** Enable wiki links extension. */
  readonly WIKI_LINKS: 0x2000;
  /** Enable underline extension (disables '_' for emphasis) */
  readonly UNDERLINE: 0x4000;

  readonly PERMISSIVE_AUTOLINKS: 0x0008 | 0x0004 | 0x400; // PERMISSIVE_EMAIL_AUTO_LINKS | PERMISSIVE_URL_AUTO_LINKS | PERMISSIVE_WWW_AUTOLINKS
  readonly NO_HTML: 0x0020 | 0x0040; // NO_HTML_BLOCKS | NO_HTML_SPANS

  /** Default flags */
  readonly DEFAULT: 0x0001 | 0x0002 | 0x0004 | 0x0200 | 0x0100 | 0x0800; //  COLLAPSE_WHITESPACE | PERMISSIVE_ATX_HEADERS | PERMISSIVE_URL_AUTO_LINKS | STRIKETHROUGH | TABLES | TASK_LISTS

  /* Convenient sets of flags corresponding to well-known Markdown dialects.
   *
   * Note we may only support subset of features of the referred dialect.
   * The constant just enables those extensions which bring us as close as
   * possible given what features we implement.
   *
   * ABI compatibility note: Meaning of these can change in time as new
   * extensions, bringing the dialect closer to the original, are implemented.
   */
  readonly DIALECT_COMMONMARK: 0;
  /** Github Style */
  readonly DIALECT_GITHUB: 0x0008 | 0x0004 | 0x400 | 0x0100 | 0x0200 | 0x0800; // PERMISSIVE_AUTO_LINKS | TABLES | STRIKETHROUGH | TASK_LISTS
};
