# Handoff P5: Cleanup Old Integration Package

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,200 | OK |
| Episodic Memory | 1,000 tokens | ~600 | OK |
| Semantic Memory | 500 tokens | ~300 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~2,100** | **OK** |

---

## Working Memory (Current Phase)

### Phase 5 Goal

Remove the old `packages/shared/integrations` package now that all functionality has been migrated to the new three-tier architecture.

### Deliverables

1. **Verify No Imports**: Confirm no code imports from `packages/shared/integrations`
2. **Delete Old Package**: Remove the entire `packages/shared/integrations` directory
3. **Update Configuration**:
   - Remove from `turbo.json` pipeline (if present)
   - Remove from `tsconfig.base.jsonc` path aliases (if present)
   - Remove from any workspace configurations
4. **Clean Build**: Verify `bun run check` and `bun run build` pass

### Success Criteria

- [ ] Zero imports from `@beep/shared-integrations` in codebase
- [ ] `packages/shared/integrations` directory deleted
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] No broken path aliases or tsconfig references

---

## Episodic Memory (Phase 4 Summary)

### What Was Done

Phase 4 created a unified `GoogleWorkspace.layer.ts` in `@beep/runtime-server` that composes all Google adapters:

**Created:**
- `packages/runtime/server/src/GoogleWorkspace.layer.ts`
  - Composes `GoogleCalendarAdapterLive`, `GmailAdapterLive`, `GmailExtractionAdapterLive`
  - Each provided with `GoogleAuthClientLive` and `FetchHttpClient.layer`
  - Exported as `GoogleWorkspace.layer`

**Modified:**
- `packages/runtime/server/src/HttpRouter.layer.ts` - Added `GoogleWorkspace.layer` to `ProtectedRoutes`
- `packages/runtime/server/src/index.ts` - Re-exports `GoogleWorkspace`
- `packages/runtime/server/package.json` - Added google-workspace dependencies
- `packages/runtime/server/tsconfig.src.json` - Added project reference

**Integration Tests Created:**
- `packages/calendar/server/test/adapters/GoogleCalendarAdapter.test.ts` (10 tests)
- `packages/comms/server/test/adapters/GmailAdapter.test.ts` (15 tests)
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (14 tests)

### Verification Results

All type checks and tests pass:
- `@beep/runtime-server`: ✅ Check passes
- `@beep/calendar-server`: ✅ Check passes, 10 tests pass
- `@beep/comms-server`: ✅ Check passes, 15 tests pass
- `@beep/knowledge-server`: ✅ Check passes, 430 tests pass

---

## Semantic Memory (Architecture Context)

### Old vs New Structure

**Old (to be deleted):**
```
packages/shared/integrations/
├── src/google/
│   ├── calendar/models.ts
│   └── gmail/
│       ├── actions/          # 12+ action handlers
│       ├── common/           # GmailClient, wrapGmailCall
│       ├── models/           # Email, Label models
│       └── errors.ts
└── src/utils/email-processor.ts
```

**New (already implemented):**
```
packages/integrations/google-workspace/
├── domain/                   # Errors, models, scopes
├── client/                   # GoogleAuthClient interface
└── server/                   # GoogleAuthClientLive

packages/calendar/server/src/adapters/GoogleCalendarAdapter.ts
packages/comms/server/src/adapters/GmailAdapter.ts
packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts

packages/runtime/server/src/GoogleWorkspace.layer.ts  # Composition
```

### What Gets Deleted

The entire `packages/shared/integrations` directory containing:
- ~70+ TypeScript source files
- Build artifacts in `build/`
- Test files in `test/`
- Package configuration (package.json, tsconfig.json)

---

## Procedural Memory (How-To References)

### Verifying No Imports
```bash
# Search for imports from old package
Grep: "@beep/shared-integrations" glob:**/*.ts
Grep: "packages/shared/integrations" glob:**/*.ts
Grep: "from.*shared/integrations" glob:**/*.ts
```

### Safe Deletion Pattern
```bash
# 1. First verify no imports exist
# 2. Then delete directory
rm -rf packages/shared/integrations

# 3. Remove from turbo.json if present
# 4. Remove path aliases from tsconfig.base.jsonc if present
# 5. Run verification
bun run check
bun run build
```

---

## Phase 5 Execution Plan

### Step 1: Verify No Imports (Orchestrator)

Search for any remaining imports from the old package:

```bash
Grep: "@beep/shared-integrations" glob:**/*.ts
Grep: "packages/shared/integrations" glob:**/*.ts
```

If any imports are found, they must be updated before deletion.

### Step 2: Check Configuration Files (Orchestrator)

Look for references in:
- `turbo.json`
- `tsconfig.base.jsonc`
- `package.json` (workspace packages)
- Any `tsconfig.slices/*.json` files

### Step 3: Delete Package (Agent)

**Agent**: `package-error-fixer` or direct Bash

**Prompt**:
```
Delete the old packages/shared/integrations package.

<contextualization>
- All functionality has been migrated to packages/integrations/google-workspace
- Slice adapters now live in calendar/comms/knowledge server packages
- Runtime composition is in packages/runtime/server/src/GoogleWorkspace.layer.ts
</contextualization>

Steps:
1. Delete packages/shared/integrations directory
2. Remove any references from turbo.json
3. Remove any path aliases from tsconfig.base.jsonc
4. Run bun install to update lockfile
5. Run bun run check to verify
```

### Step 4: Verification (Orchestrator)

```bash
bun run check
bun run build
bun run test
```

---

## Verification Checklist

After cleanup:

- [ ] `packages/shared/integrations` directory no longer exists
- [ ] No imports from `@beep/shared-integrations` in codebase
- [ ] `turbo.json` has no references to old package
- [ ] `tsconfig.base.jsonc` has no path aliases to old package
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] `bun run test` passes

---

## Post-Phase Actions

1. **Update REFLECTION_LOG.md** with Phase 5 learnings
2. **Update verification outputs** (`outputs/P5-cleanup-verification.md`)
3. **Proceed to Phase 6** for final verification and documentation
