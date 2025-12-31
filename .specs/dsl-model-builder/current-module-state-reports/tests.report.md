# DSL Test Suite Analysis Report

**Date**: 2025-12-30
**Directory**: `packages/common/schema/test/integrations/sql/dsl/`
**Purpose**: Test patterns for ModelFactory implementation

---

## Executive Summary

The DSL test suite demonstrates sophisticated testing patterns for Field/Model composition, variant schema integration, and type-level assertions. Understanding these patterns is essential for properly testing a new `ModelFactory` feature.

---

## 1. How Field and Model Are Tested Together

### Test File: `field-model-comprehensive.test.ts`

**Integration Patterns:**

1. **Field Creation with Column Options**
   ```typescript
   const field = Field(S.String)({ column: { primaryKey: true } });
   expect(field[ColumnMetaSymbol].primaryKey).toBe(true);
   ```

2. **Model Class Definition**
   ```typescript
   class TestModel extends Model<TestModel>("TestModelName")({
     id: Field(S.String)({ column: { primaryKey: true } }),
     name: Field(S.String)({}),
   }) {}
   ```

3. **Metadata Extraction**
   - `Model.columns`: Record of ColumnDef for all fields
   - `Model.primaryKey`: Array of field names
   - `Model.tableName`: Converted to snake_case
   - `Model.identifier`: Original name

4. **Model Integration with toDrizzle**
   ```typescript
   const table = toDrizzle(TestModel);
   expect(getTableName(table)).toBe("test_model");
   ```

---

## 2. Test Patterns for Type-Level Assertions

### Primary Pattern: `expectTypeOf` from `bun:test`

**Type-Level Verification:**

1. **Direct Type Equality**
   ```typescript
   expectTypeOf(field).toExtend<DSLField<string, string, never>>();
   expectTypeOf<ColDef["type"]>().toEqualTypeOf<"uuid">();
   ```

2. **Literal Type Preservation**
   ```typescript
   type ColDef = FieldType extends { [ColumnMetaSymbol]: infer C } ? C : never;
   expectTypeOf<ColDef["primaryKey"]>().toEqualTypeOf<true>();
   ```

3. **Schema Integration**
   ```typescript
   type UserIdSchema = S.String.pipe(S.fromBrand(UserId));
   const field = Field(UserIdSchema)({});
   expectTypeOf(field).toExtend<DSLField<UserId, string, never>>();
   ```

---

## 3. How Default Values and Update Functions Are Tested

### Default Value Testing

```typescript
it("defaultValue option is preserved - string", () => {
  const field = Field(S.String)({ column: { defaultValue: "default" } });
  expect(field[ColumnMetaSymbol].defaultValue).toBe("default");
});

it("defaultValue option is preserved - function", () => {
  const defaultFn = () => "generated";
  const field = Field(S.String)({ column: { defaultValue: defaultFn } });
  expect(field[ColumnMetaSymbol].defaultValue).toBe(defaultFn);
});
```

### Variant-Aware Default Values (`variant-integration.test.ts`)

```typescript
it("allows decoding without generated field for insert", () => {
  class Post extends Model<Post>("Post")({
    id: Field(M.Generated(S.String))({ column: { type: "uuid" } }),
    title: Field(S.String)({}),
  }) {}
  const result = S.decodeSync(Post.insert)({ title: "Hello" });
  expect(result).toEqual({ title: "Hello" });
});
```

---

## 4. Patterns for Testing Schema Composition

### Structural Type Derivation

```typescript
it("derives 'json' column type for simple struct", () => {
  const field = Field(S.Struct({ name: S.String }))({});
  expect(field[ColumnMetaSymbol].type).toBe("json");
});

it("derives 'json' for nested structs", () => {
  const NestedStruct = S.Struct({
    user: S.Struct({ name: S.String }),
    metadata: S.Struct({ created: S.String }),
  });
  const field = Field(NestedStruct)({});
  expect(field[ColumnMetaSymbol].type).toBe("json");
});
```

### Variant Schema Composition

```typescript
class ComplexUser extends Model<ComplexUser>("ComplexUser")({
  _rowId: Field(M.Generated(S.Int))({ column: { primaryKey: true } }),
  id: Field(M.GeneratedByApp(S.String))({ column: { unique: true } }),
  email: Field(S.String)({}),
  passwordHash: Field(M.Sensitive(S.String))({}),
  bio: Field(M.FieldOption(S.String))({}),
}) {}

// Verify variant field inclusion
expect(hasField(ComplexUser.select.fields, "passwordHash")).toBe(true);
expect(hasField(ComplexUser.json.fields, "passwordHash")).toBe(false);
expect(hasField(ComplexUser.jsonCreate.fields, "_rowId")).toBe(false);
```

---

## 5. Edge Cases Covered

### Error Cases

```typescript
it("S.Never throws UnsupportedColumnTypeError", () => {
  expect(() => Field(S.Never)({})).toThrow("Never type cannot be used as a SQL column");
});
```

### Validation Errors (`model-composition.test.ts`)
- Multiple autoIncrement fields detected
- Empty model identifier rejected
- Model identifier length validation
- JSON serializable error format

### Edge Cases

```typescript
it("empty config object defaults correctly", () => {
  const field = Field(S.String)({});
  expect(field[ColumnMetaSymbol].primaryKey).toBe(false);
});

// Deeply nested structures
const DeepNullable = S.NullOr(S.NullOr(S.String));
const field = Field(DeepNullable)({});
expect(field[ColumnMetaSymbol].type).toBe("string");
```

---

## 6. Test Organization Strategy

### Section Headers
```typescript
describe("Primitive Keywords - Column Type Derivation", () => { ... })
describe("Structural Types - Column Type Derivation", () => { ... })
describe("Union Patterns - Column Type Derivation", () => { ... })
```

### Helper Functions
```typescript
const hasField = (fields: S.Struct.Fields, key: string): boolean => key in fields;
```

---

## 7. Runtime Verification Strategies

1. **Symbol Access for Metadata**
   ```typescript
   const columnDef = (field as any)[ColumnMetaSymbol];
   ```

2. **Schema Field Inspection**
   ```typescript
   expect(S.isSchema(Entity.select)).toBe(true);
   ```

3. **Decoding Verification**
   ```typescript
   const result = S.decodeSync(Post.insert)({ title: "Hello" });
   ```

4. **Table Generation Verification**
   ```typescript
   const table = toDrizzle(TestModel);
   expect(getTableName(table)).toBe("test_model");
   ```

---

## 8. Key Findings for ModelFactory Testing

1. **Two API Styles Coexist**
   - Direct Field definition: `Field(S.String)({ column: {...} })`
   - Combinator DSL: `S.String.pipe(DSL.uuid, DSL.primaryKey)`

2. **Type System Must Be Preserved**
   - Literal types must be narrowed (not widened)
   - Type-level validation catches schema/column incompatibilities

3. **Variant Integration is Non-Negotiable**
   - All 6 variants must be exposed
   - Variant exclusions must be correct per field type

4. **Metadata Pattern is Consistent**
   - ColumnMetaSymbol for runtime metadata
   - Model static properties: columns, primaryKey, tableName, identifier

5. **Testing Requires Both Levels**
   - Runtime assertions via expect()
   - Type-level assertions via expectTypeOf()
   - Schema decode/encode validation
