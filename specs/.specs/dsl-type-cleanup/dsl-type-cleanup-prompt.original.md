# DSL Types Cleanup: Nested Ternary to Distributive Key Remapping

## Objective

Refactor types in `packages/common/schema/src/integrations/sql/dsl/types.ts` that use deeply nested ternary conditional types to use the cleaner **distributive key remapping** / **conditional key extraction** pattern.

## The Problem: Nested Ternary Conditional Types

Nested ternary conditional types become difficult to read, maintain, and extend:

```typescript
// BEFORE: Hard to read, error-prone, doesn't scale
export type ColumnTypeToTS<T extends ColumnType> = T extends "string" | "uuid"
  ? string
  : T extends "number" | "integer"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "datetime"
        ? string | Date
        : T extends "json"
          ? object | unknown[] | Record<string, unknown>
          : T extends "bigint"
            ? bigint
            : never;
```

Issues with this pattern:
1. **Deep nesting** makes the type hard to follow
2. **Adding new cases** requires finding the right place in the chain
3. **Related mappings** (e.g., input vs output types) require duplicate logic
4. **No single source of truth** for the type relationships

## The Solution: Distributive Key Remapping

Use a **config interface** as a single source of truth, then derive types via indexed access:

```typescript
// AFTER: Clean, scalable, single source of truth
export interface ColumnTypeConfig {
  readonly string: { readonly output: string; readonly accepts: string };
  readonly uuid: { readonly output: string; readonly accepts: string };
  readonly number: { readonly output: number; readonly accepts: number };
  readonly integer: { readonly output: number; readonly accepts: number };
  readonly boolean: { readonly output: boolean; readonly accepts: boolean };
  readonly datetime: { readonly output: string | Date; readonly accepts: string | Date };
  readonly json: { readonly output: unknown; readonly accepts: JsonColumnInput };
  readonly bigint: { readonly output: bigint; readonly accepts: bigint };
}

// Simple indexed access - no conditionals needed!
export type ColumnTypeToTS<T extends ColumnType.Type> = ColumnTypeConfig[T]["output"];

// Reverse mapping uses conditional key extraction
export type TSToColumnTypes<T> = {
  readonly [K in ColumnType.Type]: [T] extends [ColumnTypeConfig[K]["accepts"]] ? K : never;
}[ColumnType.Type];
```

### Why This Pattern Is Better

1. **Single source of truth**: All type relationships in one interface
2. **Easy to extend**: Add a new column type by adding one entry
3. **Self-documenting**: The config clearly shows input/output relationships
4. **Type-safe**: TypeScript ensures the config is exhaustive
5. **Composable**: Multiple derived types from same config

## Pattern Mechanics

### Forward Mapping (Config Key -> Type)

When you have a discriminated key and want the corresponding type:

```typescript
// Config as source of truth
interface Config {
  readonly a: TypeA;
  readonly b: TypeB;
  readonly c: TypeC;
}

// Direct indexed access - no conditionals!
type GetType<K extends keyof Config> = Config[K];
```

### Reverse Mapping (Type -> Config Keys)

When you have a type and want the matching config keys:

```typescript
// Iterate all keys, keep those where type matches, collect via indexed access
type GetKeys<T> = {
  readonly [K in keyof Config]: [T] extends [Config[K]] ? K : never;
}[keyof Config];
```

### Multi-Property Configs

For complex mappings with multiple related types:

```typescript
interface Config {
  readonly a: { readonly input: InputA; readonly output: OutputA };
  readonly b: { readonly input: InputB; readonly output: OutputB };
}

type GetInput<K extends keyof Config> = Config[K]["input"];
type GetOutput<K extends keyof Config> = Config[K]["output"];

// Reverse lookup still works
type GetKeysByOutput<T> = {
  readonly [K in keyof Config]: [T] extends [Config[K]["output"]] ? K : never;
}[keyof Config];
```

## Types to Refactor

The following types in `types.ts` use nested ternary patterns and should be refactored:

### High Priority (Direct Mappings)

#### 1. `IsSchemaColumnCompatible` (lines 73-95)

**Current** (nested ternary):
```typescript
export type IsSchemaColumnCompatible<SchemaEncoded, ColType extends ColumnType.Type> =
  ColType extends "string" | "uuid"
    ? [StripNullable<SchemaEncoded>] extends [string] ? true : ...
    : ColType extends "datetime"
      ? [StripNullable<SchemaEncoded>] extends [string | Date] ? true : false
      : ColType extends "number" | "integer"
        ? ...
```

