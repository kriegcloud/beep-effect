import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', '!./**/*.spec.ts'],
  splitting: false,
  sourcemap: true,
  clean: true
})
