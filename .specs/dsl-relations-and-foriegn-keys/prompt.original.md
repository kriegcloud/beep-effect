# Implementation Prompt: Entity Relationship Metadata System

## Objective

Orchestrate the implementation of an entity relationship metadata system for the DSL module at `packages/common/schema/src/integrations/sql/dsl`. This system enables defining relations at both Model and Field levels, with mapping to Drizzle ORM relations and foreign key definitions.

## Prerequisites

This prompt assumes the research phase is complete with findings synthesized in:
- `.specs/dsl-relations-and-foriegn-keys/research-results.md`

Review the research results before proceeding to ensure alignment with recommended approaches.

## Implementation Context

### Target Module Location
```
packages/common/schema/src/integrations/sql/dsl/
├── Field.ts           # Extend with relation config
├── Model.ts           # Extend with relation accessors
├── types.ts           # Add relation type definitions
├── relations.ts       # NEW: Core relation primitives
├── foreign-keys.ts    # NEW: Foreign key generation
├── combinators.ts     # Extend with relation combinators
├── adapters/
│   ├── drizzle.ts     # Extend with relation mapping
│   └── drizzle-relations.ts  # NEW: Drizzle relation generation
└── index.ts           # Export new APIs
```

### Existing Patterns to Follow

1. **Symbol-based metadata** - Use `Symbol.for()` with `$SchemaId` for cross-module consistency
2. **Curried APIs** - Follow the `Field(schema)(config)` pattern for composability
3. **Type-safe extraction** - Use conditional types for safe metadata access
4. **Combinator style** - Support pipe-friendly transformers
5. **Lazy references** - Use thunks `() => Model` to handle circular dependencies

### Integration Points

1. **ColumnDef extension** - Add optional `references` property
2. **ModelStatics extension** - Add `relations` accessor
3. **toDrizzle extension** - Generate foreign key constraints
4. **New toDrizzleRelations** - Generate relation definitions

## Implementation Phases

### Phase 1: Core Data Structures

**Files to Create/Modify:**
- `types.ts` - Add relation type definitions
- `relations.ts` - Create relation primitives

**Deliverables:**

1. **Relation Type Definitions**
```typescript
// Relation cardinality
export type RelationType = "one" | "many" | "manyToMany";

// Foreign key actions
export type ForeignKeyAction = "cascade" | "restrict" | "no action" | "set null" | "set default";

// Foreign key configuration
export interface ForeignKeyConfig {
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
  readonly name?: string;
}

// Base relation metadata
export interface RelationMeta<
  Target extends ModelClass = ModelClass,
  FromField extends string = string,
  ToField extends string = string,
> {
  readonly _tag: RelationType;
  readonly target: () => Target;
  readonly fromField: FromField;
  readonly toField: ToField;
  readonly optional: boolean;
  readonly foreignKey?: ForeignKeyConfig;
}

// One-to-one/many relation
export interface OneRelation<...> extends RelationMeta<...> {
  readonly _tag: "one";
}

// Many-side relation
export interface ManyRelation<...> extends RelationMeta<...> {
  readonly _tag: "many";
}

// Many-to-many relation (with junction)
export interface ManyToManyRelation<...> extends RelationMeta<...> {
  readonly _tag: "manyToMany";
  readonly junction: JunctionConfig;
}
```

2. **Relation Constructors**
```typescript
export const Relation = {
  one: <Target, From, To>(
    target: () => ModelClass<Target>,
    config: OneRelationConfig<From, To>
  ): OneRelation<...> => {...},

  many: <Target, From, To>(
    target: () => ModelClass<Target>,
    config: ManyRelationConfig<From, To>
  ): ManyRelation<...> => {...},

  manyToMany: <Target, Junction>(
    target: () => ModelClass<Target>,
    config: ManyToManyConfig<Junction>
  ): ManyToManyRelation<...> => {...},
};
```

