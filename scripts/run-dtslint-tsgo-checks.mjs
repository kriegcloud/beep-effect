#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const searchRoots = ["packages", "tooling", "apps"];
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

/**
 * @param {string} filePath
 * @returns {string}
 */
const findNearestTsconfig = (filePath) => {
  let currentDir = path.dirname(filePath);

  while (currentDir.startsWith(rootDir)) {
    const candidate = path.join(currentDir, "tsconfig.json");
    if (candidate !== filePath && readdirSync(currentDir).includes("tsconfig.json")) {
      return candidate;
    }

    if (currentDir === rootDir) {
      break;
    }

    currentDir = path.dirname(currentDir);
  }

  return path.join(rootDir, "tsconfig.json");
};

/**
 * @param {Map<string, string[]>} groups
 * @returns {Map<string, string[]>}
 */
const sortGroups = (groups) =>
  new Map(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([configPath, files]) => [configPath, [...files].sort((left, right) => left.localeCompare(right))]),
  );

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

/** @type {Map<string, string[]>} */
const groupedByBaseConfig = new Map();

for (const filePath of discoveredFiles) {
  const tsconfigPath = findNearestTsconfig(filePath);
  const existing = groupedByBaseConfig.get(tsconfigPath) ?? [];
  existing.push(filePath);
  groupedByBaseConfig.set(tsconfigPath, existing);
}

const sortedGroups = sortGroups(groupedByBaseConfig);
const tempDir = path.join(rootDir, "node_modules", ".tmp", "tsgo-dtslint-checks");
mkdirSync(tempDir, { recursive: true });

let hasFailures = false;
let groupIndex = 0;

for (const [baseConfigPath, files] of sortedGroups.entries()) {
  groupIndex += 1;

  const relativeBaseConfig = path.relative(rootDir, baseConfigPath) || "tsconfig.json";
  const syntheticConfigPath = path.join(tempDir, `group-${groupIndex}.tsconfig.json`);

  const syntheticConfig = {
    extends: baseConfigPath,
    include: files,
    exclude: [],
    compilerOptions: {
      composite: false,
      incremental: false,
      noEmit: true,
      rootDir: rootDir,
    },
  };

  writeFileSync(syntheticConfigPath, `${JSON.stringify(syntheticConfig, null, 2)}\n`);

  console.log(
    `[check:dtslint:tsgo] checking ${files.length} file(s) with ${relativeBaseConfig}`,
  );

  const result = spawnSync(tsgoPath, ["-p", syntheticConfigPath, ...extraArgs], {
    cwd: rootDir,
    stdio: "inherit",
  });

  rmSync(syntheticConfigPath, { force: true });

  if (result.status !== 0) {
    hasFailures = true;
  }
}

if (hasFailures) {
  process.exit(1);
}
