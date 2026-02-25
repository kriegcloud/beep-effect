#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const TARGET_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/rules/agent-instructions.md",
  "tooling/cli/src/commands/create-package/templates/AGENTS.md.hbs",
];

const repoRoot = process.cwd();
const violations = [];

for (const relativePath of TARGET_FILES) {
  const absolutePath = path.resolve(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    violations.push({
      file: relativePath,
      line: 0,
      column: 0,
      message: "file missing",
      excerpt: "",
    });
    continue;
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  const lines = content.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) {
      continue;
    }

    const slashColumn = line.indexOf("/");
    const backslashColumn = line.indexOf("\\");
    const column = slashColumn >= 0 ? slashColumn : backslashColumn;

    if (column < 0) {
      continue;
    }

    violations.push({
      file: relativePath,
      line: index + 1,
      column: column + 1,
      message: "path separator is not allowed in pathless config surfaces",
      excerpt: line.trim(),
    });
  }
}

if (violations.length > 0) {
  console.error(`[pathless-config] failed with ${violations.length} violation(s)`);
  for (const violation of violations) {
    const location =
      violation.line > 0 ? `${violation.file}:${violation.line}:${violation.column}` : `${violation.file}:missing`;
    console.error(`- ${location} ${violation.message}`);
    if (violation.excerpt.length > 0) {
      console.error(`  ${violation.excerpt}`);
    }
  }
  process.exit(1);
}

console.log(`[pathless-config] ok (${TARGET_FILES.length} files)`);
