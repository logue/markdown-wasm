// https://github.com/rsms/markdown-wasm/issues/2
import { checkHTMLResult, exit } from './testutil.js';

// When MD4C_USE_UTF8 is not defined for md4c, the example input here fail to parse as a valid
// reference link. In that case, instead of the expected output, we get "<p>[Á]</p>".
checkHTMLResult(
  'MD4C_USE_UTF8',
  `
[á]: /url
[Á]
`,
  `<p><a href="/url">Á</a></p>\n`
);

exit();
