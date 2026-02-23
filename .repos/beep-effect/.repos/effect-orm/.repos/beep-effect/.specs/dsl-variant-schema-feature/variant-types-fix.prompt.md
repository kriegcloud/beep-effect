---
name: variant-types-fix
version: 2
created: 2025-12-27T00:00:00Z
iterations: 1
---

# DSL.Model Variant Types Fix - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, an Effect-first TypeScript codebase. The `@beep/schema` package contains a DSL for SQL model definitions that was recently extended to support VariantSchema patterns from `@effect/sql/Model`.

**Current State**:
- The DSL implementation is **functionally complete** - all 59 runtime tests pass
- The DSL supports `M.Generated`, `M.Sensitive`, `M.GeneratedByApp`, `M.FieldOption` from `@effect/sql/Model`
- Variant accessors (`.select`, `.insert`, `.update`, `.json`, `.jsonCreate`, `.jsonUpdate`) exist and work at runtime

**Problem**: The **type-level inference for variant accessors is broken**. TypeScript shows generic indexed types instead of specific field structures.

### Before/After Comparison

```typescript
class User extends Model<User>("User")({
  id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
  name: Field(S.String, { column: { type: "string" } }),
}) {}

// ❌ BEFORE (current broken behavior):
typeof User.select.fields
// ^? { readonly [x: string]: S.Struct.Field; readonly [x: number]: S.Struct.Field; readonly [x: symbol]: S.Struct.Field }

// ✅ AFTER (expected fixed behavior):
typeof User.select.fields
// ^? { readonly id: typeof S.String; readonly name: typeof S.String }

typeof User.insert.fields
// ^? { readonly name: typeof S.String }  // 'id' excluded (M.Generated)
```

**Root Cause**: The DSL type definitions are missing **tuple wrapping** to prevent distributive conditional types. The working `VariantSchema.ExtractFields` implementation uses `[T] extends [U]` syntax consistently, but the DSL's `ShouldIncludeField` and `ExtractFieldSchema` use bare `T extends U` conditionals.

## Objective

Fix the type-level inference for DSL.Model variant accessors with these measurable outcomes:

1. `User.select.fields` shows `{ id: ..., name: ... }` (specific field types, not indexed)
2. `User.insert.fields` shows `{ name: ... }` (excludes Generated field `id`)
3. `User.json.fields` excludes Sensitive fields
4. All 59 existing tests continue to pass
5. Type check passes (`bun run check --filter=@beep/schema`)

## Role

You are a **TypeScript Type-Level Expert** specializing in:
- Distributive vs non-distributive conditional types
- Mapped types with key filtering (`as` clause)
- Effect Schema type patterns
- Generic type parameter preservation

## Constraints

### Effect-First Patterns (MANDATORY)

```typescript
// REQUIRED imports
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
```

**FORBIDDEN**:
- Native Array methods: `.map()`, `.filter()` → Use `A.map()`, `A.filter()` with `F.pipe()`
- Native Object methods: `Object.keys()` → Use `Struct.keys()` with `F.pipe()`
- `any`, `@ts-ignore`, or unchecked type casts

### Type-Level Patterns (CRITICAL)

**Pattern 1: Tuple Wrapping for Non-Distributive Conditionals**
```typescript
// ❌ BROKEN - distributes over unions
F extends DSLVariantField<infer Config, ColumnDef> ? ... : ...

// ✅ FIXED - prevents distribution
[F] extends [DSLVariantField<infer Config, ColumnDef>] ? ... : ...
```

**Pattern 2: Safe Config Access with Guard**
```typescript
// ❌ BROKEN - Config[V] may be undefined if V not in keyof Config
[Config[V]] extends [S.Schema.All] ? Config[V] : never

// ✅ FIXED - guard V extends keyof Config BEFORE accessing Config[V]
V extends keyof Config
  ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]
    ? Config[V]
    : never
  : never
```

### Schema Layer Purity

- No I/O, logging, network, or filesystem operations
- Pure runtime values only
- Exports flow through `src/index.ts`

## Resources

### Files to Modify

1. **`packages/common/schema/src/integrations/sql/dsl/types.ts`** (PRIMARY)
   - Line ~135: `ShouldIncludeField` - add tuple wrapping
   - Line ~146: `ExtractFieldSchema` - add tuple wrapping AND safe config guard
   - Line ~123: `ExtractVariantFields` - will work correctly after helper fixes

### How the Types Relate

```
ExtractVariantFields<V, Fields>
    │
    ├── Key Filter (as clause): ShouldIncludeField<V, Fields[K]>
    │   └── Returns true/false to include/exclude field key
    │
    └── Value Type: ExtractFieldSchema<V, Fields[K]>
        └── Returns the schema type for the field in variant V
```

