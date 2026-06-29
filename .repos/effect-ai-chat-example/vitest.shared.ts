import * as path from "node:path";
import type { ViteUserConfig } from "vitest/config";

const alias = (name: string) => {
  const scopedName = `@app/${name}`;
  return {
    [scopedName]: path.join(__dirname, "packages", name, "src"),
    [`${scopedName}/*`]: path.join(__dirname, "packages", name, "src"),
  };
};

const config: ViteUserConfig = {
  esbuild: {
    target: "es2020",
  },
  test: {
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    fakeTimers: {
      toFake: undefined,
    },
    sequence: {
      concurrent: true,
    },
    pool: "threads",
    poolOptions: {
      threads: {
        isolate: false,
      },
    },
    slowTestThreshold: 5_000,
    testTimeout: 30_000,
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    alias: {
      ...alias("domain"),
    },
  },
};

export default config;
