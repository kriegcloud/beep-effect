# Handoff Document - Phase 1: Discovery & Impact Analysis

---

## Phase 0 Summary

The spec was scaffolded with:
- Complete inventory of 11 deprecated items across 4 packages
- Replacement strategies documented for each item
- Phase structure defined (Discovery → Migration → Deletion → Verification)

---

## Phase 1 Objectives

Produce a comprehensive usage analysis that enables safe migration in Phase 2.

---

## Deprecated Items Inventory

### Package: `@beep/types` (packages/common/types/)

| Export | File | Replacement |
|--------|------|-------------|
| `IfAny<T, Then, Else>` | `src/if-any.ts` | `If<IsAny<T>, Then, Else>` |
| `IfEmptyObject<T, Then, Else>` | `src/if-empty-object.ts` | `If<IsEmptyObject<T>, Then, Else>` |
| `IfNever<T, Then, Else>` | `src/if-never.ts` | `If<IsNever<T>, Then, Else>` |
| `IfNull<T, Then, Else>` | `src/if-null.ts` | `If<IsNull<T>, Then, Else>` |
| `IfUnknown<T, Then, Else>` | `src/if-unknown.ts` | `If<IsUnknown<T>, Then, Else>` |
| `ReadonlyTuple<Length, Element>` | `src/readonly-tuple.ts` | `Readonly<TupleOf<Length, Element>>` |
| `Opaque<Type, Token>` | `src/tagged.ts:216` | `Tagged<Type, Token>` |
| `UnwrapOpaque<OpaqueType>` | `src/tagged.ts:254` | `UnwrapTagged<TaggedType>` |

### Package: `@beep/testkit` (tooling/testkit/)

| Export | File | Replacement |
|--------|------|-------------|
| `PlaywrightPageService.click(selector)` | `src/playwright/page.ts:183` | `page.locator(selector).click()` |

### Package: `@beep/build-utils` (tooling/build-utils/)

| Export | File | Replacement |
|--------|------|-------------|
| `PluginOptions.subdomainPrefix` | `src/pwa/types.ts:242` | Use `basePath` in `next.config.js` |

### Package: `@beep/utils` (tooling/utils/)

| Export | File | Replacement |
|--------|------|-------------|
| `collectUniqueDependencies()` | `src/repo/UniqueDependencies.ts:60` | `collectUniqueNpmDependencies()` |

---

## Search Commands

Use these to find usages:

```bash
# Find all @deprecated tags
rg "@deprecated" --type ts -l

# Find @beep/types deprecated exports
rg "\\b(IfAny|IfNever|IfNull|IfUnknown|IfEmptyObject|ReadonlyTuple|Opaque|UnwrapOpaque)\\b" --type ts

# Find @beep/testkit deprecated method
rg "\\.click\\(" tooling/testkit --type ts
rg "page\\.click" --type ts

# Find @beep/build-utils deprecated option
rg "subdomainPrefix" --type ts

# Find @beep/utils deprecated function
rg "collectUniqueDependencies" --type ts

# Find package consumers
rg "from ['\"]@beep/types['\"]" --type ts
rg "from ['\"]@beep/testkit['\"]" --type ts
```

---

## Expected Output

File: `specs/deprecated-code-cleanup/outputs/usage-analysis.md`

Must contain:
1. Summary statistics
2. Per-item usage tables with file paths, line numbers, patterns
3. Migration complexity assessment per usage
4. Recommended migration order based on dependencies
5. Any blockers or risks discovered

---

## Success Criteria

- [ ] All 11 deprecated items have usage counts
- [ ] All affected files are listed with line numbers
- [ ] Migration order accounts for package dependencies
- [ ] Test files are identified separately
- [ ] Risks and blockers documented

---

## Known Gotchas

1. **Re-exports**: Check barrel files (`index.ts`) - they may re-export deprecated items
2. **Type-only imports**: `import type { Opaque }` - these are usages too
3. **Generic constraints**: Types may be used in `extends` clauses
4. **Documentation**: `JSDOC_ANALYSIS.md` references deprecated types
5. **Tests**: Test files often use deprecated APIs for backward compat testing

---

## Next Phase Preview

Phase 2 (Migration) will:
1. Update usages in reverse dependency order
2. Verify compilation after each file change
3. Run package-level checks incrementally
