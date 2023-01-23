import { ready, parse } from '../../dist/markdown.es.js';
import { exit } from '../testutil.js';

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

await ready();
// https://spec.commonmark.org
const source = readFileSync(
  fileURLToPath(new URL('./spec.txt', import.meta.url))
);
const timeLabel = `markdown.parse("spec.txt")`;
console.time(timeLabel);
let html = parse(source);
console.timeEnd(timeLabel);

html = `
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Markdown spec</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css" integrity="sha512-KUoB3bZ1XRBYj1QcH4BHCQjurAZnCO3WdrswyLDtp7BMwCw7dPZngSLqILf68SGgvnWHTD5pPaYrXi6wiRJ65g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  </head>

  <body class="markdown-body" style="padding: 1rem;">
    ${html}
  </body>
</html>
`.trim();

writeFileSync(
  fileURLToPath(new URL('./spec.html', import.meta.url)),
  html,
  'utf8'
);

exit();
