# Deprecated Code Usage Analysis

> Phase 1 output for the deprecated-code-cleanup spec.

---

## Summary

| Metric | Value |
|--------|-------|
| **Total deprecated exports** | 11 |
| **Total files with usages** | 2 (test files only) |
| **Packages affected** | 2 (`@beep/testkit`, `@beep/build-utils`) |
| **Migration complexity** | Low |

### Key Finding

The deprecated `@beep/types` exports (IfAny, IfNever, IfNull, IfUnknown, IfEmptyObject, ReadonlyTuple, Opaque, UnwrapOpaque) are:
1. **NOT exported** from the main barrel file (`src/index.ts`)
2. **NOT imported** by any consuming packages
3. Only accessible via wildcard subpath exports (`./*`) but **never actually used**

This means **Phase 2 migration is trivial** - these types can be deleted directly without any consumer migration.

---

## Detailed Usages by Deprecated Item

### 1. IfAny (`packages/common/types/src/if-any.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 2. IfNever (`packages/common/types/src/if-never.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 3. IfNull (`packages/common/types/src/if-null.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 4. IfUnknown (`packages/common/types/src/if-unknown.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 5. IfEmptyObject (`packages/common/types/src/if-empty-object.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 6. ReadonlyTuple (`packages/common/types/src/readonly-tuple.ts`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | - | - | - |

**Status**: Definition file exists but NOT exported from barrel. No external usages found.

**Migration Notes**: Can delete directly.

---

### 7. Opaque (`packages/common/types/src/tagged.ts:216`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | 216 | `export type Opaque<Type, Token = unknown>` | - |

**Status**: Defined in `tagged.ts` alongside non-deprecated `Tagged` type. No external usages.

**Migration Notes**: Remove the deprecated type alias from `tagged.ts`. Keep `Tagged`, `UnwrapTagged`, and other non-deprecated exports.

---

### 8. UnwrapOpaque (`packages/common/types/src/tagged.ts:254`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (definition only) | 254 | `export type UnwrapOpaque<OpaqueType>` | - |

**Status**: Defined in `tagged.ts` alongside non-deprecated `UnwrapTagged` type. No external usages.

**Migration Notes**: Remove the deprecated type alias from `tagged.ts`. Keep `UnwrapTagged`.

---

### 9. PlaywrightPageService.click() (`tooling/testkit/src/playwright/page.ts:183`)

**Usage Count**: 2

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| `tooling/testkit/test/playwright/page.test.ts` | 50 | `yield* page.click("#mybutton")` | Simple |
| `tooling/testkit/test/playwright/page.test.ts` | 109 | `yield* page.click("#mybutton", { position: { x: 10, y: 10 } })` | Simple |

**Status**: Deprecated method has 2 usages in test files.

**Migration Pattern**:
```typescript
// OLD (deprecated)
yield* page.click("#mybutton");
yield* page.click("#mybutton", { position: { x: 10, y: 10 } });

// NEW (recommended)
yield* page.locator("#mybutton").click();
yield* page.locator("#mybutton").click({ position: { x: 10, y: 10 } });
```

**Migration Notes**: Update test files to use locator pattern, then remove the deprecated `click` method from the service interface and implementation.

---

### 10. PluginOptions.subdomainPrefix (`tooling/build-utils/src/pwa/types.ts:244`)

**Usage Count**: 1 (internal)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| `tooling/build-utils/src/pwa/with-pwa.ts` | 189 | destructured from `pluginOptions` | Simple |
| `tooling/build-utils/src/pwa/with-pwa.ts` | 206-209 | deprecation warning check | Simple |

**Status**: Internal usage only. Handles deprecation warning but no actual functionality.

**Migration Notes**:
1. Remove `subdomainPrefix` from the `PluginOptions` interface in `types.ts`
2. Remove the destructuring and warning check in `with-pwa.ts`
3. No external migration needed - this option was never functionally used

---

