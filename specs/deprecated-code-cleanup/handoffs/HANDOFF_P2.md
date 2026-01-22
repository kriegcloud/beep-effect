# Phase 2 Handoff - Migration & Deletion

> Handoff from Phase 1 (Discovery & Impact Analysis) to Phase 2 (Migration Implementation)

---

## Phase 1 Summary

Phase 1 analysis revealed an unexpectedly clean situation:

| Category | Status |
|----------|--------|
| Total deprecated exports | 11 |
| External usages requiring migration | **2** (test file only) |
| Direct deletions (no migration) | **9** |

### Key Finding

The deprecated `@beep/types` exports are **NOT used anywhere** in the codebase. They exist as orphaned files/exports that can be deleted directly.

---

## Work Completed in Phase 1

- [x] Identified all 11 deprecated items across 4 packages
- [x] Searched entire codebase for usages
- [x] Documented dependency graph
- [x] Created `outputs/usage-analysis.md` with detailed findings
- [x] Identified test files using deprecated code

---

## Phase 2 Work Items

### 2A: Direct Deletions (No Migration)

#### `@beep/types` Package

1. **Delete deprecated files**:
   - `packages/common/types/src/if-any.ts`
   - `packages/common/types/src/if-never.ts`
   - `packages/common/types/src/if-null.ts`
   - `packages/common/types/src/if-unknown.ts`
   - `packages/common/types/src/if-empty-object.ts`
   - `packages/common/types/src/readonly-tuple.ts`

2. **Edit `packages/common/types/src/tagged.ts`**:
   - Remove lines 142-216 (Opaque type and docs)
   - Remove lines 218-259 (UnwrapOpaque type and docs)

#### `@beep/tooling-utils` Package

3. **Edit `tooling/utils/src/repo/UniqueDependencies.ts`**:
   - Remove lines 57-95 (getUniqueDeps alias and JSDoc)

4. **Edit `tooling/utils/src/index.ts`**:
   - Update line 8: Remove `getUniqueDeps` from comment
   - Remove lines 55-65: JSDoc example referencing `getUniqueDeps`

5. **Edit `tooling/utils/src/repo/index.ts`**:
   - Update lines 127-138: Change JSDoc example from `getUniqueDeps` to `collectUniqueNpmDependencies`

#### `@beep/build-utils` Package

6. **Edit `tooling/build-utils/src/pwa/types.ts`**:
   - Remove lines 241-244 (subdomainPrefix property)

7. **Edit `tooling/build-utils/src/pwa/with-pwa.ts`**:
   - Remove line 189: `subdomainPrefix,` from destructuring
   - Remove lines 205-210: deprecation warning conditional

---

### 2B: Migration Required

#### `@beep/testkit` Package

8. **Migrate test usages**:

   File: `tooling/testkit/test/playwright/page.test.ts`

   Line 50:
   ```typescript
   // OLD
   yield* page.click("#mybutton");

   // NEW
   yield* page.locator("#mybutton").click();
   ```

   Line 109:
   ```typescript
   // OLD
   yield* page.click("#mybutton", { position: { x: 10, y: 10 } });

   // NEW
   yield* page.locator("#mybutton").click({ position: { x: 10, y: 10 } });
   ```

9. **Delete deprecated method** after migration:

   File: `tooling/testkit/src/playwright/page.ts`
   - Remove lines 176-191 (click method JSDoc)
   - Remove lines 223 (click implementation in make function)

---

## Verification Checklist

After Phase 2 completion:

- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] `grep -r "@deprecated" --include="*.ts" packages/ tooling/` returns no results

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/deprecated-code-cleanup/README.md` | Main spec |
| `specs/deprecated-code-cleanup/outputs/usage-analysis.md` | Phase 1 detailed findings |
| `specs/deprecated-code-cleanup/handoffs/P2_ORCHESTRATOR_PROMPT.md` | Orchestrator prompt for Phase 2 |
