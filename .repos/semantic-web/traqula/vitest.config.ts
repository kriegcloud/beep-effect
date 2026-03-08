/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: [
        'packages/*/dist/esm/**/*.js',
      ],
    },
    include: [
      'engines/*/test/**/*.test.ts',
      'packages/*/test/**/*.test.ts',
    ],
    typecheck: {
      enabled: true,
      include: [
        '**/test/**/*.types.test.ts',
      ],
    },
    benchmark: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
      ],
    },
  },
});
