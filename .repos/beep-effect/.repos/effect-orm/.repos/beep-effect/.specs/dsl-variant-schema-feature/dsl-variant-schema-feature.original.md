# DSL.Model VariantSchema Integration - Implementation Handoff

## Objective

Extend the DSL.Model system to support `@effect/sql/Model` VariantSchema patterns, enabling variant-aware field definitions (select, insert, update, json, jsonCreate, jsonUpdate) while preserving SQL column metadata.

## Target API

```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { Model, Field } from "@beep/schema/integrations/sql/dsl";

class User extends Model<User>("User")({
  // Generated fields excluded from insert/jsonCreate
  id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
  _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),

  // Sensitive fields excluded from JSON variants
  passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),

  // Standard fields present in all variants
  name: Field(S.String, { column: { type: "string" } }),
  email: Field(S.String, { column: { type: "string", unique: true } }),

  // DateTime fields with database/JSON transforms
  createdAt: Field(M.DateTimeInsertFromDate, { column: { type: "datetime" } }),
  updatedAt: Field(M.DateTimeUpdateFromDate, { column: { type: "datetime" } }),
}) {}

// All variants available as static properties
User                  // select variant (default)
User.insert          // insert variant - excludes Generated fields
User.update          // update variant
User.json            // json variant - excludes Sensitive fields
User.jsonCreate      // jsonCreate variant - excludes Generated + Sensitive
User.jsonUpdate      // jsonUpdate variant
User.select          // explicit select variant

// Static SQL metadata still available
User.tableName       // "user"
User.columns         // { id: { type: "uuid", ... }, ... }
User.primaryKey      // ["_rowId"]
```

---

## Phase 1: Research Agents

Deploy researcher agents to thoroughly understand the implementation requirements.

### Agent 1: VariantSchema Deep Dive

**Task:** Analyze `@effect/experimental/VariantSchema` implementation in depth.

```
Read and analyze:
- node_modules/@effect/experimental/src/VariantSchema.ts (full file)

Document:
1. The `make()` factory function signature and return type
2. How `Class` function works - specifically the class extension pattern
3. How `Field` function works - the `Field.Config` and variant mapping
4. How `extract()` works - caching, variant extraction, default handling
5. The `TypeId` and `FieldTypeId` symbols and their role
6. The `Struct` vs `Field` distinction
7. Type-level machinery: `ExtractFields`, `Extract`, `ClassFromFields`
8. How nested VariantSchema.Struct fields are handled
```

### Agent 2: @effect/sql/Model Analysis

**Task:** Analyze how `@effect/sql/Model` uses VariantSchema.

```
Read and analyze:
- node_modules/@effect/sql/src/Model.ts (full file)

Document:
1. The specific variants used: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"]
2. How `Generated`, `GeneratedByApp`, `Sensitive` are implemented
3. How `FieldOption` uses `fieldEvolve` for variant-specific transforms
4. The `DateTimeInsertFromDate`, `DateTimeUpdateFromDate` patterns
5. How the Model.Class combines with VariantSchema.Class
6. The `Override` and `Overrideable` patterns
7. How variant schemas get extracted and annotated with identifiers
```

### Agent 3: Current DSL Implementation Review

**Task:** Understand the current DSL.Model implementation and identify integration points.

```
Read and analyze:
- packages/common/schema/src/integrations/sql/dsl/Model.ts
- packages/common/schema/src/integrations/sql/dsl/Field.ts
- packages/common/schema/src/integrations/sql/dsl/types.ts
- packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts
- packages/common/schema/src/integrations/sql/dsl/__tests__/poc.test.ts
- packages/common/schema/src/core/VariantSchema.ts (our internal copy)

Document:
1. Current Field() implementation - how ColumnMetaSymbol is attached
2. Current Model() implementation - static properties, S.Class wrapping
3. How column metadata is extracted at runtime via AST annotations
4. How toDrizzle() maps ColumnDef to Drizzle builders
5. What changes are needed to support VariantSchema.Field as input
```

### Agent 4: Type-Level Integration Analysis

**Task:** Design the type-level integration between DSL.Field and VariantSchema.Field.

