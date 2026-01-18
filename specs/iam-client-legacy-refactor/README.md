# IAM Client Legacy Module Refactor

> Refactor legacy IAM client modules to canonical patterns established in sign-in, core, and sign-up.

---

## Overview

This specification guides the systematic refactoring of 5 legacy modules (~30 handlers) in `@beep/iam-client` to align with the canonical patterns documented in `documentation/patterns/iam-client-patterns.md`.

### Scope

| Module | Handlers | Complexity |
|--------|----------|------------|
| `email-verification` | 1 | Simple |
| `multi-session` | 3 | Low |
| `password` | 3 | Low |
| `two-factor` | ~8 | Medium |
| `organization` | ~15 | High |

**Total**: ~30 handlers across 5 modules

---

## Goals

1. **Consistency**: All modules follow identical patterns
2. **Type Safety**: Leverage Effect Schema and `@beep/wrap` contracts
3. **Maintainability**: Standardized file structure and naming
4. **Documentation**: JSDoc with proper `@module` and `@category` tags
5. **Deprecation**: Remove `createHandler` factory after migration

---

## Quick Start

```bash
# Read the handoff prompt
cat specs/iam-client-legacy-refactor/handoffs/HANDOFF_INITIAL.md

# Review pattern documentation
cat documentation/patterns/iam-client-patterns.md

# Review canonical examples
ls packages/iam/client/src/sign-in/
```

---

## Key References

| Document | Purpose |
|----------|---------|
| `documentation/patterns/iam-client-patterns.md` | **Primary pattern reference** |
| `handoffs/HANDOFF_INITIAL.md` | Full context and mission |
| `REFLECTION_LOG.md` | Cumulative learnings |

### Canonical Modules

- `packages/iam/client/src/sign-in/` - Email, Username handlers
- `packages/iam/client/src/core/` - GetSession, SignOut handlers
- `packages/iam/client/src/sign-up/` - Email handler

---

## Phases

> **IMPORTANT**: At the end of each phase, create a handoff document (`handoffs/HANDOFF_P{N}.md`) capturing:
> - Phase summary and key findings
> - Artifacts created/modified
> - Reflection checkpoint answers
> - Requirements for next phase
> - Next steps for the following session

### Phase 1: Discovery ✅ COMPLETE

**Output**: `outputs/legacy-inventory.md`
**Handoff**: `handoffs/HANDOFF_P1.md`

**Key Findings**:
- 30 handlers total across 5 modules
- All handlers can use Simple Pattern (no transforms needed)
- 8 handlers mutate session
- No captcha middleware needed for legacy handlers
- `password/*` handlers need schema updates (S.String → S.Redacted)

See `REFLECTION_LOG.md` for detailed analysis.

### Phase 2: Design + Dry Run ✅ COMPLETE

**Outputs**:
- `outputs/better-auth-api-audit.md` - API verification findings
- `outputs/migration-design.md` - Per-module design decisions
- `outputs/dry-run-reflection.md` - Learnings from 3-handler trial
- `handoffs/HANDOFF_P2.md` - Phase completion handoff

**Key Findings**:
- All 30 Better Auth methods verified
- WrapperGroup compositions designed for all 5 modules
- 3 dry run handlers passed type-check
- Estimated ~8 hours for full implementation

See `REFLECTION_LOG.md` for detailed analysis.

### Phase 3: Implementation ✅ COMPLETE

**Outputs**:
- Migrated handler files for all 5 modules
- Module-level files (layer.ts, service.ts, mod.ts, index.ts)
- `handoffs/HANDOFF_P3_REVIEW.md` - Final review handoff

**Completed Modules**:
1. ✅ email-verification (1 handler)
2. ✅ multi-session (3 handlers)
3. ✅ password (3 handlers)
4. ✅ two-factor (8 handlers)
5. ✅ organization (15 handlers)

**Verification**:
- Type check passing: `bun run check --filter @beep/iam-client`
- Lint check passing: `bun run lint --filter @beep/iam-client`

See `REFLECTION_LOG.md` for detailed learnings.

---

## Success Criteria

- [x] All 5 modules refactored to canonical patterns
- [x] All handlers use `Wrapper.implement()` + `wrapIamMethod()`
- [x] Each module has complete layer/service structure
- [x] Type-check passes: `bun run check --filter @beep/iam-client`
- [x] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] `createHandler` factory deprecated (pending review approval)

---

## Directory Structure

```
specs/iam-client-legacy-refactor/
├── README.md                           # This file
├── REFLECTION_LOG.md                   # Learnings log
├── outputs/
│   ├── legacy-inventory.md             # P1: Complete handler inventory ✅
│   ├── better-auth-api-audit.md        # P2: API verification findings ✅
│   ├── migration-design.md             # P2: Per-module design decisions ✅
│   └── dry-run-reflection.md           # P2: Dry run learnings ✅
├── handoffs/
│   ├── HANDOFF_INITIAL.md              # Initial context and mission
│   ├── HANDOFF_P1.md                   # Phase 1 completion handoff ✅
│   ├── HANDOFF_P2.md                   # Phase 2 completion handoff ✅
│   └── HANDOFF_P3_REVIEW.md            # Phase 3 review handoff ✅
└── templates/
    ├── handler-migration.template.md   # Per-handler checklist
    └── module-completion.template.md   # Per-module checklist
```

---

## Related

- [Pattern Documentation](../../documentation/patterns/iam-client-patterns.md)
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md)
- [Spec Creation Guide](../SPEC_CREATION_GUIDE.md)
