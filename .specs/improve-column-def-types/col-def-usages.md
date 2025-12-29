# ColumnDef Usage Analysis & Migration Plan - Phase 2 Synthesis

## Executive Summary

This document catalogs **all ColumnDef usages** across the SQL DSL module and provides a concrete migration plan to replace the legacy `ColumnDef` interface with `ColumnDefSchema.Generic`.

### Usage Statistics

| File | ColumnDef Refs | ExactColumnDef Refs | DerivedColumnDefFromSchema Refs | Complexity |
|------|----------------|---------------------|--------------------------------|------------|
| types.ts | 79 | 12 | 5 | High |
| Field.ts | 6 | 5 | 3 | Complex |
| Model.ts | 8 | 0 | 0 | Medium |
| combinators.ts | 15 | 1 | 0 | Medium |
| adapters/drizzle.ts | 12 | 0 | 0 | Medium |
| validate.ts | 6 | 0 | 0 | Simple |
| **Total** | **126** | **18** | **8** | - |

---

## Critical Finding: ColumnDefSchema.Generic Already Exists

The replacement types **already exist** in types.ts. The migration is about updating *usages*, not creating new types.

```typescript
// Already defined in types.ts (lines 785-834)
export declare namespace ColumnDefSchema {
  /**
   * GenericMap provides indexed access by column type.
   * Each member has its NATURAL ARITY - no phantom type parameters.
   */
  export type GenericMap<
    PrimaryKey extends boolean,
    Unique extends boolean,
    AutoIncrement extends boolean,
  > = {
    readonly string: StringColumnDefSchema.Generic<PrimaryKey, Unique>;      // 2 params
    readonly number: NumberColumnDefSchema.Generic<PrimaryKey, Unique>;      // 2 params
    readonly integer: IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>; // 3 params
    readonly boolean: BooleanColumnDefSchema.Generic<PrimaryKey, Unique>;    // 2 params
    readonly datetime: DatetimeColumnDefSchema.Generic<PrimaryKey, Unique>;  // 2 params
    readonly uuid: UuidColumnDefSchema.Generic<PrimaryKey, Unique>;          // 2 params
    readonly json: JsonColumnDefSchema.Generic<PrimaryKey, Unique>;          // 2 params
    readonly bigint: BigintColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>;   // 3 params
  };

  /**
   * Generic type with T (column type) as FIRST parameter.
   * Uses indexed access on GenericMap for precise type narrowing.
   */
  export type Generic<
    T extends ColumnType.Type = ColumnType.Type,
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    AutoIncrement extends boolean = boolean,
  > = GenericMap<PrimaryKey, Unique, AutoIncrement>[T];
}
```

**Key Properties**:
- **T is FIRST parameter** - enables `Generic<"integer", true>` pattern
- **No phantom types** - `StringColumnDefSchema.Generic<PK, U>` has 2 params, not 3
- **Indexed access** - `GenericMap[T]` provides precise types when T is literal
- **INV-SQL-AI-001 enforced** - only integer/bigint have `autoIncrement` property

---

## Migration Strategy

### Decision: Incremental vs. Big Bang

**Recommendation: Incremental Migration with Backward Compatibility**

1. Keep `ColumnDef` interface temporarily as an alias
2. Update critical files one at a time
3. Run type checks after each file
4. Remove `ColumnDef` interface only after all usages are migrated

### Migration Order (Dependency-Driven)

```
Phase 3.1: types.ts (Foundation)
    ↓
Phase 3.2: Field.ts (Updates ExactColumnDef, DerivedColumnDefFromSchema)
    ↓
Phase 3.3: Model.ts (Updates ExtractColumnsType, ExtractPrimaryKeys)
    ↓
Phase 3.4: adapters/drizzle.ts (Updates type mappers)
    ↓
Phase 3.5: combinators.ts (Updates MergeColumnDef, helper types)
    ↓
Phase 3.6: validate.ts (Updates parameter types)
    ↓
Phase 3.7: Test files (Update type assertions)
```

---

## File-by-File Migration Plan

### 1. types.ts (Foundation)

**Current State**: Defines both `ColumnDef` (legacy) and `ColumnDefSchema.Generic` (replacement)

**Migration Actions**:

| Line | Current | Action | New |
|------|---------|--------|-----|
| 832-843 | `ColumnDef` interface | Deprecate, then remove | Use existing `ColumnDefSchema.Generic` |
| 849-855 | `ExactColumnDef<C>` | Remove | Inline extraction pattern |
| 444-450 | `DerivedColumnDefFromSchema<S,C>` | Refactor | Use `ColumnDefSchema.Generic` with derivation |
| 873-875 | `DSLField<A,I,R,C extends ColumnDef>` | Update constraint | `C extends ColumnDefSchema.Generic` |
| 892-896 | `DSLVariantField<A,C extends ColumnDef>` | Update constraint | `C extends ColumnDefSchema.Generic` |

