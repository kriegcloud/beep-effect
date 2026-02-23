# derive-column-type.ts + nullability.ts Analysis Report

## Overview

These modules form the core AST analysis layer for runtime derivation of SQL column types and nullability constraints.

**Locations**:
- `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` (~450 lines)
- `packages/common/schema/src/integrations/sql/dsl/nullability.ts` (~115 lines)

## derive-column-type.ts

### Main Function

```typescript
deriveColumnType(ast: AST.AST, visited: WeakSet<AST.AST>): ColumnType.Type
```

- Uses `Match.discriminatorsExhaustive("_tag")` for exhaustive AST matching
- Circular reference protection via WeakSet
- Returns: `"string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json" | "bigint"`

### Column Type Mapping

| AST Node | Column Type |
|----------|-------------|
| StringKeyword, TemplateLiteral | `"string"` |
| NumberKeyword | `"number"` |
| BooleanKeyword | `"boolean"` |
| BigIntKeyword | `"bigint"` |
| Refinement + UUID/ULID SchemaId | `"uuid"` |
| Refinement + Int SchemaId | `"integer"` |
| Transformation + Date identifier | `"datetime"` |
| Transformation + BigInt identifier | `"bigint"` |
| TupleType, TypeLiteral, Object | `"json"` |
| Union (homogeneous) | Base type |
| Union (heterogeneous) | `"json"` |
| NeverKeyword, VoidKeyword, etc. | Throws UnsupportedColumnTypeError |

### SchemaId Detection

Uses custom schema ID classes extending `S.UniqueSymbolFromSelf`:
- `UUIDSchemaId` for S.UUID
- `ULIDSchemaId` for S.ULID
- `IntSchemaId` for S.Int
- `DateSchemaId` for Date variants
- `BigIntSchemaId` for BigInt variants

## nullability.ts

### Main Function

```typescript
isNullable(ast: AST.AST, side: "from" | "to" = "from", visited: WeakSet<AST.AST>): boolean
```

- `side: "from"` = encoded/database side (default)
- `side: "to"` = decoded/TypeScript side

### Nullability Rules

| AST Node | Nullable? |
|----------|-----------|
| UndefinedKeyword, VoidKeyword | Yes |
| Literal(null) | Yes |
| Union | Yes if ANY member nullable |
| Refinement | Check `from` |
| Transformation | Check specified side |
| All primitives | No |

## Interaction with ColumnDef

| Location | Usage |
|----------|-------|
| Field.ts:260 | `columnDef = { type: deriveColumnType(...), ... }` |
| combinators.ts:31-35 | Import for type derivation |
| validate.ts:360 | `isNullableField` parameter |
| types.ts:444-450 | Type-level derivation mirrors runtime |

## Challenges

1. **Union Type Ambiguity** — Heterogeneous unions fallback to `"json"`
2. **Circular Reference Handling** — Defaults to `"json"` (may lose precision)
3. **Transformation Side Selection** — Must select correct side for nullability
4. **Type-Level vs Runtime Mismatch** — Must stay synchronized with types.ts

## Recommendations

1. **Extract Common AST Analysis Patterns** — Shared traversal with circularity handling
2. **Consolidate SchemaId Detection** — Unified module for all schema ID checks
3. **Complete Declaration Node Handling** — Add all Date/BigInt variants
4. **Document Union Handling Strategy** — Explain filter-dedupe-fallback logic
5. **Add Schema Caching** — WeakMap cache for repeated derivation calls
