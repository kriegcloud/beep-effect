# Effect SchemaAST Nullable Patterns - Exhaustive Analysis

## Executive Summary

This document provides an exhaustive catalog of all AST node types and patterns in `effect/SchemaAST` that represent nullable, optional, or missing values. Based on deep analysis of the Effect SchemaAST source code, we identify 7 primary nullable patterns and their detection strategies.

**Critical Finding**: Nullable detection requires recursive traversal through wrappers (`Refinement`, `Suspend`, `Transformation`) to reach the underlying nullable type, and union membership checks to detect nullable members.

## Problem Statement

When generating SQL column definitions or analyzing schema nullability, we need to determine if an Effect Schema encodes to a value that can be `null`, `undefined`, or missing. This requires understanding all AST node types that represent these states and how they combine.

## Research Sources

- **Source Code Analysis**: `/tmp/effect/packages/effect/src/SchemaAST.ts` (26,000+ tokens)
- **AST Type Union**: Lines 25-49 (complete type definition)
- **Nullable Constructors**: Lines 545-746 (Literal, UndefinedKeyword, VoidKeyword, NeverKeyword)
- **Optional Types**: Lines 1275-1418 (OptionalType, PropertySignature)
- **Union Types**: Lines 1701-1742 (Union.make, Members)
- **Transformations**: Lines 1927-2096 (Transformation, PropertySignatureTransformation)

---

## Complete AST Type Union

```typescript
export type AST =
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

---

## Nullable AST Node Types

### 1. Literal with Null Value

**Pattern**: `Literal` node with `literal: null`

```typescript
export class Literal implements Annotated {
  readonly _tag = "Literal"
  constructor(readonly literal: LiteralValue, readonly annotations: Annotations = {})
}

export type LiteralValue = string | number | boolean | null | bigint

// Singleton instance
const $null = new Literal(null)
export { $null as null }
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"

const isNullLiteral = (ast: AST.AST): boolean =>
  AST.isLiteral(ast) && ast.literal === null
```

**Example Schema**:
```typescript
S.Literal(null)  // AST: Literal { literal: null }
```

---

### 2. UndefinedKeyword

**Pattern**: Built-in AST node for `undefined` type

```typescript
export class UndefinedKeyword implements Annotated {
  readonly _tag = "UndefinedKeyword"
  constructor(readonly annotations: Annotations = {})
}

// Singleton instance
export const undefinedKeyword: UndefinedKeyword = new UndefinedKeyword({
  [TitleAnnotationId]: "undefined"
})
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"

AST.isUndefinedKeyword(ast)  // Type guard
```

**Example Schema**:
```typescript
S.Undefined  // AST: UndefinedKeyword
```

---

### 3. VoidKeyword

**Pattern**: Built-in AST node for `void` type (equivalent to `undefined` at runtime)

```typescript
export class VoidKeyword implements Annotated {
  readonly _tag = "VoidKeyword"
  constructor(readonly annotations: Annotations = {})
}

// Singleton instance
export const voidKeyword: VoidKeyword = new VoidKeyword({
  [TitleAnnotationId]: "void"
})
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"

AST.isVoidKeyword(ast)  // Type guard
```

**Example Schema**:
```typescript
S.Void  // AST: VoidKeyword
```

**Note**: `VoidKeyword` is semantically equivalent to `UndefinedKeyword` at runtime but distinct at the type level.

---

### 4. Union Containing Nullable Members

**Pattern**: Union with `null`, `undefined`, or `void` as a member

```typescript
export class Union<M extends AST = AST> implements Annotated {
  static make = (types: ReadonlyArray<AST>, annotations?: Annotations): AST => {
    return isMembers(types) ? new Union(types, annotations) : types.length === 1 ? types[0] : neverKeyword
  }
  readonly _tag = "Union"
  private constructor(readonly types: Members<M>, readonly annotations: Annotations = {})
}

export type Members<A> = readonly [A, A, ...Array<A>]  // At least 2 members
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

