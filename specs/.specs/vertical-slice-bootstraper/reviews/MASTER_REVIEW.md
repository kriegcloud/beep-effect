# Master Review: create-slice CLI Command

> Consolidated findings from 5 parallel review agents analyzing the `tooling/cli/src/commands/create-slice/` codebase.

**Review Date**: 2026-01-06
**Total Files Analyzed**: ~30 source files, ~30 template files
**Total Lines of Code**: ~2,600

---

## Executive Summary

The `create-slice` CLI command successfully scaffolds vertical slices but contains significant technical debt that threatens maintainability. The code demonstrates good Effect patterns in many areas but has critical issues requiring immediate attention.

### Overall Assessment by Category

| Category | Rating | Summary |
|----------|--------|---------|
| Effect Patterns | Good | Proper Effect.gen, tagged errors, good Array/String utilities with notable exceptions |
| Architecture | Needs Refactoring | Massive duplication, unused code, god function in file-generator.ts |
| Type Safety | Good with Issues | 1 explicit `any`, 5 type assertions, proper error typing |
| Templates | Good but Incomplete | Missing schema.ts and _check.ts templates, export pattern mismatches |
| ts-morph | Fragile | Heavy regex usage bypasses AST safety, silent failures |

---

## Critical Issues (Must Fix)

### 1. Massive Code Duplication: Inline Generators vs .hbs Templates
**Source**: Architecture Review
**Severity**: Critical
**Files**: `file-generator.ts` (1,300 lines) + `templates/**/*.hbs` (30+ files)

The codebase maintains **two parallel implementations** for generating the same files. Inline generators are actively used; .hbs templates are completely unused dead code.

**Impact**: Confusing source of truth, doubled maintenance burden, ~240 lines of dead code in template.ts.

**Fix**: Delete all unused .hbs templates and unused TemplateService code in template.ts.

---

### 2. Regex-Based AST Manipulation in ts-morph.ts
**Source**: ts-morph Review
**Severity**: Critical
**Lines**: 139, 224, 381, 429, 445, 502, 518, 647

The code uses regex patterns instead of ts-morph's AST API, making it fragile to:
- Formatting changes
- Comments within matched regions
- Nested structures

**Example**:
```typescript
// FRAGILE - Line 381
const unionRegex = /S\.Union\(([\s\S]*?)\)\.annotations/;
```

**Impact**: Code breaks when target files are reformatted or when patterns evolve.

**Fix**: Replace all regex operations with proper ts-morph AST queries.

---

### 3. Silent Failures in ts-morph Operations
**Source**: ts-morph Review
**Severity**: Critical
**Lines**: 227, 384, 432, 448, 505, 521, 650

Functions silently succeed when expected patterns aren't found, leading to incomplete slice integration with no error feedback.

**Impact**: Slices are partially integrated without any error, making debugging extremely difficult.

**Fix**: Fail explicitly with TsMorphError when critical patterns aren't found.

---

### 4. Missing Template Files
**Source**: Templates Review
**Severity**: Critical
**Location**: `templates/tables/src/`

Missing files:
- `schema.ts.hbs` - Required for `@beep/xxx-tables/schema` import pattern
- `_check.ts.hbs` - Required for compile-time model/table alignment verification

**Impact**: Generated slices don't match reference implementations, manual file creation required.

**Fix**: Create the missing template files matching existing slice patterns.

---

## High Priority Issues

### 5. Switch Statement Without Match.exhaustive
**Source**: Effect Patterns Review
**Severity**: High
**Location**: `file-generator.ts` lines 383-464

```typescript
// VIOLATION - use Match.value() instead
switch (layer) {
  case "domain": return `...`;
  case "tables": return `...`;
  // ...
  default: return `export {};\n`;
}
```

**Fix**: Replace with `Match.value(layer).pipe(Match.when(...), Match.exhaustive)`.

---

