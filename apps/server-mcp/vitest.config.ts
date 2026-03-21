/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "server-mcp",
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
    passWithNoTests: true,
  },
});
