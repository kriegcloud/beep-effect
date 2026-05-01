# Schema To Drizzle Projection Plan

## Phase 1: Scratchpad Plumbing

- Create a local `EntitySchema` module that wraps `Schema.Class`.
- Attach entity definition metadata through schema annotations.
- Preserve a static `definition` property for ergonomic inspection.
- Support `ClassFactory(...)(baseDefinition).Class(...)` so invariant fields can
  be reused without repeating the empty `fields` slot smell.
- Keep entity-specific identity outside the base invariant fields. A thin
  scratchpad `BaseEntity` wrapper injects `id`, `entityType`, and table name
  from the concrete entity id passed by each child entity.

## Phase 2: Persistence Descriptors

- Add storage helpers under `EntitySchema.persist`.
- Check persisted descriptors against field encoded types.
- Model descriptors as discriminated unions with repo-style `storageKind` and
  `valueStrategy` fields.
- Back the descriptor vocabulary with schemas so consumers get `cases`,
  `guards`, `isAnyOf`, and `match` narrowing helpers instead of plain object
  metadata only.
- Normalize table names and column names without forcing callers to write SQL
  language in the domain model.
- Derive nullability from `SchemaAST.toEncoded(field.ast)` for the supported
  field shapes.
- Use native Effect Schema optional/nullish constructs directly. Selected SQL
  row nullability is proven with nullable encoded shapes such as `S.NullOr` and
  `S.OptionFromNullOr`; optional/missing-key schemas are rejected for persisted
  row columns in this proof.
- Add runtime absence-shape checks for selected-row columns so optional or
  undefined encodings are rejected even if a caller bypasses the generic type
  contract.
- Classify encoded absence with a schema-backed `EncodedAbsenceKind` so tests
  can distinguish required, nullable, undefined, nullish, optional-key, and
  ambiguous declared-schema cases.
- Keep `jsonb` from becoming a catch-all escape hatch by requiring encoded
  JSON container shapes in the descriptor type contract.
- Require exact persisted maps: missing persisted keys and extra drifted keys
  are compile-time errors.

## Phase 3: Drizzle Projection

- Build `pgTableFrom(EntityClass)`.
- Map storage descriptors to Postgres column builders with
  `Match.discriminatorsExhaustive`.
- Apply `$type<Schema.Codec.Encoded<Field>>()` to every projected column.
- Preserve generated id/default strategy in the Drizzle insert/select types.
- Attach metadata to the Drizzle table object without cloning it, so Drizzle's
  internal table identity survives query generation.

## Phase 4: Evidence

- Add a runtime proof with two real repo entity ids that decodes, encodes,
  retrieves annotations, and inspects projected Drizzle columns.
- Add type assertions and TSTyche tests proving distinct entity id brands,
  entity-id-derived table names, descriptor narrowing, encoded persistence
  shapes, and Drizzle row shapes.
- Add `@effect/vitest` tests covering runtime decode/encode, annotations,
  descriptor decoding/narrowing, nullability derivation, and Drizzle columns.
- Add a query-builder SQL proof showing the projected table can be used by
  Drizzle insert/select builders with the encoded persistence row shape.
- Add a real PGlite-backed integration proof that creates projected tables,
  inserts encoded rows through Drizzle, selects them back, and decodes selected
  rows into opaque domain class instances.
- Keep the experiment out of package exports until the proof is persuasive.

## Exit Criteria

- The scratchpad runtime proof runs with Bun.
- The scratchpad type assertions pass under the scratchpad tsconfig.
- The scratchpad TSTyche lane passes.
- The scratchpad `@effect/vitest` lane passes.
- Drizzle query generation treats projected tables as real tables, not SQL
  parameters.
- The PGlite integration proof passes against a real database driver.
- The initiative has enough evidence to decide whether this should become a
  package-level prototype.