### 6. Mutable Array Patterns with .push()
**Source**: Effect Patterns Review
**Severity**: High
**Location**: `file-generator.ts` lines 994-1016

```typescript
// VIOLATION
const directories: string[] = [];
for (const layer of LAYERS) {
  directories.push(layerDir);
}
```

**Fix**: Use `A.flatMap` for immutable generation:
```typescript
const directories = F.pipe(LAYERS, A.flatMap((layer) => [...]))
```

---

### 7. Explicit `any` Type in handler.ts
**Source**: Type Safety Review
**Severity**: High
**Location**: `handler.ts` lines 70-71

```typescript
// biome-ignore lint/suspicious/noExplicitAny: jsonc-parser returns any
const currentPaths: Record<string, any> = parsed?.compilerOptions?.paths || {};
```

**Fix**: Create Effect Schema for tsconfig structure and validate properly.

---

### 8. Native Array Methods in template.ts
**Source**: Type Safety Review
**Severity**: High
**Location**: `template.ts` lines 93-99

```typescript
// VIOLATION
arr.map((part) => {...}).join("")
```

**Fix**: Use `F.pipe(arr, A.map(...), A.join(""))`.

---

### 9. Native Set Usage
**Source**: Effect Patterns Review
**Severity**: High
**Location**: `config-updater.ts` lines 183-188

```typescript
// VIOLATION
const currentPaths = new Set(...)
```

**Fix**: Use `HashSet.fromIterable` from `effect/HashSet`.

---

### 10. Domain package.json Missing @effect/sql
**Source**: Templates Review
**Severity**: High
**Location**: `templates/domain/package.json.hbs`

The model template uses `@effect/sql/Model` but domain package.json doesn't list it as dependency.

**Fix**: Add `"@effect/sql": "catalog:"` to domain dependencies.

---

## Medium Priority Issues

### 11. Inconsistent Export in slice-relations.ts
**Source**: ts-morph Review
**Severity**: Medium
**Location**: `ts-morph.ts` lines 594-597

Generated: `export {} from "@beep/xxx-tables/relations";`
Expected: `export { placeholderRelations } from "@beep/xxx-tables/relations";`

**Fix**: Generate named exports matching existing pattern.

---

### 12. Awkward Option Patterns
**Source**: Effect Patterns Review
**Severity**: Medium
**Location**: `ts-morph.ts` lines 227, 384, 432, 448, etc.

```typescript
// AWKWARD
if (O.isSome(O.fromNullable(match))) {
  const value = match![1];  // Non-null assertion defeats Option
}
```

**Fix**: Use `O.match` or `O.getOrElse` properly.

---

### 13. Type Assertions Without Validation
**Source**: Type Safety Review
**Severity**: Medium
**Locations**: handler.ts:121, config-updater.ts:107, config-updater.ts:134

```typescript
const parsed = jsonc.parse(content) as { references?: ... };
```

**Fix**: Use Effect Schema validation instead of type assertions.

---

### 14. JSDoc Example Uses new Date()
**Source**: Templates Review
**Severity**: Medium
**Location**: `templates/domain/src/entities/Placeholder/Placeholder.model.ts.hbs`

```typescript
// VIOLATION - per CLAUDE.md, new Date() is forbidden
createdAt: new Date(),
```

**Fix**: Use `DateTime.unsafeNow()` in example.

---

### 15. God Function in file-generator.ts
**Source**: Architecture Review
**Severity**: Medium
**Location**: `file-generator.ts` createPlan() lines 988-1203

215-line function handling 30+ file types violates single responsibility.

**Fix**: Split into focused modules:
```
file-generator/
  index.ts
  plan-builder.ts
  generators/
    domain.ts
    tables.ts
    server.ts
    client-ui.ts
```

---

### 16. Duplicated Layer Constants
**Source**: Architecture Review
**Severity**: Medium
**Locations**: file-generator.ts:43, ts-morph.ts:42/49, template.ts:184

```typescript
// Duplicated in 4 files
const LAYERS = ["domain", "tables", "server", "client", "ui"];
```

