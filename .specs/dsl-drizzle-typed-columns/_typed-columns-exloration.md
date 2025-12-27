# DSL Drizzle Typed Columns - Handoff

## Status: Partially Complete

### Completed Work

1. **Feature 1: Typed Drizzle Columns** - Implemented but not fully integrated with Drizzle's type inference
   - `ExtractEncodedType<F>` extracts encoded types from DSL fields
   - `DrizzleTypedBuildersFor` attempts to apply `$Type<Builder, EncodedType>`
   - `.$type<T>()` is called at runtime (purely type-level, no runtime effect)
   - `Model._fields` exposes original fields for type extraction

2. **Feature 2: Schema/Column Compatibility Validation** - Fully working
   - `ValidateSchemaColumn<SchemaEncoded, ColType, ResultType>` validates compatibility
   - `SchemaColumnError<SchemaEncoded, ColType>` provides descriptive error types
   - `Field()` overloads return either `DSLField` or `SchemaColumnError` based on compatibility

### Remaining Work

The `InferSelectModel<typeof table>` and `InferInsertModel<typeof table>` Drizzle utilities do not correctly infer the typed column types. They return `null` instead of the expected encoded types (e.g., `string`, `number`, branded types).

## Problem Analysis

The issue is in how Drizzle's `BuildColumns` utility processes our `DrizzleTypedBuildersFor` type:

```typescript
// Current approach - types not propagating correctly
type DrizzleTypedBuildersFor<
  Columns extends Record<string, ColumnDef>,
  Fields extends DSL.Fields,
> = {
  [K in keyof Columns & keyof Fields & string]: DrizzleTypedBuilderFor<
    K,
    Columns[K]["type"],
    Columns[K] extends { autoIncrement: true } ? true : false,
    ExtractEncodedType<Fields[K]>  // This gets lost in BuildColumns
  >;
};
```

The `BuildColumns<TableName, Builders, "pg">` utility appears to lose the `$Type` wrapper information during its internal type computation.

---

## Proposed Solutions

### Option A: Fix `DrizzleTypedBuildersFor` Type Inference

Deep-dive into Drizzle's type system to understand why `$Type` isn't being preserved. May require:
- Using different type intersection patterns
- Investigating Drizzle's `MakeColumnConfig` and `BuildColumns` internals
- Potentially contributing to Drizzle ORM if this is a limitation

### Option B: Validate Types in `toDrizzle` Adapter

Instead of validating schema/column compatibility inline on the `Field()` call, move validation to the `toDrizzle()` function:

```typescript
// Current: Validation happens at Field() call site
Field(S.String, { column: { type: "integer" } })  // Returns SchemaColumnError

// Alternative: Validation happens at toDrizzle() call site
const table = toDrizzle(MyModel);  // Type error if any field is incompatible
```

This approach:
- Defers validation to the point where Drizzle types are actually needed
- May provide better error messages (showing which model/field is invalid)
- Could use a conditional return type on `toDrizzle` that checks all fields

```typescript
type ValidateModelFields<M extends ModelStatics<any, any, any, any, any>> =
  // Check each field in M._fields against M.columns
  // Return error type if any incompatible, else return PgTableWithColumns<...>
```

### Option C: Pipeable Field with Deferred Column Config (Recommended for Exploration)

Make `Field` return a pipeable intermediate type, with column config applied via a separate function. This separates schema definition from SQL column mapping:

```typescript
class ExampleModel extends Model<ExampleModel>("ExampleModel")({
  // Option 1: Using pipe()
  id: Field(S.String).pipe(
    DSL.uuid({ primaryKey: true })
  ),

  // Option 2: Using fluent .sqlConfig() method
  name: Field(S.String).sqlConfig({ type: "string" }),

  // Option 3: Using specialized column type helpers
  count: Field(S.Int).pipe(DSL.integer()),
  active: Field(S.Boolean).pipe(DSL.boolean()),
  metadata: Field(MyStruct).pipe(DSL.jsonb()),
  createdAt: Field(M.Generated(S.String)).pipe(DSL.timestamp()),
}) {}
```

