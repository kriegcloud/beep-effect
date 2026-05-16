import { A } from "@beep/utils";
import { Config, Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import ts from "typescript";
import type { ViteUserConfig } from "vitest/config";

type AliasEntry = {
  readonly find: RegExp | string;
  readonly replacement: string;
};

const projectRootDirectory = new URL("./", import.meta.url);
const rootTsconfigPath = new URL("./tsconfig.json", import.meta.url).pathname;
const coverageProvider = process.versions.bun !== undefined ? "istanbul" : "v8";
const configStringOptionSync = (name: string): O.Option<string> => Effect.runSync(Config.option(Config.string(name)));
const configStringEqualsSync = (name: string, expected: string): boolean =>
  pipe(
    configStringOptionSync(name),
    O.exists((value) => value === expected)
  );
export const vitestCoverageReportOnly = configStringEqualsSync("VITEST_COVERAGE_REPORT_ONLY", "1");
const coverageThresholds = vitestCoverageReportOnly
  ? {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    }
  : {
      branches: 80,
      functions: 60,
      lines: 30,
      statements: 30,
    };

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readRootTsconfigPaths = (): Readonly<Record<string, readonly string[]>> => {
  const fileText = ts.sys.readFile(rootTsconfigPath);

  if (fileText === undefined) {
    return {};
  }

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
  const absoluteReplacement = new URL(replacement, projectRootDirectory).pathname;

  if (!find.includes("*")) {
    return {
      find: new RegExp(`^${escapeRegExp(find)}$`),
      replacement: absoluteReplacement,
    };
  }

  return {
    find: new RegExp(`^${escapeRegExp(find).replace("\\*", "(.*)")}$`),
    replacement: absoluteReplacement.replaceAll("*", "$1"),
  };
};

const rootTsconfigPathEntries: Array<[string, readonly string[]]> = Object.entries(readRootTsconfigPaths());

const rootTsconfigAliases = A.flatMap(
  A.sortWith(rootTsconfigPathEntries, ([find]) => find.length, Order.flip(Order.Number)),
  ([find, replacements]: [string, readonly string[]]) =>
    A.map(replacements, (replacement) => toAliasEntry(find, replacement))
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
    setupFiles: [new URL("./vitest.setup.ts", import.meta.url).pathname],
    fakeTimers: {
      toFake: undefined,
    },
    sequence: {
      concurrent: true,
    },
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: coverageProvider,
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
      thresholds: coverageThresholds,
    },
  },
};

export default config;
