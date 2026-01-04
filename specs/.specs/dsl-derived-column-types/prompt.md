# DSL Derived Column Types

## Overview

This feature extends the DSL Field system to automatically derive default column types from Effect Schema AST when no explicit `type` is specified in `FieldConfig`. This follows the same pattern as the recently implemented derived nullability feature.

Currently, when a field is defined without a `type` property, it defaults to `"string"`:

```typescript
// Current behavior - always defaults to "string"
const field = Field(S.Int)({});  // type: "string" (wrong!)
const field = Field(S.Boolean)({});  // type: "string" (wrong!)
```

The goal is to derive sensible defaults based on the schema's encoded type:

```typescript
// Target behavior - derives from schema AST
const field = Field(S.Int)({});  // type: "integer" (derived!)
const field = Field(S.Boolean)({});  // type: "boolean" (derived!)
const field = Field(S.String)({});  // type: "string" (derived!)
```

## Research Phase (MUST COMPLETE FIRST)

Before implementing any code changes, you MUST conduct thorough research using sub-agents. This research phase is critical.

### Step 1: Deploy Effect Researchers

Launch a cluster of `effect-researcher` sub-agents to investigate:

1. **Valid Schemas for Field**: Determine which Effect Schema patterns are valid inputs to the `Field()` function. Some schemas should cause compile-time or runtime errors:
   - `S.Undefined` - Not valid (columns cannot be purely undefined)
   - `S.Never` - Not valid (no valid values)
   - `S.Void` - Not valid (no serializable representation)
   - Recursive schemas without base case

2. **Schema AST Union Members**: Document ALL members of `AST.AST` union from `effect/SchemaAST`:
   - `StringKeyword`
   - `NumberKeyword`
   - `BooleanKeyword`
   - `BigIntKeyword`
   - `SymbolKeyword`
   - `ObjectKeyword`
   - `UnknownKeyword`
   - `AnyKeyword`
   - `UndefinedKeyword`
   - `VoidKeyword`
   - `NeverKeyword`
   - `Literal`
   - `Enums`
   - `TemplateLiteral`
   - `TupleType`
   - `TypeLiteral`
   - `Union`
   - `Suspend`
   - `Refinement`
   - `Transformation`
   - `Declaration`

3. **Optimal Column Type Mapping**: For each valid AST type, determine the optimal default `ColumnType`:

   | AST Type            | Recommended ColumnType        | Reasoning                   |
   |---------------------|-------------------------------|-----------------------------|
   | `StringKeyword`     | `"string"`                    | Direct mapping to TEXT      |
   | `NumberKeyword`     | `"number"`                    | DOUBLE PRECISION for floats |
   | `BooleanKeyword`    | `"boolean"`                   | Direct mapping to BOOLEAN   |
   | `BigIntKeyword`     | `"bigint"` (new?)             | BIGINT for large integers   |
   | `Literal` (string)  | `"string"`                    | TEXT for string literals    |
   | `Literal` (number)  | `"integer"` or `"number"`     | Depends on literal value    |
   | `Literal` (boolean) | `"boolean"`                   | BOOLEAN                     |
   | `Literal` (null)    | ERROR                         | Cannot be column type alone |
   | `Enums`             | `"string"` or `"enum"` (new?) | Native PG ENUM?             |
   | `TemplateLiteral`   | `"string"`                    | TEXT                        |
   | `TupleType`         | `"json"`                      | JSONB for arrays            |
   | `TypeLiteral`       | `"json"`                      | JSONB for objects           |
   | `Union`             | Derived from members          | See special handling        |
   | `Refinement`        | Derived from base             | Pass through to `.from`     |
   | `Transformation`    | Derived from encoded          | Use `.from` (encoded side)  |
   | `Suspend`           | Derived recursively           | Handle circular refs        |
   | `Declaration`       | Derived from type             | UUID, Date, etc.            |

### Step 2: Special Case Analysis

Research these special cases in detail:

1. **UUID Detection**: `S.UUID` is a Refinement of String. Should detect and default to `"uuid"`.