**Suggested approach**: Add an `accepts` property to `ColumnTypeConfig` (already done), then:
```typescript
export type IsSchemaColumnCompatible<SchemaEncoded, ColType extends ColumnType.Type> =
  [StripNullable<SchemaEncoded>] extends [ColumnTypeConfig[ColType]["accepts"]] ? true : false;
```

#### 2. `PrettyPrintType` (lines 102-114)

**Current**:
```typescript
export type PrettyPrintType<T> = [T] extends [string]
  ? "string"
  : [T] extends [number]
    ? "number"
    : [T] extends [boolean]
      ? "boolean"
      : [T] extends [Date]
        ? "Date"
        : [T] extends [readonly unknown[]]
          ? "Array"
          : [T] extends [object]
            ? "object"
            : "unknown";
```

**Suggested approach**:
```typescript
interface PrettyPrintConfig {
  readonly string: "string";
  readonly number: "number";
  readonly boolean: "boolean";
  readonly Date: "Date";
  readonly Array: "Array";
  readonly object: "object";
}

// Note: Order matters for overlapping types (Date before object, Array before object)
// May need special handling for type precedence
```

### Medium Priority (Schema Derivation)

#### 3. `DeriveColumnTypeFromEncoded` (lines 219-248)

This is complex because it needs to handle:
- `any` and `unknown` checks (via `IsAny`, `IsUnknown`)
- Type precedence (Date before object, Array before object)
- Nullable stripping

**Suggested approach**: Create a precedence-aware config:
```typescript
interface EncodedTypeConfig {
  readonly date: { readonly check: Date; readonly result: "datetime" };
  readonly array: { readonly check: readonly unknown[]; readonly result: "json" };
  readonly object: { readonly check: object; readonly result: "json" };
  readonly string: { readonly check: string; readonly result: "string" };
  readonly number: { readonly check: number; readonly result: "number" };
  readonly boolean: { readonly check: boolean; readonly result: "boolean" };
  readonly bigint: { readonly check: bigint; readonly result: "bigint" };
}
```

Note: This may require a hybrid approach due to precedence requirements.

#### 4. `DeriveColumnTypeFromSchemaSpecific` (lines 346-390)

Maps specific schema types (like `S.Int`, `S.UUID`) to column types.

**Suggested approach**:
```typescript
interface SchemaTypeConfig {
  readonly Int: "integer";
  readonly Positive: "number";
  readonly Negative: "number";
  readonly NonPositive: "number";
  readonly NonNegative: "number";
  readonly UUID: "uuid";
  readonly ULID: "uuid";
  readonly DateFromString: "datetime";
  readonly Date: "datetime";
  readonly DateTimeUtc: "datetime";
  readonly DateTimeUtcFromSelf: "datetime";
  readonly BigInt: "bigint";
  readonly BigIntFromSelf: "bigint";
}
```

#### 5. `DeriveFromTypeParameter` (lines 403-423)

Similar to `DeriveColumnTypeFromEncoded` but for type parameters.

### Lower Priority (Complex Extraction)

#### 6. `ExtractFieldSchema` (lines 988-1010)

Handles multiple field wrapper types (DSLVariantField, VariantSchema.Field, DSLField, Schema, PropertySignature).

#### 7. `ExtractEncodedType` (lines 1116-1148)

Similar structure to `ExtractFieldSchema`.

#### 8. `FieldResult` (lines 924-938)

Maps input types to result types.

#### 9. `ExtractVariantSelectEncoded` / `ExtractVariantSelectSchema` (lines 149-177)

Extracts types from variant configs.

### Adapter Files

#### 10. `DrizzleBaseBuilderFor` in `adapters/drizzle.ts` (lines 44-62)

Maps `ColumnType.Type` to the corresponding Drizzle builder type.

