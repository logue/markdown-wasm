import { ready, parse } from '../index.js';
import { it, describe, assert, expect } from 'vitest';

await ready();

describe('issue2', () => {
  // #2
  it('When MD4C_USE_UTF8 is not defined for md4c, the example input here fail to parse as a valid reference link. In that case, instead of the expected output, we get "<p>[Á]</p>".', () =>
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
    expect(
      parse(`
\`\`\`
                 |
\`\`\``)
    ).toBe(`<pre><code>                 |
</code></pre>
`));

  it('this does not (indent is 1 less space)#1', () =>
    expect(
      parse(`
\`\`\`
                |
\`\`\``)
    ).toBe(`<pre><code>                |
</code></pre>
`));

  it('this does not (indent is 1 more space)#2', () =>
    expect(
      parse(`
\`\`\`
                  |
\`\`\``)
    ).toBe(`<pre><code>                  |
</code></pre>
`));
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
