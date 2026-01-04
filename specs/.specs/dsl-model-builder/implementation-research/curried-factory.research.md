# Curried Factory Patterns in Effect - Research Report

## Executive Summary

This research documents curried factory patterns used throughout the Effect ecosystem, with specific focus on how `Schema.Class`, `Model.Class`, `VariantSchema.Class`, and the DSL `Field` factory achieve type-safe multi-stage function application. These patterns provide excellent templates for implementing `ModelBuilder.create()` with the signature:

```typescript
ModelBuilder.create(config) => (identifier) => (fields) => ModelClass
```

The key insight is that Effect's curried factories use **closure capture** to preserve configuration context across multiple function calls while maintaining full type inference at each stage.

## Problem Statement

We need to implement a three-stage curried factory that:
1. Accepts build configuration (table naming strategy, column transformations)
2. Accepts a model identifier (string name)
3. Accepts field definitions
4. Returns a fully configured Model class

The challenge is preserving type parameters and configuration context through three levels of currying while maintaining TypeScript's type inference capabilities.

## Research Sources

### Effect Documentation
- Schema constructors: `S.Class`, `S.TaggedClass`, `S.TaggedError`
- Model patterns from `@effect/sql`

### Source Code Analysis
- `effect/src/Schema.ts` - `Class` implementation (lines 9194-9215)
- `@effect/sql/src/Model.ts` - `Model.Class` implementation (lines 19-157)
- `@effect/experimental/src/VariantSchema.ts` - `VariantSchema.Class` (lines 494-517)
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Curried `Field` factory (lines 245-333)
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Current DSL `Model` factory (lines 432-511)

### Ecosystem Libraries
- `@effect/experimental/VariantSchema` - Multi-variant schema patterns
- `@effect/sql/Model` - Repository-oriented model classes

## Recommended Approach

### Pattern Overview: Multi-Level Curried Factory

The canonical Effect pattern for multi-stage factories follows this structure:

```typescript
export const Factory = <Config>(config: Config) =>
  <Identifier>(identifier: Identifier) =>
    <Fields>(fields: Fields): Result<Config, Identifier, Fields> => {
      // Implementation has access to all three parameters via closure
      // Each stage can perform type-level transformations
      return constructResult(config, identifier, fields)
    }
```

### Key Architectural Principles

#### 1. Closure Capture for Configuration Propagation

Each curried level returns a function that captures previous parameters in its closure:

```typescript
// From Schema.Class implementation
export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Simplify<Struct.Type<Fields>>>
  ): ClassResult<Self, Fields> => {
    // 'identifier' is captured from outer scope
    return makeClass({
      kind: "Class",
      identifier,  // ← Closure capture
      schema: getSchemaFromFieldsOr(fieldsOr),
      fields: getFieldsFromFieldsOr(fieldsOr),
      Base: data_.Class,
      annotations
    })
  }
```

**Key insight**: Each stage only needs to return a function - the configuration flows through closures automatically.

#### 2. Type-Level Conditional Returns

Use conditional types to enforce `Self` generic parameter:

```typescript
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends Class<Self>()${Params}({ ... })\``

export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fields: Fields,
    annotations?: Annotations<Self>
  ): [Self] extends [never]
    ? MissingSelfGeneric<"Class">  // ← Compile error with helpful message
    : ClassResult<Self, Fields>    // ← Actual return type
```

This pattern forces users to provide the `Self` generic: `class User extends Model<User>()("User")({ ... })`

#### 3. Lazy Evaluation with Object.defineProperty

For expensive computed properties (like variant schemas), use lazy getters:

```typescript
// From Model.ts - Adding 6 variant accessors
const variantCache: Record<string, S.Schema.All> = {}

