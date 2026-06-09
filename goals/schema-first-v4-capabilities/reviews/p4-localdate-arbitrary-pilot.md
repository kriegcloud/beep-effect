# P4 LocalDate Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/modeling/schema/test/LocalDate.test.ts` from
  the `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving `LocalDate` class instances from the source
  schema with `S.toArbitrary(LocalDate)`.
- Proved the generated values round-trip through `S.encodeEffect(LocalDate)`
  and `S.decodeUnknownEffect(LocalDate)` and compare equal with the existing
  schema-derived `equals` helper.
- Kept the existing static fixtures for specific dates, parser rejection cases,
  clock behavior, date arithmetic, ordering, and leap-year examples.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 21 tracked files.

## Finding

This is a useful local schema-package pilot because it moves a high-codec-count
test file from fixture-only coverage to a generated schema law without changing
public behavior. While exploring the stronger ISO string round-trip law, the
schema boundary showed an important precision question: the `LocalDate` object
schema currently allows structurally bounded values such as day 31 for any
month, while `fromString` enforces real calendar dates. That should be handled
as a deliberate future precision-remediation decision instead of being changed
as incidental test cleanup.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run beep:test -- LocalDate.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```
