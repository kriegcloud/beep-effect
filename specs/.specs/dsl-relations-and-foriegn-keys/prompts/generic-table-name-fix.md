# Orchestration Prompt: Generic Table Name Literal Preservation

## Objective

Fix the DSL `Model` function to preserve table name literal types through the entire type chain, enabling type-safe `db.query.<tableName>` access patterns in Drizzle ORM.

## Problem Statement

Currently, the `Model` function signature uses `string` for the identifier parameter:

```typescript
// Current (problematic)
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(fields: Fields, annotations?: S.Annotations.Schema<Self>): ...
```

This causes the table name to become `string` instead of a literal type, breaking:
1. `db.query.users.findMany()` - TypeScript can't infer available table names
2. The `toDrizzleRelations` return type losing accessor information
3. Drizzle schema composition requiring manual type assertions

## Deliverables

### 1. Generic Identifier with SnakeTag Constraint

Update `Model` to use a generic identifier parameter constrained by `SnakeTag`:

```typescript
import type { SnakeTag } from "@beep/types/tag.types";

export const Model =
  <Self = never, Id extends SnakeTag = never>(identifier: Id) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${Id}")`>
    : [Id] extends [never]
      ? "Missing identifier - use Model<Self, 'table_name'>('table_name')({...})"
      : ModelClassWithVariants<Self, Fields, Id, ExtractColumnsType<Fields>, readonly string[], Id> => ...
```

The `SnakeTag` type enforces at compile-time:
- Lowercase letters only (a-z)
- Underscores as delimiters
- Must start with a lowercase letter
- No consecutive underscores
- No trailing underscores

### 2. Literal Type Preservation in toDrizzle

Ensure `toDrizzle` output preserves the literal table name:

```typescript
class Entity extends Model<Entity, "entity_table">("entity_table")({
  _rowId: Field(M.Generated(S.Int))({ column: { type: "integer", primaryKey: true, autoIncrement: true } }),
}) {}

const entityTable = toDrizzle(Entity);
// Type should be:
// PgTableWithColumns<{
//   name: "entity_table"  // <-- literal, not string
//   schema: undefined
//   columns: { _rowId: ... }
//   dialect: "pg"
// }>
```

### 3. Type-Safe Drizzle Relations

Update `toDrizzleRelations` to preserve table name literals in the return type:

```typescript
// Current (loses type info)
export const toDrizzleRelations = <...>(
  models: Models,
  drizzleTables: Tables
): Record<string, ReturnType<typeof drizzleRelations>> => ...

// Fixed (preserves type info)
export const toDrizzleRelations = <
  Models extends readonly ModelClass<...>[],
  Tables extends Record<string, PgTableWithColumns<any>>,
>(
  models: Models,
  drizzleTables: Tables
): {
  [K in Models[number]["tableName"] as `${K}Relations`]: ReturnType<typeof drizzleRelations>
} => ...
```

## Files to Modify

### Primary Files

1. **`packages/common/schema/src/integrations/sql/dsl/Model.ts`**
   - Add `Id extends SnakeTag` generic parameter
   - Update `MissingSelfGeneric` to include missing identifier case
   - Flow `Id` through to `ModelClassWithVariants` return type
   - Update `BaseClass.tableName` to use `identifier` directly (it's already snake_case)

2. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Update `ModelClass` interface TName constraint
   - Update `ModelClassWithVariants` interface TName constraint
   - Update `ModelStatics` interface TName constraint
   - Ensure all type parameters flow the literal through

3. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`**
   - Update `toDrizzle` generic constraints
   - Ensure `M["tableName"]` preserves the literal in return type

4. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle-relations.ts`**
   - Update `toDrizzleRelations` return type to preserve table name literals
   - Use mapped types instead of `Record<string, ...>`

### Type Definition Reference

**`packages/common/types/src/tag.types.ts`** (read-only reference):
```typescript
export type SnakeTag<S extends string = string> = S extends `${LowercaseLetter}${infer R}`
  ? ValidateSnakeAfterLetter<R, S>
  : never;

type ValidateSnakeAfterLetter<R extends string, Original extends string> = R extends ""
  ? Original
  : R extends `${LowercaseLetter}${infer Rest}`
    ? ValidateSnakeAfterLetter<Rest, Original>
    : R extends `${Underscore}${LowercaseLetter}${infer Rest}`
      ? ValidateSnakeAfterLetter<Rest, Original>
      : never;
```

**`packages/common/types/src/characters.ts`** (read-only reference):
```typescript
export type LowercaseLetter =
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i"
  | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r"
  | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
