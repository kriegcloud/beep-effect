#!/usr/bin/env node
import { readFileSync } from "node:fs"

const args = process.argv.slice(2)
const fileFlagIndex = args.indexOf("--file")
if (fileFlagIndex === -1 || !args[fileFlagIndex + 1]) {
  console.error("usage: node validate-whitepaper-draft.mjs --file <path>")
  process.exit(1)
}

const filePath = args[fileFlagIndex + 1]
const text = readFileSync(filePath, "utf8")

const failures = []
const requiredSectionHeaders = [
  "## S01. Executive Summary",
  "## S02. Problem and Context",
  "## S03. Conceptual Model and Terminology",
  "## S04. Architecture and Dataflow",
  "## S05. Methods and Reasoning",
  "## S06. Interfaces and Contracts",
  "## S07. Operations and Reliability",
  "## S08. Validation and Metrics",
  "## S09. Risks and Roadmap",
  "## S10. Traceability Annex Reference",
  "## Assumptions"
]

for (const header of requiredSectionHeaders) {
  if (!text.includes(header)) failures.push(`missing section header: ${header}`)
}

const topLevelHeaders = [...text.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim())
const expectedHeaders = [
  "S01. Executive Summary",
  "S02. Problem and Context",
  "S03. Conceptual Model and Terminology",
  "S04. Architecture and Dataflow",
  "S05. Methods and Reasoning",
  "S06. Interfaces and Contracts",
  "S07. Operations and Reliability",
  "S08. Validation and Metrics",
  "S09. Risks and Roadmap",
  "S10. Traceability Annex Reference",
  "Assumptions"
]
if (JSON.stringify(topLevelHeaders) !== JSON.stringify(expectedHeaders)) {
  failures.push("top-level section model is not aligned to required S01-S10 + Assumptions sequence")
}

for (let sectionIndex = 1; sectionIndex <= 10; sectionIndex += 1) {
  const sectionId = `S${String(sectionIndex).padStart(2, "0")}`
  const sectionStart = text.indexOf(`## ${sectionId}.`)
  const nextSectionStart = sectionIndex < 10 ? text.indexOf(`## S${String(sectionIndex + 1).padStart(2, "0")}.`) : text.indexOf("## Assumptions")
  if (sectionStart === -1 || nextSectionStart === -1) continue
  const sectionText = text.slice(sectionStart, nextSectionStart)
  if (!/^- Claim IDs:\s+.+/m.test(sectionText)) failures.push(`${sectionId} missing Claim IDs line`)
  if (!/^- Evidence IDs:\s+.+/m.test(sectionText)) failures.push(`${sectionId} missing Evidence IDs line`)
}

const assumptionsIndex = text.indexOf("## Assumptions")
const mainBodyText = assumptionsIndex === -1 ? text : text.slice(0, assumptionsIndex)
const mainBodyWords = (mainBodyText.match(/[A-Za-z0-9_'-]+/g) ?? []).length
if (mainBodyWords < 7000 || mainBodyWords > 10000) {
  failures.push(`word count out of range: ${mainBodyWords}`)
}

if (!text.includes("C-002") || !text.includes("E-S03-005")) {
  failures.push("missing required deferred reliability caveat references")
}
if (!text.includes("D11 governance risks remain open by design")) {
  failures.push("missing required D11 caveat language")
}

if (/\b(TODO|TBD|PLACEHOLDER|FIXME)\b/.test(text)) {
  failures.push("placeholder token found in manuscript")
}

if (failures.length > 0) {
  console.error(`validate-whitepaper-draft: FAIL (${filePath})`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`validate-whitepaper-draft: PASS (${filePath})`)
console.log(`main body words: ${mainBodyWords}`)
