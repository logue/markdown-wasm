import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

import { dataToEsm } from '@rollup/pluginutils';
import banner from 'vite-plugin-banner';
import { checker } from 'vite-plugin-checker';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

import pkg from './package.json';

// Export vite config
export default defineConfig(async ({ mode }) => {
  // Hook production build.
  /** @type {import('vite').UserConfig} https://vitejs.dev/config/ */
  const config = {
    // https://vitejs.dev/config/shared-options.html#base
    base: './',
    plugins: [
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: false,
        vueTsc: false,
        eslint: {
          lintCommand: 'eslint',
        },
      }),
      // vite-plugin-banner
      // https://github.com/chengpeiquan/vite-plugin-banner
      banner(`/**
 * ${pkg.name}
 *
 * @description ${pkg.description}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @see {@link ${pkg.homepage}}
 */
`),
      {
        name: 'vite-plugin-base64',
        async transform(_source, id) {
          if (!id.endsWith('.wasm')) return;
          const file = readFileSync(id);
          const base64 = file.toString('base64');
          const code = `data:application/wasm;base64,${base64}";`;
          return dataToEsm(code);
        },
      },
      wasm(),
      topLevelAwait(),
    ],
    // Build Options
    // https://vitejs.dev/config/build-options.html
    build: {
      outDir: mode === 'docs' ? 'docs' : undefined,
      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: 'esnext',
      // https://vitejs.dev/config/build-options.html#build-lib
      lib:
        mode === 'docs'
          ? undefined
          : {
              entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
              name: 'markdown',
              formats: ['es', 'umd', 'iife'],
              fileName: format => `markdown.${format}.js`,
            },
      // https://vitejs.dev/config/build-options.html#build-sourcemap
      sourcemap: true,
    },
    esbuild: {
      drop: mode === 'serve' ? [] : ['console'],
    },
  };
  return config;
});
