# VariantSchema.Class Extension Pattern - Research Summary

## Alignment Notes

> **Status**: WELL ALIGNED - Core internals documented correctly, implementation pattern needs refinement

### How This Research Aligns with DSL.Model Goals

This document provides **essential internal knowledge** for implementing DSL.Model:

1. **Class<Self>(identifier)(fields) internals** - Correctly documents the curried factory pattern DSL.Model must follow
2. **Hybrid class-schema return type** - Confirms DSL.Model IS a valid Effect Schema
3. **static [TypeId] = fields storage** - Shows how to preserve original field definitions
4. **Object.defineProperty for variants** - Explains how variant schemas are attached

### Caveats - Outdated Assumptions to Ignore

| Section | Issue | DSL.Model Correction |
|---------|-------|---------------------|
| Section 4 | Shows `.drizzleTable` as static property | Use generic `.columns` static; Drizzle via `DSL.toDrizzle(Model)` adapter |
| Section 7 | Shows `.drizzleTable`, `.betterAuthFields`, `.sqlMetadata` statics | Correct statics are `.tableName`, `.columns`, `.primaryKey`, `.indexes`, `.identifier` |
| Section 7 | `generateDrizzleTable()`, `generateBetterAuthFields()` in factory | Driver-specific generation belongs in SEPARATE adapter functions |
| Section 3 | `field.__sqlMeta` pattern | Use `DSL.Field({ column: ColumnDef })` with annotation extraction |

### Pattern Status

| Pattern | Status | Notes |
|---------|--------|-------|
| Curried factory `Model<Self>()(id, fields)` | RECOMMENDED | Matches VariantSchema.Class pattern |
| `static [TypeId] = fields` storage | RECOMMENDED | Preserves raw field definitions for introspection |
| `Object.defineProperty` for variants | RECOMMENDED | How VariantSchema attaches `.select`, `.insert`, etc. |
| Anonymous class extension | RECOMMENDED | For adding custom static properties |
| `annotations()` override | CRITICAL | Must return new factory instance preserving statics |
| Type intersection return type | RECOMMENDED | `typeof BaseClass & { readonly prop: T }` |

### Correct Implementation Pattern for DSL.Model

```typescript
// DSL.Model factory - ALIGNED with design spec
export const Model = <Self>() =>
  <const Fields extends Record<string, DSLField<any, any, any>>>(
    identifier: string,
    fields: Fields
  ): ModelSchemaInstance<Self, Fields> => {
    // 1. Extract GENERIC column definitions (driver-agnostic)
    const columns = extractColumns(fields)       // -> Record<string, ColumnDef>
    const primaryKey = derivePrimaryKey(columns) // -> readonly string[]

    // 2. Extract schema-only fields for VariantSchema
    const schemaFields = extractSchemaFields(fields)

    // 3. Create base class via VariantSchema.Class
    const BaseClass = VariantSchema.Class<Self>(identifier)(schemaFields)

    // 4. Return extended class with GENERIC static properties
    return class ModelClass extends BaseClass {
      static readonly tableName = toSnakeCase(identifier)
      static readonly columns = columns           // ColumnDef, NOT Drizzle
      static readonly primaryKey = primaryKey
      static readonly indexes = [] as readonly IndexDef[]
      static readonly identifier = identifier

      static override annotations(annotations: S.Annotations.Schema<Self>) {
        return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations))
      }
    } as typeof BaseClass & {
      readonly tableName: string
      readonly columns: typeof columns
      readonly primaryKey: readonly string[]
      readonly indexes: readonly IndexDef[]
      readonly identifier: string
    }
  }

// SEPARATE adapter functions (NOT in factory)
// packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts
export const toDrizzle = <M extends ModelSchemaInstance<any, any>>(model: M): PgTable => {
  // Use model.columns (generic ColumnDef) to generate Drizzle-specific table
}

// packages/common/schema/src/integrations/sql/dsl/adapters/better-auth.ts
export const toBetterAuth = <M extends ModelSchemaInstance<any, any>>(
  model: M
): Record<string, DBFieldAttribute> => {
  // Use model.columns to generate better-auth-specific config
}
```

### Key Differences from Original Research

1. **Static properties are GENERIC** - `.columns` contains `ColumnDef`, not `PgColumnBuilderBase`
2. **Driver adapters are SEPARATE** - `toDrizzle()`, `toBetterAuth()` are standalone functions
3. **No driver imports in Model** - Model factory has zero knowledge of Drizzle/better-auth
4. **`const` type parameter** - `<const Fields>` preserves literal types for column inference

---

## Overview

This document details how `VariantSchema.Class` works internally and how to extend it to create a `DSL.Model` that exposes SQL metadata as static properties.

---

## 1. How Class<Self>(identifier)(fields) Works Internally

**Source**: `packages/common/schema/src/core/VariantSchema.ts:488-507`