for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = VS.extract(vsStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`
        })
      }
      return variantCache[variant]
    },
    enumerable: true,
    configurable: false
  })
}
```

**Benefits**:
- Variants only computed when accessed
- Cached for subsequent access
- No overhead if unused

#### 4. The `make` Helper Pattern

Complex factories often use an internal `make` helper that receives all accumulated parameters:

```typescript
// From VariantSchema.Class
function Class<Self>(identifier: string) {
  return function(
    fields: Struct.Fields,
    annotations?: Schema.Annotations.Schema<Self>
  ) {
    const variantStruct = Struct(fields)
    const schema = extract(variantStruct, options.defaultVariant, {
      isDefault: true
    })

    // Use S.Class as the foundation
    class Base extends Schema.Class<any>(identifier)(schema.fields, annotations) {
      static [TypeId] = fields  // Add variant-specific metadata
    }

    // Augment with variant accessors
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

**Key insight**: Delegate to existing lower-level factories (`Schema.Class`) and augment the result.

### Implementation Strategy for ModelBuilder

#### Stage 1: Configuration Capture

```typescript
export const create = <const Config extends BuilderConfig>(config: Config) =>
```

**Responsibilities**:
- Accept builder configuration (table naming, column transformers)
- Validate configuration if needed
- Return the identifier-accepting function

**Type parameters captured**: `Config`

#### Stage 2: Identifier Capture

```typescript
<Self = never>(identifier: string) =>
```

**Responsibilities**:
- Accept model identifier string
- Validate identifier (length, SQL compatibility)
- Apply table naming strategy from config
- Return the fields-accepting function

**Type parameters captured**: `Self` (user must provide)
**Runtime values captured**: `config`, `identifier`

#### Stage 3: Fields Processing and Class Construction

```typescript
<const Fields extends DSL.Fields>(
  fields: Fields,
  annotations?: S.Annotations.Schema<Self>
): [Self] extends [never]
  ? MissingSelfGeneric<`("${typeof identifier}")`>
  : ModelClassWithVariants<Self, Fields, ...>
```

**Responsibilities**:
- Process fields into variant-compatible format
- Derive columns metadata
- Derive primary key(s)
- Compute table name from identifier + config strategy
- Construct base class using `S.Class`
- Attach static properties (tableName, columns, primaryKey)
- Attach variant accessors (select, insert, update, json, jsonCreate, jsonUpdate)

**Complete context available**: `config`, `identifier`, `fields`, `annotations`

### Detailed Implementation Pattern

```typescript
// Builder.ts
import * as S from "effect/Schema"
import * as F from "effect/Function"
import { Model } from "./Model"
import type { BuilderConfig, DSL } from "./types"

export const create = <const Config extends BuilderConfig>(config: Config) =>
  <Self = never>(identifier: string) =>
    <const Fields extends DSL.Fields>(
      fields: Fields,
      annotations?: S.Annotations.Schema<Self>
    ): [Self] extends [never]
      ? MissingSelfGeneric<`("${typeof identifier}")`>
      : ModelClassWithVariants<Self, Fields, ...> =>
{
  // All three parameters available here via closure

  // 1. Apply table naming strategy from config
  const tableName = F.pipe(
    identifier,
    config.tableNaming ?? defaultToSnakeCase
  )

  // 2. Apply field transformations from config
  const transformedFields = config.fieldTransform
    ? F.pipe(fields, config.fieldTransform)
    : fields

  // 3. Delegate to Model factory (which handles variant extraction)
  const ModelClass = Model<Self>(identifier)(transformedFields, annotations)

  // 4. Override tableName if config specified a strategy
  if (config.tableNaming) {
    // Use Object.defineProperty to override static property
    Object.defineProperty(ModelClass, 'tableName', {
      value: tableName,
      writable: false,
      enumerable: true,
      configurable: false
    })
  }

  // 5. Apply any additional config-based augmentations
  if (config.addTimestamps) {
    // Augment with timestamp tracking logic
  }

  return ModelClass as any  // Type assertion to satisfy return type
}
```

### Type Safety Considerations

#### Preserving Type Parameters Through Currying

Each stage must declare its type parameters and pass them forward:

```typescript
// Stage 1: Captures Config
create<Config>(config) =>

// Stage 2: Introduces Self
  <Self = never>(identifier) =>

  // Stage 3: Introduces Fields, has access to Config and Self
    <Fields extends DSL.Fields>(fields) =>

    // Result type has access to all three
      Result<Config, Self, Fields>
```

#### Type-Level Configuration Validation

Use conditional types to validate configuration at compile time:

```typescript
type ValidateConfig<C extends Partial<BuilderConfig>> =
  C extends { tableNaming: infer TN }
    ? TN extends (id: string) => string
      ? C  // Valid
      : { error: "tableNaming must be (id: string) => string" }
    : C  // tableNaming is optional
```

#### Avoiding Type Widening

Use `const` type parameters and `as const` assertions:

```typescript
// ✅ Preserves literal types
create<const Config>({ tableNaming: "snake_case" as const })

// ❌ Widens to string
create({ tableNaming: "snake_case" })
```

## Pattern Comparison: Field vs Model

### Two-Stage Currying: Field Factory

The DSL `Field` factory demonstrates a simpler two-stage pattern:

```typescript
// Stage 1: Accept schema
export function Field<Schema extends S.Schema.All>(schema: Schema):
  // Returns configurator function
  SchemaConfiguratorWithSchema<Schema>

// Stage 2: Accept config
type SchemaConfiguratorWithSchema<Schema> = <const C extends Partial<ColumnDef>>(
  config?: FieldConfig<C>
) => DSLField<...>

// Implementation
export function Field(input: S.Schema.All | VariantSchema.Field) {
  return <C extends Partial<ColumnDef>>(config?: FieldConfig<C>) => {
    // Compute column def from schema + config
    const columnDef = {
      type: config?.column?.type ?? deriveColumnType(extractASTFromInput(input)),
      primaryKey: config?.column?.primaryKey ?? false,
      unique: config?.column?.unique ?? false,
      autoIncrement: config?.column?.autoIncrement ?? false
    }

    // Attach metadata to schema
    if (isVariantField(input)) {
      const result = Object.create(Object.getPrototypeOf(input))
      Object.assign(result, input)
      result[ColumnMetaSymbol] = columnDef
      return result
    }

    // Plain schema: use annotations
    return input.annotations({ [ColumnMetaSymbol]: columnDef })
  }
}
```

**Key insights**:
- First call captures the schema
- Second call applies configuration
- Both type and runtime metadata flow through the pipeline

### One-Stage with Defaults: Model Factory

The current DSL `Model` factory is actually one-stage curried (identifier only):

```typescript
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): ModelClass<Self, Fields, ...>
```

**Why not more stages?**
- Identifier is the natural point of configuration
- Fields are the "payload" - keeping them in the same call improves ergonomics
- Table name derivation is deterministic (snake_case)

**For ModelBuilder**, we add a configuration stage before identifier:

```typescript
ModelBuilder.create(config) => (identifier) => (fields) => ModelClass
                    ↑              ↑              ↑
                   New         Existing      Existing