### 11. getUniqueDeps (`tooling/utils/src/repo/UniqueDependencies.ts:95`)

**Usage Count**: 0 (external)

| File | Line | Usage Pattern | Migration Complexity |
|------|------|---------------|---------------------|
| (export only) | 95 | `export const getUniqueDeps = collectUniqueNpmDependencies` | - |

**Status**: Compatibility alias exported from barrel files but never actually used by any consumer.

**Migration Notes**: Remove the deprecated export from:
1. `tooling/utils/src/repo/UniqueDependencies.ts` (line 95)
2. Update barrel file documentation in `tooling/utils/src/index.ts` (lines 8, 59)
3. Update barrel file documentation in `tooling/utils/src/repo/index.ts` (line 132)

---

## Dependency Graph

### Packages that import from `@beep/types`

The following packages import from `@beep/types` (none import deprecated items):

| Package | Imports Used |
|---------|--------------|
| `@beep/schema` | `StringTypes`, `StructTypes`, `UnsafeTypes`, `RecordTypes`, `Or` |
| `@beep/utils` | `UnsafeTypes`, `StringTypes`, `RecordTypes`, `StructTypes`, `DeepNonNullable` |
| `@beep/ui-core` | `UnsafeTypes` |
| `@beep/ui` | `UnsafeTypes`, `StringTypes` |
| `@beep/shared-domain` | `UnsafeTypes`, `StringTypes` |
| `@beep/shared-server` | `UnsafeTypes` |
| `@beep/iam-client` | `UnsafeTypes` |
| `@beep/runtime-client` | `UnsafeTypes` |
| `@beep/wrap` | `UnsafeTypes` |
| `@beep/identity` | `StringTypes` |
| `@beep/constants` | `UnsafeTypes` |
| `apps/web` | `UnsafeTypes` |
| `@beep/build-utils` | `UnsafeTypes` (in tests only) |

**Key Observation**: No packages import any deprecated types.

### Circular Dependencies

None detected relevant to deprecated code.

---

## Recommended Migration Order

Given that most deprecated items have **zero external usages**, the migration order is straightforward:

### Phase 2A: Direct Deletions (No Migration Needed)

1. **`@beep/types` deprecated files** - Delete directly:
   - `src/if-any.ts`
   - `src/if-never.ts`
   - `src/if-null.ts`
   - `src/if-unknown.ts`
   - `src/if-empty-object.ts`
   - `src/readonly-tuple.ts`

2. **`@beep/types` deprecated exports in `tagged.ts`**:
   - Remove `Opaque` type alias (line 216)
   - Remove `UnwrapOpaque` type alias (lines 254-258)

3. **`@beep/tooling-utils` deprecated export**:
   - Remove `getUniqueDeps` alias

4. **`@beep/build-utils` deprecated option**:
   - Remove `subdomainPrefix` from `PluginOptions`
   - Remove deprecation warning code

### Phase 2B: Migration Required

5. **`@beep/testkit` deprecated method**:
   - Migrate 2 test file usages of `page.click()` to locator pattern
   - Remove `click` method from `PlaywrightPageService`

---

## Test Files Using Deprecated Code

| Test File | Deprecated Item | Lines |
|-----------|-----------------|-------|
| `tooling/testkit/test/playwright/page.test.ts` | `PlaywrightPageService.click()` | 50, 109 |

---

## Blockers & Risks

### None Identified

The analysis reveals an unexpectedly clean situation:
- All `@beep/types` deprecated items have zero external consumers
- The only migration needed is 2 test file updates in `@beep/testkit`
- All other deprecated items can be deleted directly

### Recommendations

1. **Proceed directly to Phase 2** - No blockers
2. **Consider removing wildcard exports** from `@beep/types` package.json to prevent future accidental imports of internal-only types
3. **Update JSDoc for `tagged.ts`** to remove references to deprecated `Opaque`/`UnwrapOpaque` in examples
