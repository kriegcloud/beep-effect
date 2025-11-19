#!/usr/bin/env bun
import { spawnSync } from "node:child_process";

const scopes = ["invariant", "identity", "schema", "types", "utils"] as const;
const passthroughArgs = process.argv.slice(2);

for (const scope of scopes) {
  const result = spawnSync("bunx", ["tsx", "./src/analyze-jsdoc.ts", "--scope", scope, ...passthroughArgs], {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