**Step-by-Step**:
1. Add `@deprecated` JSDoc to `ColumnDef` interface
2. Update `DSLField` and `DSLVariantField` to use `ColumnDefSchema.Generic`
3. Create helper type for extracting Generic from partial config:
```typescript
type ExtractGenericFromConfig<C extends Partial<ColumnDefSchema.Generic>> =
  ColumnDefSchema.Generic<
    C extends { primaryKey: infer PK extends boolean } ? PK : false,
    C extends { unique: infer U extends boolean } ? U : false,
    C extends { autoIncrement: infer AI extends boolean } ? AI : false
  >;
```
4. Remove `ExactColumnDef` (replaced by inline extraction)
5. Update `DerivedColumnDefFromSchema` to return `ColumnDefSchema.Generic`

---

### 2. Field.ts (Critical)

**Current State**: Uses `ExactColumnDef<C>` and `DerivedColumnDefFromSchema<Schema, C>` extensively

**Migration Actions**:

| Line | Current Pattern | New Pattern |
|------|-----------------|-------------|
| 110 | `ExactColumnDef<C>` | `ExtractGenericFromConfig<C>` |
| 116 | `DerivedColumnDefFromSchema<Schema, C>` | `ColumnDefSchema.Generic<...extracted params...>` |
| 132, 148 | Same patterns in variant configurators | Same replacements |
| 265 | `as ExactColumnDef<C>` cast | `as ExtractGenericFromConfig<C>` |
| 299, 313 | Return type casts | Updated casts |

**Key Insight**: Both branches (explicit type vs derived type) can use `ColumnDefSchema.Generic<PK, U, AI>`:
- Explicit type: The `type` field narrows the union correctly
- Derived type: The union remains polymorphic, narrowed at use sites

---

### 3. Model.ts (Critical)

**Current State**: Uses `ColumnDef` in mapped types and runtime parameters

**Migration Actions**:

| Line | Current | New |
|------|---------|-----|
| 50 | `ColumnDef<"string", false, false, false>` fallback | Keep as-is (still valid) |
| 90-95 | `defaultColumnDef: ColumnDef<...>` | `defaultColumnDef: ColumnDefSchema.Generic<false, false, false>` |
| 163 | `columns: Record<string, ColumnDef>` | `columns: Record<string, ColumnDefSchema.Generic>` |
| ExtractColumnsType | Infers `C` from `DSLField<..., C>` | No change needed (C is ColumnDefSchema.Generic after Field.ts update) |
| ExtractPrimaryKeys | Checks `C extends { primaryKey: true }` | No change needed (pattern still works) |

**Note**: Most Model.ts changes are automatic once DSLField/DSLVariantField constraints are updated.

---

### 4. adapters/drizzle.ts (Critical)

**Current State**: Type mappers use `Col extends ColumnDef` constraints

**Migration Actions**:

| Line | Current | New |
|------|---------|-----|
| 76 | `ApplyNotNull<T, Col extends ColumnDef, E>` | `Col extends ColumnDefSchema.Generic` |
| 87 | `ApplyPrimaryKey<T, Col extends ColumnDef>` | `Col extends ColumnDefSchema.Generic` |
| 94 | `ApplyHasDefault<T, Col extends ColumnDef>` | `Col extends ColumnDefSchema.Generic` |
| 103 | `ApplyAutoincrement<T, Col extends ColumnDef>` | `Col extends ColumnDefSchema.Generic` |
| 117 | `DrizzleTypedBuilderFor<..., Col extends ColumnDef, ...>` | `Col extends ColumnDefSchema.Generic` |
| 139 | `DrizzleTypedBuildersFor<Columns extends Record<string, ColumnDef>, ...>` | `Columns extends Record<string, ColumnDefSchema.Generic>` |
| 217 | `columnBuilder(..., def: ColumnDef, ...)` | `def: ColumnDefSchema.Generic` |
| 275 | `toDrizzle<..., Columns extends Record<string, ColumnDef>, ...>` | `Columns extends Record<string, ColumnDefSchema.Generic>` |

**Runtime Property Access**: The property access patterns (`def.primaryKey`, `def.unique`, etc.) remain valid because `ColumnDefSchema.Generic` has the same properties.

---

### 5. combinators.ts (Medium)

**Current State**: Uses `ColumnDef` in type utilities and combinator signatures

**Migration Actions**:

