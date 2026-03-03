#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = "specs/pending/repo-whitepaper-final"

const requiredFiles = [
  "README.md",
  "QUICK_START.md",
  "MASTER_ORCHESTRATION.md",
  "RUBRICS.md",
  "REFLECTION_LOG.md",
  "outputs/manifest.json",
  "outputs/p0/initial-plan.md",
  "outputs/p0/spec-review-findings.md",
  "outputs/p0/spec-review-issue-register.json",
  "outputs/p1/whitepaper-brief.md",
  "outputs/p1/section-contracts.md",
  "outputs/p1/style-guide.md",
  "outputs/p2/claim-evidence-matrix.json",
  "outputs/p2/citation-ledger.md",
  "outputs/p2/assumption-register.md",
  "outputs/p3/whitepaper-v1.md",
  "outputs/p3/draft-qc-report.md",
  "outputs/p4/technical-review.md",
  "outputs/p4/editorial-review.md",
  "outputs/p4/revision-resolution-log.md",
  "outputs/p5/whitepaper-final.md",
  "outputs/p5/evidence-annex.md",
  "outputs/p5/publication-export-plan.md",
  "outputs/p5/publication-gates.json",
  "outputs/p6/final-signoff-summary.md",
  "handoffs/HANDOFF_P0.md",
  "handoffs/HANDOFF_P1.md",
  "handoffs/HANDOFF_P2.md",
  "handoffs/HANDOFF_P3.md",
  "handoffs/HANDOFF_P4.md",
  "handoffs/HANDOFF_P5.md",
  "handoffs/HANDOFF_P6.md"
]

const placeholderScanFiles = [
  "outputs/p1/whitepaper-brief.md",
  "outputs/p1/section-contracts.md",
  "outputs/p1/style-guide.md",
  "outputs/p2/citation-ledger.md",
  "outputs/p2/assumption-register.md",
  "outputs/p3/whitepaper-v1.md",
  "outputs/p4/technical-review.md",
  "outputs/p4/editorial-review.md",
  "outputs/p4/revision-resolution-log.md",
  "outputs/p5/whitepaper-final.md",
  "outputs/p5/evidence-annex.md",
  "outputs/p5/publication-export-plan.md",
  "outputs/p6/final-signoff-summary.md",
  "handoffs/HANDOFF_P0.md",
  "handoffs/HANDOFF_P1.md",
  "handoffs/HANDOFF_P2.md",
  "handoffs/HANDOFF_P3.md",
  "handoffs/HANDOFF_P4.md",
  "handoffs/HANDOFF_P5.md",
  "handoffs/HANDOFF_P6.md"
]
const placeholderPattern = /\b(TODO|TBD|PLACEHOLDER|FIXME)\b/

const failures = []

for (const rel of requiredFiles) {
  const abs = join(root, rel)
  if (!existsSync(abs)) {
    failures.push(`missing required file: ${rel}`)
  }
}

for (const rel of placeholderScanFiles) {
  const abs = join(root, rel)
  if (!existsSync(abs)) continue
  const txt = readFileSync(abs, "utf8")
  if (placeholderPattern.test(txt)) {
    failures.push(`placeholder token found in: ${rel}`)
  }
}

try {
  const manifest = JSON.parse(readFileSync(join(root, "outputs/manifest.json"), "utf8"))
  if (manifest.status !== "complete_pending_promotion") {
    failures.push(`manifest.status expected 'complete_pending_promotion' got '${manifest.status}'`)
  }
  const sections = manifest?.sectionModel?.sections ?? []
  const expectedSections = ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10"]
  if (JSON.stringify(sections) !== JSON.stringify(expectedSections)) {
    failures.push("manifest sectionModel.sections does not match expected S01-S10")
  }
} catch (error) {
  failures.push(`manifest parse failure: ${String(error)}`)
}

if (failures.length > 0) {
  console.error("validate-spec-integrity: FAIL")
  for (const f of failures) console.error(`- ${f}`)
  process.exit(1)
}

console.log("validate-spec-integrity: PASS")
