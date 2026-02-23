import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: false,
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"]
    }
  }
})