```typescript
function Class<Self>(identifier: string) {
  return (fields: Struct.Fields, annotations?: S.Annotations.Schema<Self>) => {
    const variantStruct = Struct(fields);  // Creates Struct<A>
    const schema = extract(variantStruct, options.defaultVariant, {
      isDefault: true,
    });

    class Base extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(schema.fields, annotations) {
      static [TypeId] = fields;  // Key: stores original field definitions
    }

    for (const variant of options.variants) {
      Object.defineProperty(Base, variant, {
        value: extract(variantStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`,
        }),
      });
    }
    return Base;
  };
}
```

**Key Points**:
- Factory returns a curried function: `Class<Self>(id)(fields, annotations?)`
- Creates a `Base` class extending `S.Class`
- Stores original fields in `static [TypeId] = fields`
- Adds variant schemas as static properties via `Object.defineProperty`

---

## 2. What Is Returned - A Class, Schema, or Both?

**It's a hybrid: a class that IS a schema.**

The return type `ClassFromFields<Self, Fields, SchemaFields>` extends:
- `S.Schema<Self, I, R>` — Makes it a valid Effect Schema
- `Struct<Fields>` — Preserves field metadata
- Callable constructor via `new (...props)`
- Static properties for each variant (`.select`, `.insert`, `.update`, etc.)

**Type Definition** (lines 245-271):
```typescript
export interface Class<Self, Fields, SchemaFields, A, I, R, C>
  extends S.Schema<Self, S.Simplify<I>, R>,
          Struct<S.Simplify<Fields>> {
  new (props: RequiredKeys<C> extends never ? void | S.Simplify<C> : S.Simplify<C>): A;
  readonly ast: AST.Transformation;
  readonly identifier: string;
  readonly fields: S.Simplify<SchemaFields>;
}
```

---

## 3. How to Intercept Field Definitions

**Fields are stored in two places:**

1. **During class creation**: `static [TypeId] = fields` (line 496)
   - Raw, unprocessed field definitions
   - Contains `Field` objects with all variant metadata

2. **After extraction**: `schema.fields` (line 493)
   - Extracted for default variant only
   - Processed through Effect Schema

**To extract SQL metadata:**
```typescript
const extractSqlMetadata = <Fields>(fields: Fields) => {
  return F.pipe(
    Struct.keys(fields),
    A.map((key) => {
      const field = fields[key];
      if (isDSLField(field)) {
        return [key, field.__sqlMeta] as const;
      }
      return [key, inferSqlMeta(field)] as const;
    }),
    R.fromEntries
  );
};
```

---

## 4. Adding Static Properties Like .drizzleTable

**Pattern from existing code:**

Static properties are added via direct assignment in the class body or `Object.defineProperty`:

```typescript
class Base extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(schema.fields, annotations) {
  static [TypeId] = fields;

  // Add custom static properties:
  static readonly drizzleTable = computeDrizzleTable(fields);
  static readonly betterAuthFields = computeBetterAuthFields(fields);
  static readonly sqlMetadata = extractSqlMetadata(fields);
}
```

**Existing pattern in beep-effect** (`packages/shared/domain/src/entities/User/User.model.ts:115`):
```typescript
export class Model extends M.Class<Model>($I`UserModel`)(...) {
  static readonly utils = modelKit(Model);  // Custom static property
}
```

---

## 5. TypeScript Type Preservation

Types are preserved through:

1. **Generic parameters in Class<Self>**: Capture the user-defined class type
2. **Field-level type narrowing**: `[Fields[K]] extends [Field<infer Config>]`
3. **Return type computation**: `ClassFromFields<Self, Fields, ExtractFields<...>>`

**For DSL.Model:**
```typescript
return class ModelClass extends BaseClass {
  static readonly drizzleTable = drizzleTable;
  static readonly betterAuthFields = betterAuthFields;
} as typeof BaseClass & {
  readonly drizzleTable: typeof drizzleTable;
  readonly betterAuthFields: typeof betterAuthFields;
};
```

The `as` type assertion with intersection ensures TypeScript sees both base class types and new static properties.

---

## 6. Key Files

| File | Purpose |
|------|---------|
| `packages/common/schema/src/core/VariantSchema.ts` | Core Class factory |
| `packages/common/schema/src/integrations/sql/Model.ts` | SQL-specific extensions |
| `packages/shared/domain/src/entities/User/User.model.ts` | Real-world usage example |
| `packages/shared/domain/src/common.ts` | makeFields helper pattern |

---

## 7. Recommended Implementation for DSL.Model

```typescript
const Model = <Self>() => <Fields extends FieldSpecs>(
  identifier: string,
  fields: Fields
) => {
  // 1. Extract SQL metadata from DSL.Field instances
  const sqlMetadata = extractSqlMetadata(fields);

  // 2. Generate Drizzle table and better-auth config
  const drizzleTable = generateDrizzleTable(identifier, sqlMetadata);
  const betterAuthFields = generateBetterAuthFields(sqlMetadata);

  // 3. Extract schema-only fields (strip SQL config)
  const schemaFields = extractSchemaFields(fields);

  // 4. Create base class using existing VariantSchema.Class
  const BaseClass = VariantSchema.Class<Self>(identifier)(schemaFields);

  // 5. Return extended class with static properties
  return class ModelClass extends BaseClass {
    static readonly drizzleTable = drizzleTable;
    static readonly betterAuthFields = betterAuthFields;
    static readonly sqlMetadata = sqlMetadata;
    static readonly tableName = toSnakeCase(identifier);

    static override annotations(annotations: S.Annotations.Schema<Self>) {
      // Preserve static properties through chaining
      return makeModelClass(identifier, fields, mergeSchemaAnnotations(this.ast, annotations));
    }
  } as typeof BaseClass & {
    readonly drizzleTable: typeof drizzleTable;
    readonly betterAuthFields: typeof betterAuthFields;
    readonly sqlMetadata: typeof sqlMetadata;
    readonly tableName: string;
  };
};
```
