#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as Str from "effect/String";

const TOOLING_ROOT = "tooling/cli/src";
const ALLOWED_NON_PASCAL_FILENAMES = new Set(["index", "bin"]);
const REQUIRED_TAGGED_UNIONS = [
  "GenerationAction",
  "TsMorphMutation",
  "TsMorphMutationOutcome",
  "DocsSection",
  "TsconfigSyncRunOptions",
  "TsconfigSyncChange",
  "PlannedFileChange",
  "TsconfigSyncResult",
  "VersionCategoryReport",
  "VersionSyncOptions",
];

const listFiles = () => {
  const result = spawnSync("rg", ["--files", TOOLING_ROOT], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.error) {
    console.error("[check-tooling-schema-first] failed to execute ripgrep.");
    console.error(result.error.message);
    process.exit(2);
  }

  if (result.status !== 0) {
    console.error("[check-tooling-schema-first] failed to enumerate tooling/cli/src files.");
    if (Str.isNonEmpty(Str.trim(result.stderr))) {
      console.error(Str.trim(result.stderr));
    }
    process.exit(result.status ?? 2);
  }

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".ts"));
};

const lineNumberAt = (content, offset) => content.slice(0, offset).split("\n").length;

const violations = [];

for (const file of listFiles()) {
  const absolute = path.join(process.cwd(), file);
  const content = readFileSync(absolute, "utf8");

  const pushViolation = (kind, detail, offset = 0) => {
    violations.push({
      file,
      line: lineNumberAt(content, offset),
      kind,
      detail,
    });
  };

  const basename = path.basename(file, ".ts");
  if (!ALLOWED_NON_PASCAL_FILENAMES.has(basename) && !/^[A-Z][A-Za-z0-9]*$/.test(basename)) {
    pushViolation(
      "pascal-case-file",
      "Tooling CLI TypeScript files must use PascalCase names (except index.ts and bin.ts)."
    );
  }

  if (/\bexport\s+interface\b/.test(content)) {
    pushViolation("export-interface", "Use schema classes or type aliases instead of exported interfaces.");
  }

  if (/\bData\.taggedEnum\b|\bData\.TaggedEnum\b/.test(content)) {
    pushViolation("data-tagged-enum", "Use Schema tagged unions via LiteralKit + mapMembers + Tuple.evolve.");
  }

  const serviceLinePattern = /ServiceMap\.Service</g;
  for (const match of content.matchAll(serviceLinePattern)) {
    const start = match.index ?? 0;
    const nearby = content.slice(start, start + 320);
    if (!/\(\)\(\s*\$I`/.test(nearby)) {
      pushViolation("service-id", "ServiceMap.Service tag must use $I`ServiceName` identity.", start);
    }
  }

  const classPattern = /S\.Class<[^>]+>\(\$I`[^`]+`\)\(/g;
  for (const match of content.matchAll(classPattern)) {
    const start = match.index ?? 0;
    const nearby = content.slice(start, start + 560);
    if (!/\$I\.annote\(/.test(nearby)) {
      pushViolation("schema-annotation", "S.Class schema is missing $I.annote(...) metadata.", start);
    }
  }
}

for (const schemaName of REQUIRED_TAGGED_UNIONS) {
  const declarationPattern = new RegExp(`(?:export\\s+)?const\\s+${schemaName}\\s*=`);
  let found = false;

  for (const file of listFiles()) {
    const absolute = path.join(process.cwd(), file);
    const content = readFileSync(absolute, "utf8");
    const match = declarationPattern.exec(content);
    if (match === null) {
      continue;
    }
    found = true;
    const snippet = content.slice(match.index, match.index + 1400);
    if (!/\.mapMembers\(/.test(snippet) || !/Tuple\.evolve\(/.test(snippet) || !/\.pipe\(S\.toTaggedUnion\(/.test(snippet)) {
      violations.push({
        file,
        line: lineNumberAt(content, match.index),
        kind: "tagged-union-pattern",
        detail: `${schemaName} must use LiteralKit + mapMembers + Tuple.evolve + S.toTaggedUnion.`,
      });
    }
    break;
  }

  if (!found) {
    violations.push({
      file: TOOLING_ROOT,
      line: 1,
      kind: "missing-schema",
      detail: `Expected tagged union schema '${schemaName}' was not found.`,
    });
  }
}

if (violations.length > 0) {
  console.error(`[check-tooling-schema-first] found ${violations.length} violation(s).`);
  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line} [${violation.kind}] ${violation.detail}`);
  }
  process.exit(1);
}

console.log("[check-tooling-schema-first] OK: tooling/cli schema-first checks passed.");
