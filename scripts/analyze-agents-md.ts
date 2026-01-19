#!/usr/bin/env bun
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

interface AgentsMdAnalysis {
  path: string;
  packageName: string;
  lineCount: number;
  hasPackageJson: boolean;
  hasReadme: boolean;
  staleRefs: number;
  hasMcpTools: boolean;
  effectCompliant: boolean;
  issues: string[];
}

const agentsMdFiles = [
  "/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/apps/marketing/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/apps/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/apps/todox/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/apps/web/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/constants/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/errors/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/identity/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/invariant/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/types/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/common/utils/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/comms/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/comms/domain/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/comms/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/comms/tables/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/comms/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/customization/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/customization/domain/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/customization/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/customization/tables/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/customization/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/domain/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/tables/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/documents/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/domain/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/tables/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/_internal/db-admin/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/client/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/env/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/server/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/core/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/tooling/build-utils/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/tooling/repo-scripts/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md",
  "/home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/AGENTS.md",
];

// Known stale/deleted packages
const deletedPackages = [
  "@beep/core-db",
  "@beep/core-env",
  "@beep/platform-server",
];

function analyzeAgentsMd(filePath: string): AgentsMdAnalysis {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const dir = dirname(filePath);
  const issues: string[] = [];

  // Check for package.json
  const packageJsonPath = join(dir, "package.json");
  const hasPackageJson = existsSync(packageJsonPath);
  let packageName = "N/A";

  if (hasPackageJson) {
    try {
      const pkgJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      packageName = pkgJson.name || "N/A";
    } catch (e) {
      packageName = "ERROR";
    }
  }

  // Check for README.md
  const hasReadme = existsSync(join(dir, "README.md"));

  // Count stale @beep/* references
  let staleRefs = 0;
  deletedPackages.forEach((pkg) => {
    const matches = content.match(new RegExp(pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
    if (matches) {
      staleRefs += matches.length;
      issues.push(`References deleted package: ${pkg} (${matches.length} times)`);
    }
  });

  // Check for MCP tool shortcuts
  const mcpPatterns = [
    /tool:\s*"[^"]*mcp[^"]*"/gi,
    /jetbrains__/gi,
    /context7__/gi,
    /<invoke name="mcp_/gi,
  ];
  const hasMcpTools = mcpPatterns.some((pattern) => pattern.test(content));
  if (hasMcpTools) {
    issues.push("Contains MCP tool shortcuts");
  }

  // Check Effect pattern compliance
  let effectCompliant = true;

  // Anti-patterns
  const antiPatterns = [
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

  antiPatterns.forEach(({ pattern, issue: issueText }) => {
    const matches = content.match(pattern);
    if (matches) {
      effectCompliant = false;
      issues.push(`${issueText} (${matches.length} occurrences)`);
    }
  });

  return {
    path: filePath.replace("/home/elpresidank/YeeBois/projects/beep-effect/", ""),
    packageName,
    lineCount: lines.length,
    hasPackageJson,
    hasReadme,
    staleRefs,
    hasMcpTools,
    effectCompliant,
    issues,
  };
}

// Analyze all files
const results = agentsMdFiles.map(analyzeAgentsMd);

// Generate statistics
const totalFiles = results.length;
const totalLines = results.reduce((sum, r) => sum + r.lineCount, 0);
const filesWithReadme = results.filter((r) => r.hasReadme).length;
const filesWithStaleRefs = results.filter((r) => r.staleRefs > 0).length;
const effectCompliantCount = results.filter((r) => r.effectCompliant).length;
const effectCompliantPercent = Math.round((effectCompliantCount / totalFiles) * 100);

// Generate markdown output
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

results.forEach((r) => {
  output += `| ${r.path} | ${r.packageName} | ${r.lineCount} | ${r.hasPackageJson ? "Yes" : "No"} | ${r.hasReadme ? "Yes" : "No"} | ${r.staleRefs} | ${r.hasMcpTools ? "Yes" : "No"} | ${r.effectCompliant ? "Yes" : "No"} |\n`;
});

// Gap analysis
output += `\n## Gap Analysis\n\n`;

// Files with most stale references
const staleFiles = results.filter((r) => r.staleRefs > 0).sort((a, b) => b.staleRefs - a.staleRefs);
if (staleFiles.length > 0) {
  output += `### Files with Stale References\n\n`;
  staleFiles.forEach((r) => {
    output += `- **${r.path}** (${r.staleRefs} stale references)\n`;
  });
}

// Non-compliant files
const nonCompliantFiles = results.filter((r) => !r.effectCompliant);
if (nonCompliantFiles.length > 0) {
  output += `\n### Non-Effect-Compliant Files (${nonCompliantFiles.length})\n\n`;
  nonCompliantFiles.forEach((r) => {
    output += `- **${r.path}**\n`;
  });
}

// Files with MCP tools
const mcpFiles = results.filter((r) => r.hasMcpTools);
if (mcpFiles.length > 0) {
  output += `\n### Files with MCP Tool Shortcuts (${mcpFiles.length})\n\n`;
  mcpFiles.forEach((r) => {
    output += `- ${r.path}\n`;
  });
}

// Detailed issues
output += `\n## Detailed Issues\n\n`;
results.forEach((r) => {
  if (r.issues.length > 0) {
    output += `### ${r.path}\n\n`;
    r.issues.forEach((issue) => {
      output += `- ${issue}\n`;
    });
    output += `\n`;
  }
});

console.log(output);