```
Analyze and design:
1. How to detect if input to Field() is a VariantSchema.Field vs plain Schema
2. Type-level preservation of variant information through Field wrapper
3. How ExtractColumnsType needs to change for VariantSchema.Field inputs
4. How Model class should expose variant static properties
5. Ensure column metadata flows correctly through variant extraction

Key type challenges:
- Field(M.Generated(S.String), { column: ... }) needs to:
  - Preserve M.Generated's variant behavior
  - Attach column metadata that survives variant extraction
  - Allow Model to extract variant schemas with correct fields
```

---

## Phase 2: Implementation Agents

Deploy implementation agents to build the feature.

### Agent 5: Field Integration

**Task:** Extend DSL.Field to support VariantSchema.Field inputs.

```typescript
// Target implementation in Field.ts

import * as VariantSchema from "@effect/experimental/VariantSchema";

// Detect if input is VariantSchema.Field
const isVariantField = (u: unknown): u is VariantSchema.Field<any> =>
  P.hasProperty(u, VariantSchema.FieldTypeId);

// Extended DSLField that can wrap VariantSchema.Field
export interface DSLField<
  A,
  I = A,
  R = never,
  C extends ColumnDef = ColumnDef,
  VF extends VariantSchema.Field.Config | undefined = undefined
> extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C;
  readonly [VariantFieldSymbol]?: VF;
}

// Updated Field function
export const Field = <
  Input extends S.Schema.All | S.PropertySignature.All | VariantSchema.Field<any>,
  const C extends Partial<ColumnDef> = {}
>(
  schema: Input,
  config?: FieldConfig<C>
): DSLField<...> => {
  // If input is VariantSchema.Field, preserve its schemas property
  // Attach column metadata to each variant schema
  // Return DSLField with both column metadata and variant info
};
```

Implementation requirements:
1. Handle plain Schema input (current behavior)
2. Handle VariantSchema.Field input - preserve variant mapping
3. Attach ColumnMetaSymbol annotation to each variant schema
4. Export symbol for variant field detection

### Agent 6: Model VariantSchema Integration

**Task:** Extend DSL.Model to use VariantSchema.make() and expose variant properties.

```typescript
// Target implementation in Model.ts

import * as VariantSchema from "@effect/experimental/VariantSchema";

const VS = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
});

// Detect DSL fields with variant info
const getDSLVariantField = (field: unknown): VariantSchema.Field<any> | undefined => {
  // Check for VariantFieldSymbol
};

// Convert DSL fields to VariantSchema fields
const toVariantFields = <Fields extends S.Struct.Fields>(
  fields: Fields
): VariantSchema.Struct.Fields => {
  // For each field:
  // - If DSLField with variant info, use the variant field
  // - If DSLField without variant, wrap in VS.FieldOnly for all variants
  // - Preserve column metadata attachment
};

export const Model = <Self = never>(identifier: string) =>
  <const Fields extends S.Struct.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): ModelClassWithVariants<...> => {
    // 1. Convert fields to VariantSchema fields
    const variantFields = toVariantFields(fields);

    // 2. Create VariantSchema.Struct
    const variantStruct = VS.Struct(variantFields);

    // 3. Extract default (select) variant for base class
    const selectSchema = VS.extract(variantStruct, "select");

    // 4. Create base class using S.Class
    const BaseClass = S.Class<Self>(identifier)(selectSchema.fields, annotations);

    // 5. Attach variant properties
    BaseClass.insert = VS.extract(variantStruct, "insert");
    BaseClass.update = VS.extract(variantStruct, "update");
    // ... etc

    // 6. Attach SQL metadata (existing logic)
    BaseClass.tableName = toSnakeCase(identifier);
    BaseClass.columns = extractColumns(fields);
    BaseClass.primaryKey = derivePrimaryKey(columns);

    return BaseClass;
  };
```

Implementation requirements:
1. Use VariantSchema.make() with sql/Model variants
2. Convert DSL fields to VariantSchema-compatible format
3. Expose all 6 variant schemas as static properties
4. Preserve existing SQL metadata (tableName, columns, primaryKey)
5. Ensure column annotations survive variant extraction

### Agent 7: Type Definitions

**Task:** Define complete TypeScript types for the integrated system.

