import path from "node:path";
import aliases from "vite-tsconfig-paths";
import type { ViteUserConfig } from "vitest/config";

const config: ViteUserConfig = {
  esbuild: {
    target: "es2020",
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"],
  },
  plugins: [
    aliases({
      ignoreConfigErrors: true,
    }),
  ],
  server: {
    watch: {
      ignored: ["**/.context/**"],
    },
  },
  test: {
    exclude: ["**/.context/**", "**/node_modules/**"],
    setupFiles: [path.join(__dirname, "vitest.setup.ts")],
    fakeTimers: {
      toFake: undefined,
    },
    sequence: {
      concurrent: true,
    },
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "benchmark/",
        "bundle/",
        "dtslint/",
        "build/",
        "coverage/",
        "test/utils/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.setup.*",
        "**/vitest.shared.*",
      ],
    },
  },
};

export default config;
