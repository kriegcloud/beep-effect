# Architecture Review: Lexical Utils Effect Refactoring

## Executive Summary

**Review Date**: 2026-01-27
**Reviewer**: Architecture Pattern Enforcer Agent
**Scope**: apps/todox/src/app/lexical/utils/ refactoring to Effect patterns
**Overall Assessment**: **CONDITIONAL PASS** - Approach is sound but requires specific corrections

---

## 1. Import Conventions Compliance

**Requirement**: Follow `.claude/rules/effect-patterns.md` import conventions
- Namespace imports: `import * as Effect from "effect/Effect"`
- Single-letter aliases: `A`, `Str`, `O`, `P`, `S`
- No named imports from effect modules

### Analysis

**Current State Violations** (from codebase analysis):
```typescript
// VIOLATION - url.ts uses native methods
export function sanitizeUrl(url: string): string {
  const invalidProtocolRegex = /^(%20|\s)*(javascript|data|vbscript)/im;
  const ctrlCharactersRegex = /[^\x20-\x7E]/gmi;

  let urlStringToSanitize = url.replace(ctrlCharactersRegex, '').trim();
  // Native .replace(), .trim()
}
```

**Proposed Fix Pattern**:
```typescript
// REQUIRED - Effect utilities
import * as Str from "effect/String";
import * as Effect from "effect/Effect";

export const sanitizeUrl = (url: string): Effect.Effect<string, SanitizeUrlError> =>
  Effect.gen(function* () {
    const trimmed = Str.trim(url);
    // Use Str.replace() or custom Effect-based regex handling
  });
```

### Verdict: **CONDITIONAL PASS**

**Issues**:
1. Proposed import structure follows namespace pattern correctly
2. Current code uses native methods - must migrate to Effect utilities
3. Single-letter aliases correctly identified in spec

**Required Actions**:
- Replace all `string.method()` with `Str.method(string)`
- Replace all `array.method()` with `A.method(array)`
- Import namespaces as specified: `import * as A from "effect/Array"`

---

## 2. Schema Location Compliance

**Requirement**: Schemas in `apps/todox/src/app/lexical/schema/`, use `$TodoxId` annotations

### Analysis

**Existing Schema Structure**:
```typescript
// apps/todox/src/app/lexical/schema/schemas.ts
import { $TodoxId } from "@beep/identity";
import * as S from "effect/Schema";

export class DocumentHash extends S.Class<DocumentHash>($TodoxId("DocumentHash"))({
  hash: S.String,
}) {}
```

**Proposed New Schemas**:
- `url.schema.ts` - URL validation schemas
- `docHash.schema.ts` - Document hash schemas
- `position.schema.ts` - DOM position schemas
- `swipe.schema.ts` - Swipe gesture schemas

### Verdict: **PASS**

**Rationale**:
- Schema location follows existing pattern
- One schema file per domain (url, docHash, position, swipe)
- Barrel exports in index.ts maintained
- Uses `$TodoxId` for annotations (pattern established in schemas.ts)

---

## 3. Cross-Boundary Import Validation

**Requirement**: Utils should NOT import from other slices, ONLY: `effect/*`, `@lexical/*`, `@beep/identity`, local schema

### Analysis

**Permitted Import Sources**:
- `effect/*` - Core Effect modules
- `@lexical/*` - Lexical editor modules
- `@beep/identity` - Identity utilities (`$TodoxId`)
- `apps/todox/src/app/lexical/schema/*` - Local schemas
- DOM APIs (window, document) - Unavoidable for UI utilities
- React APIs - Necessary for UI components

**Forbidden Import Sources**:
- `@beep/iam-*` - IAM slice
- `@beep/documents-*` - Documents slice
- `@beep/shared-server` - Server layer
- `packages/*/domain` - Other domain layers
- Node.js fs module - Use Effect FileSystem service

### Current Import Audit

- **url.ts**: No cross-boundary violations
- **docSerialization.ts**: Uses Node.js `crypto` - must migrate to `@effect/platform`
- **focusUtils.ts**, **getDOMRangeRect.ts**, **getSelectedNode.ts**: DOM/Lexical APIs (acceptable)
- **swipe.ts**: No cross-boundary imports
- **emoji-list.ts**: No imports required

### Verdict: **CONDITIONAL PASS**

**Issues**:
1. No cross-slice imports detected
2. `docSerialization.ts` uses Node.js `crypto` - must migrate to `@effect/platform`
3. DOM/Lexical imports are appropriate for UI utilities
4. No imports from `@beep/*` packages (except identity)

**Required Actions**:
- Replace `import { createHash } from "node:crypto"` with Effect Platform Hash service