Both helpers need tuple wrapping. `ShouldIncludeField` gates which keys appear; `ExtractFieldSchema` determines the value types.

### Reference Pattern (from VariantSchema.ts)

The core tuple-wrapping pattern (simplified from `ExtractFields`):
```typescript
// Key filter: [F] extends [Field<Config>] prevents distribution
[K in keyof Fields as [Fields[K]] extends [Field<infer Config>]
  ? V extends keyof Config ? K : never  // Include if variant exists
  : K]                                   // Non-Field: always include

// Value extraction: Guard V extends keyof Config BEFORE Config[V]
[Fields[K]] extends [Field<infer Config>]
  ? V extends keyof Config                              // Guard first
    ? [Config[V]] extends [S.Schema.All] ? Config[V] : never  // Then access
    : never
  : Fields[K]  // Non-Field: pass through
```

### Context Files

- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model return type
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - DSLField, DSLVariantField types
- `packages/common/schema/src/core/VariantSchema.ts` - working reference (lines 154-168)
- `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts` - runtime tests

## Output Specification

### Deliverable 1: Fixed `ShouldIncludeField` Type

**Current** (broken):
```typescript
export type ShouldIncludeField<V extends string, F> = F extends DSLVariantField<infer Config, ColumnDef>
  ? V extends keyof Config
    ? true
    : false
  : true;
```

**Required** (add tuple wrapping):
```typescript
export type ShouldIncludeField<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config
      ? true
      : false
    : true;
```

**Change**: Wrap `F` in tuple on both sides of `extends`.

### Deliverable 2: Fixed `ExtractFieldSchema` Type

**Current** (broken):
```typescript
export type ExtractFieldSchema<V extends string, F> = F extends DSLVariantField<infer Config, ColumnDef>
  ? V extends keyof Config
    ? Config[V]
    : never
  : F extends DSLField<infer A, infer I, infer R, ColumnDef>
    ? S.Schema<A, I, R>
    : F extends S.Schema.All
      ? F
      : F extends S.PropertySignature.All
        ? F
        : never;
```

**Required** (tuple wrapping + safe config access):
```typescript
export type ExtractFieldSchema<V extends string, F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? V extends keyof Config  // Guard FIRST
      ? [Config[V]] extends [S.Schema.All | S.PropertySignature.All]  // THEN safe access
        ? Config[V]
        : never
      : never
    : [F] extends [DSLField<infer A, infer I, infer R, ColumnDef>]
      ? S.Schema<A, I, R>
      : [F] extends [S.Schema.All]
        ? F
        : [F] extends [S.PropertySignature.All]
          ? F
          : never;
```

**Changes**:
1. Wrap all `F extends ...` checks in tuples: `[F] extends [...]`
2. Add `V extends keyof Config` guard BEFORE accessing `Config[V]`
3. Wrap `Config[V]` access in tuple for safe existence check

### Deliverable 3: Verify Type Inference

After applying fixes, create a type-level test:

```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { Field, Model } from "../src/integrations/sql/dsl";

// Test model
class TestUser extends Model<TestUser>("TestUser")({
  id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
  name: Field(S.String, { column: { type: "string" } }),
  secret: Field(M.Sensitive(S.String), { column: { type: "string" } }),
}) {}

// Type assertions - these should compile without error
type AssertSelectHasId = typeof TestUser.select.fields extends { readonly id: unknown } ? true : never;
type AssertSelectHasName = typeof TestUser.select.fields extends { readonly name: unknown } ? true : never;

type AssertInsertNoId = "id" extends keyof typeof TestUser.insert.fields ? never : true;
type AssertInsertHasName = typeof TestUser.insert.fields extends { readonly name: unknown } ? true : never;

type AssertJsonNoSecret = "secret" extends keyof typeof TestUser.json.fields ? never : true;

// Verify these resolve to `true`, not `never`
const _selectHasId: AssertSelectHasId = true;
const _selectHasName: AssertSelectHasName = true;
const _insertNoId: AssertInsertNoId = true;
const _insertHasName: AssertInsertHasName = true;
const _jsonNoSecret: AssertJsonNoSecret = true;
```

## Examples

### Example 1: Why Tuple Wrapping Matters for DSL Fields

In the DSL context, field types may be unions when TypeScript infers intermediate types:

