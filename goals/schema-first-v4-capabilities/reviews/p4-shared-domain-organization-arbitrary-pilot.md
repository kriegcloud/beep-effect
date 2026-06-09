# P4 Shared Domain Organization Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/shared/domain/test/Organization.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving `Organization.LicenseTier` and
  `Organization.Settings` values from their existing source schemas with
  `S.toArbitrary(...)`.
- Proved generated license tiers satisfy the `LiteralKit` guard surface and
  generated settings round-trip through the settings schema codec.
- Kept exact fixtures for entity descriptor materialization, nullable parent
  organization ids, tenant placement invariants, and table metadata.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 19 tracked files.

## Finding

This pilot is intentionally value-schema scoped. The Organization test still
uses exact entity fixtures where the table and persistence metadata are the
behavior under test, while the schema-derived property covers the reusable
literal and settings schemas that were previously static-only. It demonstrates
the desired mixed testing shape: keep precise fixtures for descriptor contracts,
but derive broad data coverage from source schemas for reusable domain values.

## Verification

```sh
cd packages/shared/domain && bun run beep:test -- Organization.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```