```

## Implementation Steps

### Phase 1: Update Model Function Signature

1. Import `SnakeTag` type in `Model.ts`:
   ```typescript
   import type { SnakeTag } from "@beep/types/tag.types";
   ```

2. Add `Id` generic parameter with constraint:
   ```typescript
   export const Model =
     <Self = never, Id extends SnakeTag = never>(identifier: Id) =>
   ```

3. Remove `toSnakeCase` call since identifier IS the table name:
   ```typescript
   // Remove: const tableName = toSnakeCase(identifier);
   // Use: identifier directly as tableName (it's already validated as snake_case)
   ```

4. Update error message type for missing identifier:
   ```typescript
   type MissingIdentifier = "Missing table name identifier - use Model<Self, 'table_name'>('table_name')({...})";
   ```

### Phase 2: Update Type Interfaces

1. In `types.ts`, update `ModelStatics`:
   ```typescript
   export interface ModelStatics<
     TName extends SnakeTag = SnakeTag,  // Changed from string
     Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
     PK extends readonly string[] = readonly string[],
     Id extends SnakeTag = SnakeTag,     // Changed from string
     Fields extends DSL.Fields = DSL.Fields,
   > {
     readonly tableName: TName;
     readonly columns: Columns;
     readonly primaryKey: PK;
     readonly identifier: Id;
     readonly _fields: Fields;
   }
   ```

2. Update `ModelClass` interface similarly.

3. Update `ModelClassWithVariants` interface similarly.

### Phase 3: Update Drizzle Adapters

1. In `drizzle.ts`, ensure `toDrizzle` preserves literals:
   ```typescript
   export const toDrizzle = <
     TName extends SnakeTag,
     Columns extends Record<string, ColumnDef>,
     PK extends readonly string[],
     Id extends SnakeTag,
     Fields extends DSL.Fields,
     M extends ModelStatics<TName, Columns, PK, Id, Fields>,
   >(model: M): PgTableWithColumns<{
     name: M["tableName"];  // Literal flows through
     schema: undefined;
     columns: BuildColumns<M["tableName"], DrizzleTypedBuildersFor<M["columns"], M["_fields"]>, "pg">;
     dialect: "pg";
   }> => ...
   ```

2. In `drizzle-relations.ts`, update return type:
   ```typescript
   export const toDrizzleRelations = <
     Models extends readonly ModelClass<unknown, DSL.Fields, SnakeTag, Record<string, ColumnDef>, readonly string[], SnakeTag>[],
     Tables extends Record<string, PgTableWithColumns<any>>,
   >(
     models: Models,
     drizzleTables: Tables
   ): {
     [M in Models[number] as `${M["tableName"]}Relations`]: ReturnType<typeof drizzleRelations>
   } => ...
   ```

### Phase 4: Update Tests

1. Update all test model definitions to use snake_case identifiers:
   ```typescript
   // Before
   class User extends Model<User>("User")({...}) {}

   // After
   class User extends Model<User, "user">("user")({...}) {}
   ```

2. Add compile-time tests for SnakeTag validation:
   ```typescript
   // @ts-expect-error - uppercase not allowed
   class Bad1 extends Model<Bad1, "User">("User")({}) {}

   // @ts-expect-error - spaces not allowed
   class Bad2 extends Model<Bad2, "user profile">("user profile")({}) {}

   // @ts-expect-error - must start with lowercase letter
   class Bad3 extends Model<Bad3, "_user">("_user")({}) {}

   // Valid
   class Good extends Model<Good, "user_profile">("user_profile")({}) {}
   ```

3. Add runtime tests verifying literal preservation:
   ```typescript
   it("should preserve table name literal type", () => {
     class Entity extends Model<Entity, "entity_table">("entity_table")({
       id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
     }) {}

     const table = toDrizzle(Entity);

     // Runtime check
     expect(table._.name).toBe("entity_table");

     // Type-level verification (compile-time)
     type TableName = typeof table._.name;
     type AssertLiteral = TableName extends "entity_table" ? true : false;
     const _check: AssertLiteral = true;
   });
   ```

## Validation Criteria

### Compile-Time

1. **Invalid identifiers produce type errors:**
   ```typescript
   // All should error
   Model<Self, "User">("User")         // uppercase
   Model<Self, "user-profile">         // hyphen
   Model<Self, "user profile">         // space
   Model<Self, "1user">                // starts with number
   Model<Self, "_user">                // starts with underscore
   Model<Self, "user__profile">        // double underscore
   Model<Self, "user_">                // trailing underscore
   ```

2. **Valid identifiers compile:**
   ```typescript
   // All should compile
   Model<Self, "user">("user")
   Model<Self, "user_profile">("user_profile")
   Model<Self, "organization_member_role">("organization_member_role")
   ```

3. **Table name literal preserved in Drizzle output:**
   ```typescript
   const users = toDrizzle(User);
   type Name = typeof users._.name;  // Should be "user", not string
   ```

### Runtime

1. All existing tests pass
2. `toDrizzle` produces correct table names
3. `toDrizzleRelations` produces correct relation config keys

## Repository Constraints (from AGENTS.md)

- Use Effect utilities (`A.map`, `Str.replace`, etc.) not native methods
- Use `effect/Predicate` for type guards, not `typeof`
- No `any` type assertions - use proper generics
- No `@ts-ignore` or `@ts-expect-error` (except in tests for negative cases)
- Import patterns:
  ```typescript
  import * as A from "effect/Array";
  import * as F from "effect/Function";
  import * as Str from "effect/String";
  import * as S from "effect/Schema";
  ```

## Test Commands

```bash
# Type checking
bun run check

# Run specific tests
bun test packages/common/schema/test/integrations/sql/dsl/

# Run all tests
bun run test
```

## Success Criteria

1. All 610+ existing tests pass
2. New compile-time tests verify SnakeTag constraint
3. `db.query.<tableName>` autocomplete works in IDE
4. No `as` type assertions required for table name access
5. Drizzle schema composition preserves type information

## Notes

- The `toSnakeCase` function in `Model.ts` can be removed since identifiers are now required to be snake_case
- Consider adding a runtime check that throws if identifier doesn't match SnakeTag pattern (defense in depth)
- The `Id` parameter in `ModelClassWithVariants` can be unified with `TName` since they're now the same (both snake_case table names)
