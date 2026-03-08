// eslint-disable-next-line import/no-nodejs-modules
import path from 'node:path';

// eslint-disable-next-line import/no-nodejs-modules
import { fileURLToPath } from 'node:url';
import config from '@rubensworks/eslint-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    rules: {
      'unicorn/no-useless-undefined': [
        'error',
        { checkArguments: false },
      ],
      'test/consistent-test-it': 'off',
      'import/extensions': 'off',

      // Default
      'unicorn/consistent-destructuring': 'off',
      'unicorn/no-array-callback-reference': 'off',

      'ts/naming-convention': 'off',
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-assignment': 'off',

      'ts/no-require-imports': [ 'error', { allow: [
        'process/',
        'is-stream',
        'readable-stream-node-to-web',
      ]}],
      'ts/no-var-requires': [ 'error', { allow: [
        'process/',
        'is-stream',
        'readable-stream-node-to-web',
      ]}],
    },
  },
  {
    // Specific rules for NodeJS-specific files
    files: [
      '**/test/**/*.ts',
    ],
    rules: {
      'import/no-nodejs-modules': 'off',
      'ts/no-require-imports': 'off',
      'ts/no-var-requires': 'off',
    },
  },
  {
    // Some test files import 'vitest' which triggers this
    // Some jest tests import '../../lib' which triggers this
    files: [
      '**/*.test.ts',
      '**/*.bench.ts',
      '**/*.util.ts',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: [
      '**/*.md',
      '**/*.md/*.ts',
    ],
    rules: {
      'unused-imports/no-unused-imports-ts': 'off',
      'ts/no-require-imports': 'off',
      'ts/no-var-requires': 'off',
    },
  },
  {
    ignores: [
      'documentation',
      '**/*.mjs',
    ],
  },
], { disableJest: true });
