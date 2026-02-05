/**
 * @file analyze-agents Command Handler
 *
 * Main handler for the analyze-agents command. Orchestrates:
 * - Dynamic discovery of AGENTS.md files via FsUtils.glob
 * - Per-file analysis (stale refs, MCP tools, Effect compliance)
 * - Formatted output (table, json, summary)
 *
 * @module analyze-agents/handler
 * @since 1.0.0
 */

import { FsUtils, RepoUtils } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import color from "picocolors";

import { AnalyzeAgentsError } from "./errors.js";
import { AgentsMdAnalysis, type AnalyzeAgentsInput } from "./schemas.js";

// -----------------------------------------------------------------------------
// Orders
// -----------------------------------------------------------------------------

const byPathAsc: Order.Order<AgentsMdAnalysis> = Order.mapInput(Order.string, (a: AgentsMdAnalysis) => a.path);

const byStaleRefsDesc: Order.Order<AgentsMdAnalysis> = F.pipe(
  Order.number,
  Order.mapInput((a: AgentsMdAnalysis) => a.staleRefs),
  Order.reverse
);

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const DELETED_PACKAGES: ReadonlyArray<string> = ["@beep/core-db", "@beep/core-env", "@beep/platform-server"];

const MCP_PATTERNS: ReadonlyArray<RegExp> = [
  /tool:\s*"[^"]*mcp[^"]*"/gi,
  /jetbrains__/gi,
  /context7__/gi,
  /<invoke name="mcp_/gi,
];

interface AntiPattern {
  readonly pattern: RegExp;
  readonly issue: string;
}

