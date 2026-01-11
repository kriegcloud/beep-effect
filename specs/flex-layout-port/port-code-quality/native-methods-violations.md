# Native Method Violations Report

**Generated**: 2026-01-10
**Scope**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/`

## Summary

| Category | Violations Found | Status |
|----------|-----------------|--------|
| Array Methods | 22 | Mostly Compliant |
| String Methods | 3 | Violations Found |
| Object Methods | 0 | Fully Compliant |
| Mutating Methods | 12 | Violations Found |

## Overall Assessment

The FlexLayout port demonstrates **good overall compliance** with Effect utilities for most operations. The codebase consistently uses `A.*` from `effect/Array`, `Str.*` from `effect/String`, and `O.*` from `effect/Option`. However, there are specific violations that need attention.

---

## True Violations

### 1. Native `.length` Property Access (CRITICAL)

**Impact**: High - Direct `.length` access bypasses Effect's `A.length()` utility.

| File | Line | Code | Fix |
|------|------|------|-----|
| `model/utils.ts` | 80 | `const len = children.length;` | `const len = A.length(children);` |
| `model/utils.ts` | 101-104 | `parent.getChildren().length` (3 occurrences) | `A.length(parent.getChildren())` |
| `model/border-set.ts` | 94 | `return this.borders.length;` | `return A.length(this.borders);` |
| `model/model.ts` | 898-900 | `newChildren.length` (3 occurrences) | `A.length(newChildren)` |
| `model/model.ts` | 1085 | `tabset.children.length` | `A.length(tabset.children)` |
| `model/model.ts` | 1095 | `newChildren.length - 1` | `A.length(newChildren) - 1` |
| `model/model.ts` | 1156 | `row.children.length > 1` | `A.length(row.children) > 1` |
| `model/model.ts` | 1227 | `row.children.length` | `A.length(row.children)` |
| `model/model.ts` | 1552 | `const childCount = children.length;` | `const childCount = A.length(children);` |
| `view/layout.tsx` | 987 | `(A.length(border.getChildren?.() ?? []) > 0 ...` | Already uses A.length - COMPLIANT |
| `view/layout.tsx` | 1286 | `ids.length = 0;` | Mutation - see below |
| `view/tab-button.tsx` | 465 | `return children.length;` | `return A.length(children);` |

**Total Direct `.length` Violations**: 15+

### 2. Mutating Array Methods (CRITICAL)

**Impact**: High - These mutations violate immutability principles expected in Effect code.

| File | Line | Code | Fix |
|------|------|------|-----|
| `attribute-definitions.ts` | 345-378 | `descriptionParts.push(...)` (7 occurrences) | Use `A.append` or collect in pipeline |
| `attribute-definitions.ts` | 375 | `lines.push(jsdoc)` | Use `A.append` |
| `attribute-definitions.ts` | 378 | `lines.push(...)` | Use `A.append` |
| `view/tab-overflow-hook.tsx` | 346 | `hidden.push(i)` | Use `A.append` |
| `view/tab-button.tsx` | 411 | `renderState.buttons.push(...)` | Use `A.append` |
| `view/border-tab-set.tsx` | 379, 393, 437, 509 | `tabButtons.push(...)`, `buttons.push(...)` | Use `A.append` |
| `view/tab-set.tsx` | 631, 644, 682 | `tabs.push(...)` | Use `A.append` |
| `view/row.tsx` | 155, 164, 168 | `childElements.push(...)` | Use `A.append` |
| `view/layout.tsx` | 1082-1225 | `edges.push(...)`, `tabStamps.push(...)` | Use `A.append` |
| `view/layout.tsx` | 1280-1294 | `nextIds.push(...)`, `ids.push(...)` | Use `A.append` |
| `view/layout.tsx` | 1286 | `ids.length = 0;` | Use `A.empty<T>()` or reassign |
| `view/border-button.tsx` | 391 | `renderState.buttons.push(...)` | Use `A.append` |

**Total Mutation Violations**: ~25

### 3. Native String `.includes()` Method

**Impact**: Medium - Should use `Str.includes` from Effect.

| File | Line | Code | Fix |
|------|------|------|-----|
| `view/utils.tsx` | 107 | `userAgent.includes("Safari")` | `Str.includes(userAgent, "Safari")` |
| `view/utils.tsx` | 107 | `!userAgent.includes("Chrome")` | `!Str.includes(userAgent, "Chrome")` |
| `view/utils.tsx` | 107 | `!userAgent.includes("Chromium")` | `!Str.includes(userAgent, "Chromium")` |

### 4. Native String `.replace()` Method

**Impact**: Medium - Should use `Str.replace` from Effect.

| File | Line | Code | Fix |
|------|------|------|-----|
| `model/utils.ts` | 124 | `"xxx...".replace(/[xy]/g, (c) => {...})` | `Str.replaceAll` with regex |

**Note**: The Str.replace in Effect may not support the same callback pattern. This may need a custom approach using `Str.split` + `A.map` + `A.join`, or keep native for this specific UUID generation.

### 5. Native `.join()` Method

**Impact**: Low - Some instances already use `A.join`, but there are violations.

| File | Line | Code | Fix |
|------|------|------|-----|
| `attribute-definitions.ts` | 383 | `[...].join("\n")` | `A.join(..., "\n")` |
| `model/close-type.model.ts` | 12 | `].join("\n")` | `A.join(..., "\n")` |

---

## Compliant Patterns (Reference)

The codebase correctly uses Effect utilities in many places:

### Array Operations (CORRECT)
```typescript
// model/model.ts
const newChildren = A.map(row.children, (child, i) => {...});
const filtered = A.filter(this.borders, (border) => ...);
const totalWeight = A.reduce(children, 0, (acc, child) => {...});

