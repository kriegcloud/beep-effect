# FlexLayout Port Code Quality Report

**Generated**: 2026-01-10T15:00:00Z
**Last Validated**: 2026-01-10 (Post-Docking System P1-P3)
**Categories Analyzed**: 6
**Total Violations**: ~250 (updated from 299)

## Executive Summary

### Overall Health

The FlexLayout port demonstrates strong discipline in avoiding the most dangerous code quality violations (no `any` types, no `@ts-ignore` directives, no `@ts-expect-error`). However, there are significant areas requiring attention before the code meets the full Effect-first standards of the beep-effect repository.

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 8 | Must fix before merge - blocks correctness or type safety |
| **High** | ~120 | Should fix - significant convention violations or potential bugs |
| **Medium** | ~120 | Nice to fix - minor convention violations or code clarity issues |

### Violation Breakdown by Category

| Category | Critical | High | Medium | Total | Notes |
|----------|----------|------|--------|-------|-------|
| Type Safety | 0 | 90 | 74 | ~164 | *Updated: 90 double-casts (was 121)* |
| Native Collections | 8 | 11 | 3 | ~22 | *Updated: 10 Map + 1 Set (was 12 Map)* |
| Native Methods | 0 | 40 | 6 | 46 | - |
| Pattern Matching | 1 | 1 | 1 | 3 | - |
| Option Anti-patterns | 0 | 0 | 3 | 3 | - |
| Repository Conventions | 2 | 0 | 15 | 17 | - |
| **TOTAL** | **11** | **~142** | **~102** | **~255** | |

*Note: Some violations overlap across categories. Counts validated 2026-01-10.*

---

## Critical Issues (MUST FIX)

### 1. Native Map Instantiations
**Category**: Native Collections
**Severity**: Critical
**Affected Files**: 4 files (10 Map + 1 Set instantiations) - *Updated 2026-01-10*

**Description**: The codebase uses native JavaScript `Map` and `Set` instead of Effect's `HashMap` and `HashSet`. This violates the repository's immutability principles and Effect-first conventions.

**Locations** (validated 2026-01-10):
- `view/layout.tsx:753` - `this.moveableElementMap = new Map();`
- `view/layout.tsx:1021-1022` - `borderSetComponents`, `borderSetContentComponents`
- `view/layout.tsx:1233` - `tabMoveables = new Map<string, React.ReactNode>()`
- `view/layout.tsx:1291` - `tabs = new Map<string, React.ReactNode>()`
- `view/layout.tsx:1333` - `nextIdsSet = new Set<string>()` *(Set, not Map)*
- `view/layout.tsx:1361` - `tabs = new Map<string, TabNode>()`
- `view/popout-window.tsx:210` - `React.useRef(new Map<...>())`
- `dock-location.ts:17` - Static `values` Map registry
- `model/model.ts:521-522` - `nodeIdMap`, `parentMap` instantiations

**Recommended Fix**:
```typescript
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";

// Replace
const map = new Map<K, V>();
// With
let map = HashMap.empty<K, V>();
```

---

### 2. Non-Exhaustive Action Dispatcher
**Category**: Pattern Matching
**Severity**: Critical
**Affected Files**: 1 file

**Description**: The `Model.doAction` method (lines 701-762 in `model/model.ts`) uses a `switch` statement with a `default` case that silently warns and returns `this`. Adding new action types won't cause compile errors, leading to runtime bugs.

**Location**:
- `model/model.ts:701-762`

**Recommended Fix**:
```typescript
import * as Match from "effect/Match";

doAction(action: Action): Model {
  return Match.value(action.type).pipe(
    Match.when(ACTION_TYPES.SELECT_TAB, () => this._doSelectTab(...)),
    // ... all cases ...
    Match.exhaustive  // Compile-time exhaustiveness check
  );
}
```

---

### 3. Schema Constructor Casing Violations
**Category**: Repository Conventions
**Severity**: Critical
**Affected Files**: 1 file

**Description**: Two instances of lowercase `S.optional()` violate the PascalCase constructor convention required by the repository.

**Locations**:
- `model/utils.ts:46` - `S.optional(BS.Fn({...}))`
- `model/utils.ts:51` - `S.optional(BS.Fn({...}))`

