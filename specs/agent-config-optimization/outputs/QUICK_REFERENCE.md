# AGENTS.md Inventory - Quick Reference Card

**Date**: 2026-01-18 | **Phase**: Discovery Complete | **Status**: ✅ Ready for Phase 2

## At-a-Glance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total AGENTS.md Files | 48 | ✅ Good |
| Total Lines | 7,483 | ℹ️ Info |
| Effect Compliance | 63% | ⚠️ Needs Work |
| Stale References | 1 file | 🔴 Critical |
| Missing Files | 12 | ⚠️ Medium |
| MCP Tool Shortcuts | 0 | ✅ Excellent |

## Critical Issues (DO FIRST)

### 🔴 CRITICAL: Stale Package References

**File**: `packages/shared/server/AGENTS.md`

**Issue**: References deleted packages that no longer exist

**Fix**:
```diff
- @beep/core-db
+ [Current DB package reference]

- @beep/core-env
+ @beep/shared-env
```

**Estimated Time**: 15 minutes
**Risk**: Low
**Impact**: High - Confuses AI agents

## High Priority Issues

### ⚠️ HIGH: Missing AGENTS.md Files (12 packages)

**Packages Needing AGENTS.md**:

#### Knowledge Slice (5 files)
- `packages/knowledge/server`
- `packages/knowledge/tables`
- `packages/knowledge/domain`
- `packages/knowledge/ui`
- `packages/knowledge/client`

#### Calendar Slice (5 files)
- `packages/calendar/server`
- `packages/calendar/tables`
- `packages/calendar/domain`
- `packages/calendar/ui`
- `packages/calendar/client`

#### Common/UI (2 files)
- `packages/common/wrap`
- `packages/ui/editor`

**Template**: `.claude/agents/templates/agents-md-template.md`
**Estimated Time**: 2-3 hours
**Risk**: Low

## Medium Priority Issues

### ⚠️ MEDIUM: Effect Pattern Violations (18 files)

**Common Violations**:

1. **Native Array Methods** (17 files)
   ```diff
   - array.map(x => x + 1)
   + A.map(array, x => x + 1)

   - array.filter(x => x > 0)
   + A.filter(array, x => x > 0)
   ```

2. **Test Anti-Patterns** (9 files)
   ```diff
   - Effect.runPromise(myEffect)
   + import { effect } from "@beep/testkit";
   + effect("test name", () => myEffect)
   ```

3. **Import Style** (1 file)
   ```diff
   - import { Effect } from "effect";
   + import * as Effect from "effect/Effect";
   ```

**Estimated Time**: 4-6 hours
**Risk**: Medium
**Reference**: `.claude/rules/effect-patterns.md`

## Files Needing Most Work

| File | Lines | Issues | Priority |
|------|-------|--------|----------|
| packages/shared/server/AGENTS.md | 246 | Stale refs (2) | 🔴 Critical |
| packages/shared/ui/AGENTS.md | 430 | Native methods (6) | ⚠️ High |
| apps/todox/AGENTS.md | 672 | Native .map() (4) | ⚠️ High |
| packages/iam/ui/AGENTS.md | 225 | Native methods (2) | ⚠️ Medium |

## Success Metrics

Track progress with these targets:

- [ ] **100% Coverage** - All 63 packages have AGENTS.md
- [ ] **0 Stale References** - No references to deleted packages
- [ ] **100% Compliance** - All files follow Effect patterns
- [ ] **Cross-References Valid** - All internal links resolve

## Verification Commands

```bash
# Check current status
bun run scripts/analyze-agents-md.ts

# Find missing files
bun run scripts/find-missing-agents.ts

# View detailed inventory
cat specs/agent-config-optimization/outputs/inventory-agents-md.md
```

## Phase Roadmap

```
Phase 1: Discovery ✅ COMPLETE
│
├─ Phase 2: Fix Stale References ⏳ NEXT
│  └─ 1 file, 15 min, Low risk
│
├─ Phase 3: Create Missing Files
│  └─ 12 files, 2-3 hours, Low risk
│
└─ Phase 4: Fix Pattern Violations
   └─ 18 files, 4-6 hours, Medium risk
```

## Quick Links

- **Full Inventory**: [inventory-agents-md.md](./inventory-agents-md.md)
- **Executive Summary**: [inventory-summary.md](./inventory-summary.md)
- **Output Index**: [README.md](./README.md)
- **Template**: `/.claude/agents/templates/agents-md-template.md`
- **Patterns Guide**: `/.claude/rules/effect-patterns.md`

## Reference Examples

### Good Examples (Use as Reference)

✅ Fully compliant files to copy patterns from:

- `packages/iam/client/AGENTS.md` (309 lines, perfect)
- `packages/runtime/client/AGENTS.md` (144 lines, perfect)
- `packages/testkit/AGENTS.md` (117 lines, perfect)

### Files to Update

⚠️ These need attention (but are otherwise solid):

- `packages/shared/ui/AGENTS.md` - Just needs Effect utility updates
- `apps/todox/AGENTS.md` - Just needs A.map() instead of .map()

---

**Next Action**: Fix stale references in `packages/shared/server/AGENTS.md`

**Questions?** See [inventory-summary.md](./inventory-summary.md) for detailed analysis.