```typescript
// Updated ModelClass interface
export interface ModelClass<
  Self,
  Fields extends S.Struct.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
  VariantFields extends VariantSchema.Struct.Fields
> extends S.Schema<Self, S.Struct.Encoded<SelectFields>, S.Struct.Context<SelectFields>>,
    ModelStatics<TName, Columns, PK, Id> {
  // Constructor for select variant
  new (props: ...): S.Struct.Type<SelectFields>;

  // Variant schema accessors
  readonly select: VariantSchema.Extract<"select", VariantSchema.Struct<VariantFields>>;
  readonly insert: VariantSchema.Extract<"insert", VariantSchema.Struct<VariantFields>>;
  readonly update: VariantSchema.Extract<"update", VariantSchema.Struct<VariantFields>>;
  readonly json: VariantSchema.Extract<"json", VariantSchema.Struct<VariantFields>>;
  readonly jsonCreate: VariantSchema.Extract<"jsonCreate", VariantSchema.Struct<VariantFields>>;
  readonly jsonUpdate: VariantSchema.Extract<"jsonUpdate", VariantSchema.Struct<VariantFields>>;

  // Existing members
  readonly ast: AST.Transformation;
  readonly fields: S.Struct.Fields;
  make(...): X;
  annotations(...): S.SchemaClass<...>;
}

// Type to extract column info from potentially variant fields
export type ExtractColumnsFromVariantField<F> =
  F extends DSLField<any, any, any, infer C, any> ? C :
  F extends VariantSchema.Field<infer Config> ?
    // Look for column metadata in variant schemas
    Config["select"] extends { [ColumnMetaSymbol]: infer C } ? C :
    ColumnDef<"string", false, false, false, false> :
  ColumnDef<"string", false, false, false, false>;
```

---

## Phase 3: Validation Agent

### Agent 8: Test Suite & Validation

**Task:** Create comprehensive test suite and validate implementation.

```typescript
// __tests__/variant-integration.test.ts

import { describe, it, expect } from "bun:test";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { Field, Model, toDrizzle, ColumnMetaSymbol } from "../index";
import * as AST from "effect/SchemaAST";
import { getTableName } from "drizzle-orm";

describe("DSL.Model with VariantSchema", () => {

  describe("Field with M.Generated", () => {
    it("preserves column metadata through Generated wrapper", () => {
      const field = Field(M.Generated(S.String), { column: { type: "uuid", unique: true } });
      // Verify column metadata is attached
    });

    it("excludes Generated fields from insert variant", () => {
      class Test extends Model<Test>("Test")({
        id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Test.insert should NOT have 'id' field
      expect(Test.insert.fields).not.toHaveProperty("id");
      expect(Test.insert.fields).toHaveProperty("name");
    });
  });

  describe("Field with M.Sensitive", () => {
    it("excludes Sensitive fields from JSON variants", () => {
      class Test extends Model<Test>("Test")({
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Test.json should NOT have 'passwordHash'
      expect(Test.json.fields).not.toHaveProperty("passwordHash");
      expect(Test.json.fields).toHaveProperty("name");

      // Test.select SHOULD have 'passwordHash'
      expect(Test.fields).toHaveProperty("passwordHash");
    });
  });

  describe("Model variant accessors", () => {
    class User extends Model<User>("User")({
      id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
      _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      name: Field(S.String, { column: { type: "string" } }),
    }) {}

    it("exposes select variant as default schema", () => {
      expect(S.isSchema(User)).toBe(true);
      expect(User.fields).toHaveProperty("id");
      expect(User.fields).toHaveProperty("name");
    });

    it("exposes insert variant without Generated fields", () => {
      expect(S.isSchema(User.insert)).toBe(true);
      expect(User.insert.fields).not.toHaveProperty("id");
      expect(User.insert.fields).toHaveProperty("_rowId");
      expect(User.insert.fields).toHaveProperty("name");
    });

    it("exposes update variant", () => {
      expect(S.isSchema(User.update)).toBe(true);
    });

    it("exposes json variant", () => {
      expect(S.isSchema(User.json)).toBe(true);
    });

    it("exposes jsonCreate variant", () => {
      expect(S.isSchema(User.jsonCreate)).toBe(true);
    });

    it("exposes jsonUpdate variant", () => {
      expect(S.isSchema(User.jsonUpdate)).toBe(true);
    });
  });

  describe("SQL metadata preservation", () => {
    class User extends Model<User>("User")({
      id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
      _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
    }) {}

    it("preserves tableName", () => {
      expect(User.tableName).toBe("user");
    });

    it("preserves columns metadata", () => {
      expect(User.columns.id.type).toBe("uuid");
      expect(User.columns.id.unique).toBe(true);
      expect(User.columns._rowId.primaryKey).toBe(true);
    });

    it("preserves primaryKey", () => {
      expect(User.primaryKey).toEqual(["_rowId"]);
    });
  });

  describe("toDrizzle with variant models", () => {
    it("generates correct Drizzle table from variant model", () => {
      class User extends Model<User>("User")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      const table = toDrizzle(User);
      expect(getTableName(table)).toBe("user");
      expect(table.id.columnType).toBe("PgUUID");
      expect(table._rowId.columnType).toBe("PgSerial");
    });
  });

  describe("S.decodeSync with variants", () => {
    class User extends Model<User>("User")({
      id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
      name: Field(S.String, { column: { type: "string" } }),
    }) {}

    it("decodes with select variant (full schema)", () => {
      const decode = S.decodeSync(User);
      const result = decode({ id: "abc", name: "Test" });
      expect(result.id).toBe("abc");
      expect(result.name).toBe("Test");
    });

    it("decodes with insert variant (no id)", () => {
      const decode = S.decodeSync(User.insert);
      const result = decode({ name: "Test" });
      expect(result.name).toBe("Test");
      expect(result).not.toHaveProperty("id");
    });
  });
});
```

