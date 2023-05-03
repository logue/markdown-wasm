#!/usr/bin/env node
import Benchmark from 'benchmark';

import { Parser, HtmlRenderer } from 'commonmark';
import Showdown from 'showdown';
import { parse as markdParse } from 'marked';
import MarkdownIt from 'markdown-it';
import { Remarkable } from 'remarkable';
import { micromark } from 'micromark';
import { ready, parse, ParseFlags } from '../../src/index.js';

import { fileURLToPath, URL } from 'node:url';
import { stat, readdir, readFile, writeFile } from 'node:fs/promises';
import { TextDecoder } from 'node:util';
import process from 'node:process';

/** setup markdownit*/
const markdownit = new MarkdownIt('commonmark');
// const markdownit_encode = markdownit.utils.lib.mdurl.encode;
// markdownit.normalizeLink = url => markdownit_encode(url);
// disable expensive IDNa links encoding:
// markdownit.normalizeLinkText = str => str;

/** setup showdown */
const showdown = new Showdown.Converter();

/** setup commonmark */
const commonmarkParser = new Parser();
const renderer = new HtmlRenderer();

/** setup remarkable */
const remarkable = new Remarkable('commonmark');

/** Setup markdown-wasm */
await ready();

/** Decoder */
const decoder = new TextDecoder('utf-8');

// parse CLI input
const filename = process.argv[2];
if (!filename) {
  console.error(`usage: bench.js <markdown-file>`);
  console.error(`usage: bench.js <dir-of-markdown-files>`);
  process.exit(1);
}

/** @type {string[]} Result Buffer */
const buffer = [];

// print CSV header
console.log(csv(['library', 'file', 'ops/sec', 'filesize']));

const inputStat = await stat(filename);
if (inputStat.isDirectory()) {
  process.chdir(filename);
  // run tests on all files in a directory or a single file
  readdir('.').then(dir =>
    dir
      .forEach(async fn => await benchmarkFile(fn))
      .then(() =>
        writeFile(
          fileURLToPath(new URL(`./results/bench.csv`, import.meta.url)),
          buffer.join('\n'),
          'utf8'
        )
      )
  );
} else {
  await benchmarkFile(filename);
  await writeFile(
    fileURLToPath(new URL(`./results/bench-${filename}.csv`, import.meta.url)),
    buffer.join('\n'),
    'utf8'
  );
}

console.log('done.');
// Benchmark.options.maxTime = 10

/**
 * toCSV
 *
 * @param {string[]} values
 * @return {string}
 */
function csv(values) {
  const line = values.map(s => String(s).replace(/,/g, '\\,')).join(',');
  buffer.push(line);
  return line;
}

/**
 * Benchmark
 *
 * @param {string} benchfile
 */
async function benchmarkFile(benchfile) {
  /** @type {Uint8Array} */
  const contentsBuffer = await readFile(benchfile);
  /** @type {string} */
  const contents = decoder.decode(contentsBuffer);

  // let csvLinePrefix = `${benchfile.replace(/,/g, "\\,")},${
  //   contentsBuffer.length
  // },`;

  await new Benchmark.Suite({
    onCycle(ev) {
      const b = ev.target;
      // console.log("cycle", b)
      console.log(csv([b.name, benchfile, b.hz, contentsBuffer.length]));
    },
    // onComplete(ev) {
    //   let b = ev.target
    //   console.log("onComplete", {ev}, b.stats, b.times)
    // }
  })
    .add('commonmark', () => renderer.render(commonmarkParser.parse(contents)))
    .add('showdown', () => showdown.makeHtml(contents))
    .add('marked', () => markdParse(contents))
    .add('markdown-it', () => markdownit.render(contents))
    .add('remarkable', () => remarkable.render(contents))
    .add('micromark', () => micromark(contents))
    .add('markdown-wasm', () =>
      parse(contentsBuffer, { parseFlags: ParseFlags.DIALECT_COMMONMARK })
    )
    // .add('markdown-wasm/string', () => _parse(contents))
    // .add('markdown-wasm/bytes', () => _parse(contentsBuffer, { bytes: true })
    .run({ async: true });
}
