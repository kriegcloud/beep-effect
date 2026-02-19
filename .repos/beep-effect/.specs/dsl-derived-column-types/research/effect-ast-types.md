# Effect SchemaAST.AST Union Type - Complete Reference

## Executive Summary

The `AST` type from `effect/SchemaAST` is a discriminated union with **22 distinct _tag values**. This document provides a comprehensive reference of all AST node types, their purposes, and their structural characteristics.

## Research Sources

- **Effect Documentation**: SchemaAST.AST type reference (Document ID: 9495)
- **Source Code Analysis**: `/node_modules/effect/dist/dts/SchemaAST.d.ts` (Effect 3.10.0+)
- **Method**: Direct examination of type definitions and class declarations

## AST Union Type Definition

From the Effect documentation and source code:

```typescript
type AST =
  | Declaration
  | Literal
  | UniqueSymbol
  | UndefinedKeyword
  | VoidKeyword
  | NeverKeyword
  | UnknownKeyword
  | AnyKeyword
  | StringKeyword
  | NumberKeyword
  | BooleanKeyword
  | BigIntKeyword
  | SymbolKeyword
  | ObjectKeyword
  | Enums
  | TemplateLiteral
  // possible transformations
  | Refinement
  | TupleType
  | TypeLiteral
  | Union
  | Suspend
  // transformations
  | Transformation
```

## Complete _tag Reference

### Primitive Keyword Types (9 types)

These represent TypeScript's built-in primitive types:

| _tag                 | Type Class         | Purpose                     | Example Schema |
|----------------------|--------------------|-----------------------------|----------------|
| `"StringKeyword"`    | `StringKeyword`    | Represents `string` type    | `S.String`     |
| `"NumberKeyword"`    | `NumberKeyword`    | Represents `number` type    | `S.Number`     |
| `"BooleanKeyword"`   | `BooleanKeyword`   | Represents `boolean` type   | `S.Boolean`    |
| `"BigIntKeyword"`    | `BigIntKeyword`    | Represents `bigint` type    | `S.BigInt`     |
| `"SymbolKeyword"`    | `SymbolKeyword`    | Represents `symbol` type    | `S.Symbol`     |
| `"ObjectKeyword"`    | `ObjectKeyword`    | Represents `object` type    | `S.Object`     |
| `"UndefinedKeyword"` | `UndefinedKeyword` | Represents `undefined` type | `S.Undefined`  |
| `"VoidKeyword"`      | `VoidKeyword`      | Represents `void` type      | `S.Void`       |
| `"NeverKeyword"`     | `NeverKeyword`     | Represents `never` type     | `S.Never`      |

### Special Keyword Types (2 types)

| _tag               | Type Class       | Purpose                   | Example Schema |
|--------------------|------------------|---------------------------|----------------|
| `"UnknownKeyword"` | `UnknownKeyword` | Represents `unknown` type | `S.Unknown`    |
| `"AnyKeyword"`     | `AnyKeyword`     | Represents `any` type     | `S.Any`        |

### Literal Types (3 types)

| _tag             | Type Class     | Structure                                                    | Purpose                                              |
|------------------|----------------|--------------------------------------------------------------|------------------------------------------------------|
| `"Literal"`      | `Literal`      | `{ literal: string \| number \| boolean \| null \| bigint }` | Represents literal values like `"foo"`, `42`, `true` |
| `"UniqueSymbol"` | `UniqueSymbol` | `{ symbol: symbol }`                                         | Represents unique symbol types                       |
| `"Enums"`        | `Enums`        | `{ enums: ReadonlyArray<[string, string \| number]> }`       | Represents TypeScript enums                          |

### Template Literal Types (1 type)

| _tag                | Type Class        | Structure                                                     | Purpose                                                         |
|---------------------|-------------------|---------------------------------------------------------------|-----------------------------------------------------------------|
| `"TemplateLiteral"` | `TemplateLiteral` | `{ head: string, spans: NonEmptyArray<TemplateLiteralSpan> }` | Represents template literal types like `` `prefix-${string}` `` |

### Structural Types (2 types)

| _tag            | Type Class    | Structure                                                                                  | Purpose                                        |
|-----------------|---------------|--------------------------------------------------------------------------------------------|------------------------------------------------|
| `"TupleType"`   | `TupleType`   | `{ elements: Array<OptionalType>, rest: Array<Type>, isReadonly: boolean }`                | Represents tuple types like `[string, number]` |
| `"TypeLiteral"` | `TypeLiteral` | `{ propertySignatures: Array<PropertySignature>, indexSignatures: Array<IndexSignature> }` | Represents object/struct types                 |

### Union and Composition Types (2 types)

| _tag        | Type Class | Structure                                    | Purpose                                        |
|-------------|------------|----------------------------------------------|------------------------------------------------|
| `"Union"`   | `Union<M>` | `{ types: Members<M> }` (at least 2 members) | Represents union types like `string \| number` |
| `"Suspend"` | `Suspend`  | `{ f: () => AST }`                           | Lazy evaluation for recursive schemas          |

### Refinement and Validation (1 type)

