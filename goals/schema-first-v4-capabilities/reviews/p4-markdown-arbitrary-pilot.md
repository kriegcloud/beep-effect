# P4 Markdown Arbitrary Pilot

Date: 2026-06-08

## Completed

- Continued P4 Wave 3 with another low-risk local schema package test:
  `packages/foundation/modeling/schema/test/Markdown.test.ts`.
- Added a property test that derives Markdown document strings from the
  existing source schema:
  `S.toArbitrary(Markdown)`.
- Kept the existing exact fixtures for parser fallback, renderer failures, raw
  HTML filtering, schema factory options, and forbidden encoding behavior.
- Removed the stale `SFV4-arbitrary-tests` inventory entry for
  `Markdown.test.ts`.

## Finding

Unlike the narrow Sha256 digest domain, Markdown is intentionally permissive.
The default derived arbitrary was enough: generated Markdown values decoded back
to themselves without adding a custom `toArbitrary` annotation to the source
schema.

This gives the remediation wave a useful decision rule:

- broad/permissive schemas can often use `S.toArbitrary(SourceSchema)` directly;
- narrow branded domains should add source-schema arbitrary annotations when
  derived generation becomes rejection-heavy;
- exact fixtures stay valuable for named compatibility and regression behavior.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run beep:test -- Markdown.test.ts
bun run beep lint schema-first
```

The live schema-first lint baseline after this pilot is:

```text
[schema-first] live_entries=366
[schema-first] tracked_entries=366
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_arbitrary_tests_advisories=25
```

## Next Steps

- Continue P4 Wave 3 with remaining local schema tests such as CSV or
  HttpHeaders only after checking that the property law is source-schema owned.
- Treat `LocalDate` as higher risk because calendar-validity properties may
  imply public validation semantics; handle it in a dedicated precision or
  equivalence pass rather than a casual arbitrary-test pilot.
