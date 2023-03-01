import { ready, parse, ParseFlags } from '../index.js';
import { it, describe, expect } from 'vitest';
import spec from 'commonmark-spec';

await ready();

describe('issue2', () => {
  // When MD4C_USE_UTF8 is not defined for md4c, the example input here fail to parse as a valid reference link. In that case, instead of the expected output, we get "<p>[Á]</p>".
  it('MD4C_USE_UTF8', () =>
    expect(
      parse(`
[á]: /url
[Á]
`)
    ).toBe(`<p><a href="/url">Á</a></p>
`));
});

describe('issue5', () => {
  it('this triggers the bug', () =>
    expect(parse('```\n                 |\n```')).equals(
      '<pre><code>                 |\n</code></pre>\n'
    ));

  it('this does not (indent is 1 less space)#1', () =>
    expect(parse('```\n                |\n```')).equals(
      '<pre><code>                |\n</code></pre>\n'
    ));

  it('this does not (indent is 1 more space)#2', () =>
    expect(parse('```\n                  |\n```')).equals(
      '<pre><code>                  |\n</code></pre>\n'
    ));
});

describe('issue22', () => {
  it('DISABLE_HEADLINE_ANCHOR', () =>
    expect(
      parse(
        `# Test1
## Test2
### Test3
#### Test4
`,
        { disableHeadlineAnchors: true }
      )
    ).toBe(`<h1>Test1</h1>
<h2>Test2</h2>
<h3>Test3</h3>
<h4>Test4</h4>
`));
  it('ENABLE_HEADLINE_ANCHOR', () =>
    expect(
      parse(
        `# Test1
## Test2
### Test3
#### Test4`,
        { disableHeadlineAnchors: false }
      )
    )
      .toBe(`<h1><a id="test1" class="anchor" aria-hidden="true" href="#test1"></a>Test1</h1>
<h2><a id="test2" class="anchor" aria-hidden="true" href="#test2"></a>Test2</h2>
<h3><a id="test3" class="anchor" aria-hidden="true" href="#test3"></a>Test3</h3>
<h4><a id="test4" class="anchor" aria-hidden="true" href="#test4"></a>Test4</h4>
`));
});

describe('XHTML Test', () => {
  it('hr tag', () =>
    expect(parse('---', { format: 'xhtml' })).toBe('<hr />\n'));

  it('img tag', () =>
    expect(
      parse('![image](https://rsms.me/raster/examples/image1.jpg)', {
        format: 'xhtml',
      })
    ).toBe(
      '<p><img src="https://rsms.me/raster/examples/image1.jpg" alt="image" /></p>\n'
    ));

  it('task list', () =>
    expect(parse('- [x] Task', { format: 'xhtml' })).toBe(
      '<ul>\n<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" disabled="disabled" checked="checked" />Task</li>\n</ul>\n'
    ));
});

describe('Commonmark spec test', () =>
  spec.tests.forEach(
    /**
     * @type {
     *   markdown: string;
     *   html: string;
     *   section: string;
     *   number: number;
     * } Commonmark spec
     */
    testCase =>
      describe(testCase.section, () =>
        it(`#${testCase.number}`, () =>
          expect(
            parse(testCase.markdown, {
              parseFlags: ParseFlags.COMMONMARK,
              format: 'xhtml',
              disableHeadlineAnchors: true,
            })
          ).equals(testCase.html))
      )
  ));
