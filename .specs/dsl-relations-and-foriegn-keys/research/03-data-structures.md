# Relation Data Structures Research

## Executive Summary

This research evaluates optimal data structures for storing relation metadata in the DSL module. After analyzing Effect's discriminated union patterns, Schema annotation system, and Drizzle's v2 relations API, the recommended approach is **Structure B (Class-based with Symbol annotation)** for its superior type inference, runtime flexibility, and alignment with existing DSL patterns.

## Problem Statement

The DSL module needs a data structure to store relation metadata that:

1. Captures relation type (one, many, manyToMany) and configuration
2. Supports type-safe extraction of relation information
3. Integrates cleanly with Effect Schema's annotation system
4. Maps efficiently to Drizzle's `defineRelations` API
5. Handles many-to-many junction table references
6. Preserves type information for target models and field references

## Research Sources

- **Effect Documentation**: Schema annotations, Data.TaggedEnum patterns
- **Source Code Analysis**:
  - `packages/common/schema/src/integrations/sql/dsl/Field.ts` - ColumnMetaSymbol usage pattern
  - `packages/common/schema/src/integrations/sql/dsl/types.ts` - Symbol-based metadata attachment
  - `node_modules/effect/src/SchemaAST.ts` - Annotation system design
  - `node_modules/effect/src/Data.ts` - TaggedEnum implementation
