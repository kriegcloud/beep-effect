# Research Prompt: Entity Relationship Metadata System for DSL Module

## Objective

Orchestrate comprehensive research into the optimal data structures, API interfaces, and syntax patterns for defining entity relationship metadata in the `packages/common/schema/src/integrations/sql/dsl` module. The goal is to design a system that enables defining relations at both the Model and Field levels, with the ability to map this metadata to valid Drizzle ORM relations and foreign key definitions.

## Context

### Current DSL Architecture

The DSL module provides a type-safe layer for defining database models with Effect Schema integration. Key components:

1. **`Model<Self>(identifier)(fields, annotations)`** - Creates a schema class with static table metadata:
   - `tableName` - snake_case version of identifier
   - `columns` - Record of ColumnDef for each field
   - `primaryKey` - Derived from fields with `primaryKey: true`
   - `_fields` - Original DSL fields for type extraction
   - 6 variant schemas: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`

2. **`Field(schema)(config)`** - Curried field factory attaching column metadata:
   - Supports plain Effect Schemas and VariantSchema.Fields
   - Column config: `type`, `primaryKey`, `unique`, `autoIncrement`, `defaultValue`
   - Metadata attached via `ColumnMetaSymbol` annotation

3. **`toDrizzle(Model)`** - Converts DSL Model to typed Drizzle PgTable:
   - Maps column types to Drizzle builders
   - Applies constraints (primaryKey, unique, notNull)
   - Uses `.$type<T>()` for schema-derived column types

4. **DSL Combinators** - Pipe-friendly column configuration:
   - Type setters: `uuid`, `string`, `integer`, `boolean`, `json`, `datetime`
   - Constraint setters: `primaryKey`, `unique`, `autoIncrement`, `defaultValue`

### Drizzle Relations API (Target)

The system must map to Drizzle's relations system:

**Foreign Keys (Database Level):**
```typescript
import { foreignKey } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
}, (table) => [
  foreignKey({
    columns: [table.authorId],
    foreignColumns: [users.id],
  })
]);
```

**Relations (Application Level):**
```typescript
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
      optional: false,
    }),
  },
  users: {
    posts: r.many.posts({
      from: r.users.id,
      to: r.posts.authorId,
    }),
  },
}));
```

**Relation Types:**
- `r.one()` - One-to-one or one-side of one-to-many
- `r.many()` - Many-side of one-to-many or many-to-many
- `.through()` - Junction table support for many-to-many

## Research Areas

Deploy the following research agents, placing their results in `.specs/dsl-relations-and-foriegn-keys/research/`:

### 1. Field-Level Relation Syntax Research

**Agent Task:** Research optimal syntax patterns for defining relations directly on fields.

**Research Questions:**
- What syntax best expresses "this field references another model's field"?
- How should foreign key constraints (ON DELETE, ON UPDATE) be specified?
- How do other ORMs (Prisma, TypeORM, Sequelize) handle field-level relations?
- What type-level validation can ensure the referenced field exists and types match?
- How should nullable vs required relations be expressed?

**Explore Patterns:**
```typescript
// Pattern A: Config object extension
Field(UserId)({
  column: { type: "uuid" },
  references: { model: User, field: "id", onDelete: "cascade" }
})

// Pattern B: Combinator-based
UserId.pipe(DSL.uuid, DSL.references(User, "id", { onDelete: "cascade" }))

// Pattern C: Branded reference type
Field(ForeignKey(User.Id))({ column: { type: "uuid" } })

// Pattern D: Annotation-based
Field(UserId.pipe(S.annotate(ForeignKeySymbol, { model: User, field: "id" })))
```

**Output File:** `research/01-field-level-syntax.md`

### 2. Model-Level Relation Syntax Research

**Agent Task:** Research optimal syntax for declaring relations at the Model definition level.

**Research Questions:**
- Should relations be defined in a second parameter after fields?
- How should bidirectional relations (one-to-many) be declared?
- What naming conventions work best for relation accessors?
- How should self-referential relations be handled?
- What patterns support lazy/deferred model references (for circular dependencies)?

**Explore Patterns:**
```typescript
// Pattern A: Relations as second config
class Post extends Model<Post>("Post")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
}, {
  relations: {
    author: Relation.one(User, { from: "authorId", to: "id" }),
  }
}) {}

// Pattern B: Static relation method
class Post extends Model<Post>("Post")({...}) {
  static readonly relations = Model.relations({
    author: Relation.one(() => User, "authorId", "id"),
  });
}

// Pattern C: Separate relation definition
const PostRelations = Model.defineRelations(Post, {
  author: Relation.one(User, Post.fields.authorId, User.fields.id),
});

// Pattern D: Builder pattern
class Post extends Model<Post>("Post")({...})
  .relation("author", Relation.one(User).from("authorId").to("id"))
  .relation("comments", Relation.many(Comment).from("id").to("postId"))
  {}
```

**Output File:** `research/02-model-level-syntax.md`

### 3. Relation Data Structure Research

**Agent Task:** Research optimal data structures for storing and accessing relation metadata.

**Research Questions:**
- What metadata is needed for each relation type?
- How should the data structure support type-safe extraction?
- What symbol/annotation strategy works best with Effect Schema?
- How to structure for efficient Drizzle mapping?
- How to represent many-to-many junction table relations?

**Explore Structures:**
```typescript
// Structure A: Discriminated union
type Relation =
  | { _tag: "One"; target: ModelRef; from: FieldRef; to: FieldRef; optional: boolean }
  | { _tag: "Many"; target: ModelRef; from: FieldRef; to: FieldRef }
  | { _tag: "ManyToMany"; target: ModelRef; through: JunctionRef };

