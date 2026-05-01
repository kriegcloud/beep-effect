# Schema To Drizzle Projection Spec

## Problem

The current entity/mixin/table split gives us useful persistence descriptors,
but it still lets the domain schema and persistence shape drift. The worst case
is a rich domain field whose encoded representation is compatible with storage,
while its decoded representation is not. If the table package has to rediscover
that relationship by hand, the entity model stops being the source of truth.

## Goals

- Entity models are just Effect schemas.
- Entity classes remain opaque domain types.
- Class factories can define invariant fields for all entities or entity
  subsets.
- Schema annotations are still passed through the normal Effect schema
  annotation channel and can be retrieved later.
- The decoded side is the domain shape.
- The encoded side is the persistence shape.
- Persistence metadata is checked against the schema field it projects.
- A Drizzle table can be derived from attached metadata with typed
  `$inferSelect` and `$inferInsert` surfaces.

## Non-Goals

- Replacing the current shared-domain entity kernel in this experiment.
- Supporting every Postgres type or every existing mixin descriptor.
- Solving migrations, indexes, relations, or cross-table constraints.
- Publishing a new package API before the proof has compiler evidence.

## Target API

```ts
const BaseEntity = EntitySchema.ClassFactory($I`BaseEntity`)({
  fields: {
    createdAt: EntitySchema.DateTimeFromMillis,
    rowVersion: EntitySchema.int,
  },
  persisted: {
    createdAt: EntitySchema.persist.timestampMillis(),
    rowVersion: EntitySchema.persist.int(),
  },
});

class CandidateDraft extends BaseEntity.Class<CandidateDraft>($I`CandidateDraft`)(
  Workspace.CandidateDraftId,
  {
    fields: {
      fixtureKey: S.String,
      lifecycle: CandidateLifecycle,
      snapshot: S.Record(S.String, S.Unknown),
      parentId: EntitySchema.entityId(Workspace.WorkspaceId).pipe(S.OptionFromNullOr),
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text(),
      lifecycle: EntitySchema.persist.literal(),
      snapshot: EntitySchema.persist.jsonb(),
      parentId: EntitySchema.persist.entityId(),
    },
  },
  $I.annote("CandidateDraft", {
    description: "A really good description",
  })
) {}
```

## Invariants

- Every persisted key must exist in `fields`.
- Every field intended for persistence must have a persisted descriptor.
- A descriptor's storage kind must be compatible with the field's encoded type.
- `jsonb` descriptors must be backed by JSON container encoded shapes instead
  of accepting every non-undefined encoded type.
- Persisted descriptor maps are exact: missing persisted field keys and extra
  persistence-only keys are rejected by the type contract.
- Persistence descriptors are discriminated unions using `storageKind` and
  `valueStrategy`, and Drizzle projection must exhaustively interpret those
  discriminants.
- Persistence descriptors expose schema-derived narrowing statics (`cases`,
  `guards`, `isAnyOf`, and `match`) so table projection and future consumers can
  narrow by descriptor shape without bespoke predicates.
- Schema files use package identity composers and `$I.annote(...)` /
  `$I.annoteSchema(...)` for identifiers and annotations.
- Drizzle columns are typed from `Schema.Codec.Encoded<Field>`, never from the
  decoded domain type.
- Nullability comes from `SchemaAST.toEncoded(field.ast)`, not from a manually
  repeated flag.
- Encoded absence classification is explicit. The prototype currently
  distinguishes required, nullable, undefined, nullish, optional-key,
  optional-nullish, and ambiguous declared-schema shapes.
- Optional/missing-key Effect schemas such as `S.optionalKey`,
  `S.OptionFromOptionalKey`, and `S.OptionFromUndefinedOr` are not selected-row
  persistence shapes. SQL row optionality is represented with nullable encoded
  schemas such as `S.NullOr` and `S.OptionFromNullOr`.
- Runtime projection also guards against optional or undefined encoded field
  shapes so `any`/casted scratchpad inputs fail loudly instead of silently
  creating a nullable-looking SQL column.
- Projected Drizzle tables preserve Drizzle's table identity while carrying
  attached entity metadata. The projection must not clone the table object into
  a plain object.
- Projected tables must survive real database execution, not only query-string
  generation. The proof inserts encoded rows through Drizzle and decodes
  selected rows back into opaque domain entities.
- Entity-specific `id`, `entityType`, and table name are derived from the
  concrete entity id supplied at the child entity boundary.
- The domain class keeps normal Effect schema behavior: decode, encode,
  annotations, and class construction still work.

## First Proof

The first proof lives in `scratchpad/schema-drizzle-projection`. It must show:

- Two entities with different real repo entity ids decode to opaque class
  instances.
- Encoding those entities produces distinct persistence row shapes.
- Entity table names come from `entityId.tableName`.
- Entity discriminator literals come from `entityId.entityType`.
- Entity schemas use normal Effect optional/nullish variants directly.
- Entity schema AST annotations contain normal user annotations.
- The attached entity definition can be read from annotations.
- `pgTableFrom(Entity)` returns a Drizzle table with typed row shapes.
- Drizzle's query builder can build insert/select SQL against the projected
  table using the schema's encoded row shape.
- PGlite can execute insert/select round trips against the projected tables,
  and the returned rows decode back into opaque domain class instances.
- TSTyche proves the static surface, including descriptor narrowing and encoded
  row shapes.
- `@effect/vitest` proves the runtime surface, including descriptor decoding,
  nullability derivation, annotation retrieval, and Drizzle column projection.
