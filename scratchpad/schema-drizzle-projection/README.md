# Schema Drizzle Projection Scratchpad

This scratchpad is the runnable proof for
`initiatives/schema-to-drizzle-projection`.

## Commands

```sh
bun scratchpad/schema-drizzle-projection/proof.ts
bunx --bun tsgo -p scratchpad/schema-drizzle-projection/tsconfig.json --noEmit
bunx vitest --config scratchpad/schema-drizzle-projection/vitest.config.ts run
```

Run the real PGlite round-trip proof with:

```sh
TESTCONTAINERS_RYUK_DISABLED=true BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bunx vitest --config scratchpad/schema-drizzle-projection/vitest.config.ts run scratchpad/schema-drizzle-projection/test/schema-drizzle-projection.pglite.test.ts
```

From `scratchpad/schema-drizzle-projection`:

```sh
bunx tstyche --config tstyche.json
```

## Files

- `entity-schema.ts` defines the schema-first entity class factory.
- `base-entity.ts` defines the identity-aware scratchpad base entity wrapper.
- `drizzle-projection.ts` exhaustively projects attached metadata into a
  Drizzle table.
- `proof.ts` defines two real-identity sample entities and runtime checks.
- `type-assertions.ts` proves the encoded shape and Drizzle row types.
- `test/schema-drizzle-projection.test.ts` hardens the runtime behavior with
  `@effect/vitest`.
- `test/schema-drizzle-projection.pglite.test.ts` proves the projected table
  against a real PGlite-backed Postgres round trip.
- `dtslint/schema-drizzle-projection.tst.ts` hardens the compile-time API with
  TSTyche.

## Current Decisions

- Entity-local identity is passed per child entity.
- Table names and discriminator literals come from the real repo `EntityId`.
- Persistence descriptors use discriminated `storageKind` and `valueStrategy`
  fields and expose schema-backed `cases`, `guards`, `isAnyOf`, and `match`
  helpers.
- Scratchpad schema files use repo-native `$I` identity composers for schema
  identifiers and annotations.
- Entity schemas use native Effect Schema optional/nullish primitives directly.
  Nullability is derived from `SchemaAST.toEncoded(field.ast)` and classified
  with `EncodedAbsenceKind`. The selected row proof accepts nullable encoded
  shapes and rejects undefined, optional/missing-key, and ambiguous declared
  schema shapes.
- `jsonb` is checked against JSON container encoded shapes instead of acting as
  a universal descriptor escape hatch.
- Persisted maps are exact: missing keys and extra drift keys are compile-time
  errors.
- Drizzle metadata is attached without cloning the generated table, preserving
  Drizzle's internal table identity for query generation.
- The integration proof creates real Postgres tables from the projected Drizzle
  columns, inserts encoded rows, selects them back, and decodes the selected
  rows into opaque domain classes.
