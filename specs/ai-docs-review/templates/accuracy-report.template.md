# Accuracy Evaluation Report

**Generated**: [DATE]
**Files Evaluated**: [N]
**Accuracy Score**: [X/5]
**Confidence**: high | medium | low

---

## Executive Summary

[2-3 sentences summarizing overall accuracy state]

---

## Score Breakdown

| Dimension | Score | Findings |
|-----------|-------|----------|
| Code Examples | X/5 | [N] issues |
| Reference Currency | X/5 | [N] issues |
| Pattern Consistency | X/5 | [N] issues |
| **Overall** | **X/5** | **[N] total** |

---

## Findings by Severity

### CRITICAL ([N] findings)

| ID | File | Line | Issue | Recommended Fix |
|----|------|------|-------|-----------------|
| ACC-001 | path/file.md | 42 | Description | Fix action |

### HIGH ([N] findings)

| ID | File | Line | Issue | Recommended Fix |
|----|------|------|-------|-----------------|
| ACC-010 | path/file.md | 42 | Description | Fix action |

### MEDIUM ([N] findings)

| ID | File | Line | Issue | Recommended Fix |
|----|------|------|-------|-----------------|
| ACC-020 | path/file.md | 42 | Description | Fix action |

### LOW ([N] findings)

| ID | File | Line | Issue | Recommended Fix |
|----|------|------|-------|-----------------|
| ACC-030 | path/file.md | 42 | Description | Fix action |

---

## Code Example Analysis

### Deprecated Patterns Found

| Pattern | Count | Locations |
|---------|-------|-----------|
| lowercase Schema | [N] | file1:10, file2:25 |
| Named imports | [N] | file1:5, file3:12 |
| async/await | [N] | file2:30 |
| Native methods | [N] | file4:15 |

### Effect Pattern Violations

| Violation Type | Count | Top Files |
|----------------|-------|-----------|
| Named imports | [N] | file1.md, file2.md |
| Missing namespace | [N] | file3.md |
| Wrong alias | [N] | file4.md |

---

## Stale Package References

| Package | Status | Files Affected | Lines |
|---------|--------|----------------|-------|
| @beep/mock | DELETED | [N] files | line refs |
| @beep/yjs | DELETED | [N] files | line refs |
| @beep/lexical-schemas | DELETED | [N] files | line refs |

---

## Contradictory Information

| Files | Contradiction | Severity |
|-------|---------------|----------|
| file1.md, file2.md | Conflicting instruction about X | HIGH |

---

## Verification Checkpoint

- [ ] All files in scope evaluated
- [ ] Severity assigned to each finding
- [ ] Sample findings verified against source
- [ ] Detection patterns executed
- [ ] Score calculated

---

## Detection Commands Used

```bash
# Commands run during evaluation
grep -rn "pattern" .claude/ --include="*.md"
```
