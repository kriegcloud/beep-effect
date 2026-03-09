import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
})
