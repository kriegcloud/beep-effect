#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs"

const gatesPath = "specs/pending/repo-whitepaper-final/outputs/p5/publication-gates.json"
const requiredGateIds = [
  "G-STRUCTURE-COMPLETE",
  "G-WORD-COUNT-RANGE",
  "G-EVIDENCE-ANCHOR-INTEGRITY",
  "G-CITATION-LEDGER-CONSISTENCY",
  "G-CAVEAT-PRESERVATION",
  "G-TECHNICAL-REVIEW-PASS",
  "G-EDITORIAL-REVIEW-PASS",
  "G-MUST-FIX-CLOSED",
  "G-NO-PLACEHOLDERS",
  "G-CLAIM-ID-VALIDITY",
  "G-EVIDENCE-ID-VALIDITY",
  "G-MATRIX-LEDGER-CONSISTENCY",
  "G-SECTION-MODEL-ALIGNMENT",
  "G-ASSUMPTION-SEPARATION"
]

const failures = []
const gates = JSON.parse(readFileSync(gatesPath, "utf8"))

const byId = new Map()
for (const gate of gates) {
  if (byId.has(gate.gateId)) failures.push(`duplicate gate ID: ${gate.gateId}`)
  byId.set(gate.gateId, gate)
}

for (const gateId of requiredGateIds) {
  const gate = byId.get(gateId)
  if (!gate) {
    failures.push(`missing required gate: ${gateId}`)
    continue
  }
  if (gate.result !== "pass") failures.push(`gate is not pass: ${gateId} -> ${gate.result}`)
  if (!gate.evidencePath || !existsSync(gate.evidencePath)) failures.push(`invalid evidencePath for ${gateId}: ${gate.evidencePath}`)
  if (!gate.checkedAt) failures.push(`missing checkedAt for ${gateId}`)
  if (!gate.checker) failures.push(`missing checker for ${gateId}`)
}

if (gates.length !== requiredGateIds.length) {
  failures.push(`unexpected gate count: expected ${requiredGateIds.length}, got ${gates.length}`)
}

if (failures.length > 0) {
  console.error("validate-publication-gates: FAIL")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log("validate-publication-gates: PASS")