| _tag           | Type Class         | Structure                                                             | Purpose                                                                     |
|----------------|--------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `"Refinement"` | `Refinement<From>` | `{ from: AST, filter: (input, options, self) => Option<ParseIssue> }` | Adds runtime validation/constraints (e.g., `S.String.pipe(S.minLength(5))`) |

### Transformations (2 types)

| _tag               | Type Class       | Structure                                                              | Purpose                                          |
|--------------------|------------------|------------------------------------------------------------------------|--------------------------------------------------|
| `"Transformation"` | `Transformation` | `{ from: AST, to: AST, transformation: TransformationKind }`           | Schema-to-schema transformation                  |
| `"Declaration"`    | `Declaration`    | `{ typeParameters: Array<AST>, decodeUnknown: fn, encodeUnknown: fn }` | Custom type declaration with encode/decode logic |

### Transformation Kinds (Internal, not in AST union)

These are NOT part of the main `AST` union but are used within `Transformation`:

| _tag                          | Type Class                  | Purpose                        |
|-------------------------------|-----------------------------|--------------------------------|
| `"FinalTransformation"`       | `FinalTransformation`       | Final encoding/decoding step   |
| `"ComposeTransformation"`     | `ComposeTransformation`     | Composition of transformations |
| `"TypeLiteralTransformation"` | `TypeLiteralTransformation` | Property-level transformations |

## Complete List of AST _tag Values

The **22 main AST node types** (in alphabetical order):

1. `"AnyKeyword"`
2. `"BigIntKeyword"`
3. `"BooleanKeyword"`
4. `"Declaration"`
5. `"Enums"`
6. `"Literal"`
7. `"NeverKeyword"`
8. `"NumberKeyword"`
9. `"ObjectKeyword"`
10. `"Refinement"`
11. `"StringKeyword"`
12. `"Suspend"`
13. `"SymbolKeyword"`
14. `"TemplateLiteral"`
15. `"Transformation"`
16. `"TupleType"`
17. `"TypeLiteral"`
18. `"UndefinedKeyword"`
19. `"UniqueSymbol"`
20. `"Union"`
21. `"UnknownKeyword"`
22. `"VoidKeyword"`

## Type Guard Pattern

Effect provides type guard functions for each AST type:

```typescript
import * as AST from "effect/SchemaAST";

// Example type guards
AST.isDeclaration(ast)       // ast is Declaration
AST.isLiteral(ast)           // ast is Literal
AST.isUniqueSymbol(ast)      // ast is UniqueSymbol
AST.isUndefinedKeyword(ast)  // ast is UndefinedKeyword
AST.isVoidKeyword(ast)       // ast is VoidKeyword
AST.isNeverKeyword(ast)      // ast is NeverKeyword
AST.isUnknownKeyword(ast)    // ast is UnknownKeyword
AST.isAnyKeyword(ast)        // ast is AnyKeyword
AST.isStringKeyword(ast)     // ast is StringKeyword
AST.isNumberKeyword(ast)     // ast is NumberKeyword
AST.isBooleanKeyword(ast)    // ast is BooleanKeyword
AST.isBigIntKeyword(ast)     // ast is BigIntKeyword
AST.isSymbolKeyword(ast)     // ast is SymbolKeyword
AST.isObjectKeyword(ast)     // ast is ObjectKeyword
AST.isEnums(ast)             // ast is Enums
AST.isTemplateLiteral(ast)   // ast is TemplateLiteral
AST.isRefinement(ast)        // ast is Refinement
AST.isTupleType(ast)         // ast is TupleType
AST.isTypeLiteral(ast)       // ast is TypeLiteral
AST.isUnion(ast)             // ast is Union
AST.isSuspend(ast)           // ast is Suspend
AST.isTransformation(ast)    // ast is Transformation
```

## Pattern Matching with Match

Effect provides a `Match` type for exhaustive pattern matching over AST nodes:

```typescript
import * as AST from "effect/SchemaAST";

type Match<A> = {
  [K in AST["_tag"]]: (
    ast: Extract<AST, { _tag: K }>,
    compile: Compiler<A>,
    path: ReadonlyArray<PropertyKey>
  ) => A;
};

// All 22 _tag values must be handled:
const match: AST.Match<MyResult> = {
  Declaration: (ast, compile, path) => { /* ... */ },
  Literal: (ast, compile, path) => { /* ... */ },
  UniqueSymbol: (ast, compile, path) => { /* ... */ },
  UndefinedKeyword: (ast, compile, path) => { /* ... */ },
  VoidKeyword: (ast, compile, path) => { /* ... */ },
  NeverKeyword: (ast, compile, path) => { /* ... */ },
  UnknownKeyword: (ast, compile, path) => { /* ... */ },
  AnyKeyword: (ast, compile, path) => { /* ... */ },
  StringKeyword: (ast, compile, path) => { /* ... */ },
  NumberKeyword: (ast, compile, path) => { /* ... */ },
  BooleanKeyword: (ast, compile, path) => { /* ... */ },
  BigIntKeyword: (ast, compile, path) => { /* ... */ },
  SymbolKeyword: (ast, compile, path) => { /* ... */ },
  ObjectKeyword: (ast, compile, path) => { /* ... */ },
  Enums: (ast, compile, path) => { /* ... */ },
  TemplateLiteral: (ast, compile, path) => { /* ... */ },
  Refinement: (ast, compile, path) => { /* ... */ },
  TupleType: (ast, compile, path) => { /* ... */ },
  TypeLiteral: (ast, compile, path) => { /* ... */ },
  Union: (ast, compile, path) => { /* ... */ },
  Suspend: (ast, compile, path) => { /* ... */ },
  Transformation: (ast, compile, path) => { /* ... */ },
};

const compiler = AST.getCompiler(match);
```

