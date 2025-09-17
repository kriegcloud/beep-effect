import * as path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteUserConfig } from "vitest/config";


// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: ViteUserConfig = {
  esbuild: {
    target: "es2020",
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"],
  },

  plugins: [
    // Ensure Vite resolves monorepo-wide TS path aliases from the root tsconfig
    tsconfigPaths({
      // Point directly to the root tsconfig.base.json so packages that don't
      // have a tsconfig.json (only tsconfig.src/test.json) still get aliases.
      projects: [path.join(__dirname, "tsconfig.base.json")],
    }),
  ],
  test: {
    onConsoleLog: (log) => {
      console.log(log);
    },
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    fakeTimers: {
      toFake: undefined,
    },
    sequence: {
      concurrent: true,
    },
    include: ["test/**/*.test.ts", "src/**/*.test.ts"]
  },
};

export default config;
