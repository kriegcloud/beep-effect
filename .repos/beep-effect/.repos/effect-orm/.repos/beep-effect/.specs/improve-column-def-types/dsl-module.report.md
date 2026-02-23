# DSL Module Exploration Report - Phase 1 Synthesis

## Executive Summary

The SQL DSL module in `packages/common/schema/src/integrations/sql/dsl/` comprises **13 source files (~3,800 lines)** and **8 test files (~209 ColumnDef references)**. The module bridges Effect Schema abstractions with SQL column definitions, providing type-safe Model/Field factories with Drizzle ORM integration.

**Primary Refactoring Target**: Remove the legacy `ColumnDef` interface in favor of `ColumnDefSchema.Generic` mapped type pattern.

### Key Findings

1. **ColumnDef is deeply embedded**: Used in 10+ files as type constraints, runtime metadata, and validation parameters
2. **ColumnDefSchema.Generic already exists**: Uses mapped type pattern with GenericMap for indexed access
3. **Nullability is NOT in ColumnDef**: Derived from Effect Schema AST at runtime (design decision already implemented)
4. **Critical migration files**: types.ts → Field.ts → Model.ts → adapters/drizzle.ts (dependency order)
5. **Type-level vs runtime duality**: Both derivation systems must stay synchronized
6. **Test impact**: 209 total ColumnDef/ColumnMetaSymbol references across 8 test files

---

## Module Architecture

```
types.ts (1,170 lines) ← Foundation: ColumnDef, ColumnDefSchema, DSLField, DSLVariantField
    ↓
Field.ts (315 lines) ← Field() factory with 3 overloads
Model.ts (493 lines) ← Model() factory, ExtractColumnsType, ExtractPrimaryKeys
    ↓
combinators.ts (445 lines) ← Pipe-friendly combinators (uuid(), primaryKey(), etc.)
validate.ts (486 lines) ← Runtime invariant validators
    ↓
derive-column-type.ts (447 lines) ← AST → ColumnType runtime derivation
nullability.ts (115 lines) ← AST → nullable boolean derivation
    ↓
adapters/drizzle.ts (311 lines) ← toDrizzle() conversion with type mappers
adapters/drizzle-to-effect-schema.ts (269 lines) ← Reverse adapter
    ↓
errors.ts (247 lines) ← DSLValidationError union
literals.ts (67 lines) ← ColumnType, ModelVariant enums
index.ts (16 lines) ← Public exports
```

---

## File-by-File Summary

### types.ts (Foundation - CRITICAL)

**Purpose**: Core type definitions for the entire DSL

**ColumnDef Interface** (lines 832-856):
```typescript
export interface ColumnDef<
  ColType extends ColumnType.Type = ColumnType.Type,
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> {
  readonly type: ColType;
  readonly primaryKey?: PrimaryKey;
  readonly unique?: Unique;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AutoIncrement;
}
```

**ColumnDefSchema (Replacement)**: Discriminated union of 8 member schemas, each with `.Generic` interface:
- StringColumnDefSchema, NumberColumnDefSchema, IntegerColumnDefSchema
- BooleanColumnDefSchema, DatetimeColumnDefSchema, UuidColumnDefSchema
- JsonColumnDefSchema, BigintColumnDefSchema

**Key Types to Migrate**:
| Type | Purpose | Complexity |
|------|---------|------------|
| `ColumnDef<T,PK,U,AI>` | Base interface | Remove entirely |
| `ExactColumnDef<C>` | Structural inference from partial | Replace with ColumnDefSchema.Generic |
| `DerivedColumnDefFromSchema<S,C>` | Schema-driven derivation | Refactor to use Generic interfaces |
| `DSLField<A,I,R,C>` | Field with column metadata | Update C constraint |
| `DSLVariantField<A,C>` | Variant field with metadata | Update C constraint |

---

### Field.ts (CRITICAL)

**Purpose**: Field() factory creating DSLField and DSLVariantField instances

**3 Overloads**:
1. Plain Schema → `SchemaConfiguratorWithSchema<Schema>`
2. Local VariantSchema.Field → `LocalVariantConfiguratorWithSchema<VC>`
3. Experimental VariantSchema.Field → `ExperimentalVariantConfiguratorWithSchema<VC>`

**ColumnDef Usages**:
| Location | Pattern | Replacement Strategy |
|----------|---------|---------------------|
| Line 105 | `Partial<ColumnDef>` constraint | `Partial<ColumnDefSchema.Generic>` |
| Line 265 | `as ExactColumnDef<C>` cast | Use member-specific Generic |
| Line 299, 313 | Return types with ColumnDef | Use ColumnDefSchema.Generic |

