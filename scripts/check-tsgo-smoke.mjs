#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const tmpRoot = path.join(rootDir, "node_modules", ".tmp");
mkdirSync(tmpRoot, { recursive: true });
const smokeDir = mkdtempSync(path.join(tmpRoot, "tsgo-smoke-"));
const srcDir = path.join(smokeDir, "src");
const tsconfigPath = path.join(smokeDir, "tsconfig.json");
const sourcePath = path.join(srcDir, "index.ts");
const tsgoPath = path.join(rootDir, "node_modules", ".bin", "tsgo");

const cleanup = () => {
  rmSync(smokeDir, { force: true, recursive: true });
};

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

mkdirSync(srcDir, { recursive: true });

writeFileSync(
  sourcePath,
  [
    'import { Effect } from "effect";',
    "",
    "export const shouldHaveSuggestion = () => {",
    "  return Effect.gen(function* () {",
    "    yield* Effect.succeed(1);",
    "    return 42;",
    "  });",
    "};",
    "",
  ].join("\n")
);

writeFileSync(
  tsconfigPath,
  `${JSON.stringify(
    {
      extends: path.join(rootDir, "tsconfig.base.json"),
      include: ["src/**/*.ts"],
      exclude: [],
      compilerOptions: {
        composite: false,
        incremental: false,
        noEmit: true,
      },
    },
    null,
    2
  )}\n`
);

const result = spawnSync(tsgoPath, ["-p", tsconfigPath, "--pretty", "false"], {
  cwd: rootDir,
  encoding: "utf8",
});

const combinedOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const expectedDiagnostic = "effect(effectFnOpportunity)";

if (result.status === 0) {
  console.error("[check:tsgo:smoke] expected tsgo to fail on effectFnOpportunity but it exited successfully");
  if (combinedOutput.length > 0) {
    console.error(combinedOutput.trim());
  }
  process.exit(1);
}

if (!combinedOutput.includes(expectedDiagnostic)) {
  console.error("[check:tsgo:smoke] tsgo failed, but did not report the expected effectFnOpportunity diagnostic");
  if (combinedOutput.length > 0) {
    console.error(combinedOutput.trim());
  }
  process.exit(1);
}

console.log("[check:tsgo:smoke] verified tsgo CLI reports effectFnOpportunity under the repo base config");
