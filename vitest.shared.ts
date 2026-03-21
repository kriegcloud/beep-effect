import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { ViteUserConfig } from "vitest/config";

type AliasEntry = {
  readonly find: RegExp | string;
  readonly replacement: string;
};

const rootTsconfigPath = path.join(__dirname, "tsconfig.json");

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readRootTsconfigPaths = (): Readonly<Record<string, readonly string[]>> => {
  const fileText = fs.readFileSync(rootTsconfigPath, "utf8");
  const parsed = ts.parseConfigFileTextToJson(rootTsconfigPath, fileText);

  if (
    typeof parsed.config !== "object" ||
    parsed.config === null ||
    typeof parsed.config.compilerOptions !== "object" ||
    parsed.config.compilerOptions === null ||
    typeof parsed.config.compilerOptions.paths !== "object" ||
    parsed.config.compilerOptions.paths === null
  ) {
    return {};
  }

  return parsed.config.compilerOptions.paths as Record<string, readonly string[]>;
};

const toAliasEntry = (find: string, replacement: string): AliasEntry => {
  const absoluteReplacement = path.resolve(__dirname, replacement);

  if (!find.includes("*")) {
    return {
      find,
      replacement: absoluteReplacement,
    };
  }

  return {
    find: new RegExp(`^${escapeRegExp(find).replace("\\*", "(.*)")}$`),
    replacement: absoluteReplacement.replaceAll("*", "$1"),
  };
};

const rootTsconfigAliases = Object.entries(readRootTsconfigPaths())
  .sort(([left], [right]) => right.length - left.length)
  .flatMap(([find, replacements]) =>
    replacements.map((replacement) => toAliasEntry(find, replacement))
  );

const config: ViteUserConfig = {
  oxc: {
    target: "es2020",
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"],
  },
  resolve: {
    alias: rootTsconfigAliases,
    tsconfigPaths: true,
  },
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
        "**/dtslint/**",
        "build/",
        "coverage/",
        "test/utils/",
        "**/test/fixtures/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.setup.*",
        "**/vitest.shared.*",
      ],
      thresholds: {
        branches: 80,
        functions: 60,
        lines: 30,
        statements: 30,
      },
    },
  },
};

export default config;
