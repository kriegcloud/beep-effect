# Deprecated Code Cleanup Spec

> Systematic removal of all `@deprecated` JSDoc-tagged code from the beep-effect monorepo.

---

## Purpose

Remove all code marked with `@deprecated` JSDoc tags, replacing usages with recommended non-deprecated alternatives before deletion.

**Goal**: Zero `@deprecated` tags remaining in the codebase after completion.

---

## Scope

### In Scope

- All files containing `@deprecated` JSDoc tags
- All usages of deprecated exports across the monorepo
- Package exports (`index.ts` barrel files) that re-export deprecated code
- Any documentation referencing deprecated APIs

### Out of Scope

- Deprecations in `node_modules/` (external dependencies)
- Third-party library deprecation warnings

---

## Success Criteria

- [ ] No files contain `@deprecated` JSDoc tags
- [ ] All previous usages migrated to recommended alternatives
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] `bun run test` passes (or tests updated appropriately)
- [ ] No broken imports across packages

---

## Known Deprecated Items (Inventory)

Based on initial scan, the following items are deprecated:

### 1. `@beep/types` Package (`packages/common/types/`)

| File | Export | Replacement |
|------|--------|-------------|
| `src/if-any.ts` | `IfAny<T, Then, Else>` | Use `If<IsAny<T>, Then, Else>` from `src/if.ts` |
| `src/if-empty-object.ts` | `IfEmptyObject<T, Then, Else>` | Use `If<IsEmptyObject<T>, Then, Else>` from `src/if.ts` |
| `src/if-never.ts` | `IfNever<T, Then, Else>` | Use `If<IsNever<T>, Then, Else>` from `src/if.ts` |
| `src/if-null.ts` | `IfNull<T, Then, Else>` | Use `If<IsNull<T>, Then, Else>` from `src/if.ts` |
| `src/if-unknown.ts` | `IfUnknown<T, Then, Else>` | Use `If<IsUnknown<T>, Then, Else>` from `src/if.ts` |
| `src/readonly-tuple.ts` | `ReadonlyTuple<Length, Element>` | Use `Readonly<TupleOf<Length, Element>>` |
| `src/tagged.ts:216` | `Opaque<Type, Token>` | Use `Tagged<Type, Token>` |
| `src/tagged.ts:254` | `UnwrapOpaque<OpaqueType>` | Use `UnwrapTagged<TaggedType>` |

### 2. `@beep/testkit` Package (`tooling/testkit/`)

| File | Export | Replacement |
|------|--------|-------------|
| `src/playwright/page.ts:183` | `PlaywrightPageService.click(selector)` | Use `page.locator(selector)` then call `.click()` on the locator |

### 3. `@beep/build-utils` Package (`tooling/build-utils/`)

| File | Export | Replacement |
|------|--------|-------------|
| `src/pwa/types.ts:242` | `PluginOptions.subdomainPrefix` | Use `basePath` in `next.config.js` instead |

### 4. `@beep/utils` Package (`tooling/utils/`)

| File | Export | Replacement |
|------|--------|-------------|
| `src/repo/UniqueDependencies.ts:60` | `collectUniqueDependencies()` | Use `collectUniqueNpmDependencies()` |

---

## Phase Overview

### Phase 1: Discovery & Impact Analysis

**Agent**: `codebase-researcher`

Tasks:
1. Find all usages of each deprecated export across the monorepo
2. Document the dependency graph (which packages import what)
3. Identify test files that use deprecated code
4. Identify any documentation files referencing deprecated APIs

Output: `outputs/usage-analysis.md`

### Phase 2: Migration Implementation

**Agent**: Manual implementation (orchestrator)

Tasks per deprecated item:
1. Update all usages to non-deprecated alternative
2. Verify each file compiles after migration
3. Run tests for affected packages

Order: Process by reverse dependency order (leaf packages first)

### Phase 3: Deletion

**Agent**: Manual implementation (orchestrator)

Tasks:
1. Remove deprecated exports from source files
2. Remove deprecated exports from barrel files (`index.ts`)
3. Delete files that only contained deprecated exports
4. Update `JSDOC_ANALYSIS.md` if it references deleted items

### Phase 4: Verification

Tasks:
1. Run `bun run check` - ensure type checking passes
2. Run `bun run lint` - ensure no lint errors
3. Run `bun run test` - ensure all tests pass
4. Grep for `@deprecated` - confirm zero results

---

## Execution Instructions

### For Orchestrating Agent

```
You are implementing the deprecated-code-cleanup spec.

READ THIS FIRST:
- specs/deprecated-code-cleanup/README.md (this file)
- specs/deprecated-code-cleanup/outputs/usage-analysis.md (after Phase 1)

YOUR MISSION:
1. Complete Phase 1 by delegating to codebase-researcher
2. Execute Phase 2 migrations package by package
3. Execute Phase 3 deletions after all migrations complete
4. Verify with Phase 4 checks

CRITICAL PATTERNS:

1. When migrating `IfAny<T, Then, Else>` → `If<IsAny<T>, Then, Else>`:
   - Import `If` and `IsAny` from appropriate locations
   - The `If` type takes 3 args: If<Condition, Then, Else>
   - The `IsAny` type takes 1 arg and returns boolean type

2. When migrating `Opaque` → `Tagged`:
   - Direct type alias replacement
   - Same signature: `Tagged<Type, Token>`

3. When migrating `collectUniqueDependencies` → `collectUniqueNpmDependencies`:
   - Direct function rename, same signature

4. For PlaywrightPageService.click:
   - Old: `yield* page.click("button#submit")`
   - New: `yield* page.locator("button#submit").click()`

VERIFICATION after each file change:
- bun tsc --noEmit path/to/changed/file.ts
- If isolated check passes, proceed to next file

VERIFICATION after all migrations:
- bun run check --filter @beep/affected-package

HANDOFF:
If context limit approaches, create handoffs/HANDOFF_P[N].md with:
- Completed migrations
- Remaining work items
- Any blockers discovered
```

---

## Reference Commands

```bash
# Find all @deprecated occurrences
rg "@deprecated" --type ts

# Find usages of specific deprecated export
rg "IfAny|IfNever|IfNull|IfUnknown|IfEmptyObject" --type ts

# Find Opaque/UnwrapOpaque usages
rg "Opaque|UnwrapOpaque" --type ts

# Find collectUniqueDependencies usages
rg "collectUniqueDependencies" --type ts

# Verify after changes
bun run check
bun run lint
bun run test
```

---

## Anti-Patterns to Avoid

1. **Don't delete before migrating** - Always update usages first
2. **Don't migrate in random order** - Follow dependency order
3. **Don't skip verification** - Check each file compiles after changes
4. **Don't ignore test files** - They need migration too
5. **Don't leave partial migrations** - Complete one deprecated item fully before starting another

---

## Related Files

- `packages/common/types/JSDOC_ANALYSIS.md` - Documents types including deprecated ones
- `packages/common/types/src/index.ts` - Main barrel file for types package
- `tooling/testkit/src/index.ts` - Testkit barrel file
- `tooling/build-utils/src/index.ts` - Build utils barrel file
- `tooling/utils/src/index.ts` - Utils barrel file
