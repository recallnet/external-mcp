import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from './prettier.config.mjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import("eslint").Linter.Config[]} */ // Updated type definition
const config = [
  {
    ignores: [
      'node_modules/',
      '**/dist/**',
      '**/build/**',
      'coverage/',
      '**/*.min.js',
      '**/vendor/**',
      'e2e/**', // Ignore e2e tests directory
      'docs/examples/**', // Ignore examples directory
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Remove project reference to avoid TypeScript project issues
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier,
    },
    rules: {
      ...ts.configs.recommended.rules, // ✅ Ensures TypeScript rules load correctly
      'prettier/prettier': ['error', prettierConfig], // ✅ Apply Prettier formatting rules
      '@typescript-eslint/no-unused-vars': 'off', // ✅ Disable for the whole project
      '@typescript-eslint/no-namespace': 'off', // Turn off namespace warning
    },
  },
];

export default config; // ✅ Explicitly export the properly typed config
