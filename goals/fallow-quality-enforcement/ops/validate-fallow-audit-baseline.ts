#!/usr/bin/env bun

type JsonRecord = Record<string, unknown>;

const textDecoder = new TextDecoder();
const repoRoot = new URL("../../../", import.meta.url).pathname;

const expectedAuditSummary = {
  changed_files_minimum: 90,
  dead_code_issues: 30,
  complexity_findings: 41,
  duplication_clone_groups: 155,
  dead_code_introduced: 3,
  dead_code_inherited: 27,
  complexity_introduced: 10,
  complexity_inherited: 30,
  duplication_introduced: 10,
  duplication_inherited: 145,
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

expectEqual("fallow audit exit", result.exitCode, 1);

const output = `${textDecoder.decode(result.stdout)}\n${textDecoder.decode(result.stderr)}`;
const audit = extractJsonObject(output, "fallow audit");
const summary = asRecord(audit.summary, "fallow audit.summary");
const attribution = asRecord(audit.attribution, "fallow audit.attribution");

expectEqual("fallow audit verdict", audit.verdict, "fail");
expectEqual("fallow audit attribution gate", attribution.gate, "new-only");
expectAtLeast(
  "fallow audit changed_files_count",
  audit.changed_files_count,
  expectedAuditSummary.changed_files_minimum
);
expectEqual("fallow audit summary.dead_code_issues", summary.dead_code_issues, expectedAuditSummary.dead_code_issues);
expectEqual(
  "fallow audit summary.complexity_findings",
  summary.complexity_findings,
  expectedAuditSummary.complexity_findings
);
expectEqual(
  "fallow audit summary.duplication_clone_groups",
  summary.duplication_clone_groups,
  expectedAuditSummary.duplication_clone_groups
);
expectEqual(
  "fallow audit attribution.dead_code_introduced",
  attribution.dead_code_introduced,
  expectedAuditSummary.dead_code_introduced
);
expectEqual(
  "fallow audit attribution.dead_code_inherited",
  attribution.dead_code_inherited,
  expectedAuditSummary.dead_code_inherited
);
expectEqual(
  "fallow audit attribution.complexity_introduced",
  attribution.complexity_introduced,
  expectedAuditSummary.complexity_introduced
);
expectEqual(
  "fallow audit attribution.complexity_inherited",
  attribution.complexity_inherited,
  expectedAuditSummary.complexity_inherited
);
expectEqual(
  "fallow audit attribution.duplication_introduced",
  attribution.duplication_introduced,
  expectedAuditSummary.duplication_introduced
);
expectEqual(
  "fallow audit attribution.duplication_inherited",
  attribution.duplication_inherited,
  expectedAuditSummary.duplication_inherited
);

console.log("fallow audit baseline matches recorded P0 evidence");
