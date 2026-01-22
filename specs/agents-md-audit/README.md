# AGENTS.md Audit

> Audit and standardize AGENTS.md files across the monorepo.

---

## Overview

This spec validates that all packages have accurate, consistent AGENTS.md files following the established template. AGENTS.md files provide AI collaborators with package-specific context and usage patterns.

**Complexity**: Simple (single session)

---

## Problem Statement

AGENTS.md files may be:
- Missing from some packages
- Outdated with stale references to deleted code
- Inconsistent in structure across packages
- Missing required sections (Purpose, Key Files, Testing)

---

## Success Criteria

- [ ] All packages in `packages/` have AGENTS.md files
- [ ] All AGENTS.md files follow `.claude/agents/templates/agents-md-template.md`
- [ ] No stale references to non-existent files or exports
- [ ] Consistent section ordering across all files

---

## Scope

### In Scope

| Area | Description |
|------|-------------|
| Package AGENTS.md | All `packages/**/AGENTS.md` files |
| Template compliance | Structure follows standard template |
| Reference validation | File paths and exports exist |

### Out of Scope

| Area | Reason |
|------|--------|
| Root AGENTS.md | Different purpose, not package-specific |
| Content accuracy | Would require deep code analysis |
| New package creation | Existing packages only |

---

## Approach

### Phase 1: Discovery

1. Inventory all packages in `packages/`
2. Identify packages missing AGENTS.md
3. Read template from `.claude/agents/templates/agents-md-template.md`

### Phase 2: Audit

1. For each existing AGENTS.md:
   - Check section structure against template
   - Validate file path references exist
   - Flag stale or broken references

### Phase 3: Remediation

1. Create missing AGENTS.md files from template
2. Fix structural inconsistencies
3. Remove stale references

---

## Verification

```bash
# Check all packages have AGENTS.md
find packages -maxdepth 3 -name "package.json" -exec dirname {} \; | while read pkg; do
  if [ ! -f "$pkg/AGENTS.md" ]; then
    echo "Missing: $pkg/AGENTS.md"
  fi
done

# Validate no broken file references (manual review of outputs/audit-report.md)
```

---

## Outputs

| Output | Purpose |
|--------|---------|
| `outputs/audit-report.md` | Findings from discovery and audit phases |
| Updated AGENTS.md files | Remediated files across packages |

---

## Related Documentation

- [AGENTS.md Template](.claude/agents/templates/agents-md-template.md)
- [Spec Guide](../_guide/README.md)
