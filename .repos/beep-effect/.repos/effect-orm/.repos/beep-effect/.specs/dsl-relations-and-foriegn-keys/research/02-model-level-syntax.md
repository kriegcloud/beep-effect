# Model-Level Relation Syntax Research

## Executive Summary

After evaluating multiple patterns for declaring relations at the Model definition level, **Pattern D (Builder Chaining)** emerges as the optimal solution. This pattern aligns with Effect's compositional philosophy, provides excellent TypeScript inference, handles circular dependencies elegantly via lazy evaluation, and maintains consistency with the existing DSL Model API.

The recommended syntax enables both unidirectional and bidirectional relation declarations while preserving type safety and supporting self-referential relations without special-casing.

## Problem Statement

The DSL module at `packages/common/schema/src/integrations/sql/dsl` currently lacks a mechanism for declaring relations between Models. The challenge is to design a syntax that:

1. Supports one-to-one, one-to-many, and many-to-many relations
2. Handles bidirectional relations cleanly (e.g., User.posts ↔ Post.author)
3. Enables self-referential relations (e.g., User.manager → User)
4. Solves circular dependency issues when Models reference each other
5. Provides excellent TypeScript inference for relation accessors
6. Integrates seamlessly with the existing `Model` factory API
7. Can convert to Drizzle's `relations()` API for migration compatibility

## Research Sources

### Effect Documentation
- **Schema Class APIs** (Effect docs): Examined patterns for extending `Schema.Class` with static methods and properties. While Effect doesn't provide explicit relation patterns, the `fields` static property pattern demonstrates metadata attachment to class schemas.
- **@effect/sql/Model**: Uses `VariantSchema.Field` for variant-based schemas but doesn't include relation declarations. Focus is on field-level variants (Generated, Sensitive) rather than inter-model relationships.

### Drizzle ORM Patterns
- **Drizzle v2 Relations API**: Uses `defineRelations()` helper that accepts a schema object and a callback receiving a relation builder `r`. Relations are defined separately from table definitions.
- **Key insight**: Drizzle separates table definitions from relation declarations, allowing lazy evaluation and avoiding circular dependencies.

### Existing beep-effect Codebase
- **packages/iam/tables/src/relations.ts**: Shows 275 lines of Drizzle relation definitions using `d.relations()`. Each relation explicitly maps foreign key fields to referenced table columns.
- **Pattern observed**: Relations are defined per-table in separate files, with `many()` and `one()` helpers. The `relationName` parameter disambiguates multiple relations between the same tables.

### Source Code Analysis
- **packages/common/schema/src/integrations/sql/dsl/Model.ts**: Current implementation uses curried factory pattern `Model<Self>(identifier)(fields, annotations?)`. Returns a class extending `S.Class` with static properties `tableName`, `columns`, `primaryKey`, `identifier`, `_fields`, and six variant schema accessors.
- **packages/common/schema/src/integrations/sql/dsl/types.ts**: Defines `ModelClassWithVariants` interface and `DSL.Fields` type. No relation types currently defined.

## Pattern Analysis

### Pattern A: Relations as Second Config

```typescript
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
}, {
  relations: {
    author: Relation.one(User, { from: "authorId", to: "id" }),
  }
}) {}

class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
}, {
  relations: {
    posts: Relation.many(Post, { from: "id", to: "authorId" }),
  }
}) {}
```

#### Trade-offs

**Pros:**
- Clear separation between fields and relations
- Follows Effect Schema's pattern of `(fields, annotations)` tuples
- Relations config is co-located with field definitions
- Explicit `from`/`to` mapping makes foreign keys clear

**Cons:**
- **Circular dependency problem**: `Post` references `User` and vice versa. TypeScript cannot resolve this without one being `undefined` at runtime.
- Requires modifying `Model` signature to accept third parameter (breaking change)
- Config object is not composable - relations are locked at definition time
- Type inference challenges: relation target types must be known before class completes initialization