```

## Alternative Approaches Considered

### Approach 1: Single-Call Factory with Options Object

```typescript
ModelBuilder.create({
  config: { tableNaming: "snake_case" },
  identifier: "User",
  fields: { ... }
})
```

**Pros**: Simpler type inference, all parameters visible at once
**Cons**: Doesn't match Effect idioms, loses progressive type refinement
**Verdict**: ❌ Not idiomatic for Effect

### Approach 2: Method Chaining (Builder Pattern)

```typescript
ModelBuilder
  .create()
  .withConfig({ tableNaming: "snake_case" })
  .withIdentifier("User")
  .withFields({ ... })
  .build()
```

**Pros**: Familiar OOP pattern, self-documenting
**Cons**: Requires mutable state or complex immutable chain, not functional
**Verdict**: ❌ Doesn't align with Effect functional style

### Approach 3: Three-Stage Curried Factory (Recommended)

```typescript
ModelBuilder.create(config)(identifier)(fields)
```

**Pros**: Matches Effect patterns, enables partial application, pure functions
**Cons**: More complex type signatures
**Verdict**: ✅ **Selected approach** - aligns with Effect ecosystem

## Integration with beep-effect

### Consistency with Existing Patterns

The three-stage curried pattern aligns with:

1. **Schema.Class**: `S.Class<Self>(identifier)(fields)`
2. **Model.Class**: `M.Class<Self>(identifier)(fields)` (from `@effect/sql`)
3. **VariantSchema.Class**: Same pattern
4. **Field factory**: Two-stage currying for schema + config

Adding a config stage is a natural extension that doesn't break the established pattern.

### Usage in beep-effect Codebase

```typescript
// Standard model (current DSL)
class User extends Model<User>("User")({
  id: Field(S.UUID)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } })
}) {}