---

## 4. File Organization & Circular Dependencies

**Requirement**:
- One schema file per domain
- Barrel exports in index.ts
- No circular dependencies

### Analysis

**Proposed File Structure**:

```
apps/todox/src/app/lexical/
├── schema/
│   ├── index.ts                    # Barrel export
│   ├── schemas.ts                  # Existing schemas
│   ├── url.schema.ts               # URL validation
│   ├── docHash.schema.ts           # Document hashing
│   ├── position.schema.ts          # DOM positioning
│   └── swipe.schema.ts             # Swipe gestures
└── utils/
    ├── index.ts                    # Barrel export
    ├── url.ts                      # Imports: ../schema/url.schema
    └── ...
```

### Dependency Graph Analysis

```
schema/index.ts
  ↓
schema/*.schema.ts (no dependencies on utils/)
  ↓
utils/*.ts (imports from schema/ only)
  ↓
utils/index.ts (re-exports utils/)
```

**Circular Dependency Check**:
- Schemas do NOT import from utils
- Utils import from schemas (one-way dependency)
- Barrel exports do NOT create cycles
- No inter-utility dependencies detected

### Verdict: **PASS**

---

## 5. Effect Pattern Compliance

**Requirement**:
- No async/await in final code
- No native collections (Set, Map)
- No native string/array methods
- All errors as tagged errors (not throw)

### Summary Table

| File | Native Collections | Native Methods | Error Handling | Verdict |
|------|-------------------|----------------|----------------|---------|
| url.ts | None | .replace(), .trim() | No errors | **FAIL** |
| docSerialization.ts | None | Node crypto | No errors | **FAIL** |
| joinClasses.ts | .filter(), .join() | Array methods | N/A | **FAIL** |
| swipe.ts | None | Mutable state | Partial | **FAIL** |
| getDOMRangeRect.ts | Array[0] | DOM API OK | Returns null | **FAIL** |
| getSelectedNode.ts | None | Lexical API OK | N/A | **PASS** |
| focusUtils.ts | None | DOM API OK | N/A | **PASS** |
| emoji-list.ts | None | Static data | N/A | **PASS** |

### Verdict: **FAIL (Current) / CONDITIONAL PASS (Proposed)**

**Critical Issues**:
1. Multiple files use native string/array methods
2. `docSerialization.ts` uses Node.js crypto instead of Effect Platform
3. No tagged error classes for failure cases
4. Functions return `null` instead of `Option`
5. Mutable state in `swipe.ts` (should use `Ref` or `MutableHashSet`)

**Required Actions for PASS**:
- Migrate ALL string operations to `Str.*` from `effect/String`
- Migrate ALL array operations to `A.*` from `effect/Array`
- Replace Node.js crypto with `Hash` from `@effect/platform`
- Create tagged error classes for all failure modes
- Replace `null` returns with `Option` types
- Replace mutable state with `Ref` or `MutableHashSet`

---

## 6. Testing Strategy Validation

**Requirement**: Use `@beep/testkit` for all Effect-based tests

### Proposed Test Structure

```typescript
// REQUIRED pattern from @beep/testkit
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("sanitizeUrl removes javascript protocol", () =>
  Effect.gen(function* () {
    const result = yield* sanitizeUrl("javascript:alert(1)");
    strictEqual(result, "");
  })
);
```

### Verdict: **PASS**

---

## Compliance Summary

| Check | Status | Notes |
|-------|--------|-------|
| 1. Import Conventions | **CONDITIONAL PASS** | Proposed structure correct, current code needs migration |
| 2. Schema Location | **PASS** | Follows existing patterns exactly |
| 3. Cross-Boundary Imports | **CONDITIONAL PASS** | Must migrate Node.js crypto to Effect Platform |
| 4. File Organization | **PASS** | Clean structure, no circular dependencies |
| 5. Effect Pattern Compliance | **FAIL (current)** / **CONDITIONAL PASS (proposed)** | Multiple native method violations |
| 6. Testing Strategy | **PASS** | Follows @beep/testkit patterns |

**Overall Verdict**: **CONDITIONAL PASS**

The proposed refactoring approach is architecturally sound and follows repository patterns. However, the current code has significant violations that MUST be addressed during migration.

**Approval Conditions**:
1. Complete migration of native methods to Effect utilities
2. Replace Node.js crypto with Effect Platform Hash service
3. Add tagged error classes for all failure modes
4. Implement comprehensive test coverage using @beep/testkit

---

**Review Completed**: 2026-01-27
**Signed**: Architecture Pattern Enforcer Agent