**Current** (nested ternary):
```typescript
type DrizzleBaseBuilderFor<Name extends string, T extends ColumnType.Type, AI extends boolean> =
  T extends "string"
    ? PgTextBuilderInitial<Name, [string, ...string[]]>
    : T extends "number"
      ? PgIntegerBuilderInitial<Name>
      : T extends "integer"
        ? AI extends true
          ? PgSerialBuilderInitial<Name>
          : PgIntegerBuilderInitial<Name>
        : T extends "boolean"
          ? PgBooleanBuilderInitial<Name>
          : T extends "datetime"
            ? PgTimestampBuilderInitial<Name>
            : T extends "uuid"
              ? PgUUIDBuilderInitial<Name>
              : T extends "json"
                ? PgJsonbBuilderInitial<Name>
                : T extends "bigint"
                  ? PgBigInt53BuilderInitial<Name>
                  : never;
```

**Suggested approach**:
```typescript
interface DrizzleBuilderConfig<Name extends string> {
  readonly string: PgTextBuilderInitial<Name, [string, ...string[]]>;
  readonly number: PgIntegerBuilderInitial<Name>;
  readonly integer: PgIntegerBuilderInitial<Name>;  // Base case, serial handled separately
  readonly boolean: PgBooleanBuilderInitial<Name>;
  readonly datetime: PgTimestampBuilderInitial<Name>;
  readonly uuid: PgUUIDBuilderInitial<Name>;
  readonly json: PgJsonbBuilderInitial<Name>;
  readonly bigint: PgBigInt53BuilderInitial<Name>;
}

// Note: The autoIncrement case for "integer" -> PgSerialBuilderInitial may need
// special handling since it depends on the AI type parameter
type DrizzleBaseBuilderFor<Name extends string, T extends ColumnType.Type, AI extends boolean> =
  T extends "integer"
    ? AI extends true
      ? PgSerialBuilderInitial<Name>
      : DrizzleBuilderConfig<Name>[T]
    : DrizzleBuilderConfig<Name>[T];
```

#### 11. `ColumnSchema` in `adapters/drizzle-to-effect-schema.ts` (lines 15-49)

Maps Drizzle column metadata to the corresponding Effect Schema type. This is a deeply nested type that checks `dataType`, `enumValues`, `columnType`, and `mode`.

**Current** (deeply nested ternary):
```typescript
type ColumnSchema<TColumn extends Drizzle.Column> = TColumn["dataType"] extends "custom"
  ? S.Schema<any>
  : TColumn["dataType"] extends "json"
    ? S.Schema<JsonValue>
    : TColumn extends { enumValues: [string, ...string[]] }
      ? Drizzle.Equal<TColumn["enumValues"], [string, ...string[]]> extends true
        ? S.Schema<string>
        : S.Schema<TColumn["enumValues"][number]>
      : TColumn["dataType"] extends "bigint"
        ? S.Schema<bigint, bigint>
        : TColumn["dataType"] extends "number"
          ? TColumn["columnType"] extends `PgBigInt${number}`
            ? S.Schema<bigint, number>
            : S.Schema<number, number>
          : TColumn["columnType"] extends "PgNumeric"
            ? S.Schema<number, string>
            : TColumn["columnType"] extends "PgUUID"
              ? S.Schema<string>
              : TColumn["columnType"] extends "PgDate"
                ? TColumn extends { mode: "string" }
                  ? S.Schema<string, string>
                  : S.Schema<Date, string>
                : TColumn["columnType"] extends "PgTimestamp"
                  ? TColumn extends { mode: "string" }
                    ? S.Schema<string, string>
                    : S.Schema<Date, string>
                  : TColumn["dataType"] extends "string"
                    ? S.Schema<string, string>
                    : TColumn["dataType"] extends "boolean"
                      ? S.Schema<boolean>
                      : TColumn["dataType"] extends "date"
                        ? TColumn extends { mode: "string" }
                          ? S.Schema<string>
                          : S.Schema<Date>
                        : S.Schema<any>;
```

**Suggested approach**: Create a config that maps `dataType` and `columnType` combinations:
```typescript
// Base mapping for simple dataType -> Schema
interface DataTypeSchemaConfig {
  readonly custom: S.Schema<any>;
  readonly json: S.Schema<JsonValue>;
  readonly bigint: S.Schema<bigint, bigint>;
  readonly number: S.Schema<number, number>;
  readonly string: S.Schema<string, string>;
  readonly boolean: S.Schema<boolean>;
  readonly date: S.Schema<Date>;
}

// Overrides for specific columnTypes
interface ColumnTypeSchemaConfig {
  readonly PgNumeric: S.Schema<number, string>;
  readonly PgUUID: S.Schema<string>;
  readonly PgDate: { readonly string: S.Schema<string, string>; readonly date: S.Schema<Date, string> };
  readonly PgTimestamp: { readonly string: S.Schema<string, string>; readonly date: S.Schema<Date, string> };
}

// Note: This type has complex conditional logic around:
// - enum detection and value extraction
// - PgBigInt${number} pattern matching
// - mode: "string" checks
// May need a hybrid approach or multiple config interfaces
```

