# Effect Schema Class Patterns Research

## Executive Summary

This research documents how Effect Schema's `S.Class<Self>()()` pattern works and how it's extended by `@effect/sql/Model` and our DSL's `Model<Self>()()` factory. Understanding these patterns is critical for implementing `ModelBuilder.create()`, which must generate classes that extend the DSL Model pattern while preserving all type-level inference and variant schema behavior.

**Key Findings:**
1. The `Self` generic is mandatory for recursive type inference in class constructors
2. Classes are built via a `makeClass` internal that extends a `Base` class and creates a transformation AST
3. `@effect/sql/Model.Class` uses `@effect/experimental/VariantSchema.Class` internally
4. The DSL `Model` factory follows the same pattern but adds column metadata and validation
5. Annotations are attached at multiple levels: schema, transformation, and encoded AST nodes

---

## Problem Statement

We're implementing `ModelBuilder.create()` to produce classes that:

1. Extend the DSL `Model` pattern: `class X extends Model<X>("Name")({ fields }) {}`
2. Support the `Self` generic for type recursion
3. Include 6 variant schemas (select, insert, update, json, jsonCreate, jsonUpdate)
4. Preserve column metadata from `Field()` calls
5. Maintain all static properties: `tableName`, `columns`, `primaryKey`, etc.
6. Allow custom methods to be added to the generated class

---

## Research Sources

### Effect Documentation
- Effect Schema `S.Class` API documentation
- VariantSchema experimental package documentation

### Source Code Analysis
- `node_modules/effect/src/Schema.ts` - Core Schema implementation
  - Lines 9194-9215: `S.Class` factory signature
  - Lines 9400-9599: `makeClass` internal implementation
- `node_modules/@effect/experimental/src/VariantSchema.ts` - VariantSchema patterns
  - Lines 467-517: `VariantSchema.Class` implementation
- `node_modules/@effect/sql/src/Model.ts` - SQL Model patterns
  - Lines 19-32: VariantSchema instantiation with 6 variants
  - Lines 80-114: `M.Class` usage example
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Our DSL Model
  - Lines 432-511: DSL `Model` factory implementation

### Ecosystem Libraries
- `@effect/experimental` - VariantSchema base pattern
- `@effect/sql` - SQL-specific Model extensions

---

## Pattern 1: How `S.Class<Self>()()` Works

### The Self Generic Requirement

```typescript
// ❌ WRONG - Missing Self generic causes type error
class User extends S.Class("User")({
  id: S.String,
  name: S.String
}) {}
// Error: Missing `Self` generic - use `class Self extends Class<Self>()(...)(...)`

// ✅ CORRECT - Self enables recursive type inference
class User extends S.Class<User>("User")({
  id: S.String,
  name: S.String
}) {}
```

**Why Self is Required:**

The `Self` generic is used for **recursive type inference**. Without it, TypeScript cannot infer the constructor return type correctly. The class definition needs to reference itself before it's fully defined.

From `Schema.ts` lines 9194-9207:

```typescript
export const Class = <Self = never>(identifier: string) =>
<Fields extends Struct.Fields>(
  fieldsOr: Fields | HasFields<Fields>,
  annotations?: ClassAnnotations<Self, Simplify<Struct.Type<Fields>>>
): [Self] extends [never]
    ? MissingSelfGeneric<"Class">  // Compile error if Self not provided
    : Class<
        Self,
        Fields,
        Struct.Encoded<Fields>,
        Struct.Context<Fields>,
        Struct.Constructor<Fields>,
        {},
        {}
      >
```

The `[Self] extends [never]` check enforces that `Self` is provided, otherwise it returns the branded error type `MissingSelfGeneric`.

### The Double-Arrow Factory Pattern

```typescript
S.Class<Self>(identifier)  // First call: captures Self and identifier
  (fields, annotations)    // Second call: receives fields and optional annotations
```

