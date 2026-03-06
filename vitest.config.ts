import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['packages/*/src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['packages/*/src/**/*.ts'],
            exclude: ['**/*.test.ts', '**/*.d.ts', '**/index.ts'],
        },
    },
});