**Complexity note**: This type is particularly challenging because it:
1. Checks `enumValues` existence and content
2. Uses template literal pattern matching (`PgBigInt${number}`)
3. Has mode-dependent behavior for date/timestamp types
4. Falls back to `S.Schema<any>` for unknown types

Consider breaking this into smaller helper types that each use the config pattern.

## Refactoring Guidelines

### Do's

1. **Start with the config interface** - Define all cases in one place
2. **Use tuple wrapping** for type comparisons: `[T] extends [X]` prevents distribution
3. **Keep related types together** - Input/output pairs, forward/reverse mappings
4. **Add JSDoc comments** explaining the config structure
5. **Verify exhaustiveness** - The config should cover all cases
6. **Test edge cases** - `any`, `unknown`, `never`, nullable types

### Don'ts

1. **Don't break existing behavior** - This is a refactor, not a redesign
2. **Don't force the pattern** where it doesn't fit (e.g., truly sequential checks with precedence)
3. **Don't remove the `IsAny`/`IsUnknown` guards** - These catch important edge cases
4. **Don't change the public API** - Same type names, same parameters, same results

### Hybrid Approaches

Some types may need a hybrid approach:

```typescript
// When precedence matters, use the config for the mapping but conditionals for precedence
type DeriveType<T> =
  IsAny<T> extends true ? "json" :
  IsUnknown<T> extends true ? "json" :
  DeriveFromConfig<T>;

// The config handles the actual type -> result mapping
type DeriveFromConfig<T> = {
  readonly [K in keyof TypeConfig]: [T] extends [TypeConfig[K]["check"]]
    ? TypeConfig[K]["result"]
    : never;
}[keyof TypeConfig];
```

## Testing Your Changes

After refactoring, verify:

1. **Type inference still works**:
   ```typescript
   type Test1 = ColumnTypeToTS<"string">; // Should be: string
   type Test2 = TSToColumnTypes<number>;  // Should be: "number" | "integer"
   ```

2. **Run type checks**:
   ```bash
   bun run check --filter=@beep/schema
   ```

3. **Run tests**:
   ```bash
   bun run test --filter=@beep/schema
   ```

4. **Check dependent code** compiles without errors

## Success Criteria

- [ ] All nested ternary types in `types.ts` converted to config-based patterns (where feasible)
- [ ] `DrizzleBaseBuilderFor` in `adapters/drizzle.ts` refactored to use config pattern
- [ ] `ColumnSchema` in `adapters/drizzle-to-effect-schema.ts` refactored (may need hybrid approach)
- [ ] No changes to public type signatures
- [ ] All existing tests pass
- [ ] Type checking passes across the monorepo
- [ ] Code is more readable and maintainable
- [ ] New patterns are documented with JSDoc comments

## Files to Modify

- `packages/common/schema/src/integrations/sql/dsl/types.ts` (primary)
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle-to-effect-schema.ts`

## Reference

The `ColumnTypeConfig` pattern was established with this refactoring:

```typescript
// Already implemented - use as reference
export interface ColumnTypeConfig {
  readonly string: { readonly output: string; readonly accepts: string };
  readonly uuid: { readonly output: string; readonly accepts: string };
  readonly number: { readonly output: number; readonly accepts: number };
  readonly integer: { readonly output: number; readonly accepts: number };
  readonly boolean: { readonly output: boolean; readonly accepts: boolean };
  readonly datetime: { readonly output: string | Date; readonly accepts: string | Date };
  readonly json: { readonly output: unknown; readonly accepts: JsonColumnInput };
  readonly bigint: { readonly output: bigint; readonly accepts: bigint };
}

export type ColumnTypeToTS<T extends ColumnType.Type> = ColumnTypeConfig[T]["output"];

export type TSToColumnTypes<T> = {
  readonly [K in ColumnType.Type]: [T] extends [ColumnTypeConfig[K]["accepts"]] ? K : never;
}[ColumnType.Type];
```
