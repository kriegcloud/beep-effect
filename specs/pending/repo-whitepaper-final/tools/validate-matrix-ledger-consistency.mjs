#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

const root = "specs/pending/repo-whitepaper-final"
const matrixPath = join(root, "outputs/p2/claim-evidence-matrix.json")
const ledgerPath = join(root, "outputs/p2/citation-ledger.md")
const docsetDir = "specs/completed/repo-whitepaper-docset-canonical/outputs/docset"

const failures = []

const matrix = JSON.parse(readFileSync(matrixPath, "utf8"))
const ledgerText = readFileSync(ledgerPath, "utf8")

const claimIds = new Set()
const evidenceIds = new Set()
for (const section of matrix.sectionLinks) {
  for (const link of section.links) {
    claimIds.add(link.claimId)
    for (const evidenceId of link.evidenceIds) evidenceIds.add(evidenceId)
  }
}

const ledgerRows = [...ledgerText.matchAll(/\|\s*(E-[^\s|]+)\s*\|\s*(D\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|/g)]
const ledgerEvidenceIds = new Set(ledgerRows.map((match) => match[1]))

for (const evidenceId of evidenceIds) {
  if (!ledgerEvidenceIds.has(evidenceId)) {
    failures.push(`matrix evidence missing in citation ledger: ${evidenceId}`)
  }
}

for (const [, evidenceId, , sourcePath] of ledgerRows) {
  const normalizedPath = sourcePath.trim()
  if (!normalizedPath.includes("*")) {
    if (!existsSync(normalizedPath)) {
      failures.push(`citation source path missing: ${evidenceId} -> ${normalizedPath}`)
    }
  }
}

const docText = readdirSync(docsetDir)
  .filter((file) => /^D\d+\.md$/.test(file))
  .sort()
  .map((file) => readFileSync(join(docsetDir, file), "utf8"))
  .join("\n")

for (const claimId of claimIds) {
  if (!docText.includes(claimId)) failures.push(`claim ID not found in D01-D12: ${claimId}`)
}

for (const evidenceId of evidenceIds) {
  if (!docText.includes(evidenceId)) failures.push(`evidence ID not found in D01-D12: ${evidenceId}`)
}

if (failures.length > 0) {
  console.error("validate-matrix-ledger-consistency: FAIL")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log("validate-matrix-ledger-consistency: PASS")
console.log(`claims: ${claimIds.size}, evidence IDs: ${evidenceIds.size}, ledger rows: ${ledgerRows.length}`)
