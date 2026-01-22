# Phase 2 Orchestrator Prompt - Migration & Deletion

Copy-paste this prompt to start Phase 2 of the deprecated-code-cleanup spec.

---

## Prompt

You are executing Phase 2 (Migration & Deletion) of the deprecated-code-cleanup spec.

### Context

Phase 1 analysis is complete. The good news: **only 2 test file usages** need migration. All other deprecated items can be deleted directly.

**Critical Files to Read First**:
- `specs/deprecated-code-cleanup/handoffs/HANDOFF_P2.md` - Work items
- `specs/deprecated-code-cleanup/outputs/usage-analysis.md` - Detailed analysis

### Your Mission

Execute all deletions and migrations. This is a straightforward task with low risk.

### Tasks (in order)

#### Part A: Direct Deletions

1. **Delete 6 files from `@beep/types`**:
   ```
   rm packages/common/types/src/if-any.ts
   rm packages/common/types/src/if-never.ts
   rm packages/common/types/src/if-null.ts
   rm packages/common/types/src/if-unknown.ts
   rm packages/common/types/src/if-empty-object.ts
   rm packages/common/types/src/readonly-tuple.ts
   ```

2. **Edit `packages/common/types/src/tagged.ts`**:
   - Remove the `Opaque` type definition and its JSDoc (lines ~142-216)
   - Remove the `UnwrapOpaque` type definition and its JSDoc (lines ~218-259)
   - Keep `Tagged`, `UnwrapTagged`, `GetTagMetadata`, `TagContainer`, `tag` exports

3. **Edit `tooling/utils/src/repo/UniqueDependencies.ts`**:
   - Remove the deprecated `getUniqueDeps` export and its JSDoc (lines ~57-95)

4. **Edit `tooling/utils/src/index.ts`**:
   - Line 8: Remove "getUniqueDeps" from the list
   - Lines 55-65: Remove the JSDoc block referencing `getUniqueDeps`

5. **Edit `tooling/utils/src/repo/index.ts`**:
   - Lines 127-138: Change example from `getUniqueDeps` to `collectUniqueNpmDependencies`

6. **Edit `tooling/build-utils/src/pwa/types.ts`**:
   - Remove lines 241-244 (the `subdomainPrefix` property with @deprecated tag)

7. **Edit `tooling/build-utils/src/pwa/with-pwa.ts`**:
   - Line 189: Remove `subdomainPrefix,` from destructuring
   - Lines 205-210: Remove the deprecation warning conditional block

#### Part B: Migration

8. **Edit `tooling/testkit/test/playwright/page.test.ts`**:

   Line 50 - Change:
   ```typescript
   yield* page.click("#mybutton");
   ```
   To:
   ```typescript
   yield* page.locator("#mybutton").click();
   ```

   Line 109 - Change:
   ```typescript
   yield* page.click("#mybutton", { position: { x: 10, y: 10 } });
   ```
   To:
   ```typescript
   yield* page.locator("#mybutton").click({ position: { x: 10, y: 10 } });
   ```

9. **Edit `tooling/testkit/src/playwright/page.ts`**:
   - Remove the `click` method from `PlaywrightPageService` interface (lines ~176-191)
   - Remove `click: (selector, options) => use((p) => p.click(selector, options)),` from the `PlaywrightPage.make` return object (line ~223)

### Verification

After all changes:

```bash
# Type check
bun run check

# Lint
bun run lint

# Tests
bun run test

# Confirm no @deprecated tags remain
grep -r "@deprecated" --include="*.ts" packages/ tooling/ | grep -v node_modules
```

### Success Criteria

- [ ] All 6 deprecated type files deleted
- [ ] `Opaque` and `UnwrapOpaque` removed from `tagged.ts`
- [ ] `getUniqueDeps` export removed
- [ ] `subdomainPrefix` option removed
- [ ] 2 test usages migrated to locator pattern
- [ ] `click` method removed from `PlaywrightPageService`
- [ ] All verification commands pass
- [ ] Zero `@deprecated` tags in codebase

### Notes

- This is a deletion-heavy phase with minimal risk
- The only "migration" is 2 test lines
- If any verification fails, check the specific package with `bun run check --filter @beep/package-name`
