# Schema To Drizzle Projection Readiness

## Verdict

The experiment is ready for package-level prototype planning. It is not yet a
repo-wide migration plan, because the API has intentionally stayed in
scratchpad form and has not been ported over representative production
entities.

## Green Gates

- Entity models are Effect schemas with opaque class instances.
- Class factories carry invariant base fields without forcing empty child
  field maps.
- Schema annotations and attached entity definitions are retrievable through
  the normal schema path.
- The decoded side is the domain shape and the encoded side is the persistence
  row shape.
- Persistence descriptor maps are exact at compile time.
- Descriptors are checked against encoded field types, including JSON container
  restrictions for `jsonb`.
- Encoded absence is derived from `SchemaAST.toEncoded(...)` and classified by
  `EncodedAbsenceKind`.
- Selected-row projection rejects undefined, optional-key, and ambiguous
  absence shapes.
- Drizzle columns are projected from encoded field types and descriptor
  discriminants.
- Projected Drizzle tables keep their internal table identity during SQL
  generation.
- PGlite executes real insert/select round trips against projected tables, and
  selected rows decode back into opaque domain entities.
- Runtime tests, type tests, scratchpad typecheck, proof script, and PGlite
  integration proof all pass.

## Migration Planning Boundary

Begin migration planning by extracting a package-level prototype and porting a
small vertical slice. Do not start a broad entity migration until that package
surface has:

- public exports with package identity composers instead of scratchpad identity,
- docgen-clean JSDoc and schema annotations,
- package-local `@effect/vitest` tests,
- package-local TSTyche assertions,
- at least two representative production entities ported side by side with the
  existing table definitions,
- a decision on how generated SQL metadata, indexes, constraints, and relations
  leave the scratchpad proof and enter package code.

## Recommended First Migration Slice

Promote the scratchpad into an unstable package surface first, then port
`CandidateDraft` and `CandidateProject`-style entities that cover:

- generated entity ids,
- derived entity type literals,
- timestamp millis encoding,
- integer version fields,
- literal domains,
- JSONB containers,
- nullable entity references,
- schema annotations.
