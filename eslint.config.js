const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');
const stylisticJs = require('@stylistic/eslint-plugin-js');


module.exports = tseslint.config({
  plugins: {
    '@stylistic/js': stylisticJs,
  },
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
  ],
  rules: {
    // Quotes
    quotes: ['error', 'single', { avoidEscape: true }],
    // Imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': ['error', { count: 2 }],
    'no-multiple-empty-lines': ['error', { max: 2 }],
    // Line length
    '@stylistic/js/max-len': ['error', { code: 120 }],
    // Brace style
    '@stylistic/js/brace-style': ['error', '1tbs'],
  },
  ignores: ['.eslint.config.js'],
});
