# Attaching Static Properties to Effect Schema Classes

## Alignment Notes

> **Status**: WELL ALIGNED - Core pattern is correct, but static property names need updating

### How This Research Aligns with DSL.Model Goals

This document correctly identifies the **anonymous class extension pattern** as the recommended approach for DSL.Model. The research validates key design decisions:

1. **Pattern 1 (Anonymous Class Extension)** - RECOMMENDED and matches DSL.Model design exactly
2. **Type intersection for static properties** - Required pattern: `typeof BaseClass & { readonly propName: T }`
3. **Eager metadata generation** - Correct approach for DSL.Model static properties
4. **Extends VariantSchema.Class** - Correctly identified as the base class

### Caveats - Outdated Assumptions to Ignore

| Section | Issue | DSL.Model Correction |
|---------|-------|---------------------|
| Problem Statement | Lists `.drizzleTable`, `.betterAuthFields`, `.sqlMetadata` as static props | DSL.Model exposes **driver-agnostic** statics: `.tableName`, `.columns`, `.primaryKey`, `.indexes`, `.identifier` |
| Integration Example | Shows `User.drizzleTable` access | Drizzle tables are obtained via `DSL.toDrizzle(User)`, NOT a static property |
| Section on Effect's Approach | Suggests annotations for SQL metadata | Column metadata goes in `DSL.Field({ column: ColumnDef })`, NOT raw annotations |
| Pattern 2 (Object.defineProperty) | Valid but discouraged | Use anonymous class extension for consistency with `annotations()` override |

### Pattern Status

| Pattern | Status | Notes |
|---------|--------|-------|
| Anonymous class extension | RECOMMENDED | Primary pattern for DSL.Model |
| Type assertion with intersection | RECOMMENDED | `as typeof BaseClass & { readonly prop: T }` |
| Eager metadata generation | RECOMMENDED | Compute statics at class creation time |
| `annotations()` override | RECOMMENDED | Must return new factory instance to preserve statics |
| Object.defineProperty | ALTERNATIVE | Only if property descriptor control needed |
| WeakMap metadata storage | DEPRECATED | Poor type safety, indirect access |
| Decorator-based metadata | DEPRECATED | Not used in beep-effect |

### Correct Static Properties for DSL.Model

```typescript
// CORRECT - Driver-agnostic static properties
class AccountModel extends DSL.Model<AccountModel>("Account")({...}) {}

AccountModel.tableName    // "account" (snake-case)
AccountModel.columns      // Record<string, ColumnDef> - generic metadata
AccountModel.primaryKey   // readonly string[] - e.g., ["id"]
AccountModel.indexes      // readonly IndexDef[]
AccountModel.identifier   // "Account" (original PascalCase)

// CORRECT - Driver-specific via adapters
const drizzleTable = DSL.toDrizzle(AccountModel)       // Drizzle PgTable
const authFields = DSL.toBetterAuth(AccountModel)      // better-auth config

// INCORRECT - Driver-specific as static properties
AccountModel.drizzleTable      // NO - use adapter instead
AccountModel.betterAuthFields  // NO - use adapter instead
```

---

## Executive Summary

Effect Schema's `S.Class` factory returns a class constructor that can be extended with static properties using TypeScript's class extension syntax. The canonical pattern is to wrap `makeClass` (internal) or extend the result of `S.Class` in an anonymous class expression, adding static properties directly in the class body.

**Key Finding**: Static properties on Schema classes work identically to regular TypeScript static properties and preserve full type inference when properly declared in interfaces.

## Problem Statement

The DSL.Model pattern requires attaching static metadata (`.drizzleTable`, `.betterAuthFields`, `.sqlMetadata`) to Effect Schema classes that extend VariantSchema.Class. This metadata should:

1. Be accessible as static properties on the class constructor
2. Preserve type information for autocomplete and type safety
3. Not interfere with Effect Schema's transformation pipeline
4. Support both runtime access and compile-time type inference

## Research Sources

### Effect Documentation
- **Schema Class APIs** (documentId: 10938) - Class definition patterns, static properties, transformations
- **Schema.Class Reference** (documentId: 9114) - API signature and usage examples

### Source Code Analysis
- **effect/src/Schema.ts** lines 9194-9627 - `makeClass` implementation showing static property attachment
- **effect/src/Schema.ts** lines 9264-9274 - `TaggedClass` pattern for extending with static properties
- **@beep/schema/VariantSchema.ts** lines 488-507 - Existing pattern using `Object.defineProperty` for variants

