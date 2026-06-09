# P4 CSV Arbitrary Pilot

Date: 2026-06-08

## Completed

- Continued P4 Wave 3 with another local schema package test:
  `packages/foundation/modeling/schema/test/Csv.test.ts`.
- Added property coverage that derives `UserRow` instances with
  `S.toArbitrary(UserRow)`, bounds the row array with FastCheck, encodes with
  `CSV(UserRow)`, decodes the produced CSV text, and asserts row equality.
- Tightened the test source row id schema from broad `S.FiniteFromString` to a
  positive finite number schema after the property exposed a `-0` round-trip
  mismatch.
- Removed the stale `SFV4-arbitrary-tests` inventory entry for `Csv.test.ts`.

## Finding

The first generated counterexample was a real modeling issue:
`S.FiniteFromString` can produce `-0`, but CSV text round-trips that value as
`0`. A static fixture with ids `1` and `2` could not reveal that edge. The fix
was to make the row schema say what the examples already implied: CSV user ids
in this test are positive numbers.

This is the core schema-first property-testing argument in miniature. When a
law claims encode/decode round-trip behavior across a schema domain, the source
schema must exclude values the boundary cannot preserve.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run beep:test -- Csv.test.ts
bun run beep lint schema-first
```

The live schema-first lint baseline after this pilot is:

```text
[schema-first] live_entries=364
[schema-first] tracked_entries=364
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_arbitrary_tests_advisories=23
```

## Next Steps

- Continue local schema package pilots before integration-heavy driver tests.
- Prefer properties that generate decoded schema values and drive the real
  encode/decode boundary, especially for transformation schemas.
- Treat counterexamples as source-schema precision feedback first, then codec
  bugs only when the schema is already precise enough.