// Structure B: Class-based with type inference
class OneRelation<From, To, Optional extends boolean> {
  readonly _tag = "One";
  constructor(
    readonly target: ModelClass<To>,
    readonly from: keyof From,
    readonly to: keyof To,
    readonly optional: Optional = true as Optional,
  ) {}
}

// Structure C: Effect Schema annotation
interface RelationMeta {
  readonly type: "one" | "many" | "manyToMany";
  readonly target: () => ModelClass<unknown>;
  readonly fromField: string;
  readonly toField: string;
  readonly foreignKey?: ForeignKeyConfig;
  readonly junction?: JunctionConfig;
}
```

**Output File:** `research/03-data-structures.md`

### 4. Foreign Key Generation Research

**Agent Task:** Research how to generate valid Drizzle foreign key definitions from relation metadata.

**Research Questions:**
- What foreign key options must be supported (ON DELETE, ON UPDATE actions)?
- How should composite foreign keys be represented?
- What validation should occur before generation?
- How to handle self-referential foreign keys?
- How to generate migration-compatible output?

**Explore Patterns:**
```typescript
// Input: DSL Relation Metadata
const relation = {
  type: "one",
  target: () => User,
  fromField: "authorId",
  toField: "id",
  foreignKey: { onDelete: "cascade", onUpdate: "no action" }
};

// Output: Drizzle Foreign Key
foreignKey({
  name: "posts_author_id_fk",
  columns: [posts.authorId],
  foreignColumns: [users.id],
}).onDelete("cascade").onUpdate("no action")
```

**Output File:** `research/04-foreign-key-generation.md`

### 5. Drizzle Relation Mapping Research

**Agent Task:** Research how to generate Drizzle `defineRelations` output from DSL metadata.

**Research Questions:**
- How to aggregate relations from multiple models into a single `defineRelations` call?
- How to handle the schema object reference requirement?
- What helper functions would simplify relation generation?
- How to support the `where` predicate filter option?
- How to generate type-safe relation accessors?

**Explore Patterns:**
```typescript
// Input: Multiple DSL Models with relations
class User extends Model<User>("User")({...}) {}
class Post extends Model<Post>("Post")({...}) {}
class Comment extends Model<Comment>("Comment")({...}) {}

// Aggregation function
const drizzleRelations = toDrizzleRelations([User, Post, Comment]);

// Output: Drizzle defineRelations
export const relations = defineRelations(schema, (r) => ({
  posts: {
    author: r.one.users({ from: r.posts.authorId, to: r.users.id }),
    comments: r.many.comments({ from: r.posts.id, to: r.comments.postId }),
  },
  // ...
}));
```

**Output File:** `research/05-drizzle-relation-mapping.md`

### 6. Type Safety & Inference Research

**Agent Task:** Research type-level techniques for ensuring relation type safety.

**Research Questions:**
- How to validate that referenced field names exist on target model?
- How to ensure foreign key column types match primary key types?
- How to infer relation accessor types for query building?
- How to express optional vs required relations in the type system?
- What compile-time error messages would be most helpful?

**Explore Patterns:**
```typescript
// Type-safe field reference
type ValidForeignKey<
  From extends ModelClass,
  FromField extends keyof ModelFields<From>,
  To extends ModelClass,
  ToField extends keyof ModelFields<To>,
> = FieldType<From, FromField> extends FieldType<To, ToField>
  ? Relation<From, To>
  : TypeMismatchError<From, FromField, To, ToField>;

// Compile-time validation
type EnsureRelationValid<R extends Relation> =
  R extends Relation<infer From, infer To>
    ? ValidForeignKey<From, R["fromField"], To, R["toField"]>
    : never;
```

**Output File:** `research/06-type-safety.md`

### 7. API Ergonomics Research

**Agent Task:** Research API ergonomics comparing different syntax approaches.

**Research Questions:**
- Which syntax minimizes boilerplate while maximizing clarity?
- How do different approaches scale with complex relation graphs?
- What developer experience patterns from other tools should be adopted?
- How to balance explicitness with conciseness?
- What autocompletion/IDE support considerations matter?

**Evaluation Criteria:**
- Lines of code to define a typical relation
- Clarity of intent when reading code
- TypeScript error message quality
- IDE autocompletion support
- Learning curve for new developers

**Output File:** `research/07-api-ergonomics.md`

## Synthesis Instructions

After all research agents complete, synthesize findings into `research-results.md` at `.specs/dsl-relations-and-foriegn-keys/research-results.md`:

1. **Executive Summary** - Key findings and recommended approach
2. **Syntax Recommendation** - Proposed API for Field and Model level relations
3. **Data Structure Recommendation** - Chosen data structures with rationale
4. **Type Safety Design** - Type-level validation approach
5. **Drizzle Mapping Strategy** - Generation approach for relations and foreign keys
6. **Implementation Priorities** - Phased rollout plan
7. **Open Questions** - Remaining design decisions requiring user input

## Agent Deployment

Use the `effect-researcher` subagent type for each research area. Each agent should:

1. Search Effect documentation for relevant patterns
2. Examine existing DSL module code for consistency
3. Research external ORM patterns for inspiration
4. Generate concrete code examples
5. Document trade-offs for each approach
6. Produce a recommendation with rationale

Place each agent's output in the corresponding research file under `.specs/dsl-relations-and-foriegn-keys/research/`.

## Success Criteria

Research is complete when:
1. All 7 research files exist with substantial content
2. Each file contains concrete code examples
3. Trade-offs are documented for each approach
4. A clear recommendation emerges per area
5. `research-results.md` synthesizes all findings coherently
