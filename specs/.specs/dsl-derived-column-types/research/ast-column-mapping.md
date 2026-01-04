# AST to ColumnType Mapping Research

This document tracks research findings for mapping Effect Schema AST types to PostgreSQL column types.

## AST Union Members

Document each member of `AST.AST` from `effect/SchemaAST`:

### Keyword Types

| AST Type           | Valid for Field? | Default ColumnType | PostgreSQL Type | Notes |
|--------------------|------------------|--------------------|-----------------|-------|
| `StringKeyword`    |                  |                    |                 |       |
| `NumberKeyword`    |                  |                    |                 |       |
| `BooleanKeyword`   |                  |                    |                 |       |
| `BigIntKeyword`    |                  |                    |                 |       |
| `SymbolKeyword`    |                  |                    |                 |       |
| `ObjectKeyword`    |                  |                    |                 |       |
| `UnknownKeyword`   |                  |                    |                 |       |
| `AnyKeyword`       |                  |                    |                 |       |
| `UndefinedKeyword` |                  |                    |                 |       |
| `VoidKeyword`      |                  |                    |                 |       |
| `NeverKeyword`     |                  |                    |                 |       |

### Composite Types

| AST Type          | Valid for Field? | Default ColumnType | PostgreSQL Type | Notes                         |
|-------------------|------------------|--------------------|-----------------|-------------------------------|
| `Literal`         |                  |                    |                 | Depends on literal value type |
| `Enums`           |                  |                    |                 | TypeScript enum               |
| `TemplateLiteral` |                  |                    |                 | Template literal strings      |
| `TupleType`       |                  |                    |                 | Fixed-length arrays           |
| `TypeLiteral`     |                  |                    |                 | Object/struct types           |
| `Union`           |                  |                    |                 | Union of types                |

### Wrapper Types

| AST Type         | Valid for Field? | Default ColumnType | PostgreSQL Type | Notes                             |
|------------------|------------------|--------------------|-----------------|-----------------------------------|
| `Suspend`        |                  |                    |                 | Lazy/recursive schemas            |
| `Refinement`     |                  |                    |                 | Validated types (UUID, Int, etc.) |
| `Transformation` |                  |                    |                 | Encoded/decoded transformations   |
| `Declaration`    |                  |                    |                 | Custom declarations               |

## Special Schema Patterns

### UUID Detection

- Schema: `S.UUID`
- AST Structure: `Refinement` over `StringKeyword`
- Detection Method:
- Recommended ColumnType: `"uuid"`

### Integer Detection

- Schema: `S.Int`
- AST Structure: `Refinement` over `NumberKeyword`
- Detection Method:
- Recommended ColumnType: `"integer"`

### Date/DateTime Detection

- Schema: `S.Date`, `S.DateFromString`, `S.DateTimeUtc`
- AST Structure: `Transformation`
- Detection Method:
- Recommended ColumnType: `"datetime"`

### Nullable Unions

- Schema: `S.NullOr(A)`, `S.UndefinedOr(A)`, `S.NullishOr(A)`
- AST Structure: `Union` with null/undefined member
- Detection Method:
- Recommended ColumnType: Derived from non-null member

### Branded Types

- Schema: `S.String.pipe(S.brand("UserId"))`
- AST Structure:
- Detection Method:
- Recommended ColumnType: Derived from base type

### Enums (TypeScript)

- Schema: `S.Enums(MyEnum)`
- AST Structure: `Enums`
- Detection Method:
- Recommended ColumnType: `"string"` or `"enum"` (new?)

## Invalid Schemas

List schemas that should throw errors when used with Field:

| Schema        | Reason |
|---------------|--------|
| `S.Never`     |        |
| `S.Void`      |        |
| `S.Undefined` |        |
| `S.Symbol`    |        |
|               |        |

## New ColumnType Literals

Determine if any new literals should be added:

| Proposed Literal | PostgreSQL Type | Use Case          | Priority |
|------------------|-----------------|-------------------|----------|
| `"bigint"`       | BIGINT          | Large integers    |          |
| `"enum"`         | ENUM            | Native PG enums   |          |
| `"date"`         | DATE            | Date without time |          |
| `"array"`        | ARRAY           | Typed arrays      |          |
|                  |                 |                   |          |

## Edge Cases

### Nested Transformations

Example: `S.DateFromString.pipe(S.nullable)`
- How to handle?
- Recommended approach:

### Multiple Refinements

Example: `S.String.pipe(S.minLength(1), S.maxLength(100), S.brand("Name"))`
- How to handle?
- Recommended approach:

### Complex Unions

Example: `S.Union(S.String, S.Number, S.Boolean)`
- How to handle?
- Recommended approach:

### Recursive Schemas

Example: `S.Struct({ children: S.suspend(() => TreeNode) })`
- How to handle?
- Recommended approach:

## Final Mapping Table

After research iterations, document the final recommended mapping:

| AST Type | ColumnType | Fallback | Notes |
|----------|------------|----------|-------|
|          |            |          |       |

## Open Questions

1.
2.
3.