// With ModelBuilder (proposed)
const UserModel = ModelBuilder
  .create({ tableNaming: "snake_case", addTimestamps: true })

class User extends UserModel<User>("User")({
  id: Field(S.UUID)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } })
}) {}
```

**Benefits**:
- Configuration reuse across multiple models
- Centralized table naming strategy
- Optional timestamp injection
- Maintains familiar syntax after config stage

### Deployment Considerations

#### Backward Compatibility

The existing `Model` factory remains unchanged. `ModelBuilder.create` is additive:

```typescript
// Option 1: Keep using Model directly (no config)
class User extends Model<User>("User")({ ... }) {}

// Option 2: Use ModelBuilder for config
const CustomModel = ModelBuilder.create({ ... })
class User extends CustomModel<User>("User")({ ... }) {}
```

#### Migration Path

1. **Phase 1**: Introduce `ModelBuilder.create` alongside existing `Model`
2. **Phase 2**: Migrate models that need custom config to `ModelBuilder`
3. **Phase 3**: (Optional) Make `Model = ModelBuilder.create(defaultConfig)` for consistency

## Code Examples

### Example 1: Basic Three-Stage Factory

```typescript
import * as S from "effect/Schema"
import * as F from "effect/Function"
import * as Str from "effect/String"

// Configuration type
interface ModelConfig {
  readonly tableNaming: "snake_case" | "pascal_case" | ((id: string) => string)
  readonly addTimestamps?: boolean
}

// Stage 1: Config
export const create = <const Config extends ModelConfig>(config: Config) =>
  // Stage 2: Identifier
  <Self = never>(identifier: string) =>
    // Stage 3: Fields
    <const Fields extends Record<string, S.Schema.All>>(
      fields: Fields
    ): ModelClass<Self, Fields, Config> => {

      // Compute table name from identifier + config
      const tableName = typeof config.tableNaming === "function"
        ? config.tableNaming(identifier)
        : config.tableNaming === "snake_case"
          ? F.pipe(identifier, toSnakeCase)
          : identifier

      // Add timestamps if configured
      const augmentedFields = config.addTimestamps
        ? {
            ...fields,
            createdAt: S.DateTimeInsert,
            updatedAt: S.DateTimeUpdate
          }
        : fields

      // Build the model
      class ModelClass extends S.Class<Self>(identifier)(augmentedFields) {
        static readonly tableName = tableName
        static readonly config = config
      }

      return ModelClass as any
    }

// Helper
const toSnakeCase = (str: string) =>
  F.pipe(
    str,
    Str.replace(/([A-Z])/g, "_$1"),
    Str.toLowerCase,
    Str.replace(/^_/, "")
  )
```

### Example 2: Type-Safe Config Validation

```typescript
import type { UnsafeTypes } from "@beep/types"

// Validate config at type level
type ValidateConfig<C> =
  C extends { tableNaming: infer TN }
    ? TN extends "snake_case" | "pascal_case" | ((id: string) => string)
      ? C
      : { error: "Invalid tableNaming strategy" }
    : C

export const create = <const Config extends ModelConfig>(
  config: Config & ValidateConfig<Config>
) => // ... rest of implementation

// ✅ Valid
create({ tableNaming: "snake_case" })

// ❌ Compile error: Invalid tableNaming strategy
create({ tableNaming: "kebab-case" })
```

### Example 3: Partial Application for Config Reuse

```typescript
// Define a standard config
const StandardModel = ModelBuilder.create({
  tableNaming: "snake_case",
  addTimestamps: true
})