const ANTI_PATTERNS: ReadonlyArray<AntiPattern> = [
  { pattern: /\.map\(/g, issue: "Uses native .map() instead of A.map()" },
  { pattern: /\.filter\(/g, issue: "Uses native .filter() instead of A.filter()" },
  { pattern: /\.split\(/g, issue: "Uses native .split() instead of Str.split()" },
  { pattern: /S\.struct\(/g, issue: "Uses lowercase S.struct instead of S.Struct" },
  { pattern: /S\.array\(/g, issue: "Uses lowercase S.array instead of S.Array" },
  { pattern: /S\.string/g, issue: "Uses lowercase S.string instead of S.String" },
  { pattern: /S\.number/g, issue: "Uses lowercase S.number instead of S.Number" },
  { pattern: /import.*from.*"effect"/g, issue: "Direct imports from 'effect' instead of namespace" },
  { pattern: /Effect\.runPromise/g, issue: "Uses Effect.runPromise instead of @beep/testkit" },
  { pattern: /import.*\{.*test.*\}.*from.*"bun:test"/g, issue: "Uses raw bun:test instead of @beep/testkit" },
];

// -----------------------------------------------------------------------------
// Per-file Analysis
// -----------------------------------------------------------------------------

const escapeRegex = (str: string): string => F.pipe(str, Str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const countMatches = (content: string, pattern: RegExp): number => {
  const matches = content.match(pattern);
  return O.fromNullable(matches).pipe(
    O.map((m) => m.length),
    O.getOrElse(() => 0)
  );
};

const analyzeFile = (
  filePath: string,
  repoRoot: string
): Effect.Effect<AgentsMdAnalysis, AnalyzeAgentsError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path_ = yield* Path.Path;

    const content = yield* fs.readFileString(filePath);

    const lines = Str.split(content, "\n");
    const lineCount = A.length(lines);
    const dir = path_.dirname(filePath);
    const issues: Array<string> = [];

    // Check for sibling package.json
    const packageJsonPath = path_.join(dir, "package.json");
    const hasPackageJson = yield* fs.exists(packageJsonPath);
    let packageName = "N/A";

    if (hasPackageJson) {
      const pkgContent = yield* fs.readFileString(packageJsonPath);
      const parsed = yield* Effect.try({
        try: () => JSON.parse(pkgContent) as { name?: string },
        catch: () =>
          new AnalyzeAgentsError({
            message: `Failed to parse ${packageJsonPath}`,
            operation: "parsePackageJson",
          }),
      });
      packageName = O.fromNullable(parsed.name).pipe(O.getOrElse(() => "N/A"));
    }

    // Check for sibling README.md
    const readmePath = path_.join(dir, "README.md");
    const hasReadme = yield* fs.exists(readmePath);

    // Count stale @beep/* references to deleted packages
    let staleRefs = 0;
    for (const pkg of DELETED_PACKAGES) {
      const escaped = escapeRegex(pkg);
      const pkgPattern = new RegExp(escaped, "g");
      const matchCount = countMatches(content, pkgPattern);
      if (matchCount > 0) {
        staleRefs = staleRefs + matchCount;
        issues.push(`References deleted package: ${pkg} (${matchCount} times)`);
      }
    }

    // Check for MCP tool patterns
    const hasMcpTools = A.some(MCP_PATTERNS, (pattern) => pattern.test(content));
    if (hasMcpTools) {
      issues.push("Contains MCP tool shortcuts");
    }

    // Check Effect pattern compliance
    let effectCompliant = true;
    for (const antiPattern of ANTI_PATTERNS) {
      const matchCount = countMatches(content, antiPattern.pattern);
      if (matchCount > 0) {
        effectCompliant = false;
        issues.push(`${antiPattern.issue} (${matchCount} occurrences)`);
      }
    }

    // Compute relative path from repo root
    const relativePath = path_.relative(repoRoot, filePath);

    return new AgentsMdAnalysis({
      path: relativePath,
      packageName,
      lineCount,
      hasPackageJson,
      hasReadme,
      staleRefs,
      hasMcpTools,
      effectCompliant,
      issues,
    });
  }).pipe(
    Effect.catchAll((cause) =>
      Effect.fail(
        new AnalyzeAgentsError({
          message: `Failed to analyze ${filePath}`,
          underlyingCause: cause,
          operation: "analyzeFile",
        })
      )
    ),
    Effect.withSpan("analyzeFile", { attributes: { filePath } })
  );

// -----------------------------------------------------------------------------
// Formatting
// -----------------------------------------------------------------------------

const boolToYesNo = (value: boolean): string => (value ? "Yes" : "No");

const formatTable = (results: ReadonlyArray<AgentsMdAnalysis>): string => {
  const totalFiles = A.length(results);
  const totalLines = A.reduce(results, 0, (acc, r) => acc + r.lineCount);
  const filesWithReadme = F.pipe(
    results,
    A.filter((r) => r.hasReadme),
    A.length
  );
  const filesWithStaleRefs = F.pipe(
    results,
    A.filter((r) => r.staleRefs > 0),
    A.length
  );
  const effectCompliantCount = F.pipe(
    results,
    A.filter((r) => r.effectCompliant),
    A.length
  );
  const effectCompliantPercent = totalFiles > 0 ? Num.round((effectCompliantCount / totalFiles) * 100, 0) : 0;

  let output = `# AGENTS.md Files Inventory

## Summary
- Total AGENTS.md files: ${totalFiles}
- Total lines: ${totalLines}
- Files with README.md: ${filesWithReadme}
- Files with stale references: ${filesWithStaleRefs}
- Effect compliant: ${effectCompliantPercent}%

## Inventory Table

| Path | Package | Lines | package.json | README.md | Stale Refs | MCP Tools | Compliant |
|------|---------|-------|--------------|-----------|------------|-----------|-----------|
`;

  for (const r of results) {
    output = Str.concat(
      output,
      `| ${r.path} | ${r.packageName} | ${r.lineCount} | ${boolToYesNo(r.hasPackageJson)} | ${boolToYesNo(r.hasReadme)} | ${r.staleRefs} | ${boolToYesNo(r.hasMcpTools)} | ${boolToYesNo(r.effectCompliant)} |\n`
    );
  }

  // Gap analysis
  output = Str.concat(output, "\n## Gap Analysis\n\n");

  // Files with stale references
  const staleFiles = F.pipe(
    results,
    A.filter((r) => r.staleRefs > 0),
    A.sort(byStaleRefsDesc)
  );
  if (A.isNonEmptyReadonlyArray(staleFiles)) {
    output = Str.concat(output, "### Files with Stale References\n\n");
    for (const r of staleFiles) {
      output = Str.concat(output, `- **${r.path}** (${r.staleRefs} stale references)\n`);
    }
  }

  // Non-compliant files
  const nonCompliantFiles = A.filter(results, (r) => !r.effectCompliant);
  if (A.isNonEmptyReadonlyArray(nonCompliantFiles)) {
    output = Str.concat(output, `\n### Non-Effect-Compliant Files (${A.length(nonCompliantFiles)})\n\n`);
    for (const r of nonCompliantFiles) {
      output = Str.concat(output, `- **${r.path}**\n`);
    }
  }

  // Files with MCP tools
  const mcpFiles = A.filter(results, (r) => r.hasMcpTools);
  if (A.isNonEmptyReadonlyArray(mcpFiles)) {
    output = Str.concat(output, `\n### Files with MCP Tool Shortcuts (${A.length(mcpFiles)})\n\n`);
    for (const r of mcpFiles) {
      output = Str.concat(output, `- ${r.path}\n`);
    }
  }

  // Detailed issues
  output = Str.concat(output, "\n## Detailed Issues\n\n");
  for (const r of results) {
    if (A.isNonEmptyReadonlyArray(r.issues)) {
      output = Str.concat(output, `### ${r.path}\n\n`);
      for (const issue of r.issues) {
        output = Str.concat(output, `- ${issue}\n`);
      }
      output = Str.concat(output, "\n");
    }
  }

  return output;
};

const formatJson = (results: ReadonlyArray<AgentsMdAnalysis>): string => JSON.stringify(results, null, 2);

const formatSummary = (results: ReadonlyArray<AgentsMdAnalysis>): string => {
  const totalFiles = A.length(results);
  const totalLines = A.reduce(results, 0, (acc, r) => acc + r.lineCount);
  const filesWithReadme = F.pipe(
    results,
    A.filter((r) => r.hasReadme),
    A.length
  );
  const filesWithStaleRefs = F.pipe(
    results,
    A.filter((r) => r.staleRefs > 0),
    A.length
  );
  const effectCompliantCount = F.pipe(
    results,
    A.filter((r) => r.effectCompliant),
    A.length
  );
  const effectCompliantPercent = totalFiles > 0 ? Num.round((effectCompliantCount / totalFiles) * 100, 0) : 0;
  const mcpToolCount = F.pipe(
    results,
    A.filter((r) => r.hasMcpTools),
    A.length
  );

  return F.pipe(
    [
      color.cyan("AGENTS.md Analysis Summary"),
      "",
      `  Total files:          ${totalFiles}`,
      `  Total lines:          ${totalLines}`,
      `  With README.md:       ${filesWithReadme}`,
      `  With stale refs:      ${filesWithStaleRefs}`,
      `  Effect compliant:     ${effectCompliantCount}/${totalFiles} (${effectCompliantPercent}%)`,
      `  With MCP tools:       ${mcpToolCount}`,
    ],
    A.join("\n")
  );
};

// -----------------------------------------------------------------------------
// Main Handler
// -----------------------------------------------------------------------------

/**
 * Main handler for the analyze-agents command.
 *
 * @since 0.1.0
 * @category handlers
 */
export const analyzeAgentsHandler = (input: AnalyzeAgentsInput) =>
  Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const repo = yield* RepoUtils;
    const path_ = yield* Path.Path;
    const repoRoot = repo.REPOSITORY_ROOT;

    if (input.verbose) {
      yield* Console.log(color.cyan("Discovering AGENTS.md files..."));
    }

    // Discover all AGENTS.md files
    const allFiles = yield* fsUtils
      .glob("**/AGENTS.md", {
        cwd: repoRoot,
        ignore: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
      })
      .pipe(
        Effect.mapError(
          (cause) =>
            new AnalyzeAgentsError({
              message: "Failed to glob for AGENTS.md files",
              underlyingCause: cause,
              operation: "glob",
            })
        )
      );

    // Resolve to absolute paths
    const absolutePaths = A.map(allFiles, (file) => path_.join(repoRoot, file));

    // Apply optional filter
    const filteredPaths = O.fromNullable(input.filter).pipe(
      O.match({
        onNone: () => absolutePaths,
        onSome: (filterPattern) =>
          A.filter(absolutePaths, (filePath) => {
            const relative = path_.relative(repoRoot, filePath);
            return F.pipe(relative, Str.includes(filterPattern));
          }),
      })
    );

    const fileCount = A.length(filteredPaths);
    if (input.verbose) {
      yield* Console.log(color.green(`Found ${fileCount} AGENTS.md files`));
    }

    if (fileCount === 0) {
      yield* Console.log(color.yellow("No AGENTS.md files found matching the criteria."));
      return;
    }

    // Analyze each file
    const results = yield* Effect.forEach(filteredPaths, (filePath) => analyzeFile(filePath, repoRoot), {
      concurrency: 10,
    });

    // Sort results by path for stable output
    const sortedResults = A.sort(results, byPathAsc);

    // Format and output
    const output = F.pipe(input.format, (format) => {
      if (format === "json") return formatJson(sortedResults);
      if (format === "summary") return formatSummary(sortedResults);
      return formatTable(sortedResults);
    });

    yield* Console.log(output);
  }).pipe(Effect.withSpan("analyzeAgentsHandler"));