3. **Symbol Registration**
```typescript
export const RelationMetaSymbol: unique symbol = Symbol.for($I`relation-meta`);
export const ForeignKeySymbol: unique symbol = Symbol.for($I`foreign-key`);
```

### Phase 2: Field-Level Relations

**Files to Modify:**
- `Field.ts` - Extend config with references
- `types.ts` - Extend FieldConfig type
- `combinators.ts` - Add relation combinators

**Deliverables:**

1. **Extended FieldConfig**
```typescript
export interface FieldConfig<C extends Partial<ColumnDef> = Partial<ColumnDef>> {
  readonly column?: C;
  readonly references?: FieldReference;
}

export interface FieldReference<
  Target extends ModelClass = ModelClass,
  TargetField extends string = string,
> {
  readonly target: () => Target;
  readonly field: TargetField;
  readonly foreignKey?: ForeignKeyConfig;
}
```

2. **Extended Field Function**
```typescript
// Update Field to accept references config
Field(UserId)({
  column: { type: "uuid" },
  references: {
    target: () => User,
    field: "id",
    foreignKey: { onDelete: "cascade" }
  }
})
```

3. **Relation Combinators**
```typescript
// Combinator for defining references
export const references = <Target, TargetField extends string>(
  target: () => ModelClass<Target>,
  field: TargetField,
  foreignKey?: ForeignKeyConfig
) => <A, I, R, C extends ColumnDef>(
  self: S.Schema<A, I, R> | DSLField<A, I, R, C>
): DSLFieldWithRef<A, I, R, C, Target, TargetField> => {...};

// Usage
const authorIdField = UserId.pipe(
  DSL.uuid,
  DSL.references(() => User, "id", { onDelete: "cascade" })
);
```

### Phase 3: Model-Level Relations

**Files to Modify:**
- `Model.ts` - Add relations config and accessor
- `types.ts` - Extend ModelClass, ModelStatics

**Deliverables:**

1. **Extended Model Factory**
```typescript
export const Model =
  <Self = never>(identifier: string) =>
  <const Fields extends DSL.Fields, const Relations extends RelationsConfig = {}>(
    fields: Fields,
    config?: {
      relations?: Relations;
      annotations?: S.Annotations.Schema<Self>;
    }
  ): ModelClassWithRelations<Self, Fields, Relations, ...> => {...};
```

2. **Relations Config Type**
```typescript
export type RelationsConfig = {
  readonly [name: string]: RelationMeta;
};
```

3. **Extended ModelStatics**
```typescript
export interface ModelStatics<...> {
  readonly tableName: TName;
  readonly columns: Columns;
  readonly primaryKey: PK;
  readonly identifier: Id;
  readonly _fields: Fields;
  readonly relations: Relations;  // NEW
}
```

4. **Usage Example**
```typescript
class Post extends Model<Post>("Post")({
  id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(UserId)({
    column: { type: "uuid" },
    references: { target: () => User, field: "id" }
  }),
  title: Field(S.String)({ column: { type: "string" } }),
}, {
  relations: {
    author: Relation.one(() => User, {
      from: "authorId",
      to: "id",
      optional: false,
    }),
    comments: Relation.many(() => Comment, {
      from: "id",
      to: "postId",
    }),
  },
}) {}

// Access relations
Post.relations.author  // OneRelation<User, "authorId", "id">
Post.relations.comments  // ManyRelation<Comment, "id", "postId">
```

### Phase 4: Foreign Key Generation

**Files to Create:**
- `foreign-keys.ts` - Foreign key extraction and generation

**Deliverables:**

1. **Foreign Key Extraction**
```typescript
// Extract foreign keys from Model fields
export const extractForeignKeys = <M extends ModelClass>(
  model: M
): readonly ForeignKeyDef[] => {...};

// ForeignKeyDef structure
export interface ForeignKeyDef {
  readonly name: string;
  readonly columns: readonly string[];
  readonly foreignTable: string;
  readonly foreignColumns: readonly string[];
  readonly onDelete?: ForeignKeyAction;
  readonly onUpdate?: ForeignKeyAction;
}
```

