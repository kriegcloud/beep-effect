#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const opsDir = dirname(fileURLToPath(import.meta.url));
const initiativeDir = dirname(opsDir);
const findingsDir = join(initiativeDir, "findings");
const triagePath = join(opsDir, "triage.json");
const indexPath = join(findingsDir, "INDEX.md");
const manifestPath = join(opsDir, "manifest.json");

const verdictOrder = ["needs-current-head-review", "active", "dismissed", "fixed"];
const today = new Date().toISOString().slice(0, 10);

const triage = JSON.parse(await readFile(triagePath, "utf8"));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const findingPaths = manifest.paths.findings.map((path) => join(initiativeDir, path));

const formatList = (items) => (items.length === 0 ? ["  - none"] : items.map((item) => `  - ${item}`));

const sectionFor = (entry) =>
  [
    `- Verdict: \`${entry.verdict}\``,
    `- Rationale: ${entry.rationale}`,
    `- Remediation status: \`${entry.remediationStatus}\``,
    `- Verification command: \`${entry.verificationCommand}\``,
    "- Changed files:",
    ...formatList(entry.changedFiles ?? []),
    "- Verification notes:",
    ...formatList(entry.verificationNotes ?? []),
  ].join("\n");

for (const findingPath of findingPaths) {
  const id = basename(findingPath).slice(0, 7);
  const entry = triage[id];
  if (entry === undefined) {
    continue;
  }

  let content = await readFile(findingPath, "utf8");
  content = content.replace(/\| Triage verdict \| [^|]+ \|/u, `| Triage verdict | ${entry.verdict} |`);
  content = content.replace(/\| Codex close reason \| [^|]+ \|/u, `| Codex close reason | ${entry.closeReason} |`);
  content = content.replace(
    /## Current-HEAD Triage\n\n[\s\S]*?\n\n## Evidence Paths/u,
    `## Current-HEAD Triage\n\n${sectionFor(entry)}\n\n## Evidence Paths`
  );
  await writeFile(findingPath, content);
}

let index = await readFile(indexPath, "utf8");
const counts = Object.fromEntries(verdictOrder.map((verdict) => [verdict, 0]));

for (const findingPath of findingPaths) {
  const id = basename(findingPath).slice(0, 7);
  const entry = triage[id];
  const content = await readFile(findingPath, "utf8");
  const verdict = entry?.verdict ?? content.match(/\| Triage verdict \| ([^|]+) \|/u)?.[1]?.trim();
  counts[verdict] = (counts[verdict] ?? 0) + 1;

  if (entry !== undefined) {
    const relativeFinding = `./${relative(findingsDir, findingPath)}`;
    const rowPattern = new RegExp(
      `\\| ${id} \\| ([^|]+) \\| ([^|]+) \\| ([^|]+) \\| (\\[[^\\]]+\\]\\(${relativeFinding.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\)) \\| ([^|]+) \\| ([^|]+) \\|`,
      "u"
    );
    index = index.replace(rowPattern, `| ${id} | $1 | ${entry.verdict} | $3 | $4 | $5 | $6 |`);
  }
}

index = index.replace(
  /## Queue Summary\n\n\| Status \| Count \|\n\|---\|---:\|\n(?:\|.*\|\n){4}/u,
  [
    "## Queue Summary",
    "",
    "| Status | Count |",
    "|---|---:|",
    ...verdictOrder.map((verdict) => `| ${verdict} | ${counts[verdict] ?? 0} |`),
    "",
  ].join("\n")
);

await writeFile(indexPath, index);

manifest.initiative.updated = today;
manifest.initiative.status =
  (counts["needs-current-head-review"] ?? 0) === 0 ? "triaged-remediation-active" : "catalog-captured-triage-active";
manifest.catalog.verdictCounts = counts;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