**Circular Dependency Example:**
```typescript
// This will fail: User is not defined when Post tries to reference it
class Post extends Model<Post>("Post")(
  { /* fields */ },
  { relations: { author: Relation.one(User, ...) } } // ERROR: User doesn't exist yet
) {}

class User extends Model<User>("User")(
  { /* fields */ },
  { relations: { posts: Relation.many(Post, ...) } } // Post exists but User.relations references Post
) {}
```

**Verdict:** ❌ **Not viable** due to unsolvable circular dependency issues.

---

### Pattern B: Static Relation Property

```typescript
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
}) {
  static readonly relations = Model.relations({
    author: Relation.one(() => User, "authorId", "id"),
  });
}

class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
}) {
  static readonly relations = Model.relations({
    posts: Relation.many(() => Post, "id", "authorId"),
  });
}
```

#### Trade-offs

**Pros:**
- Solves circular dependencies via lazy evaluation: `() => User` thunks delay resolution
- Familiar static property pattern (similar to Effect's `Context.Tag`)
- Relations are clearly part of the Model class
- Co-located with Model definition

**Cons:**
- Requires separate `Model.relations()` factory
- Awkward syntax mixing class body with constructor call
- Static properties defined in class body vs. Model factory creates two-stage definition
- TypeScript inference for relation accessors is complex (requires conditional types on static properties)
- Not composable - can't easily extend or modify relations

**Type Inference Challenge:**
```typescript
// How do we infer the relation accessor types?
type PostWithRelations = typeof Post & {
  relations: {
    author: RelationType<typeof User>
  }
}
// Complex and fragile
```

**Verdict:** ⚠️ **Viable but awkward** - solves circular deps but syntax is clunky.

---

### Pattern C: Separate Relation Definition

```typescript
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
}) {}

class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
}) {}

// Define relations separately, after both Models are declared
const PostRelations = Model.defineRelations(Post, {
  author: Relation.one(User, Post.fields.authorId, User.fields.id),
});

const UserRelations = Model.defineRelations(User, {
  posts: Relation.many(Post, User.fields.id, Post.fields.authorId),
});
```

#### Trade-offs

**Pros:**
- Completely avoids circular dependencies (models defined first, relations after)
- Follows Drizzle's separation-of-concerns pattern
- Type-safe field references via `Post.fields.authorId`
- Can be split across files if needed
- Explicit and clear

**Cons:**
- Relations are divorced from Model definition (two-step process)
- Requires separate `Model.defineRelations()` API
- Doesn't attach relations to Model class itself (separate objects)
- How do consumers access relations? Need to import both `Post` and `PostRelations`
- Loses co-location benefits

**Usage Confusion:**
```typescript
// Consumer has to know about both:
import { Post } from "./models/Post"
import { PostRelations } from "./models/relations"

// How do you access the relation? Post doesn't know about PostRelations
// This pattern works for Drizzle (relations passed to db client) but not for DSL Models
```

**Verdict:** ⚠️ **Viable for library internals** but poor DX for end users. Good for Drizzle adapter, bad for Model API.

---

### Pattern D: Builder Chaining (RECOMMENDED)

```typescript
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
  content: Field(S.String)({ column: { type: "string" } }),
})
  .relation("author", () => Relation.one(User).from("authorId").to("id"))
  .relation("comments", () => Relation.many(Comment).from("id").to("postId"))
{} // Empty class body

class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
})
  .relation("posts", () => Relation.many(Post).from("id").to("authorId"))
  .relation("manager", () => Relation.one(User).from("managerId").to("id"))
{} // Empty class body
```

#### Trade-offs

**Pros:**
- **Solves circular dependencies**: Lazy evaluation via `() => Relation.one(User)` thunks
- **Compositional**: Chain multiple `.relation()` calls in fluent API style
- **Type-safe**: Each `.relation()` call extends the class type with the accessor
- **Co-located**: Relations defined immediately after fields, part of Model definition
- **Extensible**: Easy to add relations to existing Models (just chain another `.relation()`)
- **Effect-aligned**: Matches Effect's builder pattern philosophy (e.g., `Layer.provide()`)
- **Self-referential support**: `User → User` relations work naturally (see `manager` example)

**Cons:**
- Requires implementing builder pattern in `Model` factory
- Empty class body `{}` at end is slightly awkward (but standard for class expressions)
- More complex implementation (need to return chainable object with `.relation()` method)

**Implementation Sketch:**
```typescript
// Simplified - actual implementation more complex
export const Model = <Self>(identifier: string) => <Fields extends DSL.Fields>(fields: Fields) => {
  const BaseClass = /* create S.Class with statics */;

  // Return object with .relation() method
  return Object.assign(BaseClass, {
    relation<K extends string, Rel>(
      key: K,
      thunk: () => Rel
    ) {
      // Attach relation metadata and return new chainable class
      const WithRelation = BaseClass as typeof BaseClass & {
        readonly relations: Record<K, Rel>
      };
      Object.defineProperty(WithRelation, "relations", {
        get: () => ({ [key]: thunk() }),
        enumerable: true,
      });
      return Object.assign(WithRelation, { relation: this.relation });
    }
  });
};
```

**Type Inference:**
```typescript
// After chaining, Post has type:
class Post extends ModelClass<...> {
  static readonly relations: {
    author: RelationOne<User, "authorId", "id">;
    comments: RelationMany<Comment, "id", "postId">;
  }
}

// Consumers can access:
Post.relations.author // RelationOne<User, ...>
```

**Verdict:** ✅ **RECOMMENDED** - Best balance of DX, type safety, and Effect philosophy.

---

## Bidirectional Relations

How each pattern handles bidirectional one-to-many (User ↔ Post):

### Pattern A (Config Object)
```typescript
// FAILS: Circular dependency
class Post extends Model<Post>("Post")({ ... }, {
  relations: { author: Relation.one(User, ...) }
}) {}

class User extends Model<User>("User")({ ... }, {
  relations: { posts: Relation.many(Post, ...) }
}) {}
```
**Status:** ❌ Cannot resolve circular dependencies.

### Pattern B (Static Property)
```typescript
class Post extends Model<Post>("Post")({ ... }) {
  static readonly relations = Model.relations({
    author: Relation.one(() => User, "authorId", "id"),
  });
}

class User extends Model<User>("User")({ ... }) {
  static readonly relations = Model.relations({
    posts: Relation.many(() => Post, "id", "authorId"),
  });
}
```
**Status:** ✅ Works via thunks, but awkward syntax.

### Pattern C (Separate Definition)
```typescript
class Post extends Model<Post>("Post")({ ... }) {}
class User extends Model<User>("User")({ ... }) {}

const PostRelations = Model.defineRelations(Post, {
  author: Relation.one(User, Post.fields.authorId, User.fields.id),
});

const UserRelations = Model.defineRelations(User, {
  posts: Relation.many(Post, User.fields.id, Post.fields.authorId),
});
```
**Status:** ✅ Works cleanly, but relations are external to Models.

### Pattern D (Builder Chaining) - RECOMMENDED
```typescript
class Post extends Model<Post>("Post")({ ... })
  .relation("author", () => Relation.one(User).from("authorId").to("id"))
{}

class User extends Model<User>("User")({ ... })
  .relation("posts", () => Relation.many(Post).from("id").to("authorId"))
{}
```
**Status:** ✅ Works via lazy thunks, excellent DX.

---

## Self-Referential Relations

Example: User with manager field pointing to another User.

### Pattern D (Builder Chaining) - RECOMMENDED
```typescript
class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
  managerId: Field(S.String.pipe(S.NullOr))({ column: { type: "uuid" } }),
})
  .relation("manager", () => Relation.one(User).from("managerId").to("id"))
  .relation("reports", () => Relation.many(User).from("id").to("managerId"))
{}
```

**Key points:**
- Lazy thunk `() => Relation.one(User)` prevents circular reference issues
- No special-casing needed - self-references work like any other relation
- Both "one" (manager) and "many" (reports) sides work naturally
- TypeScript infers correct recursive types

**Alternative (without lazy evaluation - FAILS):**
```typescript
// This would fail because User isn't fully defined yet:
.relation("manager", Relation.one(User).from("managerId").to("id"))
```

---

## Circular Dependency Handling Strategies

### Strategy 1: Lazy Thunks (Used in Patterns B & D)
```typescript
.relation("author", () => Relation.one(User).from("authorId").to("id"))
//                  ^^^ Thunk delays User resolution until first access
```

**How it works:**
1. When `Post` is defined, the thunk `() => Relation.one(User)` is stored, not executed
2. At runtime, when `Post.relations.author` is first accessed, the thunk executes
3. By then, both `Post` and `User` are fully defined, so no circular reference

**Implementation:**
```typescript
Object.defineProperty(ModelClass, "relations", {
  get: () => {
    // Lazy evaluation - thunks execute on first access
    const relationThunks = getStoredThunks(ModelClass);
    return F.pipe(
      relationThunks,
      R.map((thunk) => thunk()) // Execute thunks
    );
  },
  enumerable: true,
  configurable: false,
});
```

### Strategy 2: Forward References (NOT RECOMMENDED)
```typescript
// Use type-only imports to break circular dependency
import type { User } from "./User"

class Post extends Model<Post>("Post")({ ... }, {
  relations: {
    author: Relation.one("User", { from: "authorId", to: "id" }), // String reference
  }
}) {}
```

**Why not recommended:**
- Loses type safety (string references aren't checked)
- Requires separate resolution step (like a DI container)
- More complex implementation
- Deviates from Effect's typed approach

### Strategy 3: Separate Definition (Pattern C)
Models defined first, relations after - no circular dependency possible.

**Trade-off:** Relations separated from Model definitions (poor co-location).

---

## Naming Conventions for Relation Accessors

### Drizzle's Conventions (from codebase analysis)

**One-to-one / Many-to-one:**
- Singular noun: `organization`, `user`, `author`, `team`
- Matches the related entity name
- Use `relationName` to disambiguate: `invitedByUser`, `uploadedByUser`

**One-to-many:**
- Plural noun: `posts`, `comments`, `files`, `teams`
- Matches the related entity's plural
- Use `relationName` for disambiguation: `uploadedFiles`, `uploadedByFiles`

**Self-referential:**
- Descriptive names: `manager`, `reports`, `invitee`, `parent`, `children`
- Avoid generic names like `related` or `linked`

**Examples from codebase:**
```typescript
// One-to-one
author: one(User, { fields: [post.authorId], references: [user.id] })

// Many-to-one (same as one-to-one from the "many" side)
organization: one(Organization, { fields: [file.organizationId], references: [org.id] })

// One-to-many
posts: many(Post) // Inferred from foreign key in Post table
members: many(Member)

// Disambiguated relations
uploadedByUserId: one(User, {
  fields: [file.uploadedByUserId],
  references: [user.id],
  relationName: "uploadedByUser",
})
```

### Recommended Conventions for DSL

1. **Use singular for to-one relations:** `author`, `organization`, `parent`
2. **Use plural for to-many relations:** `posts`, `comments`, `children`
3. **Prefix/suffix for disambiguation:**
   - Prefix with role: `ownerUser`, `inviterUser`
   - Suffix with relationship: `uploadedFiles`, `createdPosts`
4. **Self-referential clarity:**
   - Hierarchical: `parent`, `children` / `manager`, `reports`
   - Graph-like: `friends`, `followers`, `following`

---

## Recommended Approach

### Pattern D: Builder Chaining

**Full implementation example:**

```typescript
import * as S from "effect/Schema"
import * as F from "effect/Function"
import { Field, Model } from "@beep/schema/integrations/sql/dsl"

// ============================================================================
// Model Definitions with Relations
// ============================================================================

class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
  managerId: Field(S.String.pipe(S.NullOr))({ column: { type: "uuid" } }),
})
  .relation("posts", () => Relation.many(Post).from("id").to("authorId"))
  .relation("comments", () => Relation.many(Comment).from("id").to("authorId"))
  .relation("manager", () => Relation.one(User).from("managerId").to("id"))
  .relation("reports", () => Relation.many(User).from("id").to("managerId"))
{}

class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  title: Field(S.String)({ column: { type: "string" } }),
  content: Field(S.String)({ column: { type: "string" } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
  createdAt: Field(S.DateFromSelf)({ column: { type: "datetime" } }),
})
  .relation("author", () => Relation.one(User).from("authorId").to("id"))
  .relation("comments", () => Relation.many(Comment).from("id").to("postId"))
{}

class Comment extends Model<Comment>("Comment")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  content: Field(S.String)({ column: { type: "string" } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
  postId: Field(S.String)({ column: { type: "uuid" } }),
  createdAt: Field(S.DateFromSelf)({ column: { type: "datetime" } }),
})
  .relation("author", () => Relation.one(User).from("authorId").to("id"))
  .relation("post", () => Relation.one(Post).from("postId").to("id"))
{}

// ============================================================================
// Usage
// ============================================================================

// Access relation metadata
User.relations.posts // RelationMany<Post, "id", "authorId">
Post.relations.author // RelationOne<User, "authorId", "id">

// Convert to Drizzle (for migration)
import { toDrizzle } from "@beep/schema/integrations/sql/dsl"

const userTable = toDrizzle(User)
const postTable = toDrizzle(Post)
const commentTable = toDrizzle(Comment)

// Generate Drizzle relations
const userRelations = drizzleRelations(User)
// Equivalent to:
// d.relations(userTable, ({ many, one }) => ({
//   posts: many(postTable),
//   comments: many(commentTable),
//   manager: one(userTable, { fields: [userTable.managerId], references: [userTable.id] }),
//   reports: many(userTable),
// }))
```

### Dependencies

**Required packages:**
- `effect` (existing)
- Current DSL module (Field, Model)

**New exports:**
```typescript
// packages/common/schema/src/integrations/sql/dsl/relations.ts
export { Relation } from "./relations"
export type { RelationOne, RelationMany } from "./relations"

// packages/common/schema/src/integrations/sql/dsl/index.ts
export * from "./relations"
```

### Implementation Phases

**Phase 1: Core Relation Types**
- Define `RelationOne<Target, FromField, ToField>` type
- Define `RelationMany<Target, FromField, ToField>` type
- Implement `Relation.one()` and `Relation.many()` builders

**Phase 2: Builder Pattern in Model**
- Extend `Model` factory to return chainable object
- Implement `.relation()` method with lazy thunk support
- Add type inference for relation accessors

**Phase 3: Drizzle Adapter**
- Implement `drizzleRelations()` converter
- Map DSL relation metadata to `d.relations()` calls
- Handle relation name disambiguation

**Phase 4: Testing**
- Test circular dependencies (User ↔ Post)
- Test self-referential relations (User → User)
- Test many-to-many patterns (via junction tables)
- Verify type inference accuracy

---

## Trade-offs Summary

### Pattern D (Builder Chaining) vs. Alternatives

| Aspect | Pattern A (Config) | Pattern B (Static) | Pattern C (Separate) | Pattern D (Builder) ✅ |
|--------|--------------------|--------------------|----------------------|------------------------|
| **Circular Deps** | ❌ Unsolvable | ✅ Via thunks | ✅ Separate step | ✅ Via lazy thunks |
| **Co-location** | ✅ Excellent | ✅ Good | ❌ Poor | ✅ Excellent |
| **Type Safety** | ⚠️ Complex | ⚠️ Complex | ✅ Good | ✅ Excellent |
| **Composability** | ❌ Locked | ❌ Static | ⚠️ External | ✅ Chainable |
| **Effect Alignment** | ⚠️ Tuple pattern | ⚠️ Static props | ⚠️ External | ✅ Builder pattern |
| **Self-Referential** | ❌ Fails | ✅ Works | ✅ Works | ✅ Works naturally |
| **DX** | ❌ Fails | ⚠️ Awkward | ⚠️ Two-step | ✅ Fluent |

### Why Builder Chaining Wins

1. **Solves circular dependencies** through lazy evaluation without sacrificing type safety
2. **Maintains co-location** of relations with Model definitions
3. **Composes naturally** via method chaining (add relations incrementally)
4. **Aligns with Effect philosophy** of builder patterns (Layer, Effect.gen, etc.)
5. **Handles edge cases** (self-referential, multiple relations to same table) elegantly
6. **Provides excellent DX** - reads naturally left-to-right

---

## Alternative Approaches Considered

### Decorator-Based (TypeScript Experimental Decorators)
```typescript
class Post extends Model<Post>("Post")({ ... }) {
  @Relation.one(() => User, "authorId", "id")
  static readonly author!: RelationOne<User>
}
```

**Rejected because:**
- Requires experimental decorators (not stable)
- Doesn't work with ES decorators (different semantics)
- Decorators on static properties are poorly supported
- Deviates from Effect's functional style

### Proxy-Based Runtime Resolution
```typescript
const Post = Model<Post>("Post")({ ... })

Post.relations.author = Relation.one(User, "authorId", "id")
// Relations resolved via Proxy getter
```

**Rejected because:**
- Loses compile-time type safety
- Runtime magic obscures behavior
- Incompatible with tree-shaking
- Doesn't align with Effect's transparent composition

---

## Integration with beep-effect

### Current State
- **Drizzle relations** defined separately in `packages/*/tables/src/relations.ts`
- **Models use** `@effect/sql/Model` which doesn't have relation declarations
- **Foreign keys** tracked manually in Drizzle table definitions

### Migration Path

**Step 1: Implement Builder Pattern**
Add `.relation()` method to DSL Model factory.

**Step 2: Create Drizzle Adapter**
Implement `drizzleRelations(Model)` converter:
```typescript
import { drizzleRelations } from "@beep/schema/integrations/sql/dsl"

// Convert DSL Model relations to Drizzle format
const userRelations = drizzleRelations(User)
export { userRelations }
```

**Step 3: Gradual Adoption**
Existing Drizzle relations continue to work. New Models can use builder pattern:
```typescript
class NewModel extends Model<NewModel>("NewModel")({ ... })
  .relation("user", () => Relation.one(User).from("userId").to("id"))
{}
```

**Step 4: Co-existence**
Both DSL-declared and manually-declared relations work together:
```typescript
// In schema.ts
export const schema = {
  ...tables,
  ...relations, // Manual Drizzle relations
  ...drizzleRelations(NewModel), // DSL-generated relations
}
```

### Benefits for beep-effect

1. **Type-safe relation queries** - TypeScript knows relation accessors exist
2. **Reduced boilerplate** - Don't need separate `relations.ts` files
3. **Single source of truth** - Relations declared alongside Models
4. **Better DX** - Fluent API reads naturally
5. **Migration friendly** - Gradual adoption, no breaking changes

---

## References

### Effect Documentation
- [Schema Class APIs](https://effect.website/docs/guides/schema/classes) - Pattern for extending Schema.Class
- [@effect/sql/Model source](https://github.com/Effect-TS/effect/blob/main/packages/sql/src/Model.ts) - VariantSchema.Field pattern

### Drizzle ORM
- [Drizzle Relations v2](https://orm.drizzle.team/docs/relations-v2) - `defineRelations()` API
- [Drizzle Relations Schema Declaration](https://orm.drizzle.team/docs/relations-schema-declaration) - Relation syntax patterns

### beep-effect Codebase
- `packages/iam/tables/src/relations.ts` - Real-world relation definitions (275 lines)
- `packages/shared/tables/src/relations.ts` - Shared table relations
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Current Model implementation

---

## Conclusion

**Pattern D (Builder Chaining)** is the optimal solution for declaring relations at the Model level in the DSL module. It provides:

✅ **Circular dependency resolution** via lazy thunks
✅ **Excellent developer experience** through fluent API
✅ **Type safety** with full TypeScript inference
✅ **Effect alignment** following compositional patterns
✅ **Self-referential support** without special-casing
✅ **Migration path** to Drizzle relations for compatibility

The implementation requires:
1. New `Relation` builder with `.one()` and `.many()` methods
2. Extending `Model` factory to return chainable object with `.relation()` method
3. Type-level inference for relation accessors
4. `drizzleRelations()` adapter for Drizzle compatibility

This approach balances pragmatism (solves real circular dependency issues) with Effect philosophy (compositional, type-safe, transparent).