**Recommended Fix**: Replace `S.optional()` with `S.optionalWith()` or the appropriate PascalCase pattern.

---

## High Priority Issues (SHOULD FIX)

### 1. `as unknown as` Double-Cast Patterns
**Category**: Type Safety
**Severity**: High
**Affected Files**: 11 files, 90 occurrences - *Updated 2026-01-10*

**Description**: Extensive use of `as unknown as` double-casts bypasses TypeScript's type checking. This primarily occurs when bridging between Effect Schema types and runtime interfaces.

**Most Affected Files** (validated 2026-01-10):
| File | Claimed | Actual |
|------|---------|--------|
| `view/layout.tsx` | 41 | 49 |
| `view/tab-set.tsx` | 28 | 25 |
| `model/model.ts` | 19 | 2 |
| `view/border-tab-set.tsx` | 12 | 3 |
| `model/border-node.ts` | - | 3 |
| `view/tab.tsx` | - | 2 |
| `view/row.tsx` | - | 2 |
| Other files | - | 4 |

**Key Patterns**:
- `this.props.model as unknown as ModelRuntime` (21 occurrences in layout.tsx)
- `node as unknown as { getId(): string }` - inline structural type casts
- `layout as unknown as Parameters<typeof Component>[0]["layout"]` - parameter type inference

**Recommended Fix**:
1. Create unified runtime interfaces (`IModelRuntime`, `ITabSetNodeRuntime`, etc.)
2. Use proper type guards before casts
3. Ensure interface compatibility across component boundaries

---

### 2. Mutating Array Methods (`.push()`)
**Category**: Native Methods
**Severity**: High
**Affected Files**: 10 files, ~25 occurrences

**Description**: The codebase uses `.push()` mutations which violate Effect's immutability principles.

**Locations**:
- `attribute-definitions.ts:345-378` - 8 occurrences building description parts
- `view/tab-overflow-hook.tsx:346` - `hidden.push(i)`
- `view/tab-button.tsx:411` - `renderState.buttons.push(...)`
- `view/border-tab-set.tsx:379, 393, 437, 509` - Tab button building
- `view/tab-set.tsx:631, 644, 682` - Tab array building
- `view/row.tsx:155, 164, 168` - Child element building
- `view/layout.tsx:1082-1294` - Edge and stamp building
- `view/border-button.tsx:391` - Render state mutation

**Recommended Fix**:
```typescript
// Before (IMPERATIVE)
const items: string[] = [];
items.push("a");
items.push("b");

// After (FUNCTIONAL)
const items = F.pipe(
  A.empty<string>(),
  A.append("a"),
  A.append("b")
);
```

---

### 3. Native `.length` Property Access
**Category**: Native Methods
**Severity**: High
**Affected Files**: 5 files, ~15 occurrences

**Description**: Direct `.length` property access instead of `A.length()`.

**Locations**:
- `model/utils.ts:80, 101-104`
- `model/border-set.ts:94`
- `model/model.ts:898-900, 1085, 1095, 1156, 1227, 1552`
- `view/tab-button.tsx:465`
- `view/layout.tsx:1286` - Also mutates with `ids.length = 0;`

**Recommended Fix**: Replace all `array.length` with `A.length(array)`.

---

### 4. Native Map Operations
**Category**: Native Collections
**Severity**: High
**Affected Files**: 3 files, 13 occurrences

**Description**: Native `.get()`, `.set()`, `.has()` operations on Map instances.

**Locations**:
- `view/layout.tsx:727, 823, 981, 990, 998, 1011-1053, 1193, 1246, 1309, 1462, 1467, 1279, 1299`
- `view/popout-window.tsx:86, 99, 155, 158, 308`
- `model/model.ts:535, 561, 563, 574, 576, 584, 586, 625, 638, 642`

**Recommended Fix**:
```typescript
// Before
map.set(key, value);
map.get(key);

// After
map = HashMap.set(map, key, value);
const result = HashMap.get(map, key); // Returns Option<V>
```

---

## Medium Priority Issues (NICE TO FIX)