**Key Challenges**:
- `DerivedColumnDefFromSchema` uses complex conditional types
- Schema class identity detection feeds type derivation
- Variant field prototype chain preservation

---

### Model.ts (CRITICAL)

**Purpose**: Model() factory creating S.Class with static metadata

**ColumnDef Usages**:
| Type/Function | Usage | Complexity |
|---------------|-------|------------|
| `ExtractColumnsType<Fields>` | Maps Fields → Record<K, ColumnDef> | High - mapped type |
| `ExtractPrimaryKeys<Fields>` | Filters primaryKey === true | High - conditional mapping |
| `defaultColumnDef` constant | Fallback ColumnDef | Low - replace value |
| `getColumnDef()` helper | Runtime extraction | Medium |
| `validateModelInvariants()` | Accepts Record<string, ColumnDef> | Medium |

**Migration Notes**:
- ExtractColumnsType extracts `C` from `DSLField<A,I,R,C>` and `DSLVariantField<A,C>`
- Must preserve inference through mapped types
- Model.columns static property exposes ColumnDef records

---

### adapters/drizzle.ts (CRITICAL)

**Purpose**: Convert DSL Models to Drizzle PgTables

**Type Mappers**:
| Mapper | Reads From ColumnDef | Purpose |
|--------|---------------------|---------|
| `ApplyNotNull<T,Col,E>` | primaryKey, autoIncrement | NOT NULL constraint |
| `ApplyPrimaryKey<T,Col>` | primaryKey | PRIMARY KEY constraint |
| `ApplyHasDefault<T,Col>` | autoIncrement, defaultValue | DEFAULT clause |
| `ApplyAutoincrement<T,Col>` | autoIncrement | SERIAL/BIGSERIAL |
| `DrizzleTypedBuilderFor` | Composes all modifiers | Full column builder |

**Key Pattern**: Nullability is derived from Effect Schema AST, NOT from ColumnDef

**Migration Strategy**: Update type constraints from `ColumnDef` to `ColumnDefSchema.Generic`

---

### combinators.ts

**Purpose**: Pipe-friendly DSL operators

**ColumnDef-Related Types**:
- `DerivedDefaultColumnDef<Schema>` - Default ColumnDef from schema derivation
- `ResolveColumnDef<Schema, C>` - Conditional default resolution
- `MergeColumnDef<Existing, New>` - Combinator composition

**Pattern**: Combinators return `DSLField<A,I,R,MergeColumnDef<...>>` preserving type precision

---

### validate.ts

**Purpose**: Runtime invariant validation

**ColumnDef Parameter Usages**:
- `validateAutoIncrementType(def: ColumnDef)` - INV-SQL-AI-001
- `validateSingleAutoIncrement(columns: Record<string, ColumnDef>)` - INV-MODEL-AI-001
- `validateField(name, def: ColumnDef, nullable)` - Composite validation
- `validateModel(id, columns: Record<string, ColumnDef>)` - Model validation

**Note**: Validation reads ColumnDef properties at runtime; type constraint change is straightforward

---

### derive-column-type.ts + nullability.ts

**Purpose**: Runtime AST analysis

**ColumnDef Relationship**:
- `deriveColumnType(ast)` returns `ColumnType.Type` (feeds into ColumnDef.type)
- `isNullable(ast)` returns `boolean` (NOT stored in ColumnDef - derived at use site)

**No Direct ColumnDef Usage**: These modules operate on AST and return primitive values

---

### errors.ts + literals.ts

**Purpose**: Error definitions and string literal enums

**ColumnDef Relationship**:
- `ColumnType` enum defines valid values for `ColumnDef.type`
- Errors reference ColumnDef constraints (AutoIncrementTypeError uses ColumnDef.type)

**Migration Impact**: Minimal - enum and errors don't need changes

---

### index.ts

**Purpose**: Public API barrel export

**ColumnDef Exports**:
- Re-exports from types.ts (ColumnDef, DSLField, DSLVariantField, etc.)
- Re-exports from Field.ts, Model.ts, combinators.ts

**Migration Impact**: Ensure ColumnDefSchema.Generic is exported after migration

---

## Test Coverage Analysis

| Test File | Lines | ColumnDef Coverage |
|-----------|-------|-------------------|
| poc.test.ts | 321 | ColumnMetaSymbol, Model.columns |
| combinators.test.ts | 621 | Combinator chaining, type preservation |
| derive-column-type.test.ts | 431 | Type derivation (indirect) |
| drizzle-typed-columns.test.ts | 454 | Schema/column validation, SchemaColumnError |
| field-model-comprehensive.test.ts | 1,024 | All AST types, all column options |
| variant-integration.test.ts | 760 | Variant fields + ColumnDef preservation |
| invariants/sql-standard.test.ts | 273 | INV-SQL-AI-001, INV-SQL-ID-*, INV-SQL-PK-001 |
| invariants/model-composition.test.ts | 217 | INV-MODEL-ID-001, INV-MODEL-AI-001 |

