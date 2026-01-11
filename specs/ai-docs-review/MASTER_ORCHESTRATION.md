# AI Documentation Review: Master Orchestration

## Overview

This document defines the complete workflow for reviewing AI documentation in the beep-effect monorepo. Follow each phase sequentially, using handoff documents to preserve context between sessions.

---

## Phase Summary

| Phase | Agent | Input | Output | Duration |
|-------|-------|-------|--------|----------|
| 1: Discovery | `codebase-researcher` | Scope definition | `outputs/inventory.md` | ~30 min |
| 2.1: Accuracy | `code-reviewer` | Inventory | `outputs/accuracy-report.md` | ~45 min |
| 2.2: Cross-Ref | `architecture-pattern-enforcer` | Inventory | `outputs/cross-ref-report.md` | ~45 min |
| 3: Synthesis | `reflector` | Both reports | `outputs/remediation-plan.md` | ~30 min |

---

## Phase 1: Discovery

### Objective
Create complete inventory of AI documentation files with metadata and reference mapping.

### Scope
- `.claude/` directory (all files)
- Root `CLAUDE.md` and `AGENTS.md`

### Tasks

#### 1.1 File Inventory
For each file, record:
- Full path
- Type: `agent` | `skill` | `command` | `rule` | `template` | `config`
- Line count
- Has frontmatter: Yes | No

#### 1.2 Reference Extraction
Extract from each file:
- Internal references: `[text](path)` markdown links
- Path mentions: `packages/*`, `apps/*`, `documentation/*`
- External URLs
- MCP tool references

#### 1.3 Reference Graph
Build:
- Adjacency list: file → referenced files
- Orphaned files: referenced but missing
- Unreferenced files: exist but never linked

### Agent Deployment
```
Deploy: codebase-researcher
Prompt: See AGENT_PROMPTS.md → "Discovery Agent"
```

### Success Criteria
- [ ] 100% of files in scope inventoried
- [ ] All file references extracted
- [ ] Reference graph completed
- [ ] `outputs/inventory.md` created

### Handoff
→ Create `handoffs/HANDOFF_P1.md` with inventory summary

---

## Phase 2.1: Accuracy Evaluation

### Objective
Evaluate documentation accuracy against current codebase state.

### Input
- `outputs/inventory.md` from Phase 1

### Tasks

#### 2.1.1 Code Example Validation
For each code block:
- Check import style (namespace vs named)
- Verify Schema constructors (PascalCase)
- Check for async/await (forbidden)
- Verify native method usage (forbidden)

#### 2.1.2 Reference Currency
Check for:
- Deleted packages (`@beep/mock`, `@beep/yjs`, `@beep/lexical-schemas`)
- Renamed files/directories
- Changed command syntax

#### 2.1.3 Pattern Consistency
Compare code examples against:
- `.claude/rules/effect-patterns.md`
- `.claude/skills/effect-imports.md`
- `.claude/skills/forbidden-patterns.md`

### Agent Deployment
```
Deploy: code-reviewer
Prompt: See AGENT_PROMPTS.md → "Accuracy Auditor"
```

### Success Criteria
- [ ] All files evaluated for accuracy
- [ ] Severity assigned to each finding
- [ ] Score calculated (1-5)
- [ ] `outputs/accuracy-report.md` created

---

## Phase 2.2: Cross-Reference Evaluation

### Objective
Verify all internal and external references are valid.

### Input
- `outputs/inventory.md` from Phase 1

### Tasks

#### 2.2.1 Link Validation
For each markdown link `[text](path)`:
- Resolve relative to file location
- Check if target exists
- Record status: `VALID` | `BROKEN` | `REDIRECTED`

#### 2.2.2 Path Reference Validation
For mentions of:
- `packages/*/` paths
- `apps/*/` paths
- `documentation/*/` paths
- `specs/*/` paths

Verify:
- Directory/file exists
- Path is correct case

#### 2.2.3 External URL Logging
Flag external URLs for manual review (don't validate).

### Agent Deployment
```
Deploy: architecture-pattern-enforcer
Prompt: See AGENT_PROMPTS.md → "Cross-Reference Validator"
```

### Success Criteria
- [ ] All internal links validated
- [ ] All path references checked
- [ ] External URLs logged
- [ ] Score calculated (1-5)
- [ ] `outputs/cross-ref-report.md` created

### Handoff
→ Create `handoffs/HANDOFF_P2.md` with evaluation summary

---

## Phase 3: Synthesis

### Objective
Consolidate findings into prioritized remediation plan.

### Inputs
- `outputs/accuracy-report.md`
- `outputs/cross-ref-report.md`

### Tasks

#### 3.1 Finding Consolidation
- Merge findings from both reports
- De-duplicate overlapping issues
- Normalize finding format

#### 3.2 Priority Assignment

| Impact \ Effort | Low | High |
|-----------------|-----|------|
| High | P1 | P2 |
| Low | P3 | P4 |

#### 3.3 Remediation Grouping
Group by:
- File type (agents, skills, rules)
- Issue type (accuracy, consistency, cross-ref)
- Effort bucket (quick fix, moderate, significant)

#### 3.4 Plan Generation
For each finding:
- Current state (quote)
- Issue description
- Recommended fix
- Estimated effort

### Agent Deployment
```
Deploy: reflector
Prompt: See AGENT_PROMPTS.md → "Synthesis Agent"
```

### Success Criteria
- [ ] All findings consolidated
- [ ] Priorities assigned with rationale
- [ ] Remediation plan actionable
- [ ] `outputs/remediation-plan.md` created

---

## Verification Commands

```bash
# Check all outputs exist
ls -la specs/ai-docs-review/outputs/

# Verify inventory completeness
wc -l specs/ai-docs-review/outputs/inventory.md

# Check for broken internal links in reports
grep -c "NOT FOUND\|BROKEN" specs/ai-docs-review/outputs/*.md
```

---

## Self-Reflection Checkpoint

After each phase, update `REFLECTION_LOG.md` with:
- What worked well
- What needed adjustment
- Prompt improvements discovered
- Insights about documentation state

---

## Context Preservation

### Between Sessions
Use handoff documents (`handoffs/HANDOFF_P[N].md`) to:
- Summarize completed work
- Record key metrics
- Provide ready-to-use prompts for next phase

### For Future Runs
Update this document with:
- Detection patterns that worked
- Agent prompt refinements
- Rubric adjustments