This curried pattern allows:
1. **First arrow**: Capture the `Self` type parameter and identifier string
2. **Second arrow**: Accept fields (with `Self` already bound for type inference)

This pattern appears in:
- `S.Class<Self>(id)(fields, annotations)`
- `Model<Self>(id)(fields, annotations)`
- `VariantSchema.Class<Self>(id)(fields, annotations)`

---

## Pattern 2: The `makeClass` Internal Implementation

### Core Structure

From `Schema.ts` lines 9400-9599, the `makeClass` function is the workhorse behind all class schemas:

```typescript
const makeClass = <Fields extends Struct.Fields>(
  { Base, annotations, disableToString, fields, identifier, kind, schema }: {
    kind: "Class" | "TaggedClass" | "TaggedError" | "TaggedRequest"
    identifier: string
    schema: Schema.Any          // The base struct schema
    fields: Fields
    Base: new(...args: ReadonlyArray<any>) => any  // Parent class
    annotations?: ClassAnnotations<any, any> | undefined
    disableToString?: boolean | undefined
  }
): any => {
  // 1. Create unique class symbol for instanceof checks
  const classSymbol = Symbol.for(`effect/Schema/${kind}/${identifier}`)

  // 2. Extract annotation layers
  const [typeAnnotations, transformationAnnotations, encodedAnnotations] =
    getClassAnnotations(annotations)

  // 3. Create surrogate schemas for different sides of transformation
  const declarationSurrogate = typeSchema(schema).annotations({
    identifier,
    ...typeAnnotations
  })

  const typeSide = typeSchema(schema).annotations({
    [AST.AutoTitleAnnotationId]: `${identifier} (Type side)`,
    ...typeAnnotations
  })

  const constructorSchema = schema.annotations({
    [AST.AutoTitleAnnotationId]: `${identifier} (Constructor)`,
    ...typeAnnotations
  })

  const encodedSide = schema.annotations({
    [AST.AutoTitleAnnotationId]: `${identifier} (Encoded side)`,
    ...encodedAnnotations
  })

  // 4. Create the actual class extending Base
  const klass = class extends Base {
    constructor(props = {}, options = false) {
      props = { ...props }
      if (kind !== "Class") {
        delete props["_tag"]  // TaggedClass/Error/Request handle _tag specially
      }
      props = lazilyMergeDefaults(fields, props)
      if (!getDisableValidationMakeOption(options)) {
        props = ParseResult.validateSync(constructorSchema)(props)
      }
      super(props, true)
    }

    // Schema interface implementation
    static [TypeId] = variance

    static get ast(): AST.AST {
      // Lazy AST creation with caching
      let out = astCache.get(this)
      if (out) return out

      // Create declaration (type-level schema)
      const declaration = declare(
        [schema],
        {
          decode: () => (input, _, ast) =>
            input instanceof this || fallbackInstanceOf(input)
              ? ParseResult.succeed(input)
              : ParseResult.fail(new ParseResult.Type(ast, input)),
          encode: () => (input, options) =>
            input instanceof this
              ? ParseResult.succeed(input)
              : ParseResult.map(
                  ParseResult.encodeUnknown(typeSide)(input, options),
                  (props) => new this(props, true)
                )
        },
        { identifier, ...typeAnnotations }
      )

      // Create transformation AST
      out = transform(
        encodedSide,
        declaration,
        {
          strict: true,
          decode: (i) => new this(i, true),
          encode: identity
        }
      ).annotations({
        [AST.SurrogateAnnotationId]: transformationSurrogate.ast,
        ...transformationAnnotations
      }).ast

      astCache.set(this, out)
      return out
    }

    static make(...args) {
      return new this(...args)
    }

    static fields = { ...fields }

    static identifier = identifier
  }

  return klass
}
```

### Key Insights for ModelBuilder

