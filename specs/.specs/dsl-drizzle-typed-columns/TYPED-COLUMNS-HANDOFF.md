# DSL Drizzle Typed Columns - Type Inference Fix

## Problem

`InferSelectModel<typeof table>` and `InferInsertModel<typeof table>` do not correctly infer typed column types from `toDrizzle()`. They return `null` instead of the expected encoded types (e.g., `string`, `number`, branded types).

## Current State

### What Works
- Schema/column compatibility validation via `ValidateSchemaColumn` in `Field()` overloads
- `.$type<T>()` is called at runtime (correct runtime behavior)
- `Model._fields` exposes original fields for type extraction
- `ExtractEncodedType<F>` correctly extracts encoded types from DSL fields

### What Doesn't Work
```typescript
class User extends Model<User>("User")({
  id: Field(UserIdSchema, { column: { type: "uuid", primaryKey: true } }),
}) {}

const table = toDrizzle(User);
type Select = InferSelectModel<typeof table>;

// Expected: Select["id"] = UserId (branded string)
// Actual: Select["id"] = null
```

## Root Cause

The `DrizzleTypedBuildersFor` type correctly applies `$Type<Builder, EncodedType>`, but Drizzle's `BuildColumns` utility loses this information during its internal type computation:

```typescript
// In drizzle.ts - our type wrapper
type DrizzleTypedBuildersFor<Columns, Fields> = {
  [K in keyof Columns & keyof Fields & string]: $Type<
    DrizzleBaseBuilderFor<K, Columns[K]["type"], ...>,
    ExtractEncodedType<Fields[K]>  // ← This gets lost in BuildColumns
  >;
};

// Return type uses BuildColumns which loses $Type
PgTableWithColumns<{
  columns: BuildColumns<TName, DrizzleTypedBuildersFor<...>, "pg">;  // ← $Type lost here
}>
```

## Task

Fix the return type of `toDrizzle()` so that `InferSelectModel` correctly infers the encoded types from DSL fields.

## Suggested Approach

Bypass `BuildColumns` and construct the column types directly. The goal is to produce a `PgTableWithColumns` type where each column's `data` type matches `ExtractEncodedType<Fields[K]>`.

### Investigation Steps

1. **Examine Drizzle's type structure**
   ```bash
   # Key files to study
   node_modules/drizzle-orm/column-builder.d.ts  # $Type, MakeColumnConfig
   node_modules/drizzle-orm/table.d.ts           # BuildColumns
   node_modules/drizzle-orm/pg-core/table.d.ts   # PgTableWithColumns
   node_modules/drizzle-orm/pg-core/columns/     # Individual column types
   ```

2. **Understand what `InferSelectModel` expects**
   - It reads from `table[Table.Symbol.Columns]`
   - Each column needs a `_` property with `data` and `notNull` types
   - The `$type` field in column config overrides the `data` type

3. **Try constructing the return type directly**
   ```typescript
   // Instead of using BuildColumns, construct columns directly
   type DirectColumns<Fields extends DSL.Fields, TName extends string> = {
     [K in keyof Fields & string]: PgColumn<{
       name: K;
       tableName: TName;
       dataType: "string" | "number" | "boolean" | "json" | "date";
       data: ExtractEncodedType<Fields[K]>;
       // ... other required properties
     }>;
   };
   ```

4. **Alternative: Intercept at a different point**
   - The `$Type` utility adds `_: { $type: TType }` to the builder
   - `MakeColumnConfig` checks for this and uses it for the `data` field
   - Find where this chain breaks and fix it

## Files to Modify

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Fix return type of `toDrizzle()` |
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Add helper types if needed |

## Test Cases

Add to `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`:

```typescript
import { InferSelectModel } from "drizzle-orm";

describe("InferSelectModel type inference", () => {
  it("infers string types correctly", () => {
    class User extends Model<User>("User")({
      id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
      name: Field(S.String, { column: { type: "string" } }),
    }) {}

    const table = toDrizzle(User);
    type Select = InferSelectModel<typeof table>;

    expectTypeOf<Select["id"]>().toEqualTypeOf<string>();
    expectTypeOf<Select["name"]>().toEqualTypeOf<string>();
  });

  it("infers branded types correctly", () => {
    type UserId = string & Brand<"UserId">;
    const UserIdSchema = S.String.pipe(S.fromBrand(Brand.nominal<UserId>()));

    class User extends Model<User>("User")({
      id: Field(UserIdSchema, { column: { type: "uuid", primaryKey: true } }),
    }) {}

    const table = toDrizzle(User);
    type Select = InferSelectModel<typeof table>;

    expectTypeOf<Select["id"]>().toEqualTypeOf<UserId>();
  });

  it("infers variant field types correctly", () => {
    class Post extends Model<Post>("Post")({
      id: Field(M.Generated(S.Int), { column: { type: "integer", primaryKey: true } }),
      secret: Field(M.Sensitive(S.String), { column: { type: "string" } }),
    }) {}

    const table = toDrizzle(Post);
    type Select = InferSelectModel<typeof table>;

    expectTypeOf<Select["id"]>().toEqualTypeOf<number>();
    expectTypeOf<Select["secret"]>().toEqualTypeOf<string>();
  });

  it("infers complex JSON types correctly", () => {
    const Metadata = S.Struct({ level: S.Number, tags: S.Array(S.String) });

    class Entity extends Model<Entity>("Entity")({
      id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
      metadata: Field(Metadata, { column: { type: "json" } }),
    }) {}

    const table = toDrizzle(Entity);
    type Select = InferSelectModel<typeof table>;

    expectTypeOf<Select["metadata"]>().toEqualTypeOf<{
      readonly level: number;
      readonly tags: readonly string[];
    }>();
  });
});
```

## Success Criteria

1. All test cases above pass type checking
2. `InferSelectModel<typeof table>` returns correct types for all column types
3. Branded types are preserved through the Drizzle type inference
4. No runtime behavior changes

## Time Box

If after 2-3 hours the types still don't propagate correctly through Drizzle's type system, document the limitation and close. The schema/column validation works, runtime is correct, and `InferSelectModel` inference is a nice-to-have enhancement.

## References

- Current implementation: `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- Drizzle `$Type` utility: `node_modules/drizzle-orm/column-builder.d.ts:135-139`
- Drizzle `MakeColumnConfig`: `node_modules/drizzle-orm/column-builder.d.ts:32-34`
- Drizzle `BuildColumns`: `node_modules/drizzle-orm/table.d.ts`