Validation checklist:
1. All existing POC tests still pass
2. VariantSchema.Field inputs work with DSL.Field
3. All 6 variants are correctly exposed on Model class
4. Column metadata survives variant extraction
5. toDrizzle works with variant-enabled models
6. Type inference is correct for all variants
7. S.decodeSync/encodeSync work for each variant

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Extend to support VariantSchema.Field |
| `packages/common/schema/src/integrations/sql/dsl/Model.ts` | Integrate VariantSchema.make() |
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Add VariantFieldSymbol, update types |
| `packages/common/schema/src/integrations/sql/dsl/__tests__/variant-integration.test.ts` | New test file |
| `packages/common/schema/src/core/VariantSchema.ts` | Reference implementation |
| `node_modules/@effect/sql/src/Model.ts` | Reference for variant patterns |
| `node_modules/@effect/experimental/src/VariantSchema.ts` | Core VariantSchema implementation |

---

## Reference: Key Patterns from @effect/sql/Model

```typescript
// How Generated works - excludes from insert/jsonCreate
export const Generated = <S>(schema: S): Generated<S> =>
  Field({
    select: schema,
    update: schema,
    json: schema
    // Note: NO insert, NO jsonCreate, NO jsonUpdate
  });

// How Sensitive works - excludes from all JSON variants
export const Sensitive = <S>(schema: S): Sensitive<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema
    // Note: NO json, NO jsonCreate, NO jsonUpdate
  });

// How GeneratedByApp works - required for DB, optional for JSON
export const GeneratedByApp = <S>(schema: S): GeneratedByApp<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema,
    json: schema
    // Note: NO jsonCreate, NO jsonUpdate
  });
```

---

## Success Criteria

1. **Backward Compatible**: Existing `Field(S.String, { column: ... })` usage unchanged
2. **Type Safe**: Full TypeScript inference for all variants
3. **Composable**: Works with all @effect/sql/Model field helpers
4. **Metadata Preserved**: Column definitions flow through variant extraction
5. **Drizzle Compatible**: toDrizzle works with variant-enabled models
6. **Tested**: Comprehensive test coverage for all variant combinations

---

## Commands

```bash
# Build
bun run build --filter=@beep/schema

# Type check
bun run check --filter=@beep/schema

# Run tests
cd packages/common/schema && bun test src/integrations/sql/dsl/

# Run specific test file
bun test src/integrations/sql/dsl/__tests__/variant-integration.test.ts
```
