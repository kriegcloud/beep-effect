# AI Documentation Review: Agent Prompts

## Overview

This document contains ready-to-use prompts for sub-agents deployed during each phase of the AI documentation review.

---

## Phase 1: Discovery Agent

**Agent**: `codebase-researcher`

```markdown
# AI Documentation Inventory Agent

## Objective
Create complete inventory of all AI documentation files with metadata and references.

## Scope
- `.claude/` directory (all files)
- Root `CLAUDE.md` and `AGENTS.md`

## Tasks

### 1. File Inventory
For each file, record:
- Full path
- Type: agent | skill | command | rule | template | config
- Line count
- Has frontmatter: Yes | No

### 2. Reference Extraction
Extract from each file:
- Internal references: `[text](path)` links
- Path mentions: `packages/*`, `apps/*`, `documentation/*`
- External URLs
- MCP tool references

### 3. Reference Graph
Build:
- Adjacency list: file -> referenced files
- Orphaned files: referenced but missing
- Unreferenced files: exist but never linked

## Output Format
Use `templates/inventory.template.md`

## Constraints
- Read-only analysis
- Report exact line numbers for references
- Include file counts by type
```

---

## Phase 2.1: Accuracy Auditor

**Agent**: `code-reviewer`

```markdown
# Accuracy Auditor Agent

## Objective
Evaluate documentation accuracy against current codebase state.

## Input
Read `outputs/inventory.md` from Phase 1 first.

## Tasks

### 1. Code Example Validation
For each code block in each file:
- Check import style (namespace vs named imports)
- Verify Schema constructors use PascalCase
- Check for async/await usage (forbidden)
- Verify no native method usage (forbidden)

### 2. Reference Currency
Check for references to:
- Deleted packages: @beep/mock, @beep/yjs, @beep/lexical-schemas
- Renamed files/directories
- Changed command syntax

### 3. Pattern Consistency
Compare code examples against:
- `.claude/rules/effect-patterns.md`
- `.claude/skills/effect-imports.md`
- `.claude/skills/forbidden-patterns.md`

## Severity Classification
- CRITICAL: Actively misleading (wrong imports, deleted packages)
- HIGH: Outdated patterns (lowercase Schema constructors)
- MEDIUM: Minor inconsistencies
- LOW: Cosmetic issues

## Output Format
Use `templates/accuracy-report.template.md`

## Detection Commands
```bash
# Deprecated Schema patterns
grep -rn "S\.struct\|S\.array\|S\.string" .claude/ --include="*.md"

# Named imports
grep -rn "import { .* } from ['\"]effect" .claude/ --include="*.md"

# Stale packages
grep -rn "@beep/mock\|@beep/yjs\|@beep/lexical" .claude/ --include="*.md"
```
```

---

## Phase 2.2: Cross-Reference Validator

**Agent**: `architecture-pattern-enforcer`

```markdown
# Cross-Reference Validator Agent

## Objective
Verify all internal and external references are valid.

## Input
Read `outputs/inventory.md` from Phase 1 first.

## Tasks

### 1. Link Validation
For each markdown link `[text](path)`:
- Resolve path relative to file location
- Check if target file/directory exists
- Record status: VALID | BROKEN | REDIRECTED

### 2. Path Reference Validation
For mentions of:
- `packages/*/` paths
- `apps/*/` paths
- `documentation/*/` paths
- `specs/*/` paths

Verify:
- Directory/file exists at specified path
- Path case is correct (case-sensitive filesystem)

### 3. External URL Logging
For external URLs (http://, https://):
- Log for manual review
- Do not validate (may require network)

## Output Format
Use `templates/cross-ref-report.template.md`

## Detection Commands
```bash
# Extract markdown links
grep -oE "\[.*\]\([^)]+\)" .claude/**/*.md

# Path references
grep -rn "packages/\|apps/\|documentation/" .claude/ --include="*.md"

# Package references
grep -rn "@beep/[a-z-]*" .claude/ --include="*.md"
```
```

---

## Phase 3: Synthesis Agent

**Agent**: `reflector`

```markdown
# Remediation Synthesis Agent

## Objective
Consolidate findings from Phase 2 into prioritized remediation plan.

## Inputs
Read these files first:
- `outputs/accuracy-report.md`
- `outputs/cross-ref-report.md`

## Tasks

### 1. Finding Consolidation
- Merge findings from both reports
- De-duplicate overlapping issues
- Normalize finding format to consistent structure

### 2. Priority Assignment
Use impact/effort matrix:

| Impact \ Effort | Low Effort | High Effort |
|-----------------|------------|-------------|
| High Impact | P1 (Do First) | P2 (Plan) |
| Low Impact | P3 (Quick Wins) | P4 (Defer) |

### 3. Remediation Grouping
Group findings by:
- File type: agents, skills, rules, commands
- Issue type: accuracy, consistency, cross-ref
- Effort: quick fix (<5 min), moderate (5-15 min), significant (>15 min)

### 4. Plan Generation
For each finding provide:
- Current state (quote the problematic content)
- Issue description (what's wrong)
- Recommended fix (specific change)
- Estimated effort (minutes)

## Output Format
Use `templates/remediation-plan.template.md`

## Meta-Learning
Also update `REFLECTION_LOG.md` with:
- Patterns discovered during synthesis
- Recommendations for future reviews
- Suggested rubric adjustments
```

---

## Notes for Orchestrator

### Deploying Agents
1. Read the prompt for the relevant phase
2. Provide any additional context from previous phases
3. Ensure agent has access to required input files
4. Verify output matches expected template

### Context Handoff
Between phases, ensure:
- Previous phase outputs are accessible
- Key findings are summarized in handoff
- Any discovered patterns are documented