// Reuse across multiple models
class User extends StandardModel<User>("User")({
  id: Field(S.UUID)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } })
}) {}

class Post extends StandardModel<Post>("Post")({
  id: Field(S.UUID)({ column: { type: "uuid", primaryKey: true } }),
  title: Field(S.String)({ column: { type: "string" } })
}) {}

// All models share the same config
User.tableName   // "user"
Post.tableName   // "post"
User.columns.createdAt  // DateTime (added by config)
```

### Example 4: Advanced - Multiple Configs

```typescript
// Development config (verbose table names)
const DevModel = ModelBuilder.create({
  tableNaming: (id) => `dev_${toSnakeCase(id)}`,
  addTimestamps: true
})

// Production config (optimized table names)
const ProdModel = ModelBuilder.create({
  tableNaming: "snake_case",
  addTimestamps: false  // Use DB triggers instead
})

// Switch via environment
const Model = process.env.NODE_ENV === "production" ? ProdModel : DevModel

class User extends Model<User>("User")({ ... }) {}

// Development: User.tableName = "dev_user"
// Production:  User.tableName = "user"
```

## Trade-offs and Limitations

### Pros

1. **Configuration Reuse**: Define table naming, timestamp strategies once
2. **Type Safety**: Full type inference across all three stages
3. **Idiomatic**: Matches Effect patterns (Class, Model, VariantSchema)
4. **Composable**: Partial application enables config libraries
5. **Pure**: No mutable state, each stage is a pure function

### Cons

1. **Type Complexity**: Three-stage currying has complex type signatures
2. **Learning Curve**: Users must understand curried API
3. **Nesting**: `ModelBuilder.create(config)(identifier)(fields)` is verbose
4. **Type Errors**: Errors propagate through multiple stages

### Mitigations

1. **Documentation**: Comprehensive examples and type documentation
2. **Helper Functions**: Provide common configs (`StandardModel`, `DevModel`)
3. **Type Aliases**: Export configurator types for clarity
4. **Error Messages**: Use branded error types with helpful messages

## Verification Checklist

- [x] No `async/await` or bare Promises (pure factory functions)
- [x] All configuration typed with Schema or type-level validation
- [x] Uses Effect collections (F.pipe, Str.*, etc.)
- [x] Closure capture for parameter propagation
- [x] Lazy evaluation for expensive computations (Object.defineProperty)
- [x] Type-level validation with helpful error messages
- [x] Backward compatible with existing `Model` factory
- [x] Aligns with Effect ecosystem patterns

## References

### Effect Core Documentation
- [Schema Classes](https://effect.website/docs/schema/classes) - S.Class, S.TaggedClass patterns
- [Schema Annotations](https://effect.website/docs/schema/annotations) - Metadata attachment

### Source Files
- `/node_modules/effect/src/Schema.ts` - Lines 9194-9215 (S.Class)
- `/node_modules/@effect/sql/src/Model.ts` - Lines 19-157 (M.Class)
- `/node_modules/@effect/experimental/src/VariantSchema.ts` - Lines 494-517 (VS.Class)
- `/packages/common/schema/src/integrations/sql/dsl/Field.ts` - Lines 245-333 (Field factory)
- `/packages/common/schema/src/integrations/sql/dsl/Model.ts` - Lines 432-511 (Current DSL Model)

### Key Patterns Identified
1. **Multi-stage currying**: Config → Identifier → Fields → Result
2. **Closure capture**: Each stage captures previous parameters
3. **Lazy evaluation**: Variant schemas computed on-demand with caching
4. **Type-level validation**: Conditional types for compile-time errors
5. **Delegation**: Build on lower-level factories (S.Class) and augment

## Next Steps

1. **Implement ModelBuilder.create**: Follow three-stage curried pattern
2. **Add config validation**: Type-level validation for tableNaming strategies
3. **Write tests**: Unit tests for each currying stage
4. **Document API**: Examples for common config patterns
5. **Integration**: Ensure compatibility with existing DSL Model
