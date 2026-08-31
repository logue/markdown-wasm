#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import { program } from 'commander';

import {
  handleMarkdownConversion,
  showAvailableTemplates,
} from '../src/cli.ts';

interface PackageJson {
  version: string;
}

const pkg: PackageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf-8'),
);

program
  .name('md2html')
  .version(pkg.version)
  .description('Convert markdown to HTML using WebAssembly');

// Default command: convert markdown to HTML
program
  .argument('[input]', 'Input file path', undefined)
  .option('-o, --output <file>', 'Output file path')
  .option('-t, --template <name>', 'Template name', 'default')
  .option(
    '--toc-min <number>',
    'Minimum heading level to include in the table of contents',
    '2',
  )
  .option(
    '--toc-max <number>',
    'Maximum heading level to include in the table of contents',
    '4',
  )
  .option('--html', 'Allow HTML in the input', false)
  .action(handleMarkdownConversion);

// Show available templates
program
  .command('templates')
  .description('Show available templates')
  .action(showAvailableTemplates);

program.parse();
