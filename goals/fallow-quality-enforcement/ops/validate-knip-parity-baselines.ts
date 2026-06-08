#!/usr/bin/env bun

import { parse } from "jsonc-parser";

type JsonRecord = Record<string, unknown>;

const textDecoder = new TextDecoder();
const repoRoot = new URL("../../../", import.meta.url).pathname;

const expectedKnipCounts = {
  issueContainers: 31,
  files: 9,
  exports: 13,
  dependencies: 4,
  devDependencies: 4,
  unlisted: 1,
  unresolved: 9,
} as const;

const expectedFallowSummary = {
  total_issues: 63,
  unused_files: 6,
  unused_exports: 25,
  unused_types: 4,
  unused_dependencies: 21,
  unlisted_dependencies: 7,
  unresolved_imports: 0,
  boundary_violations: 0,
} as const;

const expectedMigrationWarnings = [
  "`rules.catalog`",
  "`ignoreBinaries`",
  "`ignoreWorkspaces`",
  "`workspaces`",
] as const;

const expectedWorkspacePaths = [
  "packages/shared/client",
  "packages/shared/config",
  "packages/shared/server",
  "packages/shared/use-cases",
  "packages/canvas/client",
  "packages/canvas/ui",
  "packages/drivers/konva",
] as const;

const expectedPluginNames = [
  "vitest",
  "eslint",
  "biome",
  "markdownlint",
  "cspell",
  "typescript",
  "babel",
  "turborepo",
  "changesets",
  "syncpack",
  "commitlint",
  "lefthook",
  "bun",
  "i18next",
  "nextjs",
  "lexical",
  "storybook",
  "tailwind",
  "drizzle",
  "vite",
] as const;

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const asRecord = (value: unknown, label: string): JsonRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : fail(`${label}: expected object`);

const asArray = (value: unknown, label: string): ReadonlyArray<unknown> =>
  Array.isArray(value) ? value : fail(`${label}: expected array`);

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

const readJsonc = async (path: string, label: string): Promise<JsonRecord> => {
  try {
    return asRecord(parse(await Bun.file(`${repoRoot}/${path}`).text()), label);
  } catch (error) {
    fail(`${label}: JSONC parse failed: ${String(error)}`);
  }
};