2. **Date/DateTime Detection**: `S.Date`, `S.DateFromString`, `S.DateTimeUtc` transformations should default to `"datetime"`.

3. **Integer Detection**: `S.Int` is a Refinement. Should detect and default to `"integer"` not `"number"`.

4. **Union Handling**: For `S.Union(A, B)`:
   - If all members have same derived type, use that type
   - If nullable union (`S.NullOr(A)`), use the non-null member's type
   - If heterogeneous types, fallback to `"json"`

5. **Branded Types**: `S.String.pipe(S.brand("UserId"))` - should derive from base type.

6. **New Column Types**: Determine if we need to add:
   - `"bigint"` for BigInt schemas
   - `"enum"` for native PostgreSQL enums
   - `"date"` vs `"datetime"` distinction
   - `"array"` for typed arrays

### Step 3: Review and Critique (3+ Iterations)

After initial research, conduct at least 3 review iterations:

**Iteration 1**: Cross-reference findings with:
- Effect Schema source code
- Drizzle ORM column types
- PostgreSQL native types

**Iteration 2**: Validate edge cases:
- Nested transformations
- Multiple refinements
- Complex unions
- Recursive schemas

**Iteration 3**: Finalize recommendations:
- Create definitive mapping table
- Document error cases
- Identify any gaps in ColumnType literals

### Step 4: Research Checkpoint

**STOP HERE AND NOTIFY THE USER** before proceeding to implementation.

Present your findings:
1. Complete AST → ColumnType mapping table
2. List of invalid schemas (should error)
3. Recommended new ColumnType literals (if any)
4. Edge cases and their handling
5. Any open questions or uncertainties

Wait for user approval before implementing.

---

## Implementation Phase

Only proceed after research is approved.

### Key Files to Modify

1. **`packages/common/schema/src/integrations/sql/dsl/literals.ts`**
   - Add any new ColumnType literals identified in research

2. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Update ColumnType if new literals added
   - May need type-level AST → ColumnType mapping

3. **`packages/common/schema/src/integrations/sql/dsl/Field.ts`**
   - Add `deriveColumnType(ast: AST.AST): ColumnType.Type` function
   - Update default `type` to use derived value instead of `"string"`
   - Handle error cases for invalid schemas

4. **`packages/common/schema/src/integrations/sql/dsl/combinators.ts`**
   - Update type-level inference if needed
   - Ensure explicit type setters still override derived defaults

5. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`**
   - Verify runtime column building still works with derived types

### Implementation Pattern

Follow the pattern from derived nullability:

```typescript
import * as AST from "effect/SchemaAST";
import * as Match from "effect/Match";

/**
 * Derives the default column type from a Schema AST.
 * Analyzes the encoded side of transformations.
 *
 * @throws Error for invalid schema types (Never, Void, etc.)
 */
export const deriveColumnType = (
  ast: AST.AST,
  visited: WeakSet<AST.AST> = new WeakSet()
): ColumnType.Type => {
  if (visited.has(ast)) {
    // Circular reference - default to json
    return "json";
  }
  visited.add(ast);

  return Match.value(ast).pipe(
    Match.tag("StringKeyword", () => "string"),
    Match.tag("NumberKeyword", () => "number"),
    Match.tag("BooleanKeyword", () => "boolean"),
    Match.tag("BigIntKeyword", () => "bigint"), // if added
    Match.tag("Literal", (lit) => {
      if (typeof lit.literal === "string") return "string";
      if (typeof lit.literal === "number") return "integer";
      if (typeof lit.literal === "boolean") return "boolean";
      throw new Error(`Invalid literal type for column: ${typeof lit.literal}`);
    }),
    Match.tag("Refinement", (r) => {
      // Check for known refinements (UUID, Int, etc.)
      // Fall back to deriving from base
      return deriveColumnType(r.from, visited);
    }),
    Match.tag("Transformation", (t) => {
      // Use encoded side
      return deriveColumnType(t.from, visited);
    }),
    Match.tag("Union", (u) => {
      // Handle nullable unions, enum unions, etc.
      return deriveUnionColumnType(u, visited);
    }),
    Match.tag("TypeLiteral", () => "json"),
    Match.tag("TupleType", () => "json"),
    Match.tag("Suspend", (s) => deriveColumnType(s.f(), visited)),
    // Error cases
    Match.tag("NeverKeyword", () => {
      throw new Error("Never type cannot be used as column");
    }),
    Match.tag("VoidKeyword", () => {
      throw new Error("Void type cannot be used as column");
    }),
    Match.orElse(() => "string") // Safe fallback
  );
};
```

### Type-Level Derivation (Optional Enhancement)

For full type safety, implement type-level column derivation:

```typescript
/**
 * Type-level derivation of ColumnType from Schema AST.
 * Mirrors runtime deriveColumnType for compile-time checking.
 */