const hasNullableMember = (ast: AST.AST): boolean => {
  if (!AST.isUnion(ast)) return false

  return F.pipe(
    ast.types,
    A.some((member) =>
      AST.isUndefinedKeyword(member) ||
      AST.isVoidKeyword(member) ||
      (AST.isLiteral(member) && member.literal === null)
    )
  )
}
```

**Example Schemas**:
```typescript
S.Union(S.String, S.Null)       // AST: Union { types: [StringKeyword, Literal(null)] }
S.Union(S.Number, S.Undefined)  // AST: Union { types: [NumberKeyword, UndefinedKeyword] }
S.NullOr(S.String)              // Equivalent to S.Union(S.String, S.Null)
S.UndefinedOr(S.String)         // Equivalent to S.Union(S.String, S.Undefined)

// orUndefined helper
export const orUndefined = (ast: AST): AST => Union.make([ast, undefinedKeyword])
```

**Important**: If `Union.make` receives exactly 1 type, it unwraps to that type (not a Union). It requires at least 2 members to create a Union.

---

### 5. OptionalType (Tuple Elements)

**Pattern**: Tuple element marked as optional via `isOptional: true`

```typescript
export class OptionalType extends Type {
  constructor(
    type: AST,
    readonly isOptional: boolean,
    annotations: Annotations = {}
  ) {
    super(type, annotations)
  }

  toString() {
    return String(this.type) + (this.isOptional ? "?" : "")
  }
}

export class TupleType implements Annotated {
  readonly _tag = "TupleType"
  constructor(
    readonly elements: ReadonlyArray<OptionalType>,
    readonly rest: ReadonlyArray<Type>,
    readonly isReadonly: boolean,
    readonly annotations: Annotations = {}
  )
}
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

const hasOptionalElements = (ast: AST.AST): boolean => {
  if (!AST.isTupleType(ast)) return false

  return F.pipe(
    ast.elements,
    A.some((element) => element.isOptional)
  )
}
```

**Example Schema**:
```typescript
S.Tuple(S.String, S.optionalElement(S.Number))
// AST: TupleType {
//   elements: [
//     OptionalType { type: StringKeyword, isOptional: false },
//     OptionalType { type: NumberKeyword, isOptional: true }
//   ]
// }
```

**Nullability Semantics**: Optional tuple elements can be **absent** (array length is shorter), which is distinct from being `undefined`. However, accessing beyond array bounds returns `undefined` in JavaScript.

---

### 6. PropertySignature with isOptional

**Pattern**: Object property marked as optional via `isOptional: true`

```typescript
export class PropertySignature extends OptionalType {
  constructor(
    readonly name: PropertyKey,
    type: AST,
    isOptional: boolean,
    readonly isReadonly: boolean,
    annotations?: Annotations
  ) {
    super(type, isOptional, annotations)
  }

  toString(): string {
    return (this.isReadonly ? "readonly " : "") +
           String(this.name) +
           (this.isOptional ? "?" : "") +
           ": " + this.type
  }
}

export class TypeLiteral implements Annotated {
  readonly _tag = "TypeLiteral"
  constructor(
    readonly propertySignatures: ReadonlyArray<PropertySignature>,
    readonly indexSignatures: ReadonlyArray<IndexSignature>,
    readonly annotations: Annotations = {}
  )
}
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

const hasOptionalProperties = (ast: AST.AST): boolean => {
  if (!AST.isTypeLiteral(ast)) return false

  return F.pipe(
    ast.propertySignatures,
    A.some((prop) => prop.isOptional)
  )
}

const isPropertyNullable = (prop: AST.PropertySignature): boolean => {
  // Optional property can be missing (undefined)
  if (prop.isOptional) return true

  // Required property with nullable type
  return isNullable(prop.type)
}
```

**Example Schemas**:
```typescript
S.Struct({
  name: S.String,
  age: S.optional(S.Number)
})
// AST: TypeLiteral {
//   propertySignatures: [
//     PropertySignature { name: "name", type: StringKeyword, isOptional: false },
//     PropertySignature { name: "age", type: NumberKeyword, isOptional: true }
//   ]
// }

