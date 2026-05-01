#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const searchRoots = ["apps", "packages", "tooling", "infra"];
const tsgoPath = path.join(rootDir, "node_modules", ".bin", "tsgo");
const extraArgs = process.argv.slice(2);
const ignoredDirectoryNames = new Set(["node_modules", "dist", "coverage", "tmp"]);
const ignoredPathSegments = ["/test/fixtures/"];

/**
 * @param {string} filePath
 * @returns {string}
 */
const normalizePath = (filePath) => filePath.split(path.sep).join("/");

/**
 * @param {string} normalizedPath
 * @returns {boolean}
 */
const isIgnoredTestPath = (normalizedPath) =>
  ignoredPathSegments.some((segment) => normalizedPath.includes(segment));

/**
 * @param {string} dir
 * @returns {string[]}
 */
const collectTestFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const normalized = normalizePath(fullPath);

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name) || isIgnoredTestPath(`${normalized}/`)) {
        continue;
      }

      files.push(...collectTestFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!normalized.includes("/test/")) {
      continue;
    }

    if (isIgnoredTestPath(normalized)) {
      continue;
    }

    if (!/\.(?:cts|mts|ts|tsx)$/.test(entry.name)) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

const discoveredFiles = searchRoots
  .map((searchRoot) => path.join(rootDir, searchRoot))
  .filter((searchRoot) => {
    try {
      return readdirSync(searchRoot) !== undefined;
    } catch {
      return false;
    }
  })
  .flatMap((searchRoot) => collectTestFiles(searchRoot))
  .sort((left, right) => left.localeCompare(right));

if (discoveredFiles.length === 0) {
  console.log("[check:tsgo:tests] no test files found");
  process.exit(0);
}

const tempDir = path.join(rootDir, "node_modules", ".tmp", "tsgo-test-checks");
mkdirSync(tempDir, { recursive: true });

const syntheticConfigPath = path.join(tempDir, "test.tsconfig.json");
const syntheticConfig = {
  extends: path.join(rootDir, "tsconfig.json"),
  references: [],
  include: discoveredFiles,
  exclude: [],
  compilerOptions: {
    composite: false,
    incremental: false,
    noEmit: true,
    rootDir: rootDir,
    tsBuildInfoFile: path.join(tempDir, "test.tsbuildinfo"),
  },
};

writeFileSync(syntheticConfigPath, `${JSON.stringify(syntheticConfig, null, 2)}\n`);

console.log(`[check:tsgo:tests] checking ${discoveredFiles.length} file(s) with tsconfig.json`);

const result = spawnSync(tsgoPath, ["-p", syntheticConfigPath, "--pretty", "false", ...extraArgs], {
  cwd: rootDir,
  encoding: "utf8",
});

rmSync(syntheticConfigPath, { force: true });

const combinedOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const outputLines = combinedOutput.split(/\r?\n/);
const effectDiagnosticLines = outputLines.filter((line) => /\b(?:error|warning) TS\d+: .* effect\([^)]+\)/.test(line));
const fileDiagnosticLines = outputLines.filter((line) => /^[^(]+\(\d+,\d+\): (?:error|warning) TS\d+:/.test(line));

if (result.error !== undefined) {
  console.error(`[check:tsgo:tests] failed to run tsgo: ${result.error.message}`);
  process.exit(1);
}

if (effectDiagnosticLines.length > 0) {
  console.error(`[check:tsgo:tests] found ${effectDiagnosticLines.length} Effect diagnostic(s) in test files`);
  console.error(effectDiagnosticLines.join("\n"));
  process.exit(1);
}

if (result.status !== 0 && fileDiagnosticLines.length === 0) {
  if (combinedOutput.length > 0) {
    console.error(combinedOutput.trim());
  }
  process.exit(result.status ?? 1);
}

if (result.status !== 0) {
  console.log(
    `[check:tsgo:tests] ignored ${fileDiagnosticLines.length} non-Effect TypeScript diagnostic(s); this lane only gates Effect diagnostics`
  );
  if (process.env.BEEP_TSGO_TEST_CHECK_VERBOSE === "1" && combinedOutput.length > 0) {
    console.log(combinedOutput.trim());
  }
}