const run = (
  label: string,
  command: ReadonlyArray<string>,
  expectedExitCode: number
): { readonly json: JsonRecord; readonly output: string } => {
  const result = Bun.spawnSync(command, {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== expectedExitCode) {
    fail(`${label}: expected exit ${expectedExitCode}, got ${result.exitCode}`);
  }
  const output = `${textDecoder.decode(result.stdout)}\n${textDecoder.decode(result.stderr)}`;
  return {
    json: extractJsonObject(output, label),
    output,
  };
};

const runText = (label: string, command: ReadonlyArray<string>, expectedExitCode: number): string => {
  const result = Bun.spawnSync(command, {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== expectedExitCode) {
    fail(`${label}: expected exit ${expectedExitCode}, got ${result.exitCode}`);
  }
  return `${textDecoder.decode(result.stdout)}\n${textDecoder.decode(result.stderr)}`;
};

const nestedIssueCount = (issues: ReadonlyArray<unknown>, key: string): number =>
  issues.reduce((total, issue, index) => {
    const record = asRecord(issue, `knip issues[${index}]`);
    return total + asArray(record[key], `knip issues[${index}].${key}`).length;
  }, 0);

const expectEqual = (label: string, actual: number, expected: number): void => {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
};

const expectStringContains = (label: string, actual: string, expected: string): void => {
  if (!actual.includes(expected)) {
    fail(`${label}: expected output to include ${expected}`);
  }
};

const normalizeFallowIgnorePattern = (pattern: string): string =>
  pattern.startsWith("packages/") && pattern.endsWith("/**") ? pattern.slice(0, -3) : pattern;

const expectSameSet = (label: string, actual: ReadonlyArray<string>, expected: ReadonlyArray<string>): void => {
  const missing = expected.filter((value) => !actual.includes(value));
  const extra = actual.filter((value) => !expected.includes(value));
  if (missing.length > 0 || extra.length > 0) {
    fail(`${label}: missing [${missing.join(", ")}], extra [${extra.join(", ")}]`);
  }
};

const knipConfig = await readJsonc("knip.jsonc", "knip config");
const fallowConfig = await readJsonc(".fallowrc.jsonc", "fallow config");
const knipIgnore = asArray(knipConfig.ignore, "knip.ignore").map(String);
const knipIgnoreWorkspaces = asArray(knipConfig.ignoreWorkspaces, "knip.ignoreWorkspaces").map(String);
const fallowIgnorePatterns = asArray(fallowConfig.ignorePatterns, "fallow.ignorePatterns").map(String);
const fallowNormalizedIgnores = fallowIgnorePatterns.map(normalizeFallowIgnorePattern);
expectSameSet(
  "knip.ignore parity",
  fallowNormalizedIgnores.filter((pattern) => knipIgnore.includes(pattern)),
  knipIgnore
);
for (const workspace of knipIgnoreWorkspaces) {
  if (!fallowNormalizedIgnores.includes(workspace) && !fallowIgnorePatterns.includes(`${workspace}/**`)) {
    fail(`fallow.ignorePatterns: expected Knip ignored workspace ${workspace}`);
  }
}
expectSameSet(
  "knip.ignoreDependencies parity",
  asArray(fallowConfig.ignoreDependencies, "fallow.ignoreDependencies").map(String),
  asArray(knipConfig.ignoreDependencies, "knip.ignoreDependencies").map(String)
);
const knipRules = asRecord(knipConfig.rules, "knip.rules");
const fallowRules = asRecord(fallowConfig.rules, "fallow.rules");
if (knipRules.duplicates === "off" && fallowRules["duplicate-exports"] !== "off") {
  fail("fallow.rules.duplicate-exports must stay off while knip.rules.duplicates is off");
}
if (knipRules.catalog === "off") {
  if (fallowRules["unused-catalog-entries"] !== "off") {
    fail("fallow.rules.unused-catalog-entries must stay off while knip.rules.catalog is off");
  }
  if (fallowRules["empty-catalog-groups"] !== "off") {
    fail("fallow.rules.empty-catalog-groups must stay off while knip.rules.catalog is off");
  }
}

const knip = run("knip", ["bun", "run", "knip", "--reporter", "json"], 1).json;
const knipIssues = asArray(knip.issues, "knip.issues");
expectEqual("knip issue containers", knipIssues.length, expectedKnipCounts.issueContainers);
expectEqual("knip files", nestedIssueCount(knipIssues, "files"), expectedKnipCounts.files);
expectEqual("knip exports", nestedIssueCount(knipIssues, "exports"), expectedKnipCounts.exports);
expectEqual("knip dependencies", nestedIssueCount(knipIssues, "dependencies"), expectedKnipCounts.dependencies);
expectEqual(
  "knip devDependencies",
  nestedIssueCount(knipIssues, "devDependencies"),
  expectedKnipCounts.devDependencies
);
expectEqual("knip unlisted", nestedIssueCount(knipIssues, "unlisted"), expectedKnipCounts.unlisted);
expectEqual("knip unresolved", nestedIssueCount(knipIssues, "unresolved"), expectedKnipCounts.unresolved);

const fallow = run("fallow dead-code", ["bun", "run", "fallow:dead-code:json", "--", "--summary"], 1).json;
const fallowSummary = asRecord(fallow.summary, "fallow.summary");
for (const [key, expected] of Object.entries(expectedFallowSummary)) {
  expectEqual(`fallow summary.${key}`, Number(fallowSummary[key]), expected);
}

const migrationOutput = runText(
  "fallow migrate",
  ["bun", "run", "fallow:migrate:dry-run", "--", "--from", "knip.jsonc"],
  0
);
for (const warning of expectedMigrationWarnings) {
  expectStringContains("fallow migrate warnings", migrationOutput, warning);
}

const workspaceInventory = run(
  "fallow workspaces",
  ["bun", "run", "fallow", "--", "list", "--workspaces", "--config", ".fallowrc.jsonc", "--format", "json", "--quiet"],
  0
).json;
expectEqual("fallow workspace_count", Number(workspaceInventory.workspace_count), 89);
const workspacePaths = asArray(workspaceInventory.workspaces, "fallow workspaces").map((workspace, index) =>
  String(asRecord(workspace, `fallow workspaces[${index}]`).path)
);
for (const expectedPath of expectedWorkspacePaths) {
  if (!workspacePaths.includes(expectedPath)) {
    fail(`fallow workspaces: expected scaffold workspace path ${expectedPath}`);
  }
}

const pluginInventory = run(
  "fallow plugins",
  ["bun", "run", "fallow", "--", "list", "--plugins", "--config", ".fallowrc.jsonc", "--format", "json", "--quiet"],
  0
).json;
const pluginNames = asArray(pluginInventory.plugins, "fallow plugins").map((plugin, index) =>
  String(asRecord(plugin, `fallow plugins[${index}]`).name)
);
expectEqual("fallow plugin count", pluginNames.length, expectedPluginNames.length);
for (const expectedPlugin of expectedPluginNames) {
  if (!pluginNames.includes(expectedPlugin)) {
    fail(`fallow plugins: expected plugin ${expectedPlugin}`);
  }
}

const entryPointInventory = run(
  "fallow entry-points",
  [
    "bun",
    "run",
    "fallow",
    "--",
    "list",
    "--entry-points",
    "--config",
    ".fallowrc.jsonc",
    "--format",
    "json",
    "--quiet",
  ],
  0
);
expectEqual("fallow entry_point_count", Number(entryPointInventory.json.entry_point_count), 2488);
expectStringContains("fallow entry-point warnings", entryPointInventory.output, "Skipped");
expectStringContains("fallow entry-point warnings", entryPointInventory.output, "parent directory traversal");

console.log("knip/fallow parity baselines match recorded P0 evidence");
