# P4 Wave 3 Arbitrary Exceptions and Deferrals

Date: 2026-06-08

This records the false-positive review of the `SFV4-arbitrary-tests` candidates
that should NOT receive a forced property test, from the orchestrated triage in
`reviews/p4-wave3-arbitrary-remediation-batch.md`. Of the 32 candidates, 6 were
remediated, 8 are reclassified as inventory exceptions, and 18 are deferred
(left as advisory) pending a source-schema `toArbitrary` annotation.

## Exceptions (8, reclassified `status: exception`)

These files use Schema codecs incidentally — as JSON-boundary / CLI-behavior
fixture plumbing, or as meta-tests of a schema *combinator* over only
test-local illustrative schemas. There is no domain schema value/law under
test, so a derived property test would be inappropriate.

- `tooling/tool/cli/test/docgen.test.ts` — CLI docgen command-behavior test;
  codecs encode synthetic package.json/docgen.json/tsconfig fixtures and decode
  CLI report JSON at the boundary.
- `tooling/tool/cli/test/reuse-command.test.ts` — CLI reuse command-behavior
  test; codecs only decode machine-readable JSON output.
- `tooling/tool/cli/test/tsconfig-sync.test.ts` — CLI tsconfig-sync
  behavior test; codecs only decode/encode external tsconfig/tstyche/docgen
  config fixtures via test-local structs.
- `tooling/tool/cli/test/create-package.test.ts` — CLI create-package
  behavior test; codecs only decode generated package.json/tsconfig/tstyche
  artifacts at the JSON boundary.
- `schema/test/Fn.test.ts` — meta-test of the `Fn`/`ThunkOf`/`AnyFn` combinator
  over function values (`declareConstructor` with self-identity equivalence); no
  structural data for `S.toArbitrary` to generate or round-trip.
- `schema/test/Transformations.test.ts` — meta-test of the
  `destructiveTransform` combinator using test-local schemas; lossy decode +
  passthrough encode has no round-trip law.
- `schema/test/MappedLiteralKit.test.ts` — meta-test of the `MappedLiteralKit`
  combinator using test-local literal pairs; exercises combinator mechanics.
- `schema/test/SchemaUtils.test.ts` — meta-test of `SchemaUtils` combinators
  using test-local illustrative schemas.

## Deferrals (18, kept `advisory`)

These are genuine schema tests, but `S.toArbitrary` on the source schema is
unsafe today without first adding a source-schema `toArbitrary` annotation.
They remain advisory candidates so the work stays visible; a future annotation
pass should add seeded arbitraries to the source brands, then property tests
can derive from them.

**Update:** the source-annotation pass in
`reviews/p4-wave3-source-arbitrary-annotations.md` then cleared 3 of these —
`CaseStr` (Kebab/Pascal/Snake brands), `FilePath` (`WindowsDriveRoot`), and
`BlockchainRedacted` (`EthereumValidatorPublicKey`) — by adding
`fc.stringMatching` source annotations. The other filter-heavy entries below
were attempted and correctly reverted because they are template/predicate
brands rather than pure anchored-regex brands (FileName, Glob, IRI, URI) or
transforms (DateTimeUtcFromValid), so 15 deferrals remained.

**Update 2:** the probe-first batch in
`reviews/p4-wave3-deferred-arbitraries.md` then cleared 9 more (FileName +
TSMorph SymbolId source annotations; probe-only DateTimeUtcFromValid, RegExp,
Duration, Color, URI, Observed), reverted IRI and PackageJson as flaky,
reclassified PromiseSchema as an exception, and found the deferred Graph
candidate was mis-targeted (the NLP Graph was already remediated). **5
deferrals remain**: Glob and TypedArrays (Bun-runtime-blocked here), IRI and
PackageJson (reverted-flaky; need curated arbitraries), and
`schema/test/Graph.test.ts` (not yet addressed).

- filter-heavy refinement brands (regex/predicate filters that random strings
  essentially never satisfy, so `toArbitrary` exhausts on rejection):
  `schema/test/{CaseStr,FileName,Glob,FilePath,DateTimeUtcFromValid,BlockchainRedacted}.test.ts`,
  `semantic-web/test/{IRI,URI}.test.ts`,
  `repo-utils/test/schemas/PackageJson.test.ts`,
  `repo-utils/test/{TSMorph.service,TSMorph.model}.test.ts`,
  `schema/test/Color.test.ts`.
- `instanceOf` declarations lacking an arbitrary annotation:
  `schema/test/{RegExp,PromiseSchema,TypedArrays,Graph}.test.ts`,
  `observability/test/Observed.test.ts`.
- transform precision (lossy/float round-trip): `schema/test/Duration.test.ts`.

## Mechanism

The 8 exception entries were reclassified in
`standards/schema-first.inventory.jsonc` to `status: "exception"` with the
reasons above, then `bun run beep lint schema-first --write` re-serialized the
inventory canonically. The lint's merge preserves existing tracked status for
live findings, so exceptions are excluded from the active advisory count while
staying tracked. After this batch the live count is:

```text
[schema-first] sfv4_arbitrary_tests_advisories=18
```

(6 remediated + 8 exception + 18 deferred-advisory = the original 32.)