1. **Base Class**: We need to pass `data_.Class` as the `Base` parameter (same as Effect Schema)
2. **Schema Parameter**: The "select" variant schema (the default representation)
3. **Fields Parameter**: The original DSL fields with column metadata
4. **AST Creation**: Lazy evaluation with caching via `astCache`
5. **Transformation AST**: Classes are transformations from encoded → declared type
6. **Static Properties**: Added directly to the class after `makeClass` returns

---

## Pattern 3: How `M.Class` from `@effect/sql/Model` Works

### VariantSchema Integration

From `@effect/sql/Model.ts` lines 19-32:

```typescript
const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
  fieldFromKey
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})
```

This creates a **VariantSchema instance** configured for 6 variants. The `Class` factory it returns is specialized for these variants.

### VariantSchema.Class Implementation

From `@effect/experimental/VariantSchema.ts` lines 495-516:

```typescript
function Class<Self>(identifier: string) {
  return function(
    fields: Struct.Fields,
    annotations?: Schema.Annotations.Schema<Self>
  ) {
    // 1. Create variant struct from fields
    const variantStruct = Struct(fields)

    // 2. Extract the default variant (select) schema
    const schema = extract(variantStruct, options.defaultVariant, {
      isDefault: true
    })

    // 3. Create base class using S.Class with select variant fields
    class Base extends Schema.Class<any>(identifier)(schema.fields, annotations) {
      static [TypeId] = fields  // Attach original variant fields
    }

    // 4. Add variant accessors using Object.defineProperty
    for (const variant of options.variants) {
      Object.defineProperty(Base, variant, {
        value: extract(variantStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`
        })
      })
    }

    return Base
  }
}
```

### How It Works

1. **Variant Struct**: `Struct(fields)` creates a VariantSchema-aware structure
2. **Select Variant Extraction**: The default variant becomes the base class schema
3. **S.Class Delegation**: Internally calls `Schema.Class<any>(identifier)(schema.fields, annotations)`
4. **Variant Accessors**: Each variant (select, insert, update, etc.) added as static property
5. **Lazy Evaluation**: Variant schemas extracted on-demand

---

## Pattern 4: Our DSL `Model` Implementation

### Structure Overview

From `Model.ts` lines 432-511:

```typescript
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<`("${typeof identifier}")`>
    : ModelClassWithVariants<...> => {

    // 1. Extract column metadata from fields
    const columns = extractColumns(fields)

    // 2. Validate all model invariants (identifier, primaryKey, etc.)
    validateModelInvariants(identifier, fields, columns as Record<string, ColumnDef>)

    const primaryKey = derivePrimaryKey(columns)
    const tableName = toSnakeCase(identifier)

    // 3. Create internal VariantSchema instance
    const VS = createModelVariantSchema()

    // 4. Convert DSL fields to VariantSchema fields
    const variantFields = toVariantFields(fields, VS)
    const vsStruct = VS.Struct(variantFields as UnsafeTypes.UnsafeAny)

    // 5. Extract "select" variant to get plain schema fields
    const selectSchema = VS.extract(vsStruct, "select")

    // 6. Create base class using S.Class with select variant
    class BaseClass extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(selectSchema.fields, annotations) {
      static readonly tableName = tableName
      static readonly columns = columns
      static readonly primaryKey = primaryKey
      static override readonly identifier = identifier
      static readonly _fields = fields
    }

    // 7. Add 6 variant accessors with lazy evaluation + cache
    const variantCache: Record<string, S.Schema.All> = {}

    for (const variant of ModelVariant.Options) {
      Object.defineProperty(BaseClass, variant, {
        get: () => {
          if (variantCache[variant] === undefined) {
            variantCache[variant] = VS.extract(vsStruct, variant).annotations({
              identifier: `${identifier}.${variant}`,
              title: `${identifier}.${variant}`,
            })
          }
          return variantCache[variant]
        },
        enumerable: true,
        configurable: false,
      })
    }

    return BaseClass as UnsafeTypes.UnsafeAny
  }