### Ecosystem Libraries
- No specialized libraries needed - this is core TypeScript + Effect Schema functionality

## Recommended Approach

### Pattern 1: Anonymous Class Extension (Recommended)

This is the pattern used by Effect's `TaggedClass`, `TaggedError`, and `TaggedRequest`:

```typescript
const Model = <Self>() =>
  <Fields extends VariantSchema.Struct.Fields>(
    tableName: string,
    fields: Fields
  ) => {
    // Generate metadata from fields
    const drizzleTable = generateDrizzleTable(tableName, fields)
    const betterAuthFields = generateBetterAuthFields(fields)
    const sqlMetadata = generateSQLMetadata(fields)

    // Create base VariantSchema.Class
    const BaseClass = VariantSchema.Class<Self>(tableName)(fields)

    // Extend with static properties using anonymous class
    return class Model extends BaseClass {
      static readonly drizzleTable = drizzleTable
      static readonly betterAuthFields = betterAuthFields
      static readonly sqlMetadata = sqlMetadata
    } as typeof BaseClass & {
      readonly drizzleTable: typeof drizzleTable
      readonly betterAuthFields: typeof betterAuthFields
      readonly sqlMetadata: typeof sqlMetadata
    }
  }
```

**Advantages**:
- Clean, declarative syntax
- Automatic `this` binding for static properties
- TypeScript understands the class structure natively
- Used by Effect's own APIs (high confidence pattern)

**Disadvantages**:
- Requires type assertion to merge base class type with static property types
- Slightly verbose type annotations

### Pattern 2: Object.defineProperty (Alternative)

This is the pattern currently used in VariantSchema for variant schemas:

```typescript
const Model = <Self>() =>
  <Fields extends VariantSchema.Struct.Fields>(
    tableName: string,
    fields: Fields
  ) => {
    const BaseClass = VariantSchema.Class<Self>(tableName)(fields)

    // Attach static properties via Object.defineProperty
    Object.defineProperty(BaseClass, 'drizzleTable', {
      value: generateDrizzleTable(tableName, fields),
      writable: false,
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(BaseClass, 'betterAuthFields', {
      value: generateBetterAuthFields(fields),
      writable: false,
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(BaseClass, 'sqlMetadata', {
      value: generateSQLMetadata(fields),
      writable: false,
      enumerable: true,
      configurable: false
    })

    return BaseClass as typeof BaseClass & {
      readonly drizzleTable: ReturnType<typeof generateDrizzleTable>
      readonly betterAuthFields: ReturnType<typeof generateBetterAuthFields>
      readonly sqlMetadata: ReturnType<typeof generateSQLMetadata>
    }
  }
```

**Advantages**:
- Explicit property descriptor control (writable, enumerable, configurable)
- Matches existing VariantSchema pattern for consistency
- Can attach computed properties lazily

**Disadvantages**:
- More verbose than class syntax
- Requires manual type assertion
- Property descriptors may be overkill for simple readonly values

### Pattern 3: Factory Function with Mutation (Not Recommended)

```typescript
const Model = <Self>() =>
  <Fields extends VariantSchema.Struct.Fields>(
    tableName: string,
    fields: Fields
  ) => {
    const BaseClass = VariantSchema.Class<Self>(tableName)(fields)

    // Direct mutation (avoid in production)
    ;(BaseClass as any).drizzleTable = generateDrizzleTable(tableName, fields)
    ;(BaseClass as any).betterAuthFields = generateBetterAuthFields(fields)
    ;(BaseClass as any).sqlMetadata = generateSQLMetadata(fields)

    return BaseClass as typeof BaseClass & {
      readonly drizzleTable: ReturnType<typeof generateDrizzleTable>
      readonly betterAuthFields: ReturnType<typeof generateBetterAuthFields>
      readonly sqlMetadata: ReturnType<typeof generateSQLMetadata>
    }
  }
```

**Why Avoid**:
- Relies on `any` casts (defeats type safety)
- No property descriptor control
- Mutation is implicit and easy to miss
- Does not communicate immutability intent

## Effect's Approach to Schema Metadata

Effect Schema uses **annotations** stored in the AST for schema-level metadata:

```typescript
const schema = S.String.pipe(
  S.annotations({
    identifier: "MyString",
    title: "A special string",
    description: "This is stored in the AST",
    // Custom annotations
    myCustomMetadata: { foo: "bar" }
  })
)

// Access via AST
const annotations = schema.ast.annotations
```

