#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const scannedRoots = [".claude", ".codex", ".patterns", "apps", "packages", "tooling"];
const scannedExtensions = new Set([".hbs", ".md", ".ts", ".tsx"]);
const valuedModuleTagPattern = /^\s*\* @module\s+\S.*$/;

const gitResult = spawnSync("git", ["ls-files"], {
  cwd: rootDir,
  encoding: "utf8",
});

if (gitResult.status !== 0) {
  console.error("[check:jsdoc-module-tags] failed to list tracked files with git ls-files");
  if (gitResult.stderr.length > 0) {
    console.error(gitResult.stderr.trim());
  }
  process.exit(gitResult.status ?? 1);
}

const isScannedPath = (filePath) =>
  scannedRoots.some((root) => filePath === root || filePath.startsWith(`${root}/`)) &&
  scannedExtensions.has(path.extname(filePath));

const violations = [];

for (const filePath of gitResult.stdout.split(/\r?\n/).filter(Boolean).filter(isScannedPath)) {
  const absolutePath = path.join(rootDir, filePath);
  const text = readFileSync(absolutePath, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (valuedModuleTagPattern.test(line)) {
      violations.push({
        filePath,
        lineNumber: index + 1,
      });
    }
  });
}

if (violations.length > 0) {
  console.error("[check:jsdoc-module-tags] @module must be bare in module fileoverview JSDoc.");
  console.error("[check:jsdoc-module-tags] Derive package/module identity from package.json and source path instead.");

  for (const violation of violations) {
    console.error(
      `${violation.filePath}:${violation.lineNumber}: @module must be bare; derive package/module identity from package.json/path instead`
    );
  }

  process.exit(1);
}

console.log("[check:jsdoc-module-tags] verified all tracked module fileoverview tags are bare");
