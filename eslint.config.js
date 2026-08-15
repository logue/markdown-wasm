import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '.vscode/',
      '.yarn/',
      'dist/',
      'docs/',
      'public/',
      'src/**/*.generated.*',
      'src/markdown.js',
      'eslint.config.js',
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.d.ts'],
    rules: {
      // Ambient declarations describe call signatures; parameter names are
      // documentation only and third-party APIs (Emscripten) are untyped.
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  pluginImport.flatConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      // This will do the trick
      'import/parsers': {
        espree: ['.js', '.cjs', '.mjs', '.jsx'],
        '@typescript-eslint/parser': ['.ts'],
      },
      'eslint-import-resolver-custom-alias': {
        alias: {
          '@': './src',
          '~': './node_modules',
        },
        extensions: ['.js', '.ts'],
      },
    },
    rules: {
      camelcase: 'off',
      'import-x/default': 'off',
      'import-x/namespace': 'off',
      'import-x/no-default-export': 'off',
      // Sort Import Order.
      // see https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md#importorder-enforce-a-convention-in-module-import-order
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            // Internal Codes
            {
              pattern: '{@/**}',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
          },
          'newlines-between': 'always',
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
