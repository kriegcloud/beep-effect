# Handoff: P3 → P4 (Self-Healing Hooks)

**From**: P3 Onboarding Orchestrator
**To**: P4 Self-Healing Orchestrator
**Date**: 2026-02-04

---

## Executive Summary

Phase 3 (Onboarding System) is complete:

| Metric | Value | Notes |
|--------|-------|-------|
| Documentation files created | 5 | All in .claude/onboarding/ |
| Skill created | 1 | .claude/skills/onboarding/SKILL.md |
| Critical blockers addressed | 8/8 | From P0's friction analysis |
| Effect primer quality | High | Working examples, namespace imports |

---

## P3 Outputs

### Onboarding Documentation

Location: `.claude/onboarding/`

| File | Size | Purpose |
|------|------|---------|
| README.md | 6.3KB | Entry point, navigation, quick start |
| effect-primer.md | 12.4KB | Effect essentials with worked examples |
| first-contribution.md | 9.4KB | Step-by-step guide, top 5 pitfalls |
| common-tasks.md | 19.2KB | 9 task patterns with full code |
| verification-checklist.md | 8.4KB | 5 readiness gates |

### Onboarding Skill

Location: `.claude/skills/onboarding/SKILL.md`

Interactive checklist covering:
- Environment verification
- Effect proficiency self-assessment
- Pattern awareness confirmation
- Tool proficiency validation
- Architecture comprehension

---

## P4 Mission: Self-Healing Hooks

### Goal

Implement conservative self-healing hooks that automatically detect and fix safe errors without human intervention:
- Auto-fix for safe patterns (import sorting, namespace imports)
- Suggest-only for unsafe patterns (Schema changes, Layer composition)
- Never auto-fix anything that could change runtime behavior

### Deliverables

| # | Task | Output |
|---|------|--------|
| 4.1 | Create hook infrastructure | `.claude/hooks/self-healing/` |
| 4.2 | Implement safe auto-fix hooks | Import sorting, namespace imports, PascalCase |
| 4.3 | Implement suggest-only hooks | Schema fixes, EntityId reminders |
| 4.4 | Create hook configuration | `.claude/hooks/config.yaml` |
| 4.5 | Document hook behavior | `.claude/hooks/README.md` |

### Hook Categories

**Safe Auto-Fix (fix_type: safe)**:
- `SCH_001`: Lowercase schema constructors → PascalCase
- `IMP_001`: Named imports → Namespace imports
- `IMP_002`: Relative paths → Path aliases
- `BUILD_002`: Missing tsconfig references

**Suggest-Only (fix_type: unsafe)**:
- `SCH_002`: S.Date vs S.DateFromString (requires understanding data source)
- `EID_001`: Missing branded EntityIds (requires domain understanding)
- `SVC_001`: Missing Layer provision (requires architecture understanding)

### Reference Material

| Source | Purpose |
|--------|---------|
| `outputs/error-catalog.yaml` | 63 patterns with fix_type classification |
| `.claude/hooks/` | Existing hook infrastructure |
| `specs/agent-infrastructure-rationalization/` | Hook patterns |

### Error Catalog fix_type Distribution

From `error-catalog.yaml`:

| fix_type | Count | Description |
|----------|-------|-------------|
| safe | ~20 | Can auto-fix without behavior change |
| unsafe | ~35 | Requires human judgment |
| conditional | ~8 | Safe in some contexts, unsafe in others |

### Implementation Approach

**Recommended**: Start with 3-5 safe auto-fix hooks:

1. **Namespace import hook** - Detect `import { Effect }` → suggest `import * as Effect`
2. **PascalCase schema hook** - Detect `S.struct` → fix to `S.Struct`
3. **Path alias hook** - Detect `../../../` → suggest `@beep/` alias
4. **Import sorting hook** - Sort imports alphabetically

**Hook Template**:
```typescript
// .claude/hooks/self-healing/namespace-imports.ts
export const hook = {
  name: "namespace-imports",
  trigger: "pre-commit",
  pattern: /import \{ (\w+) \} from "effect\/\w+"/,
  fix_type: "safe",
  action: (match) => {
    const module = match[1];
    return `import * as ${module} from "effect/${module}"`;
  },
};
```

### Quality Gates

1. **No behavior changes** - Auto-fixes must be purely syntactic
2. **Reversible** - All changes can be undone
3. **Logging** - All fixes logged for review
4. **Dry-run mode** - Can preview without applying

### Success Criteria

- [ ] 3-5 safe auto-fix hooks implemented
- [ ] Hook configuration documented
- [ ] Suggest-only hooks show clear suggestions
- [ ] All hooks tested on real code
- [ ] REFLECTION_LOG.md updated with P4 entry

---

## Next Handoff

After P4 completion, create:
- `handoffs/HANDOFF_P5.md` - For agent config optimization phase (if applicable)
- Final spec completion summary
