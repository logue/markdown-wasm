import { ready, parse } from '../../src/index.js';
import { exit } from '../testutil.js';

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

await ready();
// https://spec.commonmark.org
const source = readFileSync(
  fileURLToPath(new URL('./spec.txt', import.meta.url))
);
const timeLabel = `parse("spec.txt")`;
console.time(timeLabel);
let html = parse(source);
console.timeEnd(timeLabel);

html = `
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Markdown spec</title>
    <link
      href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.1.0/github-markdown.min.css"
      rel="stylesheet"
    />
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