**Key Test Insights**:
1. Tests confirm nullability is NOT in ColumnDef (derived from schema AST)
2. Type-level and runtime derivation have known asymmetries (S.Int → "integer" at runtime, "number" at type level without schema identity)
3. SchemaColumnError type discrimination is well-tested

---

## ColumnDefSchema.Generic Structure (Target)

The replacement types already exist in types.ts:

```typescript
// Member-specific Generic interfaces (6 without autoIncrement use phantom param)
export declare namespace StringColumnDefSchema {
  export interface Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    _AutoIncrement extends boolean = boolean,  // Phantom
  > {
    readonly type: Type["type"];                    // "string"
    readonly primaryKey?: PrimaryKey | undefined;
    readonly unique?: Unique | undefined;
    readonly defaultValue?: Type["defaultValue"];
  }
}

// IntegerColumnDefSchema and BigintColumnDefSchema use autoIncrement
export declare namespace IntegerColumnDefSchema {
  export interface Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    AutoIncrement extends boolean = boolean,  // Actually used
  > {
    readonly type: Type["type"];                    // "integer"
    readonly primaryKey?: PrimaryKey | undefined;
    readonly unique?: Unique | undefined;
    readonly autoIncrement?: AutoIncrement | undefined;
    readonly defaultValue?: Type["defaultValue"];
  }
}

// Union type for all members
export declare namespace ColumnDefSchema {
  export type Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    AutoIncrement extends boolean = boolean,
  > =
    | StringColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | NumberColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | BooleanColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | DatetimeColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | UuidColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | JsonColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
    | BigintColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>;
}
```

**Key Properties**:
- Uses `Type["property"]` pattern to prevent drift
- `| undefined` suffix for `exactOptionalPropertyTypes` compatibility
- Phantom type parameters maintain consistent arity across all members
- autoIncrement only present on IntegerColumnDefSchema and BigintColumnDefSchema

---

## Dependency Graph for Migration

```
types.ts (remove ColumnDef, ExactColumnDef, DerivedColumnDefFromSchema)
    ↓
Field.ts (update type constraints and casts)
    ↓
Model.ts (update ExtractColumnsType, ExtractPrimaryKeys, defaultColumnDef)
    ↓
adapters/drizzle.ts (update type mappers)
    ↓
combinators.ts (update MergeColumnDef, DerivedDefaultColumnDef)
validate.ts (update parameter types)
    ↓
index.ts (verify exports)
    ↓
Test files (update type assertions if needed)
```

---

## Complexity Assessment

| File | Complexity | Risk | Notes |
|------|------------|------|-------|
| types.ts | High | High | Foundation changes cascade everywhere |
| Field.ts | High | High | Complex conditional types |
| Model.ts | High | High | Mapped types with inference |
| adapters/drizzle.ts | Medium | Medium | Type mappers use conditionals |
| combinators.ts | Medium | Low | Merge types are straightforward |
| validate.ts | Low | Low | Runtime-only, type constraint change |
| derive-column-type.ts | None | None | No ColumnDef usage |
| nullability.ts | None | None | No ColumnDef usage |
| errors.ts | None | None | No ColumnDef usage |
| literals.ts | None | None | No ColumnDef usage |
| index.ts | Low | Low | Just re-exports |

---

## Phase 2 Preparation

The following files require detailed ColumnDef usage analysis in Phase 2:
1. **types.ts** - Primary definitions to remove/replace
2. **Field.ts** - ExactColumnDef, DerivedColumnDefFromSchema usage
3. **Model.ts** - ExtractColumnsType, ExtractPrimaryKeys usage
4. **combinators.ts** - MergeColumnDef, ResolveColumnDef usage
5. **adapters/drizzle.ts** - Type mapper constraints
6. **validate.ts** - Parameter type constraints
7. **Test files** - Type assertion updates

---

## Recommendations

1. **Start with types.ts**: Remove ColumnDef interface after ensuring ColumnDefSchema.Generic is complete
2. **Incremental validation**: Run `bunx turbo run check --filter=@beep/schema` after each file
3. **Preserve type precision**: Ensure member-specific Generic interfaces are used where appropriate
4. **Test coverage**: Existing tests provide good regression coverage
5. **Watch for circular types**: Monitor ExtractColumnsType and ExtractPrimaryKeys for inference issues

---

*Report generated: 2024-12-28*
*Phase 1 Complete - Ready for Phase 2: Usage Analysis*