- **Ecosystem Libraries**:
  - Drizzle ORM v2 relations API ([docs](https://orm.drizzle.team/docs/relations-v2))
  - `@effect/sql/Model` variant patterns

## Metadata Requirements Analysis

### Required Metadata for Each Relation Type

#### One-to-One / One-to-Many Relations
```typescript
interface OneRelationMeta {
  type: "one" | "many";
  target: () => ModelClass<unknown>;     // Lazy to handle circular refs
  from: string;                           // Field name in source model
  to: string;                             // Field name in target model
  optional?: boolean;                     // Type-level nullability
  alias?: string;                         // For multiple relations to same target
}
```

**Drizzle mapping:**
```typescript
// DSL → Drizzle
r.one.targetTable({
  from: r.sourceTable[meta.from],
  to: r.targetTable[meta.to],
  optional: meta.optional,
  alias: meta.alias
})
```

#### Many-to-Many Relations
```typescript
interface ManyToManyRelationMeta {
  type: "manyToMany";
  target: () => ModelClass<unknown>;
  junctionTable: () => ModelClass<unknown>;
  sourceField: string;                    // Field in source model
  targetField: string;                    // Field in target model
  junctionSourceField: string;            // FK in junction pointing to source
  junctionTargetField: string;            // FK in junction pointing to target
  alias?: string;
}
```

**Drizzle mapping:**
```typescript
// DSL → Drizzle (using .through())
r.many.targetTable({
  from: r.sourceTable[meta.sourceField].through(
    r.junctionTable[meta.junctionSourceField]
  ),
  to: r.targetTable[meta.targetField].through(
    r.junctionTable[meta.junctionTargetField]
  ),
  alias: meta.alias
})
```

## Structure Evaluation

### Structure A: Discriminated Union (Data.TaggedEnum)

```typescript
import * as Data from "effect/Data";

type RelationMeta = Data.TaggedEnum<{
  One: {
    target: () => ModelClass<unknown>;
    from: string;
    to: string;
    optional: boolean;
    alias?: string;
  };
  Many: {
    target: () => ModelClass<unknown>;
    from: string;
    to: string;
    alias?: string;
  };
  ManyToMany: {
    target: () => ModelClass<unknown>;
    junctionTable: () => ModelClass<unknown>;
    sourceField: string;
    targetField: string;
    junctionSourceField: string;
    junctionTargetField: string;
    alias?: string;
  };
}>;

const { One, Many, ManyToMany } = Data.taggedEnum<RelationMeta>();

// Usage
const userGroupRelation = ManyToMany({
  target: () => Group,
  junctionTable: () => UsersToGroups,
  sourceField: "id",
  targetField: "id",
  junctionSourceField: "userId",
  junctionTargetField: "groupId",
});
```

**Pros:**
- ✅ Built-in structural equality via `Data.taggedEnum`
- ✅ Type-safe pattern matching with `Match.tag`
- ✅ Clean discriminated union semantics
- ✅ Follows Effect ecosystem conventions

**Cons:**
- ❌ Poor type inference - generic type parameter required at call site
- ❌ No compile-time enforcement of field names matching model
- ❌ Constructors don't capture target model type parameter
- ❌ Requires extra boilerplate for type guards
- ❌ Less ergonomic for complex nested structures

**Type Safety Issues:**
```typescript
// Problem: No connection between target and field names
const relation = Many({
  target: () => User,
  from: "id",
  to: "nonExistentField", // ❌ No compile error!
});

// Problem: Type inference fails
type ExtractTarget<R extends RelationMeta> =
  R extends { _tag: "Many"; target: () => infer T } ? T : never;
// Result: ModelClass<unknown> (loses specific type)
```

### Structure B: Class-based with Type Parameters (RECOMMENDED)

```typescript
import * as Data from "effect/Data";
import { $SchemaId } from "@beep/identity/packages";

const $I = $SchemaId.create("integrations/sql/dsl/relations");

// Relation metadata symbol (similar to ColumnMetaSymbol)
export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);
export type RelationMetaSymbol = typeof RelationMetaSymbol;

// Base relation metadata
export interface RelationMeta {
  readonly type: "one" | "many" | "manyToMany";
  readonly alias?: string;
}

// One/Many relation
export class OneRelation<
  Source,
  Target,
  FromField extends keyof Source & string,
  ToField extends keyof Target & string,
  Optional extends boolean = true
> extends Data.Class<{
  readonly type: "one";
  readonly target: () => ModelClass<Target>;
  readonly from: FromField;
  readonly to: ToField;
  readonly optional: Optional;
  readonly alias?: string;
}> {
  readonly [RelationMetaSymbol]: true = true as const;
}

export class ManyRelation<
  Source,
  Target,
  FromField extends keyof Source & string,
  ToField extends keyof Target & string
> extends Data.Class<{
  readonly type: "many";
  readonly target: () => ModelClass<Target>;
  readonly from: FromField;
  readonly to: ToField;
  readonly alias?: string;
}> {
  readonly [RelationMetaSymbol]: true = true as const;
}

// Many-to-many relation
export class ManyToManyRelation<
  Source,
  Target,
  Junction,
  SourceField extends keyof Source & string,
  TargetField extends keyof Target & string,
  JunctionSourceField extends keyof Junction & string,
  JunctionTargetField extends keyof Junction & string
> extends Data.Class<{
  readonly type: "manyToMany";
  readonly target: () => ModelClass<Target>;
  readonly junctionTable: () => ModelClass<Junction>;
  readonly sourceField: SourceField;
  readonly targetField: TargetField;
  readonly junctionSourceField: JunctionSourceField;
  readonly junctionTargetField: JunctionTargetField;
  readonly alias?: string;
}> {
  readonly [RelationMetaSymbol]: true = true as const;
}

// Type guard
export const isRelation = (u: unknown): u is
  | OneRelation<any, any, any, any, any>
  | ManyRelation<any, any, any, any>
  | ManyToManyRelation<any, any, any, any, any, any, any> =>
  u !== null &&
  typeof u === "object" &&
  RelationMetaSymbol in u &&
  (u as Record<symbol, unknown>)[RelationMetaSymbol] === true;
```

**Pros:**
- ✅ **Superior type inference** - captures all type parameters automatically
- ✅ **Type-safe field references** - constrains field names to actual model keys
- ✅ **Built-in equality** via `Data.Class` (inherits from Effect Data)
- ✅ **Consistent with ColumnMetaSymbol pattern** in existing DSL
- ✅ **Symbol-based detection** enables efficient runtime checks
- ✅ **Extensible** - easy to add methods or getters
- ✅ **Pattern matches cleanly** with existing `DSLField`/`DSLVariantField` approach

**Type Safety Wins:**
```typescript
// ✅ Compile error if field doesn't exist on target
const relation = new ManyRelation({
  type: "many",
  target: () => User,
  from: "id",
  to: "nonExistentField", // ❌ Compile error!
});

// ✅ Type extraction preserves specific types
type ExtractTarget<R> = R extends ManyRelation<infer _S, infer T, any, any>
  ? T
  : never;
// Result: User (preserves exact type!)

// ✅ Conditional types work as expected
type IsOptional<R> = R extends OneRelation<any, any, any, any, infer Opt>
  ? Opt
  : false;
```

**Usage Example:**
```typescript
// In Model definition
class User extends Model<User>("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String, { column: { type: "string" } }),
}) {
  static relations = {
    posts: new ManyRelation({
      type: "many",
      target: () => Post,
      from: "id",      // ✅ Type-checked against User
      to: "authorId",  // ✅ Type-checked against Post
    }),
    groups: new ManyToManyRelation({
      type: "manyToMany",
      target: () => Group,
      junctionTable: () => UsersToGroups,
      sourceField: "id",
      targetField: "id",
      junctionSourceField: "userId",
      junctionTargetField: "groupId",
    }),
  };
}
```

### Structure C: Schema Annotations Only

```typescript
// Attach relation metadata as schema annotations
const RelationAnnotationId = Symbol.for("@beep/schema/relation");

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [RelationAnnotationId]?: {
        type: "one" | "many" | "manyToMany";
        target: () => ModelClass<unknown>;
        config: Record<string, unknown>;
      };
    }
  }
}

// Usage - attach to model schema
class User extends Model<User>("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
}).annotations({
  [RelationAnnotationId]: {
    type: "many",
    target: () => Post,
    config: { from: "id", to: "authorId" },
  },
}) {}
```

**Pros:**
- ✅ Leverages Effect Schema's built-in annotation system
- ✅ Integrated with AST traversal tools
- ✅ Familiar pattern for Effect users

**Cons:**
- ❌ **Annotations lose type information** - everything becomes `unknown`
- ❌ **No compile-time field validation**
- ❌ **Requires AST traversal** for extraction (slower runtime)
- ❌ **Awkward for multiple relations** - annotations are flat key-value pairs
- ❌ **Model-level annotations** don't fit field-level relations well
- ❌ **No auto-completion** in IDEs for relation config

**Critical Issue:**
```typescript
// Annotations erase types - can't preserve field constraints
const relation = schema.annotations({
  [RelationAnnotationId]: {
    to: "nonExistentField", // ❌ No compile error (unknown type)
  }
});

// Extraction requires unsafe casts
const meta = SchemaAST.getAnnotation(RelationAnnotationId)(schema.ast)
  .pipe(Option.map(m => m as RelationConfig)); // ⚠️ Unsafe cast
```

## Integration with Effect Schema

### Recommended Pattern: Dual Metadata Storage

Store relation metadata **both** as class properties and schema annotations for maximum flexibility:

```typescript
class Model<Self>("ModelName")(fields) {
  // Primary storage: type-safe class properties
  static relations = {
    posts: new ManyRelation({ /* ... */ }),
  };

  // Secondary: annotate schema for AST-based tooling
  annotations({
    [RelationMetaSymbol]: this.relations,
  });
}
```

**Benefits:**
- ✅ Type-safe access via `Model.relations.posts`
- ✅ AST-compatible for codegen tools
- ✅ Single source of truth (class property)
- ✅ No duplication - annotation references class property

### Extraction Patterns

#### Runtime Access (Primary)
```typescript
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Direct access (fast)
const userPosts = User.relations.posts;

// Type-safe extraction
const extractManyRelations = <M extends ModelStatics>(model: M) =>
  F.pipe(
    Object.entries(model.relations ?? {}),
    A.filter(([_, rel]) => rel instanceof ManyRelation),
    A.map(([name, rel]) => ({ name, relation: rel }))
  );

// Pattern matching
const relationToFriendlyName = (rel: unknown) =>
  F.pipe(
    Match.value(rel),
    Match.when(
      (r): r is OneRelation<any, any, any, any, any> => r instanceof OneRelation,
      (r) => `${r.from} -> ${r.target().tableName}.${r.to}`
    ),
    Match.when(
      (r): r is ManyRelation<any, any, any, any> => r instanceof ManyRelation,
      (r) => `${r.from} -> ${r.target().tableName}.${r.to}[]`
    ),
    Match.when(
      (r): r is ManyToManyRelation<any, any, any, any, any, any, any> =>
        r instanceof ManyToManyRelation,
      (r) => `${r.sourceField} <-> ${r.target().tableName} via ${r.junctionTable().tableName}`
    ),
    Match.orElse(() => "Unknown relation")
  );
```

#### AST-based Access (Secondary)
```typescript
import * as SchemaAST from "effect/SchemaAST";

const getRelationsFromAST = <A, I, R>(schema: S.Schema<A, I, R>) =>
  SchemaAST.getAnnotation<typeof Model.relations>(RelationMetaSymbol)(schema.ast)
    .pipe(O.getOrElse(() => ({})));
```

## Mapping to Drizzle v2 Relations

### One/Many Relations

```typescript
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";

const relationToDrizzle = <S, T, F extends keyof S & string, TF extends keyof T & string>(
  sourceTable: ModelClass<S>,
  relation: OneRelation<S, T, F, TF, any> | ManyRelation<S, T, F, TF>
) => {
  const targetTable = relation.target();
  const relationType = relation.type === "one" ? "one" : "many";

  return {
    type: relationType,
    config: {
      from: sourceTable.tableName + "." + relation.from,
      to: targetTable.tableName + "." + relation.to,
      optional: relation instanceof OneRelation ? relation.optional : undefined,
      alias: relation.alias,
    },
  };
};
```

### Many-to-Many Relations

```typescript
const manyToManyToDrizzle = <
  S,
  T,
  J,
  SF extends keyof S & string,
  TF extends keyof T & string,
  JSF extends keyof J & string,
  JTF extends keyof J & string
>(
  sourceTable: ModelClass<S>,
  relation: ManyToManyRelation<S, T, J, SF, TF, JSF, JTF>
) => {
  const targetTable = relation.target();
  const junctionTable = relation.junctionTable();

  return {
    type: "many",
    config: {
      from: {
        table: sourceTable.tableName,
        field: relation.sourceField,
        through: {
          table: junctionTable.tableName,
          field: relation.junctionSourceField,
        },
      },
      to: {
        table: targetTable.tableName,
        field: relation.targetField,
        through: {
          table: junctionTable.tableName,
          field: relation.junctionTargetField,
        },
      },
      alias: relation.alias,
    },
  };
};
```

### Complete Conversion

```typescript
import { defineRelations } from "drizzle-orm";

const modelRelationsToDrizzle = <M extends ModelStatics>(model: M) => {
  const relations = model.relations ?? {};

  return F.pipe(
    Struct.entries(relations),
    A.map(([name, rel]) => {
      if (rel instanceof ManyToManyRelation) {
        return [name, manyToManyToDrizzle(model, rel)] as const;
      }
      if (rel instanceof OneRelation || rel instanceof ManyRelation) {
        return [name, relationToDrizzle(model, rel)] as const;
      }
      return null;
    }),
    A.filterMap(O.fromNullable),
    A.reduce({} as Record<string, unknown>, (acc, [k, v]) => ({
      ...acc,
      [k]: v,
    }))
  );
};

// Usage
const drizzleRelations = defineRelations(
  { users: toDrizzle(User), posts: toDrizzle(Post) },
  (r) => ({
    users: modelRelationsToDrizzle(User),
    posts: modelRelationsToDrizzle(Post),
  })
);
```

## Trade-offs Summary

| Aspect | Structure A (TaggedEnum) | Structure B (Classes) ⭐ | Structure C (Annotations) |
|--------|-------------------------|-------------------------|---------------------------|
| **Type Inference** | Poor - needs explicit params | Excellent - automatic | None - erased to unknown |
| **Field Validation** | No compile-time check | Yes - keyof constraints | No compile-time check |
| **Runtime Access** | Pattern matching required | Direct property access | AST traversal required |
| **IDE Support** | Basic | Excellent autocomplete | Poor |
| **Consistency** | New pattern | Matches ColumnMetaSymbol | Existing schema pattern |
| **Circular Refs** | Requires lazy thunks | Requires lazy thunks | Requires lazy thunks |
| **Equality** | Built-in (Data) | Built-in (Data.Class) | Manual implementation |
| **Extensibility** | Add union cases | Add class methods | Add annotation keys |
| **Performance** | Match overhead | Direct access (fastest) | AST traversal (slowest) |

## Recommendation: Structure B (Class-based)

### Rationale

1. **Type Safety**: Captures model types and field constraints at compile time
2. **Ergonomics**: Best IDE autocomplete and error messages
3. **Consistency**: Mirrors existing `ColumnMetaSymbol` pattern in `Field.ts`
4. **Performance**: Direct property access without AST traversal
5. **Flexibility**: Easy to add helper methods and getters
6. **Future-proof**: Extensible for additional relation features (cascades, etc.)

### Implementation Plan

1. **Define relation classes** in `packages/common/schema/src/integrations/sql/dsl/relations.ts`
2. **Add RelationMetaSymbol** following ColumnMetaSymbol pattern
3. **Extend ModelStatics** interface to include optional `relations` property
4. **Create helper constructors** for ergonomic relation definitions
5. **Implement toDrizzleRelations** adapter in `adapters/drizzle.ts`
6. **Add type extraction utilities** for compile-time relation queries

### Example Full Implementation

```typescript
// relations.ts
import * as Data from "effect/Data";
import { $SchemaId } from "@beep/identity/packages";
import type { ModelClass } from "./types";

const $I = $SchemaId.create("integrations/sql/dsl/relations");

export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);
export type RelationMetaSymbol = typeof RelationMetaSymbol;

// Helper constructors
export const one = <
  Source,
  Target,
  FromField extends keyof Source & string,
  ToField extends keyof Target & string,
  Optional extends boolean = true
>(config: {
  readonly target: () => ModelClass<Target>;
  readonly from: FromField;
  readonly to: ToField;
  readonly optional?: Optional;
  readonly alias?: string;
}) => new OneRelation({ type: "one" as const, ...config, optional: config.optional ?? true as Optional });

export const many = <
  Source,
  Target,
  FromField extends keyof Source & string,
  ToField extends keyof Target & string
>(config: {
  readonly target: () => ModelClass<Target>;
  readonly from: FromField;
  readonly to: ToField;
  readonly alias?: string;
}) => new ManyRelation({ type: "many" as const, ...config });

export const manyToMany = <
  Source,
  Target,
  Junction,
  SourceField extends keyof Source & string,
  TargetField extends keyof Target & string,
  JunctionSourceField extends keyof Junction & string,
  JunctionTargetField extends keyof Junction & string
>(config: {
  readonly target: () => ModelClass<Target>;
  readonly junctionTable: () => ModelClass<Junction>;
  readonly sourceField: SourceField;
  readonly targetField: TargetField;
  readonly junctionSourceField: JunctionSourceField;
  readonly junctionTargetField: JunctionTargetField;
  readonly alias?: string;
}) => new ManyToManyRelation({ type: "manyToMany" as const, ...config });

// Usage in Model
class User extends Model<User>("User")({
  id: Field(S.UUID, { column: { type: "uuid", primaryKey: true } }),
  invitedBy: Field(S.NullOr(S.UUID), { column: { type: "uuid" } }),
}) {
  static relations = {
    // One-to-one (self-referencing)
    inviter: one<User, User, "invitedBy", "id">({
      target: () => User,
      from: "invitedBy",
      to: "id",
      optional: true,
    }),

    // One-to-many
    posts: many<User, Post, "id", "authorId">({
      target: () => Post,
      from: "id",
      to: "authorId",
    }),

    // Many-to-many
    groups: manyToMany<User, Group, UsersToGroups, "id", "id", "userId", "groupId">({
      target: () => Group,
      junctionTable: () => UsersToGroups,
      sourceField: "id",
      targetField: "id",
      junctionSourceField: "userId",
      junctionTargetField: "groupId",
    }),
  };
}
```

## Alternative Approaches Considered

### Hybrid: Classes + Discriminated Union

Combine classes for type safety with discriminated unions for pattern matching:

```typescript
export type Relation =
  | OneRelation<any, any, any, any, any>
  | ManyRelation<any, any, any, any>
  | ManyToManyRelation<any, any, any, any, any, any, any>;

// Pattern matching works naturally
Match.value(relation).pipe(
  Match.when(
    (r): r is OneRelation<any, any, any, any, any> => r.type === "one",
    (r) => handleOne(r)
  ),
  // ...
);
```

**Verdict**: Unnecessary complexity - `instanceof` checks work fine and preserve types better.

### Builder Pattern

```typescript
const relation = RelationBuilder
  .from(User, "id")
  .to(Post, "authorId")
  .many();
```

**Verdict**: Less type-safe - can't enforce field constraints until final call. Class constructors are more direct.

## Integration with beep-effect Architecture

The class-based approach aligns perfectly with existing patterns:

1. **Symbol-based metadata**: `RelationMetaSymbol` mirrors `ColumnMetaSymbol`
2. **Effect Data classes**: Inherits equality and hashing like `DSLField`
3. **Lazy evaluation**: `() => ModelClass` handles circular dependencies
4. **Type-level constraints**: `keyof Model & string` ensures field validity
5. **Adapter pattern**: Clean separation between DSL and Drizzle concerns

## References

- [Drizzle ORM Relations v2](https://orm.drizzle.team/docs/relations-v2) - defineRelations API
- [Drizzle ORM Relations v1 to v2](https://orm.drizzle.team/docs/relations-v1-v2) - Migration guide
- [Effect Schema Annotations](https://effect.website/docs/schema/annotations/) - Annotation system
- [Effect Data Module](https://effect.website/docs/data-types/data/) - TaggedEnum and Class patterns
- [Effect Match Module](https://effect.website/docs/code-style/pattern-matching/) - Pattern matching
- DSL Field.ts - Local ColumnMetaSymbol implementation
- DSL types.ts - Symbol-based metadata pattern

---

**Conclusion**: Structure B (Class-based with Symbol annotation) provides the optimal balance of type safety, ergonomics, and consistency with existing DSL patterns. It should be implemented as the primary relation metadata structure, with optional schema annotation for AST-based tooling integration.

**Sources:**
- [Drizzle ORM - Drizzle Relations](https://orm.drizzle.team/docs/relations-v2)
- [Drizzle ORM - Relational Queries v1 to v2](https://orm.drizzle.team/docs/relations-v1-v2)
- [Relational API v2 Discussion](https://github.com/drizzle-team/drizzle-orm/discussions/2316)
