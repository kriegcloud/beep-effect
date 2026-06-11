#!/usr/bin/env bun

type JsonRecord = Record<string, unknown>;

const textDecoder = new TextDecoder();
const repoRoot = new URL("../../../", import.meta.url).pathname;

// Post-remediation contract (goals/fallow-zero-dead-code): the audit lane is
// blocking under the new-only gate, so a clean branch must introduce nothing
// and the dead-code lane must hold at zero. Inherited-adjacent counts vary by
// branch and are deliberately not pinned.
const expectedAuditSummary = {
  dead_code_issues: 0,
  dead_code_introduced: 0,
  complexity_introduced: 0,
  duplication_introduced: 0,
} as const;

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const asRecord = (value: unknown, label: string): JsonRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : fail(`${label}: expected object`);

const extractJsonObject = (text: string, label: string): JsonRecord => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) {
    fail(`${label}: no JSON object found in command output`);
  }
  try {
    return asRecord(JSON.parse(text.slice(start, end + 1)), label);
  } catch (error) {
    fail(`${label}: JSON parse failed: ${String(error)}`);
  }
};

const expectEqual = (label: string, actual: unknown, expected: unknown): void => {
  if (actual !== expected) {
    fail(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
};

const expectAtLeast = (label: string, actual: unknown, expected: number): void => {
  if (typeof actual !== "number" || actual < expected) {
    fail(`${label}: expected at least ${expected}, got ${String(actual)}`);
  }
};

const result = Bun.spawnSync(["bun", "run", "fallow:audit", "--", "--base", "origin/main", "--gate", "new-only"], {
  cwd: repoRoot,
  stdout: "pipe",
  stderr: "pipe",
});

expectEqual("fallow audit exit", result.exitCode, 0);

const output = `${textDecoder.decode(result.stdout)}\n${textDecoder.decode(result.stderr)}`;
const audit = extractJsonObject(output, "fallow audit");
const summary = asRecord(audit.summary, "fallow audit.summary");
const attribution = asRecord(audit.attribution, "fallow audit.attribution");

expectEqual("fallow audit verdict", audit.verdict, "pass");
expectEqual("fallow audit attribution gate", attribution.gate, "new-only");
expectAtLeast("fallow audit changed_files_count", audit.changed_files_count, 0);
expectEqual("fallow audit summary.dead_code_issues", summary.dead_code_issues, expectedAuditSummary.dead_code_issues);
expectEqual(
  "fallow audit attribution.dead_code_introduced",
  attribution.dead_code_introduced,
  expectedAuditSummary.dead_code_introduced
);
expectEqual(
  "fallow audit attribution.complexity_introduced",
  attribution.complexity_introduced,
  expectedAuditSummary.complexity_introduced
);
expectEqual(
  "fallow audit attribution.duplication_introduced",
  attribution.duplication_introduced,
  expectedAuditSummary.duplication_introduced
);

console.log("fallow audit baseline holds the zero-introduced contract");
