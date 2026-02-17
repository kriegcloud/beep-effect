import * as path from "node:path";
import type { ViteUserConfig } from "vitest/config";

const alias = (name: string) => {
  const target = process.env.TEST_DIST !== undefined ? "dist/dist/esm" : "src";
  const scopedName = `@example/${name}`;
  return {
    [scopedName]: path.join(__dirname, "packages", name, target),
    [`${scopedName}/*`]: path.join(__dirname, "packages", name, target),
  };
};

const config: ViteUserConfig = {
  esbuild: { target: "es2020" },
  test: {
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    alias: {
      ...alias("domain"),
      ...alias("server"),
    },
  },
};

export default config;