## Common AST Patterns in beep-effect

### Nullability Detection

For SQL column type derivation, the most relevant patterns are:

```typescript
import * as AST from "effect/SchemaAST";
import * as O from "effect/Option";

// Detect nullable types (Union with UndefinedKeyword or Literal null)
const isNullable = (ast: AST.AST): boolean => {
  if (AST.isUnion(ast)) {
    return F.pipe(
      ast.types,
      A.some((member) =>
        AST.isUndefinedKeyword(member) ||
        (AST.isLiteral(member) && member.literal === null)
      )
    );
  }
  return false;
};

// Extract non-nullable variant from union
const getNonNullableAST = (ast: AST.AST): O.Option<AST.AST> => {
  if (!AST.isUnion(ast)) return O.some(ast);

  const nonNullableMembers = F.pipe(
    ast.types,
    A.filter((member) =>
      !AST.isUndefinedKeyword(member) &&
      !(AST.isLiteral(member) && member.literal === null)
    )
  );

  return nonNullableMembers.length === 1
    ? O.some(nonNullableMembers[0])
    : O.none();
};
```

### Type Mapping for SQL

```typescript
import { sql } from "drizzle-orm";

const mapASTToSQLType = (ast: AST.AST): SQLType => {
  // Handle Refinements by unwrapping to base type
  if (AST.isRefinement(ast)) {
    return mapASTToSQLType(ast.from);
  }

  // Handle Transformations by using the encoded side
  if (AST.isTransformation(ast)) {
    return mapASTToSQLType(ast.from);
  }

  // Map primitive types
  if (AST.isStringKeyword(ast)) return sql`text`;
  if (AST.isNumberKeyword(ast)) return sql`real`;
  if (AST.isBooleanKeyword(ast)) return sql`integer`;
  if (AST.isBigIntKeyword(ast)) return sql`integer`;

  // Handle literals
  if (AST.isLiteral(ast)) {
    if (typeof ast.literal === "string") return sql`text`;
    if (typeof ast.literal === "number") return sql`real`;
    if (typeof ast.literal === "boolean") return sql`integer`;
  }

  // Handle unions (check for nullable, extract base type)
  if (AST.isUnion(ast)) {
    const baseType = getNonNullableAST(ast);
    if (O.isSome(baseType)) {
      return mapASTToSQLType(baseType.value);
    }
  }

  // Default fallback
  return sql`text`;
};
```

## Integration with beep-effect DSL

The DSL in `packages/common/schema/src/integrations/sql/dsl/` should handle these AST patterns:

### Priority Order for Type Mapping

1. **Unwrap Transformations**: Always check `isTransformation` first, use `.from` side
2. **Unwrap Refinements**: Check `isRefinement`, use `.from` side
3. **Handle Unions**: Detect nullable unions, extract base type
4. **Map Primitives**: Direct keyword → SQL type mapping
5. **Handle Literals**: Map based on literal value type
6. **Handle Structs**: `TypeLiteral` → composite types (if needed)
7. **Fallback**: Unknown types → `text` or error

### Nullability Derivation

```typescript
// Three sources of nullability:
// 1. Union with UndefinedKeyword
// 2. Union with Literal(null)
// 3. Optional property signature (PropertySignature.isOptional)

const deriveNullability = (
  ast: AST.AST,
  propertySignature?: AST.PropertySignature
): boolean => {
  // Check property-level optionality
  if (propertySignature?.isOptional) return true;

  // Check type-level nullability
  if (AST.isUnion(ast)) {
    return F.pipe(
      ast.types,
      A.some((m) =>
        AST.isUndefinedKeyword(m) ||
        (AST.isLiteral(m) && m.literal === null)
      )
    );
  }

  return false;
};
```

## References

- **Effect Documentation**: [SchemaAST.AST](https://effect.website/docs/schema/ast)
- **Source File**: `node_modules/effect/dist/dts/SchemaAST.d.ts`
- **Effect Version**: 3.10.0+
- **Related Modules**: `effect/Schema`, `effect/SchemaAST`, `@effect/sql/Model`

## Notes

- All AST nodes implement the `Annotated` interface with an `annotations` property
- The `Match<A>` type enforces exhaustive handling of all 22 _tag values at compile time
- Transformation kinds (`FinalTransformation`, `ComposeTransformation`, `TypeLiteralTransformation`) are NOT part of the main AST union
- The `Suspend` type is used for recursive schemas to avoid infinite loops during AST construction
- The `Declaration` type is the most general and allows custom encode/decode logic with type parameters