2. **Drizzle Foreign Key Generation**
```typescript
// Generate Drizzle foreign key constraints
export const toDrizzleForeignKeys = <M extends ModelClass>(
  model: M,
  tableRef: PgTableWithColumns<any>,
  schemaRef: Record<string, PgTableWithColumns<any>>
): readonly ForeignKeyBuilderCallback[] => {...};
```

3. **Extended toDrizzle**
```typescript
// Update toDrizzle to include foreign keys
export const toDrizzle = <M extends ModelStatics<...>>(
  model: M,
  options?: { includeForeignKeys?: boolean }
): PgTableWithColumns<...> =>
  pg.pgTable(
    model.tableName,
    columnDefinitions,
    options?.includeForeignKeys
      ? (table) => toDrizzleForeignKeys(model, table, {})
      : undefined
  );
```

### Phase 5: Drizzle Relation Mapping

**Files to Create:**
- `adapters/drizzle-relations.ts` - Drizzle relation generation

**Deliverables:**

1. **Relation Aggregation**
```typescript
// Aggregate relations from multiple models
export const aggregateRelations = (
  models: readonly ModelClass[]
): RelationGraph => {...};

// RelationGraph structure
export interface RelationGraph {
  readonly models: Map<string, ModelClass>;
  readonly relations: Map<string, readonly RelationMeta[]>;
}
```

2. **Drizzle Relations Generation**
```typescript
// Generate Drizzle defineRelations configuration
export const toDrizzleRelations = <Models extends readonly ModelClass[]>(
  models: Models,
  drizzleTables: Record<string, PgTableWithColumns<any>>
): ReturnType<typeof defineRelations> => {
  return defineRelations(drizzleTables, (r) => {
    // Generate relation config for each model
    return models.reduce((acc, model) => {
      const tableName = model.tableName;
      const modelRelations = buildModelRelations(model, r);
      return { ...acc, [tableName]: modelRelations };
    }, {});
  });
};
```

3. **Usage Example**
```typescript
// Convert DSL Models to Drizzle tables
const users = toDrizzle(User);
const posts = toDrizzle(Post);
const comments = toDrizzle(Comment);

// Generate Drizzle relations
const relations = toDrizzleRelations(
  [User, Post, Comment],
  { users, posts, comments }
);

// Use in Drizzle client
const db = drizzle(connection, { schema: { users, posts, comments, ...relations } });
```

### Phase 6: Type Safety

**Files to Modify:**
- `types.ts` - Add type-level validation

**Deliverables:**

1. **Field Existence Validation**
```typescript
// Validate field exists on model
type ValidateFieldExists<M extends ModelClass, F extends string> =
  F extends keyof ModelFields<M>
    ? F
    : FieldNotFoundError<M, F>;
```

2. **Type Compatibility Validation**
```typescript
// Validate FK and PK types match
type ValidateForeignKeyTypes<
  From extends ModelClass,
  FromField extends string,
  To extends ModelClass,
  ToField extends string,
> = ExtractFieldType<From, FromField> extends ExtractFieldType<To, ToField>
  ? true
  : TypeMismatchError<From, FromField, To, ToField>;
```

3. **Relation Config Validation**
```typescript
// Validate entire relation config
type ValidateRelationConfig<
  Self extends ModelClass,
  Config extends RelationsConfig,
> = {
  [K in keyof Config]: ValidateRelation<Self, Config[K]>;
};
```

### Phase 7: Tests & Documentation

**Files to Create:**
- `test/integrations/sql/dsl/relations.test.ts`
- `test/integrations/sql/dsl/foreign-keys.test.ts`

**Test Coverage:**

