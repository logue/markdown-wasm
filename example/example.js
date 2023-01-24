import { ready, parse } from '../src/index.js';

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
// const md = require("../build/debug/markdown.node.js")

await ready();

const source = readFileSync(
  fileURLToPath(new URL('./example.md', import.meta.url))
);
const outbuf = parse(source, {
  bytes: true,
  onCodeBlock(lang, body) {
    console.log(`onCodeBlock (${lang})`);
    return html_escape(body.toString().toUpperCase());
  },
});
const outfile = fileURLToPath(new URL('./example.html', import.meta.url));
console.log('write', outfile);
writeFileSync(outfile, outbuf);

console.log(readFileSync(outfile, 'utf8'));

// mini benchmark
if (process.argv.includes('-bench')) {
  benchmark('bytes', {
    bytes: true,
  });
  benchmark('bytes + onCodeBlock', {
    bytes: true,
    onCodeBlock(lang, body) {
      return null; // causes the body to be HTML-escaped & included as is
    },
  });
}

function benchmark(name, options) {
  console.log(`benchmark start ${name} (sampling ~2s of data)`);
  const timeStart = Date.now();
  const N = 1000,
    T = 2000;
  let ntotal = 0;
  while (Date.now() - timeStart < 2000) {
    for (let i = 0; i < N; i++) {
      global['dont-optimize-away'] = parse(source, options);
    }
    ntotal += N;
  }
  const timeSpent = Date.now() - timeStart;
  console.log(
    `benchmark end ${name} -- avg parse time: ` +
      `${((timeSpent / ntotal) * 1000).toFixed(1)}us`
  );
}

function html_escape(str) {
  return str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag])
  );
}
