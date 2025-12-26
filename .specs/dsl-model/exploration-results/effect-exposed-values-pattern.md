# Effect Schema Exposed Values Pattern

## Alignment Notes

> **Status**: ALIGNED with DSL.Model design goals
>
> This research document is **HIGHLY RECOMMENDED** for DSL.Model implementation. It provides the foundational understanding of how Effect Schema exposes static metadata, which DSL.Model directly builds upon.

### How This Research Aligns with DSL.Model Goals

1. **DSL.Model IS an Effect Schema** - CONFIRMED
   - This document explains the exact mechanism Effect uses: anonymous class extending base schema
   - DSL.Model extends `VariantSchema.Class` which itself extends the Effect Schema base
   - All Schema methods (`S.decode()`, `.pipe()`, `.annotations()`) work because we extend the schema class

2. **Static property exposure mechanism** - RECOMMENDED
   - Effect uses `static propertyName = value` in anonymous class body
   - DSL.Model uses same pattern for `.tableName`, `.columns`, `.primaryKey`, `.indexes`, `.identifier`
   - The interface declares readonly properties, implementation assigns them

3. **`annotations()` override** - CRITICAL / RECOMMENDED
   - Effect's pattern: `return makeXxxClass(this.property, mergeSchemaAnnotations(this.ast, annotations))`
   - DSL.Model uses identical approach: factory function recreates class with merged annotations
   - This preserves static properties through chaining

4. **Cloning strategy** - RECOMMENDED
   - Effect uses spread operator: `{ ...fields }`, `[...literals]`
   - DSL.Model should clone `.columns` as `{ ...columns }` to prevent mutation
   - Schema references (like the underlying field schemas) don't need cloning

### Caveats and Outdated Assumptions

1. **Base class difference**
   - Effect examples use `S.make<Type>(ast)` as base
   - DSL.Model uses `VariantSchema.Class<Self>(identifier)(fields)` as base
   - The static property pattern works the same way, just different inheritance chain

2. **Application example at end of document**
   - The "Integration with beep-effect" section shows a simplified API
   - DSL.Model uses a more sophisticated API with `DSL.Field()` combinator and variant configuration
   - The example is directionally correct but uses different field syntax

3. **Type intersection pattern not shown**
   - This document focuses on interfaces extending `AnnotableClass`
   - DSL.Model uses anonymous class with type intersection: `as typeof BaseClass & { readonly tableName: string; ... }`
   - Both approaches work; DSL.Model's is more direct for adding statics to an existing class

### Patterns Summary

| Pattern | Recommendation | Notes |
|---------|----------------|-------|
| Anonymous class from factory | RECOMMENDED | Core pattern for DSL.Model |
| Interface declaring readonly statics | RECOMMENDED | For public API type |
| Static assignment in class body | RECOMMENDED | `static tableName = ...` |
| `annotations()` override | CRITICAL | Must preserve statics |
| Spread cloning for objects/arrays | RECOMMENDED | Prevent mutation |
| Schema reference without clone | RECOMMENDED | Schemas are immutable |
| Alternative approaches (Object.assign, prototype, getters, symbols) | DEPRECATED | All have significant drawbacks |

### Directly Applicable Patterns

All 6 patterns documented here apply to DSL.Model:

1. **Pattern 1 (S.Literal)** - Simple exposed value: `.identifier`
2. **Pattern 2 (S.Union)** - Array exposed value: `.primaryKey`
3. **Pattern 3 (S.Record)** - Multiple values: `.tableName`, `.identifier`
4. **Pattern 4 (S.Enums)** - Object exposed value: `.columns`
5. **Pattern 5 (S.Struct/TypeLiteral)** - Fields object: `.columns` structure
6. **Pattern 6 (S.Array)** - Schema references: Field schemas within columns

---

## Executive Summary