1. **Unit Tests**
   - Relation constructor validation
   - Field-level reference metadata attachment
   - Model-level relation accessor
   - Foreign key extraction
   - Drizzle relation generation

2. **Type Tests**
   - Field existence validation
   - Type compatibility validation
   - Optional vs required relation inference
   - Relation accessor type inference

3. **Integration Tests**
   - Full model with relations → Drizzle table + relations
   - Circular dependency handling
   - Self-referential relations
   - Many-to-many with junction tables

## Implementation Guidelines

### Effect Patterns

Follow existing codebase conventions:

```typescript
// Use Effect Array utilities
F.pipe(relations, A.map(toRelationMeta));

// Use Effect Record utilities
F.pipe(model.relations, R.map(extractForeignKey));

// Use Effect Match for discriminated unions
Match.value(relation).pipe(
  Match.tag("one", handleOneRelation),
  Match.tag("many", handleManyRelation),
  Match.tag("manyToMany", handleManyToManyRelation),
  Match.exhaustive
);
```

### Type-Level Techniques

```typescript
// Conditional type with tuple wrapping
type ExtractRelationType<R> = [R] extends [OneRelation<infer T, infer F, infer TF>]
  ? { type: "one"; target: T; from: F; to: TF }
  : [R] extends [ManyRelation<infer T, infer F, infer TF>]
    ? { type: "many"; target: T; from: F; to: TF }
    : never;

// Mapped type for relation accessors
type RelationAccessors<Relations extends RelationsConfig> = {
  readonly [K in keyof Relations]: Relations[K];
};
```

### Error Handling

Provide helpful compile-time errors:

```typescript
interface FieldNotFoundError<M extends ModelClass, F extends string> {
  readonly _tag: "FieldNotFoundError";
  readonly message: `Field '${F}' does not exist on model '${M["identifier"]}'`;
}

interface TypeMismatchError<From, FromField, To, ToField> {
  readonly _tag: "TypeMismatchError";
  readonly message: `Type of '${FromField & string}' does not match type of '${ToField & string}'`;
}
```

## Validation Checkpoints

After each phase, verify:

1. **Phase 1**: Types compile, constructors work
   ```bash
   bun run check --filter=@beep/schema
   ```

2. **Phase 2-3**: Field and Model extensions work
   ```bash
   bun run test --filter=@beep/schema -- --grep "relations"
   ```

3. **Phase 4-5**: Drizzle generation produces valid output
   ```bash
   bun run test --filter=@beep/schema -- --grep "drizzle"
   ```

4. **Phase 6**: Type errors appear for invalid configs
   - Create intentionally invalid test cases
   - Verify compile errors have helpful messages

5. **Phase 7**: All tests pass, documentation complete
   ```bash
   bun run test --filter=@beep/schema
   bun run check
   bun run lint
   ```

## Success Criteria

Implementation is complete when:

1. Field-level `references` config works with type safety
2. Model-level `relations` config works with type safety
3. `toDrizzle` generates foreign key constraints
4. `toDrizzleRelations` generates Drizzle relation definitions
5. All relation types (one, many, manyToMany) are supported
6. Circular dependencies handled via lazy references
7. Comprehensive test coverage exists
8. No TypeScript errors in codebase
9. All existing tests continue to pass

## Agent Deployment Strategy

Use the `effect-code-writer` agent type for implementation tasks. Deploy agents in phases:

1. **Phase 1 Agent**: Core types and constructors
2. **Phase 2 Agent**: Field-level extensions
3. **Phase 3 Agent**: Model-level extensions
4. **Phase 4 Agent**: Foreign key generation
5. **Phase 5 Agent**: Drizzle relation mapping
6. **Phase 6 Agent**: Type safety layer
7. **Phase 7 Agent**: Tests and documentation

Each agent should:
- Read existing code for patterns
- Implement according to spec
- Write tests for new functionality
- Verify no type errors introduced
- Document public APIs with JSDoc