// view/tab-overflow-hook.tsx
return A.every(arr1, (val, index) => val === arr2[index]);

// view/popout-window.tsx
A.forEach(A.fromIterable(mutation.addedNodes), (addition) => {...});
```

### String Operations (CORRECT)
```typescript
// view/layout.tsx
className = Str.concat(Str.concat(className, " "), ...);
content = Str.replace("?", String(A.length(children)))(moveTabsLabel);
```

### Length Checks (CORRECT)
```typescript
// view/tab-overflow-hook.tsx
if (A.length(arr1) !== A.length(arr2)) {...}

// view/border-tab-set.tsx
const childrenLength = A.length(children);
```

---

## Fix Priority

### P0 - Critical (Fix Immediately)
1. **Direct `.length` property access** - 15+ occurrences across model files
2. **Mutating `.push()` calls** - 25+ occurrences in view components

### P1 - High (Fix Soon)
3. **String `.includes()` calls** - 3 occurrences in utils.tsx

### P2 - Medium (Fix When Convenient)
4. **Native `.join()` calls** - 2 occurrences
5. **String `.replace()` with callback** - 1 occurrence (may need special handling)

---

## Recommended Fix Patterns

### Replace `.length` with `A.length()`
```typescript
// Before
const len = children.length;

// After
const len = A.length(children);
```

### Replace `.push()` with Immutable Pattern
```typescript
// Before (IMPERATIVE)
const items: string[] = [];
items.push("a");
items.push("b");

// After (FUNCTIONAL with A.append)
const items = F.pipe(
  A.empty<string>(),
  A.append("a"),
  A.append("b")
);

// OR collect in array literal
const items = ["a", "b"];
```

### Replace String `.includes()` with `Str.includes()`
```typescript
// Before
userAgent.includes("Safari")

// After
Str.includes(userAgent, "Safari")
```

### Replace `.join()` with `A.join()`
```typescript
// Before
["a", "b", "c"].join("\n")

// After
A.join(["a", "b", "c"], "\n")
```

---

## Files Requiring Changes

| File | Violations | Priority |
|------|------------|----------|
| `model/utils.ts` | 5 | P0 |
| `model/model.ts` | 8 | P0 |
| `model/border-set.ts` | 1 | P0 |
| `view/layout.tsx` | 10+ | P0 |
| `view/tab-button.tsx` | 2 | P0 |
| `view/tab-set.tsx` | 3 | P0 |
| `view/border-tab-set.tsx` | 4 | P0 |
| `view/row.tsx` | 3 | P0 |
| `view/tab-overflow-hook.tsx` | 1 | P0 |
| `view/border-button.tsx` | 1 | P0 |
| `view/utils.tsx` | 3 | P1 |
| `attribute-definitions.ts` | 10 | P0 |
| `model/close-type.model.ts` | 1 | P2 |

---

## False Positives Identified

These were NOT counted as violations:

1. **JSDoc/Comment Examples**: `.map(` in code examples within JSDoc comments (e.g., tab-button-stamp.tsx lines 20-21)
2. **Already Effect-Compliant**: Many files correctly use `A.map`, `A.filter`, `A.forEach` etc.
3. **Option Methods**: `O.some()`, `O.map()`, `O.filter()` are Effect Option operations, not array violations
4. **Schema Usage**: `S.Array(...)` is schema definition, not runtime array manipulation

---

## Conclusion

The FlexLayout port has approximately **50-60 native method violations** requiring fixes:
- ~15 `.length` property accesses
- ~25 `.push()` mutations
- ~3 string `.includes()` calls
- ~2 `.join()` calls
- ~1 string `.replace()` with callback

The most impactful fixes are replacing `.length` with `A.length()` and refactoring `.push()` mutations to use immutable patterns with `A.append` or array literals.