| Line | Current | New |
|------|---------|-----|
| 53-59 | `DerivedDefaultColumnDef<Schema>` | Update return type to `ColumnDefSchema.Generic<false, false, false>` |
| 69 | `ResolveColumnDef<Schema, C>` | Update to use `ColumnDefSchema.Generic` |
| 86-104 | `MergeColumnDef<Existing, New>` | Update to return `ColumnDefSchema.Generic<PK, U, AI>` |
| 150-175 | `attachColumnDef` return type | `DSLField<A, I, R, ColumnDefSchema.Generic>` |
| All combinators | `C extends ColumnDef = never` | `C extends ColumnDefSchema.Generic = never` |

---

### 6. validate.ts (Simple)

**Current State**: Uses `ColumnDef` as parameter types

**Migration Actions**:

| Line | Current | New |
|------|---------|-----|
| 37 | `import type { ColumnDef }` | `import type { ColumnDefSchema }` |
| 92 | `def: ColumnDef` | `def: ColumnDefSchema.Generic` |
| 297 | `columns: Record<string, ColumnDef>` | `columns: Record<string, ColumnDefSchema.Generic>` |
| 351 | `def: ColumnDef` | `def: ColumnDefSchema.Generic` |
| 389 | `columns: Record<string, ColumnDef>` | `columns: Record<string, ColumnDefSchema.Generic>` |
| 453 | `def: ColumnDef` | `def: ColumnDefSchema.Generic` |
| 473 | `columns: Record<string, ColumnDef>` | `columns: Record<string, ColumnDefSchema.Generic>` |

---

## Key Type Patterns to Preserve

### 1. Natural Arity (No Phantom Type Parameters)

Each member schema has its NATURAL arity - no phantom parameters:
```typescript
// StringColumnDefSchema.Generic - 2 parameters (no AutoIncrement)
export interface Generic<
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
> {
  readonly type: Type["type"];  // "string"
  readonly primaryKey?: PrimaryKey | undefined;
  readonly unique?: Unique | undefined;
  readonly defaultValue?: Type["defaultValue"];
  // NO autoIncrement property - enforces INV-SQL-AI-001
}

// IntegerColumnDefSchema.Generic - 3 parameters (has AutoIncrement)
export interface Generic<
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> {
  readonly type: Type["type"];  // "integer"
  readonly primaryKey?: PrimaryKey | undefined;
  readonly unique?: Unique | undefined;
  readonly autoIncrement?: AutoIncrement | undefined;
  readonly defaultValue?: Type["defaultValue"];
}
```

**GenericMap handles arity differences** by passing AutoIncrement only to integer/bigint.

### 2. Type["property"] Pattern for Drift Prevention

All Generic interfaces use `Type["property"]` to stay in sync:
```typescript
readonly type: Type["type"];  // Always "string" for StringColumnDefSchema
readonly primaryKey?: PrimaryKey | undefined;
readonly defaultValue?: Type["defaultValue"];
```

### 3. `| undefined` for exactOptionalPropertyTypes

All optional properties include `| undefined`:
```typescript
readonly primaryKey?: PrimaryKey | undefined;
readonly unique?: Unique | undefined;
readonly autoIncrement?: AutoIncrement | undefined;  // Only on integer/bigint
```

---

## Validation Checkpoints

After each file migration, run:
```bash
bunx turbo run check --filter=@beep/schema
```

After all migrations, run:
```bash
# Verify no ColumnDef references remain
grep -r "ColumnDef" packages/common/schema/src/integrations/sql/dsl/ | grep -v "ColumnDefSchema"

# Run full test suite
bun run test --filter=@beep/schema
```

---

## Risk Assessment

| File | Risk Level | Reason |
|------|------------|--------|
| types.ts | High | Foundation - changes cascade |
| Field.ts | High | Complex conditional types |
| Model.ts | Medium | Mapped types depend on DSLField |
| adapters/drizzle.ts | Medium | Type mappers are intricate |
| combinators.ts | Low | Mostly straightforward updates |
| validate.ts | Low | Parameter type changes only |

---

## Rollback Plan

If migration becomes intractable:
1. `git checkout -- packages/common/schema/src/integrations/sql/dsl/`
2. Preserve this analysis for future attempts
3. Document specific blockers in `refactoring-summary.md`

---

## Success Criteria

1. **Zero grep matches**: `grep -r "ColumnDef" ... | grep -v "ColumnDefSchema"` returns empty
2. **Type checks pass**: `bunx turbo run check --filter=@beep/schema` succeeds
3. **Tests pass**: `bun run test --filter=@beep/schema` succeeds
4. **INV-SQL-AI-001 preserved**: autoIncrement only on integer/bigint at type level
5. **Type narrowing works**: `ColumnDefSchema.Generic` correctly narrows based on `type` field

---

*Phase 2 Complete - Ready for Phase 3: Refactoring Execution*