```

### Key Patterns

1. **Column Metadata Extraction**: `extractColumns(fields)` pulls `ColumnMetaSymbol` from each field
2. **Validation First**: `validateModelInvariants()` checks all DSL invariants before class creation
3. **VariantSchema Conversion**: `toVariantFields()` transforms DSL fields → VariantSchema-compatible
4. **Select Variant Base**: The "select" variant becomes the base class schema (same as M.Class)
5. **Static Metadata**: `tableName`, `columns`, `primaryKey` added as static readonly
6. **Lazy Variant Accessors**: Getters with caching to avoid re-extracting schemas
7. **Type Erasure**: Final cast to `UnsafeTypes.UnsafeAny` to bypass TypeScript limitations

---

## Pattern 5: Annotation Attachment

### Annotation Levels

Annotations can be attached at multiple levels:

```typescript
// 1. Schema-level annotations (for the decoded type)
const schema = S.String.annotations({
  identifier: "UserId",
  title: "User Identifier",
  description: "Unique identifier for a user"
})

// 2. AST-level annotations (via Symbol keys)
const ast = schema.ast
const annotated = AST.annotations(ast, {
  [ColumnMetaSymbol]: { type: "uuid", primaryKey: true }
})

// 3. Class-level annotations (passed to Class/Model factory)
class User extends S.Class<User>("User")(
  { id: S.String, name: S.String },
  {
    identifier: "User",
    title: "User Model",
    description: "Represents a user entity"
  }
)
```

### ClassAnnotations Type

From the `makeClass` implementation, `ClassAnnotations` can be:

1. **Single annotation object**: Applied to type side
2. **Array `[type, transformation, encoded]`**: Fine-grained control
3. **Undefined**: No annotations

```typescript
type ClassAnnotations<Self, A> =
  | Annotations.Schema<Self>
  | [
      Annotations.Schema<Self>?,         // Type annotations
      Annotations.Schema<Self>?,         // Transformation annotations
      Annotations.Schema<A>?             // Encoded annotations
    ]
```

### Our DSL Column Metadata Pattern

```typescript
// Symbol for column metadata
export const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/schema/integrations/sql/dsl/types:column-meta")

// DSLField carries metadata via symbol property
export interface DSLField<A, I = A, R = never, C extends ColumnDef = ColumnDef>
  extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: C
}

// Also attached to AST annotations
const getColumnDef = (field: unknown): ColumnDef => {
  // Case 1: Direct property access (DSLField)
  if (field && typeof field === "object" && ColumnMetaSymbol in field) {
    const meta = (field as any)[ColumnMetaSymbol]
    if (meta !== undefined) return meta
  }

  // Case 2: Check AST annotations
  if (S.isSchema(field)) {
    const ast = field.ast
    return F.pipe(
      ast,
      AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
      O.getOrElse(() => defaultColumnDef)
    )
  }

  return defaultColumnDef
}
```

---

## Pattern 6: ModelClassWithVariants Interface

### Type-Level Structure

From `types.ts` lines 1035-1055:

```typescript
export interface ModelClassWithVariants<
  Self,
  Fields extends DSL.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
> extends ModelClass<Self, Fields, TName, Columns, PK, Id> {
  /** Schema for SELECT queries - all fields */
  readonly select: S.Struct<S.Simplify<ExtractVariantFields<"select", Fields>>>;
  /** Schema for INSERT operations - excludes Generated fields */
  readonly insert: S.Struct<S.Simplify<ExtractVariantFields<"insert", Fields>>>;
  /** Schema for UPDATE operations - all fields */
  readonly update: S.Struct<S.Simplify<ExtractVariantFields<"update", Fields>>>;
  /** Schema for JSON output - excludes Sensitive fields */
  readonly json: S.Struct<S.Simplify<ExtractVariantFields<"json", Fields>>>;
  /** Schema for JSON create input - excludes Generated and Sensitive */
  readonly jsonCreate: S.Struct<S.Simplify<ExtractVariantFields<"jsonCreate", Fields>>>;
  /** Schema for JSON update input - excludes Generated and Sensitive */
  readonly jsonUpdate: S.Struct<S.Simplify<ExtractVariantFields<"jsonUpdate", Fields>>>;
}
```

### Base ModelClass Interface

From `types.ts` lines 1063-1085:

```typescript
export interface ModelClass<
  Self,
  Fields extends DSL.Fields,
  TName extends string,
  Columns extends Record<string, ColumnDef>,
  PK extends readonly string[],
  Id extends string,