```typescript
// Without tuple wrapping, TypeScript distributes the conditional
type Check<F> = F extends DSLVariantField<infer C, any> ? C : "not-variant";

// If F is inferred as a union (even temporarily), distribution happens:
type Result = Check<DSLVariantField<{select: S.String}> | DSLField<string, string, never, ColumnDef>>;
//   ^? {select: S.String} | "not-variant"  // Both branches evaluated!

// With tuple wrapping, the union is treated as a single unit:
type CheckFixed<F> = [F] extends [DSLVariantField<infer C, any>] ? C : "not-variant";
type ResultFixed = CheckFixed<DSLVariantField<{select: S.String}> | DSLField<...>>;
//   ^? "not-variant"  // Correctly rejects the union
```

### Example 2: Field Variant Behavior Table

| Field Type | select | insert | update | json | jsonCreate | jsonUpdate |
|------------|--------|--------|--------|------|------------|------------|
| `M.Generated(S.String)` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `M.Sensitive(S.String)` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `M.GeneratedByApp(S.String)` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `Field(S.String, {...})` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Example 3: The Safe Config Access Pattern

```typescript
// Config type from M.Generated:
type GeneratedConfig = { select: S.String; update: S.String; json: S.String }
// Note: NO 'insert' key!

// Accessing Config["insert"]:
type InsertSchema = GeneratedConfig["insert"];
//   ^? undefined (key doesn't exist)

// Safe pattern guards before access:
type SafeAccess<V extends string, Config> =
  V extends keyof Config                                    // Step 1: Guard
    ? [Config[V]] extends [S.Schema.All] ? Config[V] : never  // Step 2: Validate & access
    : never;                                                 // Step 3: Reject if no key

type Test1 = SafeAccess<"select", GeneratedConfig>;  // S.String ✅
type Test2 = SafeAccess<"insert", GeneratedConfig>;  // never ✅ (correctly excluded)
```

## Common Pitfalls

1. **Forgetting tuple wrapping on BOTH sides**: Must be `[F] extends [Pattern]`, not `[F] extends Pattern`

2. **Accessing Config[V] without guard**: TypeScript allows `Config[V]` even when `V` is not in `keyof Config`, returning `undefined`. Always guard with `V extends keyof Config` first.

3. **Inconsistent wrapping**: If you wrap some conditionals but not others, the unwrapped ones will still distribute. Wrap ALL field type checks.

4. **Testing only runtime behavior**: The 59 tests pass because runtime works. Add type-level assertions to catch inference regressions.

## Verification Checklist

### Type Inference
- [ ] `User.select.fields` shows specific field names (not `[x: string]`)
- [ ] `User.insert.fields` excludes Generated fields (`id` not present)
- [ ] `User.json.fields` excludes Sensitive fields (`secret` not present)
- [ ] Field types are preserved (not widened to `S.Struct.Field`)
- [ ] Hovering over `.fields` in IDE shows actual field structure

### Backward Compatibility
- [ ] All 59 existing tests pass: `cd packages/common/schema && bun test test/integrations/sql/dsl/`
- [ ] Type check passes: `bun run check --filter=@beep/schema`
- [ ] Runtime behavior unchanged (tests validate this)

### Pattern Compliance
- [ ] All conditional types use tuple wrapping: `[T] extends [U]`
- [ ] Config access guarded: `V extends keyof Config` before `Config[V]`
- [ ] No bare `T extends U` in type-level field detection

## Commands

```bash
# Type check - should complete with no errors
bun run check --filter=@beep/schema

# Run all DSL tests - all 59 should pass
cd packages/common/schema && bun test test/integrations/sql/dsl/

# Verify specific test file
cd packages/common/schema && bun test test/integrations/sql/dsl/variant-integration.test.ts

# Interactive type inspection (hover over types in editor)
# Open packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts
# Hover over User.select.fields to verify type inference
```

---

## Metadata

### Research Sources

**Files Explored**:
- `packages/common/schema/src/integrations/sql/dsl/types.ts` - broken type definitions
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Model return type
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Field types
- `packages/common/schema/src/core/VariantSchema.ts` - working reference
- `node_modules/@effect/sql/src/Model.ts` - canonical implementation
- `node_modules/effect/src/Schema.ts` - Struct.Fields definition

**AGENTS.md Consulted**:
- Root `AGENTS.md` - Effect-first patterns, forbidden native methods
- `packages/common/schema/AGENTS.md` - schema purity, BS namespace
- `packages/common/types/AGENTS.md` - zero-runtime types, compile-time idioms

**Documentation Referenced**:
- TypeScript Handbook: Conditional Types (distributive behavior)
- Effect Schema: Struct.Fields type definition

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 7 issues (2 HIGH, 3 MEDIUM, 2 LOW) | Fixed Deliverable 2 to include `V extends keyof Config` guard; simplified reference pattern; added Before/After comparison; added type relationship diagram; added Common Pitfalls section; improved Example 1 with DSL-specific context; added Safe Config Access example |
