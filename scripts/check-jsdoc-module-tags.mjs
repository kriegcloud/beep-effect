#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const scannedRoots = [".patterns", "apps", "packages", "tooling"];
const scannedExtensions = new Set([".hbs", ".md", ".ts", ".tsx"]);
const moduleTagPattern = /^\s*\* @module\b.*$/;

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
  if (!existsSync(absolutePath)) {
    continue;
  }

  const text = readFileSync(absolutePath, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (moduleTagPattern.test(line)) {
      violations.push({
        filePath,
        lineNumber: index + 1,
      });
    }
  });
}

if (violations.length > 0) {
  console.error("[check:jsdoc-module-tags] @module is not valid under the repo TSDoc policy.");
  console.error("[check:jsdoc-module-tags] Use @packageDocumentation for fileoverview JSDoc blocks.");

  for (const violation of violations) {
    console.error(`${violation.filePath}:${violation.lineNumber}: replace @module with @packageDocumentation`);
  }

  process.exit(1);
}

console.log("[check:jsdoc-module-tags] verified tracked fileoverview comments do not use @module");