> extends
  S.Schema<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>,
  ModelStatics<TName, Columns, PK, Id, Fields>
{
  // Constructor signature
  new (
    props: S.Struct.Constructor<SelectVariantFields<Fields>>,
    options?: { readonly disableValidation?: boolean }
  ): S.Struct.Type<SelectVariantFields<Fields>>;

  // Schema properties
  readonly ast: import("effect/SchemaAST").Transformation;
  readonly fields: SelectVariantFields<Fields>;

  // Class utilities
  make<Args extends ReadonlyArray<unknown>, X>(this: { new (...args: Args): X }, ...args: Args): X;

  annotations(
    annotations: S.Annotations.Schema<Self>
  ): S.SchemaClass<Self, S.Struct.Encoded<SelectVariantFields<Fields>>, S.Struct.Context<SelectVariantFields<Fields>>>;
}
```

### ModelStatics Interface

From `types.ts` lines 1092-1105:

```typescript
export interface ModelStatics<
  TName extends string = string,
  Columns extends Record<string, ColumnDef> = Record<string, ColumnDef>,
  PK extends readonly string[] = readonly string[],
  Id extends string = string,
  Fields extends DSL.Fields = DSL.Fields,
> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  /** Original DSL fields - used for extracting encoded types in toDrizzle */
  readonly _fields: Fields;
}
```

---

## Synthesis: Optimal Pattern for ModelBuilder.create()

### Recommended Approach

Based on the patterns analyzed, `ModelBuilder.create()` should:

1. **Follow the DSL Model Factory Pattern**: Use the exact same structure as the current `Model` factory
2. **Generate Class Expression**: Create an anonymous class that extends `S.Class<Self>(identifier)(selectFields, annotations)`
3. **Add Static Metadata**: Attach `tableName`, `columns`, `primaryKey`, `_fields` as static properties
4. **Lazy Variant Accessors**: Use `Object.defineProperty` with getters + cache for each variant
5. **Return Typed Result**: Cast to `ModelClassWithVariants<...>` interface

### Implementation Blueprint

```typescript
const createModelClass = <Fields extends DSL.Fields>(
  identifier: string,
  fields: Fields,
  annotations?: S.Annotations.Schema<any>
) => {
  // 1. Extract and validate
  const columns = extractColumns(fields)
  validateModelInvariants(identifier, fields, columns as Record<string, ColumnDef>)
  const primaryKey = derivePrimaryKey(columns)
  const tableName = toSnakeCase(identifier)

  // 2. Create VariantSchema instance
  const VS = createModelVariantSchema()
  const variantFields = toVariantFields(fields, VS)
  const vsStruct = VS.Struct(variantFields)

  // 3. Extract select variant
  const selectSchema = VS.extract(vsStruct, "select")

  // 4. Create base class
  class BaseClass extends S.Class<any>(identifier)(selectSchema.fields, annotations) {
    static readonly tableName = tableName
    static readonly columns = columns
    static readonly primaryKey = primaryKey
    static override readonly identifier = identifier
    static readonly _fields = fields
  }

  // 5. Add variant accessors
  const variantCache: Record<string, S.Schema.All> = {}
  for (const variant of ModelVariant.Options) {
    Object.defineProperty(BaseClass, variant, {
      get: () => {
        if (variantCache[variant] === undefined) {
          variantCache[variant] = VS.extract(vsStruct, variant).annotations({
            identifier: `${identifier}.${variant}`,
            title: `${identifier}.${variant}`,
          })
        }
        return variantCache[variant]
      },
      enumerable: true,
      configurable: false,
    })
  }

  return BaseClass
}
```

### For ModelBuilder.create()

```typescript
export class ModelBuilder {
  create<const Name extends string>(
    name: Name
  ): (<Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<any>
  ) => {
    // Return a constructor function that creates a class extending the generated base
    new <Self>(): {
      new (
        props: S.Struct.Constructor<SelectVariantFields<Fields>>,
        options?: { readonly disableValidation?: boolean }
      ): S.Struct.Type<SelectVariantFields<Fields>>
    } & ModelClassWithVariants<Self, Fields, SnakeCase<Name>, ExtractColumnsType<Fields>, DerivedPrimaryKey<Fields>, Name>
  }) {
    return (fields, annotations) => {
      // Generate base class
      const BaseClass = createModelClass(name, fields, annotations)

      // Return a factory that creates extended classes
      return function<Self>() {
        return class extends BaseClass {
          // User can add custom methods here
        } as any
      }
    }
  }
}
```

### Usage Pattern

```typescript
const User = ModelBuilder.create("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String, { column: { type: "string" } }),
  createdAt: M.DateTimeInsert
})<User>()

