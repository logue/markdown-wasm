#!/usr/bin/env node
import { stat, readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { TextDecoder } from 'node:util';

import Benchmark from 'benchmark';
import { Parser, HtmlRenderer } from 'commonmark';
import MarkdownIt from 'markdown-it';
import { parse as markdParse } from 'marked';
import { micromark } from 'micromark';
import { Remarkable } from 'remarkable';
import Showdown from 'showdown';

import { ready, parse, ParseFlags } from '../../src/index.js';

/** setup markdownit */
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

/** CSV output buffer */
const csvOutput = [];
/** Keep result output anchored to benchmark directory even when chdir'ing into samples. */
const benchmarkRootDir = process.cwd();

// parse CLI input
const filename = process.argv[2];
if (!filename) {
  console.error(`usage: bench.js <markdown-file>`);
  console.error(`usage: bench.js <dir-of-markdown-files>`);
  process.exit(1);
}

// Add CSV header
const csvHeader = csv(['library', 'file', 'ops/sec', 'filesize']);
console.log(csvHeader);
csvOutput.push(csvHeader);

const inputStat = await stat(filename);
if (inputStat.isDirectory()) {
  process.chdir(filename);
  const dir = await readdir('.');
  // run tests on all files in a directory or a single file
  for (const fn of dir) {
    const entryStat = await stat(fn);
    if (!entryStat.isFile()) {
      continue;
    }
    await benchmarkFile(fn);
  }
} else {
  await benchmarkFile(filename);
}

// Write CSV output to results/bench.csv
await writeBenchmarkResults();

// Benchmark.options.maxTime = 10

/**
 * toCSV
 *
 * @param {string[]} values
 * @return {string}
 */
function csv(values) {
  return values.map(s => String(s).replace(/,/g, '\\,')).join(',');
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

  return new Promise(resolve => {
    new Benchmark.Suite({
      onCycle(ev) {
        const b = ev.target;
        const csvLine = csv([b.name, benchfile, b.hz, contentsBuffer.length]);
        console.log(csvLine);
        csvOutput.push(csvLine);
      },
      onComplete() {
        resolve();
      },
    })
      .add('commonmark', () =>
        renderer.render(commonmarkParser.parse(contents))
      )
      .add('showdown', () => showdown.makeHtml(contents))
      .add('marked', () =>
        markdParse(contents, { mangle: false, headerIds: false })
      )
      .add('markdown-it', () => markdownit.render(contents))
      .add('remarkable', () => remarkable.render(contents))
      .add('micromark', () => micromark(contents))
      .add('markdown-wasm', () =>
        parse(contentsBuffer, { parseFlags: ParseFlags.DIALECT_COMMONMARK })
      )
      // .add('markdown-wasm/string', () => _parse(contents))
      // .add('markdown-wasm/bytes', () => _parse(contentsBuffer, { bytes: true })
      .run({ async: true });
  });
}

/**
 * Write benchmark results to CSV file
 */
async function writeBenchmarkResults() {
  try {
    const resultsDir = join(benchmarkRootDir, 'results');
    const csvPath = join(resultsDir, 'bench.csv');

    // Ensure results directory exists
    await mkdir(resultsDir, { recursive: true });

    // Write CSV content to file
    const csvContent = csvOutput.join('\n') + '\n';
    await writeFile(csvPath, csvContent, 'utf-8');

    console.log(`\nBenchmark results written to ${csvPath}`);
  } catch (error) {
    console.error('Error writing benchmark results:', error);
  }
}
