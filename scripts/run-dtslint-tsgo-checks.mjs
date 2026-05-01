#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const searchRoots = ["apps", "packages", "tooling"];
const tsgoPath = path.join(rootDir, "node_modules", ".bin", "tsgo");
const extraArgs = process.argv.slice(2);

/**
 * @param {string} dir
 * @returns {string[]}
 */
const collectDtslintFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectDtslintFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const normalized = fullPath.split(path.sep).join("/");

    if (!normalized.includes("/dtslint/")) {
      continue;
    }

    if (!/\.tst\.[^.]+$/.test(entry.name)) {
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
  .flatMap((searchRoot) => collectDtslintFiles(searchRoot))
  .sort((left, right) => left.localeCompare(right));

if (discoveredFiles.length === 0) {
  console.log("[check:dtslint:tsgo] no dtslint files found");
  process.exit(0);
}

const tempDir = path.join(rootDir, "node_modules", ".tmp", "tsgo-dtslint-checks");
mkdirSync(tempDir, { recursive: true });

const syntheticConfigPath = path.join(tempDir, "dtslint.tsconfig.json");
const syntheticConfig = {
  extends: path.join(rootDir, "tsconfig.dtslint.json"),
  references: [],
  include: discoveredFiles,
  exclude: [],
  compilerOptions: {
    composite: false,
    incremental: false,
    noEmit: true,
    rootDir: rootDir,
  },
};

writeFileSync(syntheticConfigPath, `${JSON.stringify(syntheticConfig, null, 2)}\n`);

console.log(`[check:dtslint:tsgo] checking ${discoveredFiles.length} file(s) with tsconfig.dtslint.json`);

const result = spawnSync(tsgoPath, ["-p", syntheticConfigPath, ...extraArgs], {
  cwd: rootDir,
  stdio: "inherit",
});

rmSync(syntheticConfigPath, { force: true });

if (result.status !== 0) {
  process.exit(1);
}