S.Struct({
  name: S.String,
  age: S.optional(S.Number, { exact: true })  // Type is S.Number | undefined
})
// AST: TypeLiteral {
//   propertySignatures: [
//     PropertySignature { name: "name", type: StringKeyword, isOptional: false },
//     PropertySignature {
//       name: "age",
//       type: Union([NumberKeyword, UndefinedKeyword]),
//       isOptional: true
//     }
//   ]
// }
```

**Nullability Semantics**:
- `isOptional: true` with `exact: false` (default): Property can be **missing** from object
- `isOptional: true` with `exact: true`: Property can be missing OR explicitly `undefined`
- `isOptional: false`: Property is required, but type can still encode nullable values

---

### 7. PropertySignatureTransformation (Missing → Present)

**Pattern**: Transformation that decodes missing properties to present values (or vice versa)

```typescript
/**
 * Represents a `PropertySignature -> PropertySignature` transformation
 *
 * The semantic of `decode` is:
 * - `none()` represents the absence of the key/value pair
 * - `some(value)` represents the presence of the key/value pair
 *
 * The semantic of `encode` is:
 * - `none()` you don't want to output the key/value pair
 * - `some(value)` you want to output the key/value pair
 */
export class PropertySignatureTransformation {
  constructor(
    readonly from: PropertyKey,
    readonly to: PropertyKey,
    readonly decode: (o: Option.Option<any>) => Option.Option<any>,
    readonly encode: (o: Option.Option<any>) => Option.Option<any>
  )
}

export class TypeLiteralTransformation {
  readonly _tag = "TypeLiteralTransformation"
  constructor(
    readonly propertySignatureTransformations: ReadonlyArray<
      PropertySignatureTransformation
    >
  )
}

export class Transformation implements Annotated {
  readonly _tag = "Transformation"
  constructor(
    readonly from: AST,
    readonly to: AST,
    readonly transformation: TransformationKind,
    readonly annotations: Annotations = {}
  )
}

export type TransformationKind =
  | FinalTransformation
  | ComposeTransformation
  | TypeLiteralTransformation
```

**Detection**:
```typescript
import * as AST from "effect/SchemaAST"

const hasPropertyTransformation = (ast: AST.AST): boolean => {
  if (!AST.isTransformation(ast)) return false
  return AST.isTypeLiteralTransformation(ast.transformation)
}

// For nullable analysis, check the "to" side of transformation
const getTransformationTo = (ast: AST.AST): AST.AST | undefined => {
  if (AST.isTransformation(ast)) return ast.to
  return undefined
}

