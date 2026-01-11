# Cross-Reference Integrity Report

**Generated**: [DATE]
**References Validated**: [N]
**Cross-Ref Score**: [X/5]
**Confidence**: high | medium | low

---

## Executive Summary

[2-3 sentences summarizing cross-reference state]

---

## Score Breakdown

| Reference Type | Total | Valid | Broken | Score |
|----------------|-------|-------|--------|-------|
| Markdown links | [N] | [N] | [N] | X/5 |
| Path references | [N] | [N] | [N] | X/5 |
| Package refs | [N] | [N] | [N] | X/5 |
| **Overall** | **[N]** | **[N]** | **[N]** | **X/5** |

---

## Broken Links

| ID | Source File | Line | Target | Status |
|----|-------------|------|--------|--------|
| XR-001 | agents/foo.md | 42 | path/to/file | NOT FOUND |
| XR-002 | skills/bar.md | 15 | ../relative/path | BROKEN |

---

## Invalid Path References

| ID | Source File | Line | Path | Issue |
|----|-------------|------|------|-------|
| XR-010 | agents/foo.md | 42 | packages/old/ | Directory removed |
| XR-011 | rules/bar.md | 15 | apps/deleted/ | App deleted |

---

## Invalid Package References

| ID | Source File | Line | Package | Issue |
|----|-------------|------|---------|-------|
| XR-020 | agents/foo.md | 42 | @beep/mock | Package deleted |

---

## External URLs (Unchecked)

| File | Line | URL | Notes |
|------|------|-----|-------|
| file.md | 42 | https://... | Requires manual verification |

---

## Valid Reference Summary

### By Type

| Type | Count | Notes |
|------|-------|-------|
| Agent → Agent | [N] | Internal agent refs |
| Agent → Skill | [N] | Agent uses skill |
| Rule → Agent | [N] | Rule references agent |
| Root → All | [N] | CLAUDE.md/AGENTS.md refs |

### By File

| File | Total Refs | Valid | Broken |
|------|------------|-------|--------|
| CLAUDE.md | [N] | [N] | [N] |
| AGENTS.md | [N] | [N] | [N] |
| agents/*.md | [N] | [N] | [N] |

---

## Orphaned Files

Files that exist but are never referenced:

| File | Last Modified | Recommendation |
|------|---------------|----------------|
| path/file.md | YYYY-MM-DD | Consider adding reference or removing |

---

## Missing Files

Files that are referenced but don't exist:

| Referenced From | Line | Missing Target |
|-----------------|------|----------------|
| source.md | 42 | target.md |

---

## Verification Checkpoint

- [ ] All internal links validated
- [ ] All path references checked
- [ ] All package references verified
- [ ] External URLs logged for manual review
- [ ] Score calculated

---

## Detection Commands Used

```bash
# Commands run during validation
grep -oE "\[.*\]\([^)]+\)" .claude/**/*.md
```