class User extends User {
  // Custom methods
  get displayName() {
    return this.name.toUpperCase()
  }
}

// User has all static properties and variant schemas
User.tableName       // "user"
User.columns.id      // { type: "uuid", primaryKey: true }
User.select          // S.Struct<{ id: S.UUID, name: S.String, createdAt: DateTime.Utc }>
User.insert          // S.Struct<{ id: S.UUID, name: S.String }> (excludes Generated createdAt)
```

---

## Alternative Approaches

### Alternative 1: Direct Class Expression

Generate the full class expression as a string and `eval()` it:

```typescript
const classCode = `
class ${identifier} extends S.Class<${identifier}>("${identifier}")(
  ${JSON.stringify(selectFields)},
  ${JSON.stringify(annotations)}
) {
  static readonly tableName = "${tableName}"
  static readonly columns = ${JSON.stringify(columns)}
  // ... etc
}
return ${identifier}
`
return eval(classCode)
```

**Pros**: Generates exact source code pattern
**Cons**:
- Security risk (eval)
- No type safety
- Debugging difficulty
- CSP violations

### Alternative 2: Proxy-Based Class Factory

Use Proxy to intercept class construction:

```typescript
return new Proxy(BaseClass, {
  construct(target, args) {
    const instance = new target(...args)
    // Add custom behavior
    return instance
  },
  get(target, prop) {
    if (prop === 'select') return variantCache.select || (variantCache.select = VS.extract(...))
    // ... etc
    return target[prop]
  }
})
```

**Pros**: Flexible interception
**Cons**:
- Performance overhead
- `instanceof` checks may fail
- Complexity

### Alternative 3: Code Generation at Build Time

Generate `.ts` files during build:

```typescript
// Generated file: models/User.ts
import { Model } from "@beep/schema/integrations/sql/dsl"