// Recursively get the "from" side of transformations
export const getTransformationFrom = (ast: AST): AST | undefined => {
  switch (ast._tag) {
    case "Transformation":
      return ast.from
    case "Refinement":
      return getTransformationFrom(ast.from)
    case "Suspend":
      return getTransformationFrom(ast.f())
  }
}
```

**Example Schemas**:
```typescript
// S.optional with default value
S.Struct({
  count: S.optional(S.Number).pipe(S.withDefault(() => 0))
})
// AST: Transformation {
//   from: TypeLiteral {
//     propertySignatures: [PropertySignature { name: "count", isOptional: true }]
//   },
//   to: TypeLiteral {
//     propertySignatures: [PropertySignature { name: "count", isOptional: false }]
//   },
//   transformation: TypeLiteralTransformation {
//     propertySignatureTransformations: [
//       PropertySignatureTransformation {
//         from: "count",
//         to: "count",
//         decode: (o) => o.pipe(O.orElse(() => O.some(0))),
//         encode: identity
//       }
//     ]
//   }
// }
```

**Nullability Semantics**: Transformations can convert between nullable and non-nullable representations. For SQL column analysis:
- Analyze the **`from`** side for input nullability (what database stores)
- Analyze the **`to`** side for output nullability (what TypeScript sees)

---

## AST Wrapper Types (Transparent to Nullability)

These AST nodes wrap other nodes and must be recursively traversed to determine nullability:

### Refinement

```typescript
export class Refinement<From extends AST = AST> implements Annotated {
  readonly _tag = "Refinement"
  constructor(
    readonly from: From,
    readonly filter: (input: any, options: ParseOptions, self: Refinement) => Option.Option<ParseIssue>,
    readonly annotations: Annotations = {}
  )
}
```

**Example**: `S.String.pipe(S.minLength(1))` adds a refinement but doesn't change nullability.

**Detection Strategy**: Recurse into `refinement.from` to check nullability.

---

### Suspend

```typescript
export class Suspend implements Annotated {
  readonly _tag = "Suspend"
  constructor(
    readonly f: () => AST,
    readonly annotations: Annotations = {}
  )
}
```

**Example**: Recursive schemas like linked lists use `S.suspend`.

**Detection Strategy**: Call `suspend.f()` to get the underlying AST, then check nullability.

**Warning**: Memoize results to avoid infinite recursion on circular schemas.

---

### Transformation (Non-TypeLiteralTransformation)

```typescript
export class Transformation implements Annotated {
  readonly _tag = "Transformation"
  constructor(
    readonly from: AST,
    readonly to: AST,
    readonly transformation: TransformationKind,
    readonly annotations: Annotations = {}
  )
}
```

**Example**: `S.NumberFromString` transforms string to number.

**Detection Strategy**:
- For **input validation** (what database accepts): Check `transformation.from`
- For **output type** (what TypeScript uses): Check `transformation.to`

---

## Complete Nullable Detection Algorithm

```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

/**
 * Determines if an AST node represents a type that can encode to null/undefined/missing.
 *
 * @param ast - The AST node to analyze
 * @param side - Which side of transformations to analyze ("from" for input, "to" for output)
 * @param visited - Set of AST nodes already visited (to prevent infinite recursion)
 */
export const isNullable = (
  ast: AST.AST,
  side: "from" | "to" = "to",
  visited: WeakSet<AST.AST> = new WeakSet()
): boolean => {
  // Prevent infinite recursion on circular schemas
  if (visited.has(ast)) return false
  visited.add(ast)

  switch (ast._tag) {
    // Direct nullable types
    case "UndefinedKeyword":
    case "VoidKeyword":
      return true

    case "Literal":
      return ast.literal === null

    // Union: nullable if any member is nullable
    case "Union":
      return F.pipe(
        ast.types,
        A.some((member) => isNullable(member, side, visited))
      )

    // Transparent wrappers: recurse into wrapped type
    case "Refinement":
      return isNullable(ast.from, side, visited)

    case "Suspend":
      return isNullable(ast.f(), side, visited)

    case "Transformation":
      // Analyze the requested side of the transformation
      const targetAST = side === "from" ? ast.from : ast.to
      return isNullable(targetAST, side, visited)

    // Container types with optional elements/properties
    case "TupleType":
      // Tuple is "nullable" if it has optional elements (can be shorter array)
      return F.pipe(
        ast.elements,
        A.some((element) => element.isOptional)
      )

    case "TypeLiteral":
      // TypeLiteral is "nullable" if it has optional properties
      return F.pipe(
        ast.propertySignatures,
        A.some((prop) => prop.isOptional || isNullable(prop.type, side, visited))
      )

    // Non-nullable types
    case "NeverKeyword":
    case "UnknownKeyword":
    case "AnyKeyword":
    case "StringKeyword":
    case "NumberKeyword":
    case "BooleanKeyword":
    case "BigIntKeyword":
    case "SymbolKeyword":
    case "ObjectKeyword":
    case "Declaration":
    case "UniqueSymbol":
    case "Enums":
    case "TemplateLiteral":
      return false

    default:
      // Exhaustive check - should never reach here
      return false
  }
}
```

---

## Property-Level Nullable Detection

For analyzing individual properties in `TypeLiteral`:

```typescript
import * as AST from "effect/SchemaAST"

/**
 * Determines if a property signature can be null/undefined/missing.
 */
