import { describe, it, expect, beforeAll } from 'vitest';

import { generateTableOfContents, templates } from '../cli.js';
import { ready } from '../index.js';

// Initialize WASM module
beforeAll(async () => {
  await ready();
});

describe('generateTableOfContents', () => {
  it('should generate TOC from HTML headings', () => {
    const html = `
      <h1>Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection</h3>
      <h2>Section 2</h2>
    `;
    const result = generateTableOfContents(html, 1, 3);

    expect(result).toBeDefined();
    expect(result.toc).toBeDefined();
    expect(result.html).toBeDefined();
    expect(result.toc).toContain('Title');
    expect(result.toc).toContain('Section 1');
    expect(result.toc).toContain('Subsection');
    expect(result.toc).toContain('Section 2');
  });

  it('should filter headings by level', () => {
    const html = `
      <h1>Title</h1>
      <h2>Section 1</h2>
      <h3>Subsection</h3>
    `;
    const result = generateTableOfContents(html, 2, 2);

    expect(result.toc).toContain('Section 1');
    expect(result.toc).not.toContain('Title');
    expect(result.toc).not.toContain('Subsection');
  });

  it('should return empty string if no headings match', () => {
    const html = '<p>No headings here</p>';
    const result = generateTableOfContents(html, 2, 4);

    expect(result).toBe('');
  });

  it('should strip HTML tags from heading text', () => {
    const html = '<h2><a id="test">Section <strong>Bold</strong></a></h2>';
    const result = generateTableOfContents(html, 2, 4);

    expect(result.toc).toContain('Section Bold');
    // TOC ヘッダーには <strong>TOC</strong> が含まれるため、見出しのテキストには タグなしになることを確認
    expect(result.toc).not.toContain('Section <strong>');
  });

  it('should add IDs to headings', () => {
    const html = '<h2>Section 1</h2><h2>Section 2</h2>';
    const result = generateTableOfContents(html, 2, 4);

    expect(result.html).toContain('id="heading-0"');
    expect(result.html).toContain('id="heading-1"');
  });

  it('should create nested list structure', () => {
    const html = `
      <h1>Main</h1>
      <h2>Sub1</h2>
      <h3>SubSub1</h3>
      <h2>Sub2</h2>
    `;
    const result = generateTableOfContents(html, 1, 3);

    expect(result.toc).toContain('<ul>');
    expect(result.toc).toContain('</ul>');
  });
});

describe('templates', () => {
  it('should have default template', () => {
    expect(templates).toHaveProperty('default');
    expect(typeof templates.default).toBe('function');
  });

  it('should have minimal template', () => {
    expect(templates).toHaveProperty('minimal');
    expect(typeof templates.minimal).toBe('function');
  });

  it('should have plain template', () => {
    expect(templates).toHaveProperty('plain');
    expect(typeof templates.plain).toBe('function');
  });

  it('default template should include DOCTYPE', () => {
    const html = '<p>Test</p>';
    const result = templates.default(html, { title: 'Test' });

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Test');
  });

  it('minimal template should include DOCTYPE', () => {
    const html = '<p>Test</p>';
    const result = templates.minimal(html);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<p>Test</p>');
  });

  it('plain template should return only content', () => {
    const html = '<p>Test</p>';
    const result = templates.plain(html);

    expect(result).toBe('<p>Test</p>');
  });

  it('default template should include TOC when provided', () => {
    const html = '<p>Content</p>';
    const toc = '<strong>TOC</strong><ul><li>Item</li></ul>';
    const result = templates.default(html, { title: 'Test', toc });

    expect(result).toContain(toc);
  });

  it('default template should not include TOC when not provided', () => {
    const html = '<p>Content</p>';
    const result = templates.default(html, { title: 'Test' });

    expect(result).not.toContain('nav class="toc"');
  });
});
