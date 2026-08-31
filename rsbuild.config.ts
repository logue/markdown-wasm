/** For build demo site use. */
import { readFileSync } from 'node:fs';

import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  version: string;
};

const buildDate = new Date().toISOString();

export default defineConfig({
  plugins: [
    pluginTypeCheck(),
  ],
  source: {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __BUILD_DATE__: JSON.stringify(buildDate),
    },
    entry: {
      index: './src-demo/index.ts',
    },
    include: [
      './src',
    ],
    tsconfigPath: './tsconfig.rsbuild.json',
  },
  html: {
    template: './src-demo/index.html',
  },
  output: {
    assetPrefix: './',
    distPath: {
      root: 'demo',
    },
    filenameHash: true,
  },
});