export class User extends Model<User>("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String, { column: { type: "string" } })
}) {}
```

**Pros**:
- Best type safety
- No runtime overhead
- Standard pattern

**Cons**:
- Build step complexity
- Less dynamic
- Not suitable for runtime model creation

---

## Integration with beep-effect

### Current Architecture Fit

The recommended pattern fits beep-effect's architecture because:

1. **Effect-First**: No `async/await`, pure Effect operations
2. **Schema-Based**: Leverages Effect Schema throughout
3. **Type-Safe**: Full type inference preserved
4. **Immutable**: Static properties are `readonly`
5. **Validated**: Uses existing `validateModelInvariants` function
6. **Composable**: Can be combined with other DSL utilities

### Package Location

`ModelBuilder` should live in:
```
packages/common/schema/src/integrations/sql/dsl/ModelBuilder.ts
```

Alongside:
- `Model.ts` - Current Model factory
- `Field.ts` - Field factory
- `combinators.ts` - Field combinators
- `types.ts` - Type definitions

### Dependencies

```typescript
import * as S from "effect/Schema"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as Struct from "effect/Struct"
import * as VariantSchema from "@effect/experimental/VariantSchema"
import { createModelVariantSchema, toVariantFields } from "./Model.ts"
import { extractColumns, derivePrimaryKey, validateModelInvariants } from "./Model.ts"
import type { DSL, ModelClassWithVariants, ColumnDef } from "./types.ts"
```

---

## Trade-offs

### Pattern Selection Trade-offs

| Approach | Type Safety | Runtime Performance | Developer Experience | Maintainability |
|----------|-------------|---------------------|---------------------|-----------------|
| **Recommended (Class Expression)** | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Direct eval() | ❌ Poor | ✅ Excellent | ⚠️ Medium | ❌ Poor |
| Proxy-based | ✅ Good | ⚠️ Medium | ⚠️ Medium | ⚠️ Medium |
| Build-time codegen | ✅ Excellent | ✅ Excellent | ⚠️ Medium | ⚠️ Medium |

### Recommended Pattern Advantages

1. **Reuses existing Model factory logic**: No duplication
2. **Preserves all type inference**: TypeScript understands the generated classes
3. **No eval security issues**: Pure JavaScript class expressions
4. **Debuggable**: Clear stack traces and source mapping
5. **Extensible**: Users can add methods to generated classes
6. **Testable**: Standard class testing patterns apply

### Recommended Pattern Disadvantages

1. **Verbose type annotations**: Requires careful type parameter threading
2. **Self generic ergonomics**: Users must provide `<User>()` when extending
3. **Type complexity**: Deep generic nesting in implementation

---

## References

### Effect Documentation

- [Effect Schema Classes](https://effect.website/docs/schema/classes) - Official S.Class documentation
- [VariantSchema](https://effect.website/docs/experimental/variant-schema) - Experimental VariantSchema guide
- [@effect/sql Model](https://effect.website/docs/sql/model) - SQL Model pattern documentation

### Source Files

- `node_modules/effect/src/Schema.ts`
  - Line 9194: `S.Class` factory signature
  - Line 9400: `makeClass` implementation
- `node_modules/@effect/experimental/src/VariantSchema.ts`
  - Line 467: `VariantSchema.Class` signature
  - Line 495: `VariantSchema.Class` implementation
- `node_modules/@effect/sql/src/Model.ts`
  - Line 19: VariantSchema instantiation
  - Line 80: `M.Class` usage example
- `packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - Line 432: DSL `Model` factory implementation

### Related Patterns

- Effect Schema Transformation AST pattern
- VariantSchema field extraction algorithm
- DSL column metadata attachment pattern
- S.Class recursive type inference pattern

---

## Conclusion

The optimal pattern for `ModelBuilder.create()` is to **follow the existing DSL Model factory structure exactly**, generating class expressions that:

1. Extend `S.Class<Self>(identifier)(selectFields, annotations)`
2. Add static metadata (`tableName`, `columns`, `primaryKey`, `_fields`)
3. Attach variant accessors via lazy getters with caching
4. Preserve all type-level inference through careful generic parameter threading

This approach maximizes type safety, runtime performance, and developer experience while maintaining full compatibility with the existing DSL architecture. The implementation should be straightforward since it reuses all existing utilities from `Model.ts`.

**Next Steps:**

1. Implement `createModelClass` helper in `ModelBuilder.ts`
2. Add `ModelBuilder.create()` method with proper type signatures
3. Write tests for generated classes (construction, statics, variants, methods)
4. Update DSL documentation with ModelBuilder usage patterns
5. Add examples showing custom method addition to generated classes
