// import { checker } from 'vite-plugin-checker';
import { defineConfig } from 'vite';

import { fileURLToPath, URL } from 'node:url';

// Export vite config
export default defineConfig(async ({ mode }) => {
  // Hook production build.
  /** @type {import('vite').UserConfig} https://vitejs.dev/config/ */
  const config = {
    // https://vitejs.dev/config/shared-options.html#base
    base: './',
    // https://vitejs.dev/config/server-options.html
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
      cors: false,
    },
    /*
    plugins: [
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: false,
        vueTsc: false,
        eslint: {
          lintCommand: `eslint`, // for example, lint .ts & .tsx
        },
      }),

    ],*/
    // Build Options
    // https://vitejs.dev/config/build-options.html
    build: {
      outDir: mode === 'docs' ? 'docs' : undefined,
      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: 'esnext',
      // Minify option
      // https://vitejs.dev/config/build-options.html#build-minify
      minify: mode === 'docs',
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
      // Rollup Options
      // https://vitejs.dev/config/build-options.html#build-rollupoptions
      rollupOptions: {
        external: [
          'node:module',
          'node:util',
          'node:buffer',
          'node:stream',
          'node:net',
          'node:url',
          'node:fs',
          'node:path',
        ],
        output: {
          esModule: true,
          generatedCode: {
            reservedNamesAsProps: false,
          },
          interop: 'compat',
          systemNullSetters: false,
          globals: {
            'node:module': 'module',
            'node:stream': 'stream',
            'node:buffer': 'buffer',
            'node:util': 'util',
            'node:net': 'net',
            'node:url': 'url',
          },
          inlineDynamicImports: true,
        },
      },
    },
    esbuild: {
      drop: mode === 'serve' ? [] : ['console'],
    },
  };
  return config;
});
