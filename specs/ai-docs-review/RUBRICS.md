# AI Documentation Review: Rubrics

## Overview

This document defines scoring criteria for evaluating AI documentation quality across two dimensions: **Accuracy** and **Cross-Reference Integrity**.

---

## Dimension 1: Accuracy

**What it measures**: Whether content is factually correct, current, and internally consistent.

### Scoring Criteria

| Score | Level | Criteria |
|-------|-------|----------|
| 5 | Excellent | Zero stale references, all code examples compile, no contradictions |
| 4 | Good | <5 minor stale references, code examples mostly correct |
| 3 | Acceptable | 5-15 stale references, some outdated code examples |
| 2 | Poor | 15-30 issues, significant outdated content |
| 1 | Critical | >30 issues, pervasive outdated content |

### Detection Patterns

#### Deprecated Schema Patterns
```bash
# Lowercase constructors (forbidden)
grep -rn "S\.struct\|S\.array\|S\.string\|S\.number" .claude/ --include="*.md"
```

#### Named Imports (forbidden)
```bash
grep -rn "import { .* } from ['\"]effect" .claude/ --include="*.md"
```

#### Stale Package References
```bash
# Known deleted packages
grep -rn "@beep/lexical-schemas\|@beep/mock\|@beep/yjs" .claude/ --include="*.md"
```

#### Native Method Usage (forbidden)
```bash
grep -rn "\.map(\|\.filter(\|\.reduce(\|\.forEach(" .claude/ --include="*.md"
```

### Evidence Format

| Finding ID | File | Line | Issue | Severity |
|------------|------|------|-------|----------|
| ACC-001 | agents/foo.md | 42 | Uses deprecated `S.struct` | HIGH |
| ACC-002 | rules/bar.md | 15 | Named import from effect | MEDIUM |

---

## Dimension 2: Cross-Reference Integrity

**What it measures**: Whether all links, paths, and references resolve correctly.

### Scoring Criteria

| Score | Level | Criteria |
|-------|-------|----------|
| 5 | Excellent | Zero broken links, all paths valid |
| 4 | Good | <5 broken references |
| 3 | Acceptable | 5-15 broken references |
| 2 | Poor | 15-30 broken references |
| 1 | Critical | >30 broken references |

### Detection Patterns

#### Markdown Links
```bash
# Extract and list all markdown links
grep -oE "\[.*\]\([^)]+\)" .claude/**/*.md
```

#### File Path References
```bash
# References to packages, apps, documentation
grep -rn "packages/\|apps/\|documentation/" .claude/ --include="*.md"
```

#### Package References
```bash
# @beep/* package imports
grep -rn "@beep/[a-z-]*" .claude/ --include="*.md"
```

### Evidence Format

| Finding ID | File | Line | Reference | Status |
|------------|------|------|-----------|--------|
| XR-001 | agents/doc-writer.md | 156 | `documentation/patterns/` | NOT FOUND |
| XR-002 | skills/match.md | 42 | `[Guide](../guide.md)` | BROKEN |

---

## Severity Classifications

### CRITICAL
- Actively misleading information
- References to non-existent packages
- Contradictory instructions that could cause errors

### HIGH
- Deprecated patterns in code examples
- Stale file references
- Outdated command syntax

### MEDIUM
- Minor inconsistencies
- Terminology variations
- Missing optional sections

### LOW
- Cosmetic issues
- Style inconsistencies
- Nice-to-have improvements

---

## Aggregation Rules

### Overall Score Calculation
```
Overall = min(Accuracy, Cross-Reference)
```

### Priority Mapping
| Score | Action |
|-------|--------|
| 5 | No action needed |
| 4 | Minor updates recommended |
| 3 | Remediation plan required |
| 2 | Urgent remediation required |
| 1 | Critical - immediate action |

---

## Verification Checklist

- [ ] All files in scope evaluated
- [ ] Severity assigned to each finding
- [ ] Sample findings verified against source
- [ ] Detection patterns executed
- [ ] Scores calculated per dimension