**Benefits:**
1. **Type validation is natural**: `DSL.uuid()` can constrain its input to only accept `Field<string, string, ...>` types
2. **Better ergonomics**: Column type helpers can infer defaults (e.g., `DSL.uuid()` implies `type: "uuid"`)
3. **Separation of concerns**: Schema definition vs SQL mapping are distinct operations
4. **Composable**: Can add middleware-like transformations (e.g., `DSL.nullable()`, `DSL.indexed()`)

**Implementation Sketch:**

```typescript
// Field returns a PipeableField
interface PipeableField<A, I, R> extends S.Schema<A, I, R> {
  pipe<C extends ColumnDef>(
    fn: (self: this) => DSLField<A, I, R, C>
  ): DSLField<A, I, R, C>;

  sqlConfig<C extends Partial<ColumnDef>>(
    config: FieldConfig<C>
  ): ValidateSchemaColumn<I, ExtractColumnType<C>, DSLField<A, I, R, ExactColumnDef<C>>>;
}

// Column type helpers with built-in validation
declare namespace DSL {
  // Only accepts string-encoded schemas
  function uuid<A, R>(
    options?: { primaryKey?: boolean; unique?: boolean }
  ): <I extends string>(field: PipeableField<A, I, R>) => DSLField<A, I, R, UuidColumnDef>;

  // Only accepts number-encoded schemas
  function integer<A, R>(
    options?: { primaryKey?: boolean; autoIncrement?: boolean }
  ): <I extends number>(field: PipeableField<A, I, R>) => DSLField<A, I, R, IntegerColumnDef>;

  // Only accepts object-encoded schemas
  function jsonb<A, R>(): <I extends object>(
    field: PipeableField<A, I, R>
  ) => DSLField<A, I, R, JsonColumnDef>;
}
```

**Validation happens naturally via generic constraints:**

```typescript
// This would fail at compile time because S.Int encodes to number, not string
Field(S.Int).pipe(DSL.uuid())
// Error: Type 'number' does not satisfy constraint 'string'

// This works because S.String encodes to string
Field(S.String).pipe(DSL.uuid({ primaryKey: true }))  // ✓
```

---

## Files to Modify

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Add `PipeableField` interface, column type helpers |
| `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Return `PipeableField` from `Field()` |
| `packages/common/schema/src/integrations/sql/dsl/column-helpers.ts` | New file for `DSL.uuid()`, `DSL.integer()`, etc. |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Fix `DrizzleTypedBuildersFor` or add validation |

---

## Test Cases to Add

```typescript
describe("Pipeable Field API", () => {
  it("DSL.uuid() only accepts string-encoded schemas", () => {
    // Should compile
    const valid = Field(S.String).pipe(DSL.uuid());

    // Should fail to compile (number not assignable to string constraint)
    // const invalid = Field(S.Int).pipe(DSL.uuid());
  });

  it("DSL.integer() only accepts number-encoded schemas", () => {
    // Should compile
    const valid = Field(S.Int).pipe(DSL.integer());

    // Should fail to compile
    // const invalid = Field(S.String).pipe(DSL.integer());
  });
});

describe("InferSelectModel types", () => {
  it("branded types are preserved in InferSelectModel", () => {
    class User extends Model<User>("User")({
      id: Field(UserIdSchema).pipe(DSL.uuid({ primaryKey: true })),
    }) {}

    const table = toDrizzle(User);
    type Select = InferSelectModel<typeof table>;

    expectTypeOf<Select["id"]>().toEqualTypeOf<UserId>();
  });
});
```

---

## Decision Points

1. **Which approach to pursue?**
   - Option A: Fix existing type inference (most direct, potentially complex)
   - Option B: Move validation to `toDrizzle` (simpler, changes API semantics slightly)
   - Option C: Pipeable Field API (most ergonomic, largest change)

2. **Backwards compatibility?**
   - Current `Field(schema, { column: {...} })` API should continue to work
   - Pipeable API can be additive (either syntax works)

3. **Error message quality?**
   - Current `SchemaColumnError` provides good messages
   - Pipeable approach gives natural TypeScript errors via generic constraints
   - Which is preferable for developer experience?

---

## References

- Current implementation: `packages/common/schema/src/integrations/sql/dsl/`
- Drizzle `$Type` utility: `node_modules/drizzle-orm/column-builder.d.ts:135-139`
- Drizzle `BuildColumns`: `node_modules/drizzle-orm/table.d.ts`
- Test file: `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`
