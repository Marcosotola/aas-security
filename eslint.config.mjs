import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'migracion/**'] },
  ...compat.extends('next/core-web-vitals'),
  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      // Imports o variables que quedaron sin uso (típico después de borrar código).
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }]
    }
  }
];

export default config;
