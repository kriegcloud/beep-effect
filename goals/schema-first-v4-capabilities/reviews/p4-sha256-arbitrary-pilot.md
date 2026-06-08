# P4 Sha256 Arbitrary Pilot

Date: 2026-06-08

## Completed

- Started P4 Wave 3 with a low-risk local schema package test:
  `packages/foundation/modeling/schema/test/Sha256.test.ts`.
- Added a property test that derives SHA-256 digest examples from the existing
  source schema:
  `S.toArbitrary(Sha256Hex)`.
- Added a source-schema `toArbitrary` annotation to
  `packages/foundation/modeling/schema/src/Sha256.ts` so `Sha256Hex` can
  generate canonical lowercase 64-character digest values directly.
- Removed the stale `SFV4-arbitrary-tests` inventory entry for
  `Sha256.test.ts`.

## Finding

The first attempt used `S.toArbitrary(Sha256Hex)` without a custom annotation.
That exposed a useful schema-first testing pressure point: the existing schema
could validate lowercase 64-character hex digests, but generation was stuck
trying to filter arbitrary strings into a very narrow domain.

That is exactly the desired feedback loop for this packet. When property tests
cannot generate valid values efficiently, fix or annotate the source schema so
all tests can reuse the same precise domain model. Do not define a weaker
test-only schema or hand-written fixture generator.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run check
cd packages/foundation/modeling/schema && bun run beep:test -- Sha256.test.ts
bun run beep lint schema-first
```

The live schema-first lint baseline after this pilot is:

```text
[schema-first] live_entries=367
[schema-first] tracked_entries=367
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_arbitrary_tests_advisories=26
```

## Next Steps

- Continue P4 Wave 3 with local schema tests before driver/integration tests.
- Prefer source-schema `toArbitrary` annotations for narrow branded domains
  whose generated values would otherwise rely on rejection-heavy filters.
- Keep exact fixtures beside property tests when they represent golden payloads,
  compatibility examples, or regression repros.