type DeriveColumnType<T extends AST.AST> =
  T extends AST.StringKeyword ? "string" :
  T extends AST.NumberKeyword ? "number" :
  T extends AST.BooleanKeyword ? "boolean" :
  T extends AST.Refinement ? DeriveColumnType<T["from"]> :
  T extends AST.Transformation ? DeriveColumnType<T["from"]> :
  // ... etc
  "string"; // fallback
```

### Test Cases

Create comprehensive tests in `packages/common/schema/test/integrations/sql/dsl/`:

```typescript
describe("deriveColumnType", () => {
  it("derives string for S.String", () => {
    const field = Field(S.String)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("derives integer for S.Int", () => {
    const field = Field(S.Int)({});
    expect(field[ColumnMetaSymbol].type).toBe("integer");
  });

  it("derives boolean for S.Boolean", () => {
    const field = Field(S.Boolean)({});
    expect(field[ColumnMetaSymbol].type).toBe("boolean");
  });

  it("derives uuid for S.UUID", () => {
    const field = Field(S.UUID)({});
    expect(field[ColumnMetaSymbol].type).toBe("uuid");
  });

  it("derives datetime for S.Date", () => {
    const field = Field(S.Date)({});
    expect(field[ColumnMetaSymbol].type).toBe("datetime");
  });

  it("derives json for S.Struct", () => {
    const field = Field(S.Struct({ a: S.String }))({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });

  it("derives from non-null member in NullOr", () => {
    const field = Field(S.NullOr(S.Int))({});
    expect(field[ColumnMetaSymbol].type).toBe("integer");
  });

  it("explicit type overrides derived", () => {
    const field = Field(S.String)({ column: { type: "uuid" } });
    expect(field[ColumnMetaSymbol].type).toBe("uuid");
  });

  it("throws for S.Never", () => {
    expect(() => Field(S.Never)({})).toThrow();
  });
});
```

---

## Reference: Current ColumnType Literals

From `packages/common/schema/src/integrations/sql/dsl/literals.ts`:

```typescript
export const ColumnType = S.Literal(
  "string",
  "integer",
  "number",
  "boolean",
  "datetime",
  "uuid",
  "json"
);
```

---

## Reference: Existing Files

Review these files before implementing:

1. `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Field function
2. `packages/common/schema/src/integrations/sql/dsl/types.ts` - DSLField, ColumnDef types
3. `packages/common/schema/src/integrations/sql/dsl/combinators.ts` - Pipe-friendly combinators
4. `packages/common/schema/src/integrations/sql/dsl/nullability.ts` - isNullable implementation (reference pattern)
5. `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` - Drizzle adapter

---

## Success Criteria

1. Fields without explicit `type` derive sensible defaults from Schema AST
2. Explicit `type` in FieldConfig overrides derived defaults
3. Invalid schemas throw clear error messages
4. All existing tests pass
5. New comprehensive test suite for derived column types
6. Type-level inference works correctly (IDE shows correct types)
7. No regressions in Drizzle adapter column building

---

## Commands

```bash
# Run tests for the dsl package
bun test packages/common/schema/test/integrations/sql/dsl/

# Type check
bun run check

# Build
bun run build
```