Effect Schema uses a class-based pattern to expose static metadata properties on schema instances. This is achieved through **anonymous class returns** from factory functions, where static properties are assigned within the class definition. The pattern allows TypeScript to infer precise types for these metadata properties while maintaining schema composability through the `annotations()` method.

**Key Finding**: The exposed values pattern relies on returning anonymous classes that extend a base `Schema` class, with static properties assigned directly in the class body. The TypeScript type system infers these properties through interface definitions that declare `readonly` static properties.

---

## Problem Statement

When designing a DSL for SQL operations (like `DSL.Model`), we need a way to expose static metadata (such as column specs, table names, or SQL fragments) on schema-like instances. This metadata must be:

1. **Type-safe** - TypeScript should infer the exact structure
2. **Immutable** - Properties should be readonly
3. **Composable** - Must work with chaining methods like `annotations()`
4. **Discoverable** - Accessible via dot notation (e.g., `schema.literals`)

Effect Schema solves this exact problem for its Literal, Union, Struct, and other schemas.

---

## Research Sources

### Effect Documentation
- [Schema Basic Usage - Exposed Values](https://effect.website/docs/schema/basic-usage/#exposed-values)
- [Schema Basic Usage - Unions](https://effect.website/docs/schema/basic-usage/#unions)
- Effect MCP Documentation Search Results

### Source Code Analysis
- `/node_modules/effect/src/Schema.ts` (lines 673-697, 1268-1297, 1578-1594, 2808-2822, 3082-3097)
- Key patterns examined:
  - `Literal<Literals>` - exposes `.literals` property
  - `Union<Members>` - exposes `.members` property
  - `Array$<Value>` - exposes `.value` property
  - `Record$<K, V>` - exposes `.key` and `.value` properties
  - `TypeLiteral<Fields, Records>` - exposes `.fields` and `.records` properties
  - `Enums<A>` - exposes `.enums` property
  - `TupleType<Elements, Rest>` - exposes `.elements` and `.rest` properties

---

## Recommended Approach

### Pattern Overview

Effect Schema uses a three-part architecture:

1. **Interface Definition** - Declares the public API with exposed properties
2. **Factory Function** - Returns an anonymous class extending the base schema
3. **Static Property Assignment** - Assigns metadata directly in the class body

This pattern ensures:
- TypeScript can infer exact types through structural typing
- Properties are readonly and immutable by convention
- The `annotations()` method can be overridden to preserve the custom class type
- Metadata is cloned (via spread operator) to prevent external mutation

---

## Implementation

### Pattern 1: Simple Exposed Value (S.Literal)

**Interface Definition**:

```typescript
export interface Literal<Literals extends array_.NonEmptyReadonlyArray<AST.LiteralValue>>
  extends AnnotableClass<Literal<Literals>, Literals[number]>
{
  readonly literals: Readonly<Literals>
}
```

**Factory Function**:

```typescript
function makeLiteralClass<Literals extends array_.NonEmptyReadonlyArray<AST.LiteralValue>>(
  literals: Literals,
  ast: AST.AST = getDefaultLiteralAST(literals)
): Literal<Literals> {
  return class LiteralClass extends make<Literals[number]>(ast) {
    static override annotations(annotations: Annotations.Schema<Literals[number]>): Literal<Literals> {
      return makeLiteralClass(this.literals, mergeSchemaAnnotations(this.ast, annotations))
    }
    static literals = [...literals] as Literals
  }
}
```

**Usage**:

```typescript
const schema = Schema.Literal("a", "b", "c")

// Type: readonly ["a", "b", "c"]
const literals = schema.literals

// Type: "a" | "b" | "c"
type Type = typeof schema.Type
```

**Key Techniques**:
- **Spread operator clone**: `[...literals]` prevents external mutation
- **Type assertion**: `as Literals` preserves exact tuple type
- **Override annotations**: Returns new instance of same class type
- **Readonly interface property**: `readonly literals: Readonly<Literals>` ensures immutability at type level

---

### Pattern 2: Multiple Exposed Values (S.Union)

**Interface Definition**:

```typescript
export interface Union<Members extends ReadonlyArray<Schema.All>> extends
  AnnotableClass<
    Union<Members>,
    Schema.Type<Members[number]>,
    Schema.Encoded<Members[number]>,
    Schema.Context<Members[number]>
  >
{
  readonly members: Readonly<Members>
}
```

**Factory Function**:

```typescript
function makeUnionClass<Members extends AST.Members<Schema.All>>(
  members: Members,
  ast: AST.AST = getDefaultUnionAST(members)
): Union<Members> {
  return class UnionClass extends make<
    Schema.Type<Members[number]>,
    Schema.Encoded<Members[number]>,
    Schema.Context<Members[number]>
  >(ast) {
    static override annotations(annotations: Annotations.Schema<Schema.Type<Members[number]>>): Union<Members> {
      return makeUnionClass(this.members, mergeSchemaAnnotations(this.ast, annotations))
    }

    static members = [...members]
  }
}
```

**Usage**:

```typescript
const schema = Schema.Union(Schema.String, Schema.Number)

// Type: readonly [typeof Schema.String, typeof Schema.Number]
const members = schema.members

const firstMember = members[0]  // typeof Schema.String
const secondMember = members[1] // typeof Schema.Number
```

**Key Techniques**:
- **Generic type preservation**: `Members extends ReadonlyArray<Schema.All>` maintains exact array type
- **Indexed access types**: `Schema.Type<Members[number]>` extracts union type from array
- **Array spread**: `[...members]` creates shallow copy
- **Self-referencing**: `this.members` in `annotations()` accesses the static property

---

### Pattern 3: Nested Exposed Values (S.Record)

**Interface Definition**:

```typescript
export interface Record$<K extends Schema.All, V extends Schema.All> extends
  AnnotableClass<
    Record$<K, V>,
    { readonly [P in Schema.Type<K>]: Schema.Type<V> },
    { readonly [P in Schema.Encoded<K>]: Schema.Encoded<V> },
    | Schema.Context<K>
    | Schema.Context<V>
  >
{
  readonly fields: {}
  readonly records: readonly [{ readonly key: K; readonly value: V }]
  readonly key: K
  readonly value: V
  // ... other methods
}
```

**Factory Function**:

```typescript
function makeRecordClass<K extends Schema.All, V extends Schema.All>(
  key: K,
  value: V,
  ast?: AST.AST
): Record$<K, V> {
  return class RecordClass extends makeTypeLiteralClass({}, [{ key, value }], ast) {
    static override annotations(
      annotations: Annotations.Schema<{ readonly [P in Schema.Type<K>]: Schema.Type<V> }>
    ): Record$<K, V> {
      return makeRecordClass(key, value, mergeSchemaAnnotations(this.ast, annotations))
    }

    static key = key

    static value = value
  }
}
```

**Usage**:

```typescript
const schema = Schema.Record({
  key: Schema.String,
  value: Schema.Number
})

const keyType = schema.key      // typeof Schema.String
const valueType = schema.value  // typeof Schema.Number
```

**Key Techniques**:
- **Multiple exposed properties**: `key` and `value` both exposed
- **Composition via extension**: Extends `makeTypeLiteralClass` which itself has exposed values
- **Closure capture**: Factory function parameters become static properties
- **No cloning needed**: Schemas are immutable by design

---

### Pattern 4: Object Exposed Values (S.Enums)

**Interface Definition**:

```typescript
export interface Enums<A extends EnumsDefinition> extends AnnotableClass<Enums<A>, A[keyof A]> {
  readonly enums: A
}

export type EnumsDefinition = { [x: string]: string | number }
```

**Factory Function**:

```typescript
const makeEnumsClass = <A extends EnumsDefinition>(
  enums: A,
  ast: AST.AST = getDefaultEnumsAST(enums)
): Enums<A> => (class EnumsClass extends make<A[keyof A]>(ast) {
  static override annotations(annotations: Annotations.Schema<A[keyof A]>) {
    return makeEnumsClass(this.enums, mergeSchemaAnnotations(this.ast, annotations))
  }

  static enums = { ...enums }
})
```

**Usage**:

```typescript
enum Fruits { Apple = 0, Banana = 1 }
const schema = Schema.Enums(Fruits)

schema.enums        // typeof Fruits (object with Apple, Banana properties)
schema.enums.Apple  // Access individual member
```

**Key Techniques**:
- **Object spread**: `{ ...enums }` creates shallow copy of enum object
- **Preserved object type**: TypeScript infers `A` as the exact enum type
- **Property access**: Individual enum members accessible via dot notation

---

### Pattern 5: Struct with Fields (S.Struct / TypeLiteral)

**Interface Definition**:

```typescript
export interface TypeLiteral<
  Fields extends Struct.Fields,
  Records extends IndexSignature.Records
> extends
  AnnotableClass<
    TypeLiteral<Fields, Records>,
    Simplify<TypeLiteral.Type<Fields, Records>>,
    Simplify<TypeLiteral.Encoded<Fields, Records>>,
    | Struct.Context<Fields>
    | IndexSignature.Context<Records>
  >
{
  readonly fields: Readonly<Fields>
  readonly records: Readonly<Records>
  // ... other methods
}
```

**Factory Function**:

```typescript
function makeTypeLiteralClass<Fields extends Struct.Fields, const Records extends IndexSignature.Records>(
  fields: Fields,
  records: Records,
  ast: AST.AST = getDefaultTypeLiteralAST(fields, records)
): TypeLiteral<Fields, Records> {
  return class TypeLiteralClass extends make<
    Simplify<TypeLiteral.Type<Fields, Records>>,
    Simplify<TypeLiteral.Encoded<Fields, Records>>,
    | Struct.Context<Fields>
    | IndexSignature.Context<Records>
  >(ast) {
    static override annotations(
      annotations: Annotations.Schema<Simplify<TypeLiteral.Type<Fields, Records>>>
    ): TypeLiteral<Fields, Records> {
      return makeTypeLiteralClass(this.fields, this.records, mergeSchemaAnnotations(this.ast, annotations))
    }

    static fields = { ...fields }

    static records = [...records] as Records
  }
}
```

**Usage**:

```typescript
const schema = Schema.Struct({
  a: Schema.Number,
  b: Schema.String
})

const fields = schema.fields
// Type: Readonly<{ a: typeof Schema.Number; b: typeof Schema.String }>

const aSchema = fields.a  // typeof Schema.Number
```

**Key Techniques**:
- **Object spread for fields**: `{ ...fields }` clones field definitions
- **Array spread for records**: `[...records]` clones index signatures
- **const assertion on parameter**: `const Records` preserves exact tuple type
- **Nested object structure**: Fields object contains schema instances as values

---

### Pattern 6: Array Value (S.Array / S.NonEmptyArray)

**Interface Definition**:

```typescript
export interface Array$<Value extends Schema.Any> extends TupleType<[], [Value]> {
  readonly value: Value
  annotations(annotations: Annotations.Schema<TupleType.Type<[], [Value]>>): Array$<Value>
}
```

**Factory Function**:

```typescript
function makeArrayClass<Value extends Schema.Any>(
  value: Value,
  ast?: AST.AST
): Array$<Value> {
  return class ArrayClass extends makeTupleTypeClass<[], [Value]>([], [value], ast) {
    static override annotations(annotations: Annotations.Schema<TupleType.Type<[], [Value]>>) {
      return makeArrayClass(this.value, mergeSchemaAnnotations(this.ast, annotations))
    }

    static value = value
  }
}
```

**Usage**:

```typescript
const schema = Schema.Array(Schema.Number)
const value = schema.value  // typeof Schema.Number
```

**Key Techniques**:
- **No cloning**: Schema values are immutable references
- **Inheritance with extension**: Extends `TupleType` but adds `.value` property
- **Single value exposure**: Simple case of exposing constructor argument

---

## Core Implementation Mechanics

### How TypeScript Infers Static Properties

Effect Schema relies on **structural typing** with interface definitions. The type inference works as follows:

1. **Interface declares readonly property**:
   ```typescript
   export interface Literal<Literals> {
     readonly literals: Readonly<Literals>
   }
   ```

2. **Factory returns class implementing interface**:
   ```typescript
   function makeLiteralClass<Literals>(literals: Literals): Literal<Literals> {
     return class LiteralClass extends make<...>(ast) {
       static literals = [...literals] as Literals
     }
   }
   ```

3. **TypeScript matches structure**:
   - The returned class has a static `literals` property
   - The interface declares `readonly literals: Readonly<Literals>`
   - TypeScript verifies the class structure matches the interface
   - The `Literal<Literals>` return type tells TypeScript which properties to expose

**Critical Insight**: The interface acts as a **type-level specification** of what properties should be exposed, while the class implementation provides the **runtime value**. TypeScript's structural typing bridges the gap.

---

### Why Anonymous Classes?

Effect Schema uses **anonymous classes** (returned from functions) rather than named exported classes. This provides several advantages:

1. **Encapsulation** - Implementation details hidden from consumers
2. **Factory pattern** - Easy to construct instances with default parameters
3. **Immutability** - No direct constructor access prevents mutation
4. **Composability** - `annotations()` can return new instances of the same type
5. **Type inference** - Generic parameters flow through factory function

**Example**:
```typescript
// ❌ Named class - consumers can mutate
export class LiteralClass {
  static literals = ["a", "b"]  // Can be reassigned!
}

// ✅ Anonymous class - return type controls interface
function makeLiteralClass(literals) {
  return class extends make(ast) {
    static literals = [...literals]  // New instance each time
  }
}
```

---

### The Role of `annotations()`

Every schema class overrides the `annotations()` method to:

1. **Preserve metadata** - Passes `this.literals`, `this.members`, etc. to factory
2. **Merge annotations** - Applies new annotations to existing AST
3. **Return same type** - Factory returns the specialized interface type
4. **Enable chaining** - Method chaining works with exposed values intact

**Example**:
```typescript
const schema = Schema.Literal("a", "b", "c")
  .annotations({ description: "ABC enum" })

schema.literals  // Still accessible after chaining!
// Type: readonly ["a", "b", "c"]
```

**Implementation pattern**:
```typescript
static override annotations(annotations): Literal<Literals> {
  return makeLiteralClass(this.literals, mergeSchemaAnnotations(this.ast, annotations))
  //                       ^^^^^^^^^^^^^ Preserves exposed value
  //     ^^^^^^^^^^^^^^^^^^               Returns same interface type
}
```

---

### Cloning Strategy

Effect Schema clones metadata using different strategies based on data type:

| Data Type | Cloning Strategy | Example |
|-----------|------------------|---------|
| **Array** | Spread operator | `[...literals] as Literals` |
| **Object** | Spread operator | `{ ...enums }` |
| **Schema** | Reference (no clone) | `static value = value` |
| **Mixed** | Array spread + type cast | `[...records] as Records` |

**Why clone?**
- Prevents external mutation of internal metadata
- Creates new array/object instances
- Type assertions preserve exact types after spread

**Why not clone schemas?**
- Schemas are immutable by design
- Cloning would break identity equality
- Only the reference needs to be stored

---

## Dependencies

### Required Packages
- `effect` (v3.10.0+) - Core Effect library
- TypeScript 5.0+ - Structural typing, const assertions, variance annotations

### Key Effect Modules Used
```typescript
import * as AST from "effect/SchemaAST"        // AST construction
import * as Annotations from "effect/Schema"   // Annotation types
import * as array_ from "effect/Array"         // NonEmptyReadonlyArray type
```

---

## Trade-offs

### Advantages

1. **Type Safety** ✅
   - Exact types inferred automatically
   - Compile-time checks for property access
   - No runtime type assertions needed

2. **Immutability** ✅
   - Readonly properties at type level
   - Cloning prevents external mutation
   - `annotations()` returns new instances

3. **Discoverability** ✅
   - Properties accessible via dot notation
   - IDE autocomplete shows exposed values
   - Self-documenting API

4. **Composability** ✅
   - Works with method chaining
   - Metadata preserved through transformations
   - Easy to extend with new properties

5. **Performance** ✅
   - No runtime overhead (static properties)
   - Lazy initialization via factory pattern
   - Minimal memory footprint

### Disadvantages

1. **Complexity** ⚠️
   - Requires understanding of anonymous classes
   - Interface + factory pattern adds boilerplate
   - Type gymnastics for complex exposed values

2. **Debugging** ⚠️
   - Anonymous classes have no named constructor
   - Stack traces show `<anonymous>` instead of class name
   - Harder to inspect in debugger

3. **Documentation** ⚠️
   - Type inference makes API docs less explicit
   - Requires understanding structural typing
   - No clear "this is a static property" marker in code

4. **Mutation Risk** ⚠️
   - Cloning only shallow (nested objects still mutable)
   - No runtime freeze (only TypeScript `readonly`)
   - Developers could use `any` to bypass readonly

5. **Refactoring** ⚠️
   - Changing exposed property names breaks consumers
   - No compile-time checks across package boundaries
   - Requires coordinated updates to interface + implementation

---

## Alternative Approaches

### Alternative 1: Object.assign

**Pattern**:
```typescript
const schema = Object.assign(
  make<A, I, R>(ast),
  { literals: [...literals] as Literals }
)
```

**Trade-offs**:
- ❌ Loses type inference (TypeScript can't infer static properties)
- ❌ No `annotations()` override mechanism
- ✅ Simpler implementation
- ❌ Not composable with method chaining

**Verdict**: Not suitable for complex schema APIs.

---

### Alternative 2: Prototype Augmentation

**Pattern**:
```typescript
class LiteralClass extends make<A>(ast) {}
LiteralClass.prototype.literals = literals
```

**Trade-offs**:
- ❌ Prototype properties shared across instances (mutation risk)
- ❌ Not type-safe (manual type assertions required)
- ❌ Breaks with inheritance
- ✅ Simpler syntax

**Verdict**: Incompatible with static property requirements.

---

### Alternative 3: Getter Methods

**Pattern**:
```typescript
class LiteralClass extends make<A>(ast) {
  get literals() { return [...literals] as Literals }
}
```

**Trade-offs**:
- ❌ Instance properties, not static (requires instantiation)
- ❌ Runtime overhead (getter called each time)
- ✅ Type-safe
- ❌ Not accessible from class reference

**Verdict**: Effect requires static properties, so this doesn't apply.

---

### Alternative 4: Symbol-based Metadata

**Pattern**:
```typescript
const literalsSymbol = Symbol("literals")
class LiteralClass extends make<A>(ast) {
  static [literalsSymbol] = literals
}
```

**Trade-offs**:
- ✅ Prevents naming collisions
- ❌ Not discoverable (IDE can't autocomplete symbols easily)
- ❌ Requires exporting symbol for consumer access
- ❌ Poor DX (symbol access less intuitive)

**Verdict**: Solves problems Effect doesn't have.

---

## Integration with beep-effect

### Application to DSL.Model

> **Note**: This section demonstrates the PATTERN conceptually. The actual DSL.Model API differs in syntax.
> See the design spec at `.specs/dsl-model/dsl-model.original.md` for the finalized API.

For the SQL DSL design, the exposed values pattern can be applied as follows:

```typescript
// Interface definition (conceptual - actual uses type intersection)
export interface Model<Specs extends ColumnSpecs> extends
  AnnotableClass<Model<Specs>, /* ... */>
{
  readonly specs: Readonly<Specs>
  readonly tableName: string
  // ... other SQL metadata
}

// Factory function (conceptual - actual extends VariantSchema.Class)
function makeModelClass<Specs extends ColumnSpecs>(
  specs: Specs,
  tableName: string,
  ast: AST.AST
): Model<Specs> {
  return class ModelClass extends make</* ... */>(ast) {
    static override annotations(annotations): Model<Specs> {
      return makeModelClass(this.specs, this.tableName, mergeSchemaAnnotations(this.ast, annotations))
    }

    static specs = { ...specs }
    static tableName = tableName
  }
}

// ⚠️ SIMPLIFIED EXAMPLE - Different from final DSL.Model API
const User = DSL.Model("users", {
  id: DSL.uuid(),
  name: DSL.varchar(255)
})

User.specs.id      // Access column spec
User.tableName     // "users"
User.specs.name    // Access column spec
```

### Key Differences from Final DSL.Model API

| This Example | Final DSL.Model API |
|-------------|---------------------|
| `DSL.uuid()`, `DSL.varchar()` | `DSL.Field(S.String, { column: { type: "string" } })` |
| `.specs` property | `.columns` property |
| Constant function call | Class extension: `class User extends DSL.Model<User>("User")({...}) {}` |
| Extends `S.make()` | Extends `VariantSchema.Class` |

### Integration Points

1. **Column Specs** - Expose `.columns` property for SQL column definitions (not `.specs`)
2. **Table Name** - Expose `.tableName` property for SQL table name
3. **Identifier** - Expose `.identifier` property for original PascalCase name
4. **Primary Key** - Expose `.primaryKey` property for primary key field names
5. **Indexes** - Expose `.indexes` property for index definitions

### Compatibility

The pattern is fully compatible with:
- `@beep/schema` - EntityId, Schema utilities
- `@effect/sql` - Model integration
- Drizzle ORM - Table definitions
- beep-effect architecture - Layer composition, Effect patterns

---

## References

### Effect Documentation
- [Schema Basic Usage - Exposed Values](https://effect.website/docs/schema/basic-usage/#exposed-values) (Literal.literals)
- [Schema Basic Usage - Exposed Values 2](https://effect.website/docs/schema/basic-usage/#exposed-values-2) (Union.members)
- [Schema Basic Usage - Enums](https://effect.website/docs/schema/basic-usage/#native-enums) (Enums.enums)

### Source Files
- `/node_modules/effect/src/Schema.ts`
  - Lines 673-697: `Literal` interface and factory
  - Lines 1268-1297: `Union` interface and factory
  - Lines 1490-1532: `TupleType` interface and factory
  - Lines 1578-1594: `Array$` interface and factory
  - Lines 2808-2950: `TypeLiteral` interface and factory
  - Lines 3082-3118: `Record$` interface and factory
  - Lines 748-773: `Enums` interface and factory

### Related Patterns
- Factory pattern
- Builder pattern (via `annotations()` chaining)
- Structural typing
- Type-level programming (conditional types, indexed access types)

---

## Conclusion

The Effect Schema exposed values pattern is a robust, type-safe approach to attaching static metadata to schema instances. It leverages:

1. **Anonymous classes** returned from factory functions
2. **Interface definitions** declaring readonly properties
3. **Static property assignment** within class body
4. **Structural typing** for type inference
5. **Cloning strategies** for immutability
6. **Override annotations()** for composability

This pattern is directly applicable to the `DSL.Model` design for exposing SQL metadata (column specs, table names, SQL fragments) while maintaining type safety, immutability, and composability.

The primary advantage over alternatives is **seamless TypeScript integration** - the interface + factory pattern enables exact type inference without manual type assertions, while preserving method chaining and annotation capabilities.

For the beep-effect SQL DSL, adopting this pattern will provide a familiar API surface consistent with Effect Schema, making it intuitive for developers already using Effect patterns while enabling powerful static metadata access for SQL generation.
