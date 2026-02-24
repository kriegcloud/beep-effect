# P5 Orchestrator Prompt: Cleanup Old Integration Package

Copy this prompt to start Phase 5 execution.

---

## Mission

Remove the old `packages/shared/integrations` package now that all functionality has been migrated to the new three-tier architecture.

**Primary Deliverables:**
1. Verify no code imports from the old package
2. Delete `packages/shared/integrations` directory
3. Clean up configuration files (turbo.json, tsconfig)
4. Verify build passes

**Success Criteria:**
- Old package completely removed
- No broken imports
- All type checks and tests pass

---

## Context from Phase 4

### What Was Completed

Phase 4 created `GoogleWorkspace.layer.ts` in `@beep/runtime-server` that wires all Google adapters:

```typescript
// packages/runtime/server/src/GoogleWorkspace.layer.ts
export const layer = Layer.mergeAll(
  CalendarAdapterLayer,   // GoogleCalendarAdapterLive
  GmailAdapterLayer,      // GmailAdapterLive
  GmailExtractionAdapterLayer  // GmailExtractionAdapterLive
);
```

All adapters are now available in the runtime through `ProtectedRoutes` in `HttpRouter.layer.ts`.

### Integration Tests

Created and passing:
- `packages/calendar/server/test/adapters/GoogleCalendarAdapter.test.ts` (10 tests)
- `packages/comms/server/test/adapters/GmailAdapter.test.ts` (15 tests)
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts` (14 tests)

---

## Old Package Contents

The `packages/shared/integrations` directory contains ~70+ files:

```
packages/shared/integrations/
├── src/
│   ├── google/
│   │   ├── calendar/models.ts
│   │   ├── gmail/
│   │   │   ├── actions/           # 12 action handlers
│   │   │   │   ├── batch-modify/
│   │   │   │   ├── create-label/
│   │   │   │   ├── delete-email/
│   │   │   │   ├── get-email/
│   │   │   │   ├── list-emails/
│   │   │   │   ├── send-email/
│   │   │   │   └── ... more
│   │   │   ├── common/
│   │   │   │   ├── GmailClient.ts
│   │   │   │   ├── wrap-gmail-call.ts
│   │   │   │   └── gmail.schemas.ts
│   │   │   ├── models/
│   │   │   ├── errors.ts
│   │   │   └── constants.ts
│   │   └── scopes.ts
│   └── utils/
├── test/
├── build/
├── package.json
└── tsconfig.json
```

---

## Step-by-Step Execution Plan

### Step 1: Verify No Imports (Orchestrator)

Search for any remaining imports from the old package:

```bash
# Search for package alias imports
Grep: "@beep/shared-integrations" glob:**/*.ts

# Search for direct path imports
Grep: "from.*shared/integrations" glob:**/*.ts

# Search for any references
Grep: "shared-integrations" glob:**/*.{ts,json}
```

**If imports are found**: Stop and update them before proceeding.

### Step 2: Check Configuration Files (Orchestrator)

Check these files for references:

```bash
# turbo.json - pipeline configuration
Read: turbo.json

# tsconfig base - path aliases
Read: tsconfig.base.jsonc

# Workspace config
Read: package.json (root)
```

### Step 3: Delete Package (Bash)

```bash
# Remove the directory
rm -rf packages/shared/integrations

# Update bun lockfile
bun install
```

### Step 4: Clean Configuration (Agent if needed)

If any references exist in turbo.json or tsconfig.base.jsonc, remove them.

### Step 5: Verification (Orchestrator)

```bash
# Type check entire monorepo
bun run check

# Build entire monorepo
bun run build

# Run tests
bun run test
```

---

## Risk Mitigation

### If Deletion Causes Errors

1. **Import Errors**: Some file still imports from old package
   - Find the file: `Grep: "@beep/shared-integrations"`
   - Update import to use new package paths
   - Re-run verification

2. **Build Errors**: Configuration still references old package
   - Check `turbo.json` for task definitions
   - Check `tsconfig.base.jsonc` for path aliases
   - Check `tsconfig.slices/shared.json` for references

3. **Test Failures**: Tests depended on old package
   - Unlikely since we created new tests in Phase 4
   - If found, update test imports

---

## Verification Checklist

After cleanup:

- [ ] `packages/shared/integrations` directory deleted
- [ ] `Grep "@beep/shared-integrations"` returns no results
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] `bun run test` passes

---

## Post-Phase Actions

1. **Update REFLECTION_LOG.md** with Phase 5 learnings
2. **Update `outputs/P5-cleanup-verification.md`** with results
3. **Proceed to Phase 6** for final verification and documentation updates
