import fs from 'node:fs/promises';
import path from 'node:path';

import { ready, parse, ParseFlags } from './index.js';

/**
 * Available HTML templates for wrapping markdown output
 */
export const templates = {
  default: (content, options = {}) => `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title || 'Document'}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.css" integrity="sha512-Hasfm7Iv5AG2/v5DSRXetpC33VjyPBXn5giooMag2EgSbiJ2Xp4GGvYGKSvc68SiJIflF/WrbDFdNmtlZHE5HA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>
  <article class="markdown-body">
    ${options.toc ? `<nav class="toc">${options.toc}</nav>` : ''}
    ${content}
  </article>
</body>
</html>`,

  minimal: content => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  ${content}
</body>
</html>`,

  plain: content => content,
};

/**
 * Extract headings from HTML content to generate a table of contents
 * @param {string} html - HTML content
 * @param {number} minLevel - Minimum heading level (2-6)
 * @param {number} maxLevel - Maximum heading level (2-6)
 * @returns {string} TOC HTML or empty string
 */
export function generateTableOfContents(html, minLevel = 2, maxLevel = 4) {
  const headingRegex = /<h([1-6])(?:\s[^>]*)?>(.+?)<\/h\1>/g;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    if (level >= minLevel && level <= maxLevel) {
      const text = match[2].replace(/<[^>]+>/g, ''); // Remove any HTML tags
      const id = `heading-${headings.length}`;
      headings.push({ level, text, id });
    }
  }

  if (headings.length === 0) {
    return '';
  }

  // Replace heading IDs in HTML
  let modifiedHtml = html;
  headings.forEach((h, i) => {
    const regex = new RegExp(
      `<h${h.level}([^>]*)>([^<]*${h.text.replace(/[.*+?^${}()|[\]\\]/g, '$&')}[^<]*)</h${h.level}>`,
      'i'
    );
    modifiedHtml = modifiedHtml.replace(regex, match => {
      return match.replace(`<h${h.level}`, `<h${h.level} id="${h.id}"`);
    });
  });

  // Generate TOC HTML
  let tocHtml = '<strong>TOC</strong><ul>';
  let currentLevel = minLevel;

  headings.forEach(h => {
    while (currentLevel < h.level) {
      tocHtml += '<ul>';
      currentLevel++;
    }
    while (currentLevel > h.level) {
      tocHtml += '</ul>';
      currentLevel--;
    }
    tocHtml += `<li><a href="#${h.id}">${h.text}</a></li>`;
  });

  tocHtml += '</ul>'.repeat(currentLevel - minLevel + 1);

  return { toc: tocHtml, html: modifiedHtml };
}

/**
 * Handle markdown conversion command
 */
export async function handleMarkdownConversion(input, options) {
  try {
    // Initialize the WebAssembly module
    await ready();

    let markdown;

    // Read from stdin if no input file provided
    if (!input) {
      // Read from stdin
      const chunks = [];
      process.stdin.setEncoding('utf-8');

      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }

      markdown = chunks.join('');
    } else {
      // Read from file
      const inputPath = path.resolve(input);
      markdown = await fs.readFile(inputPath, 'utf-8');
    }

    // Parse flags
    let parseFlags = ParseFlags.DEFAULT;

    // Allow HTML if specified
    if (!options.html) {
      parseFlags |= ParseFlags.NO_HTML_BLOCKS | ParseFlags.NO_HTML_SPANS;
    }

    // Convert markdown to HTML
    let html = parse(markdown, {
      parseFlags,
      verbatimEntities: true,
      xhtml: true,
    });

    // Generate table of contents if requested
    const tocMinLevel = parseInt(options.tocMin) || 2;
    const tocMaxLevel = parseInt(options.tocMax) || 4;
    let toc = '';
    if (tocMinLevel <= tocMaxLevel) {
      const result = generateTableOfContents(html, tocMinLevel, tocMaxLevel);
      if (result && result.toc) {
        html = result.html;
        toc = result.toc;
      }
    }

    // Select template
    const templateFn = templates[options.template] || templates.default;

    // Generate final HTML
    const title = input
      ? path.basename(input, path.extname(input))
      : 'Document';

    const finalHtml = templateFn(html, { title, toc: toc || undefined });

    // Output result
    if (options.output) {
      const outputPath = path.resolve(options.output);
      await fs.writeFile(outputPath, finalHtml, 'utf-8');
      console.log(`✓ Successfully converted to: ${outputPath}`);
    } else {
      // Output to stdout
      console.log(finalHtml);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Show available templates
 */
export async function showAvailableTemplates() {
  console.log('Available templates:\n');
  Object.keys(templates).forEach(name => {
    console.log(`  • ${name}`);
  });
  console.log(
    '\nUse with -t or --template option. Example: md2html input.md -t minimal'
  );
}
