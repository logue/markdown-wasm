#!/usr/bin/env node
import Benchmark from 'benchmark';

import { Parser, HtmlRenderer } from 'commonmark';
import Showdown from 'showdown';
import { parse } from 'marked';
import MarkdownIt from 'markdown-it';
import { Remarkable } from 'remarkable';
import { micromark } from 'micromark';
import { ready, parse as _parse } from '../../src/index.js';

import { statSync, readdirSync, readFileSync } from 'node:fs';

/** setup markdownit*/
const markdownit = new MarkdownIt();
const markdownit_encode = markdownit.utils.lib.mdurl.encode;
markdownit.normalizeLink = url => markdownit_encode(url);
// disable expensive IDNa links encoding:
markdownit.normalizeLinkText = str => str;

/** setup showdown */
const showdown = new Showdown.Converter();

/** setup commonmark */
const parser = new Parser();
const renderer = new HtmlRenderer();

/** setup remarkable */
const remarkable = new Remarkable();

/** Setup markdown-wasm */
await ready();

// parse CLI input
const filename = process.argv[2];
if (!filename) {
  console.error(`usage: bench.js <markdown-file>`);
  console.error(`usage: bench.js <dir-of-markdown-files>`);
  process.exit(1);
}

// print CSV header
console.log(csv(['library', 'file', 'ops/sec', 'filesize']));

// run tests on all files in a directory or a single file
if (statSync(filename).isDirectory()) {
  process.chdir(filename);
  for (let fn of readdirSync('.')) {
    benchmarkFile(fn);
  }
} else {
  benchmarkFile(filename);
}

// Benchmark.options.maxTime = 10

function csv(values) {
  return values.map(s => String(s).replace(/,/g, '\\,')).join(',');
}

function benchmarkFile(benchfile) {
  const contents = readFileSync(benchfile, 'utf8');
  const contentsBuffer = readFileSync(benchfile);

  // let csvLinePrefix = `${benchfile.replace(/,/g, "\\,")},${
  //   contentsBuffer.length
  // },`;

  new Benchmark.Suite({
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
    .add('commonmark', () => renderer.render(parser.parse(contents)))
    .add('showdown', () => showdown.makeHtml(contents))
    .add('marked', () => parse(contents))
    .add('markdown-it', () => markdownit.render(contents))
    .add('remarkable', () => remarkable.render(contents))
    .add('micromark', () => micromark(contents))
    .add('markdown-wasm', () => _parse(contentsBuffer))
    // .add('markdown-wasm/string', () => _parse(contents))
    // .add('markdown-wasm/bytes', () =>  _parse(contentsBuffer, { bytes: true })
    .run();
}