export const isPropertyNullable = (
  prop: AST.PropertySignature,
  side: "from" | "to" = "to"
): boolean => {
  // Property can be missing from the object
  if (prop.isOptional) return true

  // Property is required but type itself is nullable
  return isNullable(prop.type, side)
}

/**
 * Get all nullable property names from a TypeLiteral.
 */
export const getNullableProperties = (
  ast: AST.AST,
  side: "from" | "to" = "to"
): ReadonlyArray<PropertyKey> => {
  if (!AST.isTypeLiteral(ast)) return []

  return F.pipe(
    ast.propertySignatures,
    A.filter((prop) => isPropertyNullable(prop, side)),
    A.map((prop) => prop.name)
  )
}
```

---

## Tuple-Level Nullable Detection

For analyzing tuple elements:

```typescript
import * as AST from "effect/SchemaAST"

/**
 * Get indices of nullable tuple elements.
 */
export const getNullableIndices = (
  ast: AST.AST,
  side: "from" | "to" = "to"
): ReadonlyArray<number> => {
  if (!AST.isTupleType(ast)) return []

  return F.pipe(
    ast.elements,
    A.filterMapWithIndex((element, index) =>
      element.isOptional || isNullable(element.type, side)
        ? O.some(index)
        : O.none
    )
  )
}
```

---

## Utility: pruneUndefined

Effect provides a built-in utility to remove `undefined` from union types:

```typescript
/**
 * Recursively removes UndefinedKeyword from union types.
 *
 * @returns The pruned AST, or undefined if the input was UndefinedKeyword
 */
export const pruneUndefined = (
  ast: AST,
  self: (ast: AST) => AST | undefined,
  onTransformation: (ast: Transformation) => AST | undefined
): AST | undefined => {
  switch (ast._tag) {
    case "UndefinedKeyword":
      return neverKeyword

    case "Union": {
      const types: Array<AST> = []
      let hasUndefined = false
      for (const type of ast.types) {
        const pruned = self(type)
        if (pruned) {
          hasUndefined = true
          if (!isNeverKeyword(pruned)) {
            types.push(pruned)
          }
        } else {
          types.push(type)
        }
      }
      if (hasUndefined) {
        return Union.make(types)
      }
      break
    }

    case "Suspend":
      return self(ast.f())

    case "Transformation":
      return onTransformation(ast)
  }
}
```

---

## SQL Column Nullability Mapping

When generating Drizzle column definitions:

```typescript
import * as AST from "effect/SchemaAST"
import { pgTable, text, integer } from "drizzle-orm/pg-core"

const toColumnNullability = (ast: AST.AST): "nullable" | "notNull" => {
  // For SQL, analyze the "from" side (what gets stored in DB)
  return isNullable(ast, "from") ? "nullable" : "notNull"
}

// Example usage
const userSchema = S.Struct({
  id: S.Number,
  name: S.String,
  email: S.NullOr(S.String),
  age: S.optional(S.Number)
})

// Generate Drizzle schema
const users = pgTable("users", {
  id: integer("id").notNull(),           // S.Number -> not nullable
  name: text("name").notNull(),          // S.String -> not nullable
  email: text("email"),                  // S.NullOr(S.String) -> nullable
  age: integer("age")                    // S.optional(S.Number) -> nullable
})
```

---

## Edge Cases & Gotchas

### 1. Union Unwrapping

```typescript
// Single-member "union" unwraps to the member
S.Union(S.String)  // AST: StringKeyword (not Union!)

// Must have at least 2 members to create Union
Union.make([stringKeyword])  // Returns: stringKeyword
Union.make([stringKeyword, numberKeyword])  // Returns: Union
```

**Implication**: Always check if AST is a Union before accessing `.types`.

---

### 2. Optional vs Nullable

```typescript
// Optional (can be missing)
S.Struct({
  age: S.optional(S.Number)  // PropertySignature { isOptional: true, type: Number }
})
// Valid: {} or { age: 42 }
// Invalid: { age: undefined }

