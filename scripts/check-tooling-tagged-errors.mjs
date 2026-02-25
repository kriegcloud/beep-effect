#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import * as Str from "effect/String";


const result = spawnSync(
  "rg",
  ["--line-number", "--glob", "tooling/*/src/**/*.ts", "\\bnew Error\\(|\\bthrow new Error\\(", "."],
  {
    cwd: process.cwd(),
    encoding: "utf8",
  }
);

if (result.error) {
  console.error("[check-tooling-tagged-errors] failed to execute ripgrep.");
  console.error(result.error.message);
  process.exit(2);
}

if (result.status === 1) {
  console.log("[check-tooling-tagged-errors] OK: no native Error usage found in tooling/*/src.");
  process.exit(0);
}

if (result.status === 0) {
  console.error(
    "[check-tooling-tagged-errors] native Error usage detected in tooling/*/src. Use S.TaggedErrorClass errors."
  );
  if (Str.trim(result.stdout).length > 0) {
    console.error(Str.trim(result.stdout));
  }
  process.exit(1);
}

console.error("[check-tooling-tagged-errors] ripgrep exited unexpectedly.");
if (Str.trim(result.stderr).length > 0) {
  console.error(Str.trim(result.stderr));
}
process.exit(result.status ?? 2);

