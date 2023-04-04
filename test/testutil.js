/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

import { ready, parse } from '../src/index.js';

import { basename } from 'node:path';
import process from 'node:process';
/**
 * @typedef {import('../markdown').ParseOptions } ParseOptions
 */

await ready();

const line = '——————————————————————————————————————————————————';
const wave = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~';

let numFailures = 0;
/**
 * markdown test
 *
 * @param {string} name - test name
 * @param {string | Uint8Array} inputData - input data
 * @param {string | Uint8Array} expectedOutputData - compare data
 * @param {ParseOptions} options - options
 * @return {void}
 */
export function checkHTMLResult(
  name,
  inputData,
  expectedOutputData,
  options = {}
) {
  if (typeof inputData == 'string') {
    inputData = Buffer.from(inputData, 'utf8');
  }
  if (typeof expectedOutputData == 'string') {
    expectedOutputData = Buffer.from(expectedOutputData, 'utf8');
  }
  const actual = Buffer.from(parse(inputData, { bytes: true, ...options }));
  if (expectedOutputData.compare(actual) == 0) {
    log(`${name} OK`);
    return true;
  }
  numFailures++;
  logerr(`${name} FAIL`);
  console.error(`\n\nExpected output:\n${line}\n`);
  inspectBuf(expectedOutputData, actual);
  console.error(`${line}\n\nActual output:\n${line}\n`);
  inspectBuf(actual, expectedOutputData);
  console.error(line);
}

/**
 *
 */
export function exit() {
  process.exit(numFailures > 0 ? 1 : 0);
}

const _log = log;
export { _log as log };
const _logerr = logerr;
export { _logerr as logerr };

const logprefix = basename(process.argv[1]) + ':';

/** Output Log */
function log() {
  console.log.apply(console, [logprefix].concat([].slice.call(arguments)));
}
/** Output Error log */
function logerr() {
  console.error.apply(console, [logprefix].concat([].slice.call(arguments)));
}

const _inspectBuf = inspectBuf;
export { _inspectBuf as inspectBuf };

/**
 *
 * @param {*} buf
 * @param {*} otherbuf
 */
function inspectBuf(buf, otherbuf) {
  process.stderr.write(buf);
  if (buf[buf.length - 1] != 0x0a) {
    process.stderr.write('<no-ending-line-break>\n');
  }
  console.error(wave);
  const styleReset = '\x1b[22;39m';
  const styleNone = s => s;
  const styleDiff = process.stderr.isTTY
    ? s => '\x1b[1;33m' + s + styleReset
    : styleNone;
  const styleErr = process.stderr.isTTY
    ? s => '\x1b[1;31m' + s + styleReset
    : styleNone;

  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];

    let style = styleNone;
    if (b < 0x20 && b != 0x09 && b != 0x0a && b != 0x0d) {
      // byte is unexpected control character (except TAB, CR, LF)
      style = styleErr;
    } else if (otherbuf && otherbuf[i] != b) {
      style = styleDiff;
    }

    process.stderr.write(style(b.toString(16).padStart(2, '0')) + ' ');

    if (b == 0x0a) {
      process.stderr.write('\n');
    }
  }
}