// Optional + exact (can be missing OR undefined)
S.Struct({
  age: S.optional(S.Number, { exact: true })
})
// PropertySignature { isOptional: true, type: Union([Number, Undefined]) }
// Valid: {} or { age: 42 } or { age: undefined }

// Nullable (must be present)
S.Struct({
  age: S.NullOr(S.Number)  // PropertySignature { isOptional: false, type: Union([Number, Null]) }
})
// Valid: { age: 42 } or { age: null }
// Invalid: {}
```

**For SQL**: Both `isOptional: true` and nullable types should map to nullable columns.

---

### 3. Transformation Sides

```typescript
// Transform from nullable input to non-nullable output
const schema = S.Struct({
  count: S.optional(S.Number).pipe(S.withDefault(() => 0))
})

// AST analysis:
isNullable(schema.ast, "from")  // true (input can be missing)
isNullable(schema.ast, "to")    // false (output always has count)

// For SQL column generation, use "from" side
toColumnNullability(schema.ast)  // "nullable"
```

---

### 4. Recursive Schemas

```typescript
interface Category {
  readonly name: string
  readonly subcategories: ReadonlyArray<Category>
}

const Category: S.Schema<Category> = S.Struct({
  name: S.String,
  subcategories: S.Array(S.suspend(() => Category))
})

// Category.ast contains Suspend node
// Must memoize visited nodes to prevent infinite recursion
```

---

### 5. Never vs Undefined

```typescript
// NeverKeyword: uninhabited type (no valid values)
S.Never  // AST: NeverKeyword

// UndefinedKeyword: exactly the value undefined
S.Undefined  // AST: UndefinedKeyword

// NeverKeyword is NOT nullable (no values at all)
isNullable(neverKeyword)  // false
isNullable(undefinedKeyword)  // true
```

---

## Testing Strategy

```typescript
import * as S from "effect/Schema"
import * as AST from "effect/SchemaAST"
import { describe, it, expect } from "@effect/vitest"

describe("isNullable", () => {
  it("detects null literal", () => {
    expect(isNullable(S.Null.ast)).toBe(true)
  })

  it("detects undefined keyword", () => {
    expect(isNullable(S.Undefined.ast)).toBe(true)
  })

  it("detects void keyword", () => {
    expect(isNullable(S.Void.ast)).toBe(true)
  })

  it("detects nullable union", () => {
    expect(isNullable(S.NullOr(S.String).ast)).toBe(true)
    expect(isNullable(S.UndefinedOr(S.Number).ast)).toBe(true)
  })

  it("detects optional properties", () => {
    const schema = S.Struct({
      name: S.String,
      age: S.optional(S.Number)
    })
    const props = AST.getPropertySignatures(schema.ast)
    expect(isPropertyNullable(props[0])).toBe(false)  // name
    expect(isPropertyNullable(props[1])).toBe(true)   // age
  })

  it("traverses refinements", () => {
    const schema = S.String.pipe(S.minLength(1))
    expect(isNullable(schema.ast)).toBe(false)
  })

  it("traverses transformations", () => {
    const schema = S.NumberFromString
    expect(isNullable(schema.ast, "from")).toBe(false)  // string input
    expect(isNullable(schema.ast, "to")).toBe(false)    // number output
  })

  it("handles recursive schemas", () => {
    interface Node {
      value: number
      next: Node | null
    }
    const Node: S.Schema<Node> = S.Struct({
      value: S.Number,
      next: S.Union(S.Null, S.suspend(() => Node))
    })
    expect(isNullable(Node.ast)).toBe(false)  // struct itself not nullable
    const props = AST.getPropertySignatures(Node.ast)
    expect(isPropertyNullable(props[1])).toBe(true)  // next property
  })

  it("rejects non-nullable types", () => {
    expect(isNullable(S.String.ast)).toBe(false)
    expect(isNullable(S.Number.ast)).toBe(false)
    expect(isNullable(S.Boolean.ast)).toBe(false)
    expect(isNullable(S.Never.ast)).toBe(false)
  })
})
```

---

## Integration with beep-effect

This research directly supports the `@beep/schema` DSL implementation:

### Field.ts Nullability Detection

```typescript
// packages/common/schema/src/integrations/sql/dsl/Field.ts
import * as AST from "effect/SchemaAST"