### 1. Simple `as` Type Assertions
**Category**: Type Safety
**Severity**: Medium
**Count**: 74 occurrences

**Description**: Simple type assertions for literals, event targets, and DOM elements. Many are acceptable TypeScript patterns but could be improved.

**Examples**:
- `{ default: () => "value" as const }` - Effect Schema defaults (ACCEPTABLE)
- `(event.target as HTMLInputElement).value` - Form handling (COMMON PATTERN)
- `element.cloneNode(true) as HTMLLinkElement` - DOM cloning (ACCEPTABLE WITH CONTEXT)

---

### 2. Native String Methods
**Category**: Native Methods
**Severity**: Medium
**Affected Files**: 2 files, 6 occurrences

**Locations**:
- `view/utils.tsx:107` - `userAgent.includes("Safari")`, `!userAgent.includes("Chrome")`, `!userAgent.includes("Chromium")`
- `model/utils.ts:124` - `"xxx...".replace(/[xy]/g, (c) => {...})`
- `attribute-definitions.ts:383` - `[...].join("\n")`
- `model/close-type.model.ts:12` - `].join("\n")`

**Recommended Fix**: Use `Str.includes()` from Effect for string checks. The regex replace may require special handling.

---

### 3. Switch Statements on Discriminated Unions
**Category**: Pattern Matching
**Severity**: Medium
**Count**: 2 occurrences

**Locations**:
- `model/border-node.ts:122-132` - `toDockLocation` switch
- `model/model.ts:1522-1535` - `_calculateBorderInsets` switch

These are TypeScript-exhaustive but should use `Match.value` for consistency.

---

### 4. Empty String ID Fallbacks
**Category**: Option Anti-patterns
**Severity**: Medium
**Count**: 18 occurrences

**Description**: Using `O.getOrElse(node.id, thunkEmptyStr)` may mask bugs where missing IDs cause silent failures.

**Location**: `model/model.ts` (lines 318, 324, 336, 559, 572, 582, 787, 794, 884, 885, 1129, 1145, 1314, 1319, 1322, 1375, 1412, 1448)

**Recommendation**: Consider throwing errors for required IDs or generating random IDs instead of empty string fallbacks.

---

## Systemic Patterns

### 1. Schema vs Runtime Type Mismatch
The most pervasive issue across the codebase is the gap between Effect Schema types (used for validation/serialization) and runtime object interfaces (used for component interaction). This manifests as:
- 121 double-cast violations
- Repeated `as unknown as RuntimeType` patterns
- Inline structural type casts like `as { getId(): string }`

**Root Cause**: The Schema-based node types don't expose runtime methods, leading to casts everywhere those methods are needed.

**Solution**: Create proper runtime interfaces that extend the Schema types:
```typescript
interface IModelRuntime extends Model {
  // Runtime methods
  doAction(action: Action): Model;
  // ...
}
```

### 2. Imperative Array Building in React Components
View components consistently use `.push()` to build arrays for rendering. While common in React code, this violates Effect's immutability principles.

**Pattern Location**: All view components in `view/` directory.

**Solution**: Use functional array building with `A.append()` or spread operators, or document these as acceptable exceptions for React rendering performance.

### 3. Native Collection Usage for React State
Maps and Sets are used for React component state and refs. Converting to Effect HashMap/HashSet requires immutable update patterns.

**Consideration**: Effect HashMap is immutable, which changes how updates work in React refs. Document whether this is acceptable or requires migration.

---

## File-Level Summary

