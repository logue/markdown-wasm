import { writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import spec from 'commonmark-spec';

import { parse, ready } from '../src/index.ts';
import { exit } from './testutil.js';

await ready();
// https://spec.commonmark.org
const source = spec.text;
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
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.9.0/github-markdown.min.css"
      integrity="sha512-Ouq1+UcR9ENXndFyd/YA9i+ETLJmX3WoaMBF/nDzdqJbipKGL/SAbkO+qjDoxfD/dhZs4ZqgR9vXkolrK77xmQ=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer" />
  </head>

  <body class="markdown-body" style="padding: 1rem;">
    ${html}
  </body>
</html>
`.trim();

writeFileSync(
  fileURLToPath(new URL('./spec.html', import.meta.url)),
  html,
  'utf8',
);

exit();
