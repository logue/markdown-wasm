import hljs from 'highlight.js';

import { ParseFlags, parse, ready } from '@/index';

const inputEl = document.getElementById(
  'markdown-input',
) as HTMLTextAreaElement | null;
const outputEl = document.getElementById(
  'html-output',
) as HTMLDivElement | null;

if (!inputEl || !outputEl) {
  throw new Error(
    'Demo elements not found: expected #markdown-input and #html-output',
  );
}

const textarea = inputEl;
const preview = outputEl;
const markdown = await ready();

let line: number = textarea.value.split('\n').length;
if (line <= 3) {
  line = 3;
}
textarea.rows = line + 1;

let hljsTimer: number | undefined;

function update() {
  const source = textarea.value;
  const html = parse(source, {
    parseFlags: ParseFlags.DEFAULT | ParseFlags.NO_HTML,
  });
  preview.innerHTML = html?.toString() ?? '';
  updateCodeHighlighting();
}

function updateCodeHighlighting() {
  if (hljsTimer !== undefined) {
    clearTimeout(hljsTimer);
  }

  hljsTimer = window.setTimeout(updateCodeHighlighting, 500);

  document
    .querySelectorAll('pre code[class^="language-"]')
    .forEach((element) => {
      hljs.highlightElement(element as HTMLElement);
    });
}

textarea.addEventListener('input', update);
update();

// load the markdown module to make it playable in the browser console
console.log('markdown module API:', markdown);

window.addEventListener('DOMContentLoaded', () => {
  let lineCount = textarea.value.split('\n').length;
  if (lineCount <= 3) {
    lineCount = 3;
  }

  textarea.setAttribute('rows', (lineCount + 1).toString());
  textarea.addEventListener('input', setTextareaHeight);

  function setTextareaHeight() {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
});
