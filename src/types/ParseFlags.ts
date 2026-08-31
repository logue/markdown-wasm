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

/** ParseFlag type */
export type ParseFlags = (typeof ParseFlags)[keyof typeof ParseFlags];