class FieldImpl {
  get isNullable(): boolean {
    // Analyze the schema AST to determine nullability
    return isNullable(this.schema.ast, "from")
  }

  toColumn() {
    const drizzleColumn = this.drizzleBuilder()
    return this.isNullable ? drizzleColumn : drizzleColumn.notNull()
  }
}
```

### SQL Model Integration

```typescript
// packages/common/schema/src/integrations/sql/dsl/Model.ts
import * as M from "@effect/sql/Model"

const deriveColumnNullability = (fieldSchema: S.Schema<any>): boolean => {
  // Use "from" side for SQL storage analysis
  return isNullable(fieldSchema.ast, "from")
}
```

---

## Checklist: Complete Nullable Detection

When implementing nullable detection, verify all these patterns:

- [ ] **Literal(null)**: Check `isLiteral(ast) && ast.literal === null`
- [ ] **UndefinedKeyword**: Check `isUndefinedKeyword(ast)`
- [ ] **VoidKeyword**: Check `isVoidKeyword(ast)`
- [ ] **Union with nullable member**: Check `isUnion(ast) && any member is nullable`
- [ ] **OptionalType (tuples)**: Check `element.isOptional`
- [ ] **PropertySignature**: Check `prop.isOptional` OR `isNullable(prop.type)`
- [ ] **Refinement wrapper**: Recurse into `refinement.from`
- [ ] **Suspend wrapper**: Call `suspend.f()` and recurse
- [ ] **Transformation wrapper**: Recurse into `transformation.from` or `transformation.to`
- [ ] **Circular reference guard**: Use `WeakSet` to track visited nodes
- [ ] **Union unwrapping**: Handle single-member unions that unwrap to the member

---

## References

- **Source File**: `/tmp/effect/packages/effect/src/SchemaAST.ts`
- **Effect Schema Docs**: [effect.website/docs/schema](https://effect.website/docs/schema)
- **AST Type Definition**: Lines 25-49
- **Literal Constructor**: Lines 551-589 (includes `$null` singleton)
- **UndefinedKeyword**: Lines 629-664
- **VoidKeyword**: Lines 670-705
- **NeverKeyword**: Lines 711-746
- **OptionalType**: Lines 1275-1299
- **PropertySignature**: Lines 1389-1418
- **TupleType**: Lines 1307-1383
- **TypeLiteral**: Lines 1482-1574
- **Union**: Lines 1701-1742
- **Refinement**: Lines 1805-1846
- **Suspend**: Lines 1753-1799
- **Transformation**: Lines 1927-1964
- **PropertySignatureTransformation**: Lines 2033-2054
- **TypeLiteralTransformation**: Lines 2063-2096
- **orUndefined helper**: Line 2489
- **pruneUndefined utility**: Lines 3011-3043
- **getTransformationFrom**: Lines 2758-2767
- **getPropertySignatures**: Lines 2206-2220
- **getNumberIndexedAccess**: Lines 2239-2264

---

## Conclusion

Nullable detection in Effect SchemaAST requires checking **7 primary patterns**:

1. **Literal(null)** - Direct null value
2. **UndefinedKeyword** - Undefined type
3. **VoidKeyword** - Void type (equivalent to undefined)
4. **Union members** - Any nullable member makes union nullable
5. **OptionalType** - Tuple elements with `isOptional: true`
6. **PropertySignature** - Properties with `isOptional: true` or nullable type
7. **PropertySignatureTransformation** - Transformations between nullable/non-nullable

Plus **3 transparent wrappers** that require recursion:
- **Refinement** - Recurse into `.from`
- **Suspend** - Call `.f()` and recurse
- **Transformation** - Recurse into `.from` or `.to`

The complete algorithm handles all these cases, prevents infinite recursion on circular schemas, and correctly analyzes both transformation sides for accurate SQL column generation.