**Fix**: Create single `constants.ts` source of truth.

---

## Low Priority Issues

### 17. Spread Operators Instead of A.append
**Source**: Effect Patterns Review
**Severity**: Low
**Locations**: handler.ts:132, config-updater.ts:203/323

```typescript
// PREFER
F.pipe(refs, A.append(newRef))  // instead of [...refs, newRef]
```

---

### 18. Non-Idempotent Batch Selection
**Source**: ts-morph Review
**Severity**: Low
**Location**: `ts-morph.ts` findSmallestBatch()

When batches have equal counts, first encountered is always chosen.

**Fix**: Add deterministic tie-breaker.

---

### 19. Client/UI Missing Stub Export
**Source**: Templates Review
**Severity**: Low
**Location**: `templates/client/src/index.ts.hbs`, `templates/ui/src/index.ts.hbs`

Empty modules can cause issues. Should include `export {};`.

---

### 20. Missing @category JSDoc Tags
**Source**: Templates Review
**Severity**: Low
**Locations**: Various templates

Add consistent JSDoc with @category, @since, @module tags.

---

## Action Plan

### Phase 1: Critical Fixes (Immediate)
1. [ ] Delete unused .hbs templates and TemplateService
2. [ ] Replace ts-morph regex with AST operations (or add explicit error handling)
3. [ ] Create missing schema.ts.hbs and _check.ts.hbs templates
4. [ ] Add @effect/sql to domain package.json.hbs

### Phase 2: High Priority (This Sprint)
5. [ ] Replace switch statement with Match.value() in file-generator.ts
6. [ ] Refactor mutable array patterns to use A.flatMap
7. [ ] Remove explicit `any` with proper Schema validation
8. [ ] Fix native array methods in template.ts
9. [ ] Replace native Set with HashSet

### Phase 3: Medium Priority (Next Sprint)
10. [ ] Fix slice-relations.ts export format
11. [ ] Clean up awkward Option patterns in ts-morph.ts
12. [ ] Replace type assertions with Schema validation
13. [ ] Fix DateTime example in model template
14. [ ] Split file-generator.ts into focused modules
15. [ ] Consolidate layer constants

### Phase 4: Polish (When Time Permits)
16. [ ] Replace spread operators with A.append
17. [ ] Add deterministic batch selection
18. [ ] Add stub exports to client/ui templates
19. [ ] Add missing JSDoc tags

---

## Test Cycle Validation

After fixes, validate with:

```bash
# 1. Rollback any existing test slice
rm -rf packages/comms/ packages/shared/domain/src/entity-ids/comms/ tsconfig.slices/comms.json

# 2. Run create-slice
bun run create-slice comms "Communications module"

# 3. Install dependencies
bun install

# 4. Type check
bun run check

# 5. Build
bun run build

# 6. Lint
bun run lint:fix

# 7. Verify zero errors
echo "All checks must pass with zero errors"
```

---

## Files Summary

### Main Source Files (6)
- `handler.ts` - 300 lines - Mixed concerns
- `index.ts` - 185 lines - Clean
- `file-generator.ts` - 1,301 lines - Needs split
- `config-updater.ts` - 600 lines - Good
- `ts-morph.ts` - 731 lines - Fragile
- `template.ts` - 391 lines - Mostly unused

### Supporting Files (4)
- `schemas.ts` - 219 lines - Clean
- `errors.ts` - 252 lines - Good
- `utils/index.ts` - 14 lines - Good

### Templates (~30 files)
- Most are unused dead code
- 2 critical templates missing
- Pattern inconsistencies with reference implementations

---

## Review Documents

1. [Effect Patterns Review](./effect-patterns-review.md)
2. [Architecture Review](./architecture-review.md)
3. [Type Safety Review](./type-safety-review.md)
4. [Templates Review](./templates-review.md)
5. [ts-morph Review](./ts-morph-review.md)