| File | Critical | High | Medium | Total | Status |
|------|----------|------|--------|-------|--------|
| `view/layout.tsx` | 5 | 55 | 5 | 65 | Needs Refactoring |
| `model/model.ts` | 3 | 28 | 2 | 33 | Needs Refactoring |
| `view/tab-set.tsx` | 0 | 31 | 1 | 32 | High Priority |
| `view/border-tab-set.tsx` | 0 | 16 | 0 | 16 | High Priority |
| `model/utils.ts` | 2 | 5 | 0 | 7 | Quick Fix |
| `view/popout-window.tsx` | 1 | 8 | 0 | 9 | Medium Priority |
| `view/row.tsx` | 0 | 7 | 0 | 7 | Medium Priority |
| `view/tab-button.tsx` | 0 | 3 | 3 | 6 | Low Priority |
| `view/splitter.tsx` | 0 | 2 | 2 | 4 | Low Priority |
| `view/tab-overflow-hook.tsx` | 0 | 4 | 0 | 4 | Low Priority |
| `dock-location.ts` | 1 | 0 | 0 | 1 | Quick Fix |
| `model/border-node.ts` | 0 | 0 | 1 | 1 | Low Priority |
| `attribute-definitions.ts` | 0 | 10 | 1 | 11 | Medium Priority |
| `view/utils.tsx` | 0 | 3 | 0 | 3 | Quick Fix |
| `model/border-set.ts` | 0 | 1 | 0 | 1 | Quick Fix |
| Other files | 0 | 2 | 87 | 89 | Various |
| **TOTAL** | **12** | **175** | **102** | **289** | |

---

## Recommendations

### Phase 1: Blocking Issues (Before Merge)

1. **Fix Native Map/Set Instantiations** (Critical, ~2 hours)
   - Convert 12 `new Map()` to `HashMap.empty()`
   - Convert 4 `new Set()` to `HashSet.empty()`
   - Update all `.get()`, `.set()`, `.has()` calls

2. **Fix Non-Exhaustive Action Dispatcher** (Critical, ~1 hour)
   - Refactor `Model.doAction` to use `Match.value` with `Match.exhaustive`
   - Type action payloads properly with discriminated union

3. **Fix Schema Constructor Casing** (Critical, ~15 minutes)
   - Replace 2 `S.optional()` with PascalCase equivalent

### Phase 2: Quality Improvements (Post-Merge Sprint)

4. **Create Runtime Type Interfaces** (High, ~4 hours)
   - Define `IModelRuntime`, `ITabSetNodeRuntime`, `ITabNodeRuntime`, `IBorderNodeRuntime`
   - Replace 50+ double-casts with proper interface usage

5. **Replace Native Array Methods** (High, ~3 hours)
   - Convert ~25 `.push()` calls to `A.append()` patterns
   - Convert ~15 `.length` accesses to `A.length()`

6. **Standardize Layout Interfaces** (High, ~2 hours)
   - Create single `ILayoutInternal` interface satisfying all child components
   - Eliminate prop casting between parent and child components

### Phase 3: Refinement (Future Sprint)

7. **Convert Remaining Switch Statements** (Medium, ~1 hour)
   - Migrate 2 remaining switches to `Match.value`

8. **Replace Native String Methods** (Medium, ~30 minutes)
   - Convert `String.includes()` to `Str.includes()`
   - Evaluate regex replace handling

9. **Review ID Fallback Patterns** (Medium, ~1 hour)
   - Audit 18 empty string ID fallbacks
   - Document or fix potential silent failure points

---

## Positive Findings

Despite the violations, the FlexLayout port demonstrates several strengths:

1. **No `any` Type Usage** - The most dangerous type safety violation is completely absent
2. **No Suppression Comments** - No `@ts-ignore` or `@ts-expect-error` directives
3. **Correct Effect Schema Usage** - `as const` patterns for schema defaults are appropriate
4. **Good Option Handling** - No `getOrElse(() => undefined)` anti-patterns
5. **Consistent Import Patterns** - All Effect modules use namespace imports correctly
6. **Proper "use client" Directives** - All 19 TSX files have the directive
7. **Type Guards Implemented** - `isDraggable`, `isDropTarget` use proper patterns
8. **Convention Compliance ~95%** - Strong adherence to repository conventions overall

---

## Appendix: Detailed Reports

Individual category reports with full violation details:

- [Type Safety Violations](./port-code-quality/type-safety-violations.md)
- [Native Collections Violations](./port-code-quality/native-collections-violations.md)
- [Native Methods Violations](./port-code-quality/native-methods-violations.md)
- [Pattern Matching Violations](./port-code-quality/pattern-matching-violations.md)
- [Option Anti-patterns Violations](./port-code-quality/option-antipatterns-violations.md)
- [Repository Conventions Violations](./port-code-quality/repository-conventions-violations.md)
