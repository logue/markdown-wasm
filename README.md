# @logue/markdown-wasm

[![jsdelivr CDN](https://data.jsdelivr.com/v1/package/npm/@logue/markdown-wasm/badge)](https://www.jsdelivr.com/package/npm/@logue/markdown-wasm)
[![NPM Downloads](https://img.shields.io/npm/dm/@logue/markdown-wasm.svg?style=flat)](https://www.npmjs.com/package/@logue/markdown-wasm)
[![Open in unpkg](https://img.shields.io/badge/Open%20in-unpkg-blue)](https://uiwjs.github.io/npm-unpkg/#/pkg/@logue/markdown-wasm/file/README.md)
[![npm version](https://img.shields.io/npm/v/@logue/markdown-wasm.svg)](https://www.npmjs.com/package/@logue/markdown-wasm)
[![Open in Gitpod](https://shields.io/badge/Open%20in-Gitpod-green?logo=Gitpod)](https://gitpod.io/#https://github.com/logue/@logue/markdown-wasm)
[![Twitter Follow](https://img.shields.io/twitter/follow/logue256?style=plastic)](https://twitter.com/logue256)

Very fast Markdown parser & HTML renderer implemented in WebAssembly

- Zero dependencies (47.46 kB gzipped without minify.)
- Portable & safe (WASM executes in isolated memory and can run almost anywhere)
- [Simple API](#api)
- [Very fast](#benchmarks)
- Based on [md4c](http://github.com/mity/md4c) — compliant to the CommonMark specification

Notice: This fork replaces md4c to `0.4.8`, and some options are available. It also works with nested lists that didn't parse properly in the original.

## Install

```sh
yarn add markdown-wasm
```

## Examples

ES module with WASM loaded separately

```js
import { ready, parse } from './dist/markdown.es.js';
await ready();
console.log(parse('# hello\n*world*'));
```

CDN Usage. The entry point is `markdown`.

```html
<script
  src="https://cdn.jsdelivr.net/npm/@logue/markdown-wasm@latest/dist/markdown.iife.js"
  crossorigin="anonymous"
></script>
<script>
  await markdown.ready();
  console.log(markdown.parse('# hello\n*world*'));
</script>
```

## API

```ts
/* eslint-disable spaced-comment */
/// <reference types="emscripten" />

import { MarkdownModule } from './src/markdown';

/** Load Markdown wasm */
export function ready(): Promise<MarkdownModule>;

/**
 * parse reads markdown source at s and converts it to HTML.
 * When output is a byte array, it will be a reference.
 *
 * @param source - markdown source text
 * @param options - parse options
 */
export function parse(
  source: string | Uint8Array,
  options?: ParseOptions
): Uint8Array | string | null;

/** ParseFlag type */
export type ParseFlagsType = (typeof ParseFlags)[keyof typeof ParseFlags];

/** Options for the parse function */
export interface ParseOptions {
  /** Customize parsing. Defaults to ParseFlags.DEFAULT */
  parseFlags?: ParseFlagsType | number;

  /** Select output format. Defaults to "html" */
  format?: 'html' | 'xhtml';

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

  /** Allow "javascript:" in links */
  allowJSURIs?: boolean;

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
  onCodeBlock?: (
    langname: string,
    body: Uint8Array
  ) => Uint8Array | string | null;

  /** Disable anchor tag in headlines. Defaults to `false` */
  disableHeadlineAnchors?: boolean;
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

  /** Default flags */
  readonly DEFAULT: 0x0001 | 0x0002 | 0x0004 | 0x0200 | 0x0100 | 0x0800;
  // COLLAPSE_WHITESPACE
  // PERMISSIVE_ATX_HEADERS
  // PERMISSIVE_URL_AUTO_LINKS
  // STRIKETHROUGH
  // TABLES
  // TASK_LISTS

  /** No HTML */
  readonly NO_HTML: 0x0020 | 0x0040; // NO_HTML_BLOCKS | NO_HTML_SPANS

  /** Commonmark Comply */
  readonly COMMONMARK: 0x0000;
  /** Github Style */
  readonly GITHUB: 0x0004 | 0x0100 | 0x0200 | 0x0800; // PERMISSIVE_URL_AUTO_LINKS | TABLES | STRIKETHROUGH | TASK_LISTS
};
```

See [`markdown.d.ts`](markdown.d.ts)

## Building from source

Install latest emscripten to your environment.

```sh
yarn install
yarn build-wasm
yarn build-bundle
```

## Benchmarks

The [`test/benchmark`](test/benchmark) directory contain a benchmark suite which you can
run yourself. It tests a few popular markdown parser-renderers by parsing & rendering a bunch
of different sample markdown files.

### Test Environments

Core i7 13700K 4.75 GHz running on Windows 11 22H2, NodeJS v20.5.1

| Name                                                      | Version |
| --------------------------------------------------------- | ------- |
| [commonmark](https://github.com/commonmark/commonmark.js) | 0.30.0  |
| [markdown-it](https://github.com/markdown-it/markdown-it) | 13.0.1  |
| [marked](https://github.com/markedjs/marked)              | 7.0.4   |
| [micromark](https://github.com/micromark/micromark)       | 4.0.0   |
| [remarkable](https://github.com/jonschlinkert/remarkable) | 2.0.1   |
| [showdown](https://github.com/showdownjs/showdown)        | 2.1.0   |

### Average ops/second

Ops/second represents how many times a library is able to parse markdown and render HTML
during a second, on average across all sample files.

![Average ops/second](test/benchmark/results/avg-ops-per-sec.svg)

### Average throughput

Throughput is the average amount of markdown data processed during a second while both parsing
and rendering to HTML. The statistics does not include HTML generated but only bytes of markdown
source text parsed.

![Average throughput](test/benchmark/results/avg-throughput.svg)

### Min–max parse time

This graph shows the spread between the fastest and slowest parse-and-render operations
for each library. Lower numbers are better.

![Min–max parse time](test/benchmark/results/minmax-parse-time.svg)

See [`test/benchmark`](test/benchmark#readme) for more information.

## See Also

- [vue-markdown-wasm](https://github.com/logue/vue-markdown-wasm) - Markdown-wasm for Vue2 and 3 component.

## License

[LICENSE](LICENSE)

Copyright (c)
2019-2020 Rasmus Andersson <https://rsms.me/>
2023 Logue <https://logue.dev/>
