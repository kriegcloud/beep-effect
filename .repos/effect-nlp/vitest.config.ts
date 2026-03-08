import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["./setupTests.ts"],
    include: ["./test/**/*.test.ts"],
    exclude: ["./test/legacy/**"],
    globals: true
  }
})
