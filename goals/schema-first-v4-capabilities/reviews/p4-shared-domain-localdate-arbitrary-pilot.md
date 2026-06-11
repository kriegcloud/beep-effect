# P4 Shared Domain LocalDate Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/shared/domain/test/LocalDate.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving shared-domain `LocalDate.Model` instances from
  the source schema with `S.toArbitrary(Model)`.
- Proved every generated value round-trips through both the class codec
  (`S.encodeEffect(Model)` / `S.decodeUnknownEffect(Model)`) and the ISO string
  boundary (`LocalDateFromString`).
- Kept the existing static fixtures for constructor helpers, parser rejection
  cases, clock behavior, ordering, date arithmetic, and leap-year examples.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 20 tracked files.

## Finding

This pilot demonstrates the strongest form of the Wave 3 pattern: the
shared-domain source schema already encodes the real calendar-day invariant, so
`S.toArbitrary(Model)` produces values that are valid through the object codec
and the string boundary. That is the practical schema-first payoff the packet is
trying to make routine: when schemas are precise enough, property tests become
terse and production-like without separate fixture factories.

## Verification

```sh
cd packages/shared/domain && bun run beep:test -- LocalDate.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```