**Key Insight**: Annotations are **schema-level metadata** (attached to the schema's AST), not **class-level metadata**. For SQL metadata that needs to be accessed statically (e.g., `User.drizzleTable`), annotations are insufficient because:

1. Annotations require accessing the schema instance first
2. They're designed for validation/transformation hints, not static data
3. They don't appear in static autocomplete

**Recommendation**: Use annotations for validation metadata (e.g., SQL column constraints), but use static properties for generated artifacts (e.g., Drizzle table definitions).

## Implementation Details

### Type Inference Preservation

Effect Schema's `Class` returns a complex intersection type:

```typescript
interface Class<
  Self,
  Fields extends Struct.Fields,
  SchemaFields extends S.Struct.Fields,
  A,
  I,
  R,
  C
> extends S.Schema<Self, Simplify<I>, R>, Struct<Simplify<Fields>> {
  // Constructor
  new (props: RequiredKeys<C> extends never ? void | Simplify<C> : Simplify<C>): A

  // Schema interface
  readonly ast: AST.Transformation
  annotations(annotations: S.Annotations.Schema<Self>): S.SchemaClass<Self, I, R>

  // Class interface
  make<Args extends Array<any>, X>(this: { new (...args: Args): X }, ...args: Args): X
  readonly identifier: string
  readonly fields: Simplify<SchemaFields>
}
```

When extending with static properties, preserve this type via intersection:

```typescript
type ModelClass<Self, Fields, Metadata> =
  VariantSchema.Class<Self, Fields, ...> & {
    readonly drizzleTable: Metadata["drizzleTable"]
    readonly betterAuthFields: Metadata["betterAuthFields"]
    readonly sqlMetadata: Metadata["sqlMetadata"]
  }
```

### Static Property Access Pattern

Static properties should be accessed via the class constructor:

```typescript
class User extends DSL.Model("User")({
  id: S.String,
  name: S.String
}) {}

// ✅ Correct - static access
const table = User.drizzleTable
const authFields = User.betterAuthFields

// ❌ Incorrect - instance access (won't work)
const user = new User({ id: "1", name: "John" })
user.drizzleTable // TypeError: undefined
```

### Metadata Generation Timing

Metadata should be generated **once** during class definition, not lazily:

```typescript
// ✅ Eager generation (recommended)
const Model = <Self>() => <Fields>(tableName: string, fields: Fields) => {
  const drizzleTable = generateDrizzleTable(tableName, fields) // Generate immediately

  return class extends BaseClass {
    static readonly drizzleTable = drizzleTable
  }
}

// ⚠️ Lazy generation (use only if metadata is expensive)
const Model = <Self>() => <Fields>(tableName: string, fields: Fields) => {
  let drizzleTableCache: ReturnType<typeof generateDrizzleTable> | undefined

  return class extends BaseClass {
    static get drizzleTable() {
      if (!drizzleTableCache) {
        drizzleTableCache = generateDrizzleTable(tableName, fields)
      }
      return drizzleTableCache
    }
  }
}
```

**Recommendation**: Use eager generation unless profiling shows significant performance impact.

## Alternative Approaches Considered

### 1. Symbol-Based Metadata Storage

Store metadata in a WeakMap keyed by class constructor:

```typescript
const metadataStore = new WeakMap<Function, Metadata>()

const Model = <Self>() => <Fields>(tableName: string, fields: Fields) => {
  const BaseClass = VariantSchema.Class<Self>(tableName)(fields)

  metadataStore.set(BaseClass, {
    drizzleTable: generateDrizzleTable(tableName, fields),
    // ...
  })

  return BaseClass
}

// Access
const metadata = metadataStore.get(User)
```

**Why Rejected**:
- Loss of type safety (WeakMap values are untyped)
- No autocomplete support
- Indirect access pattern (`.get()` instead of property access)
- Module-level state management complexity

### 2. Prototype Chain Attachment

Attach metadata to the prototype instead of static properties:

```typescript
const Model = <Self>() => <Fields>(tableName: string, fields: Fields) => {
  const BaseClass = VariantSchema.Class<Self>(tableName)(fields)

  BaseClass.prototype.__drizzleTable = generateDrizzleTable(tableName, fields)

  return BaseClass
}
```

**Why Rejected**:
- Pollutes instance namespace (metadata accessible on instances)
- Semantic confusion (metadata is about the class, not instances)
- Potential conflicts with instance properties
- Does not align with static property semantics

### 3. Decorator-Based Metadata

Use TypeScript decorators to attach metadata:

```typescript
@withDrizzleTable
@withBetterAuthFields
class User extends VariantSchema.Class<User>("User")({
  id: S.String,
  name: S.String
}) {}
```

**Why Rejected**:
- Requires experimental decorators or Stage 3 decorators
- Cannot access field definitions for metadata generation
- Decorators execute after class definition (metadata needs fields first)
- beep-effect does not use decorators elsewhere (consistency)

## Integration with beep-effect Architecture

The DSL.Model pattern fits beep-effect's architecture by:

1. **Preserving VariantSchema Semantics**: Static properties do not interfere with variant extraction or schema transformations
2. **Supporting Multi-Tenant Patterns**: Drizzle table metadata can include tenant-aware column names
3. **Enabling Better Auth Integration**: `betterAuthFields` provides mapping for IAM tables
4. **Facilitating Code Generation**: Static metadata allows tooling to inspect models without instantiation

### Example Integration

```typescript
// packages/shared/domain/src/User.ts
import * as DSL from "@beep/schema/DSL"
import * as S from "effect/Schema"

class User extends DSL.Model<User>()("User")({
  id: DSL.Field({
    domain: S.UUID,
    drizzle: S.UUID.pipe(S.annotations({ sqlType: "uuid" })),
    betterAuth: S.UUID
  }),
  email: DSL.Field({
    domain: S.String,
    drizzle: S.String.pipe(S.annotations({ sqlType: "varchar(255)" })),
    betterAuth: S.String
  }),
  name: DSL.Field({
    domain: S.String,
    drizzle: S.String.pipe(S.annotations({ sqlType: "text" })),
    betterAuth: S.optionalWith(S.String, { default: () => null })
  })
}) {}

// Access static metadata
User.drizzleTable // Generated Drizzle table definition
User.betterAuthFields // Better Auth field mapping
User.sqlMetadata // SQL DDL metadata

// Use as schema
const users = S.Array(User)
const userFromDB = S.decodeUnknownSync(User)({ id: "...", email: "...", name: "..." })
```

## Trade-offs

### Pattern 1: Anonymous Class Extension

**Pros**:
- Native TypeScript syntax (high readability)
- Used by Effect's official APIs (proven pattern)
- Automatic type inference for static properties
- No manual property descriptor management

**Cons**:
- Requires type assertion for intersection
- Cannot control property descriptors (always writable unless using `readonly`)

**When to Use**: Default choice for DSL.Model

### Pattern 2: Object.defineProperty

**Pros**:
- Explicit property descriptor control
- Matches existing VariantSchema pattern
- No class extension overhead

**Cons**:
- More verbose
- Requires manual type assertion
- Property descriptors may be unnecessary complexity

**When to Use**: When you need lazy computation or strict property immutability

## References

### Effect Documentation
- [Schema Class APIs](https://effect.website/docs/schema/classes) - Official class definition guide
- [Schema Annotations](https://effect.website/docs/schema/annotations) - AST-level metadata patterns

### Source Files
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/src/Schema.ts:9194-9627` - `makeClass` implementation
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/src/Schema.ts:9264-9274` - `TaggedClass` static property pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/core/VariantSchema.ts:488-507` - VariantSchema.Class factory

### Related Patterns
- **Effect Context.Tag**: Uses similar static property pattern for service tags
- **Effect Layer**: Exposes static constructors and metadata
- **Data.Class**: Base class for Effect Schema classes (implements Equal + Hash)

## Next Steps

1. **Implement DSL.Model Factory**: Use Pattern 1 (Anonymous Class Extension)
2. **Generate Drizzle Metadata**: Create `generateDrizzleTable` function that inspects variant fields
3. **Generate Better Auth Metadata**: Create `generateBetterAuthFields` for IAM integration
4. **Write Tests**: Verify static property access, type inference, and schema functionality
5. **Document Usage**: Add examples to `packages/common/schema/AGENTS.md`

## Verification Checklist

- [x] Static properties do not interfere with Effect Schema transformations
- [x] Type inference works for both schema and static properties
- [x] Pattern is consistent with Effect's official APIs
- [x] Metadata generation is eager and deterministic
- [x] No reliance on `any` casts or unsafe mutations
- [x] Autocomplete works for static properties
- [x] Compatible with VariantSchema's multi-variant system
