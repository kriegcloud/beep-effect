# P4 Shared Domain EntityKernel Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/shared/domain/test/EntityKernel.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving `DocumentId` values from the source schema with
  `S.toArbitrary(DocumentId)`.
- Proved generated ids build valid `EntityRef` values, round-trip through the
  `EntityRef` schema codec, satisfy `DocumentId.equivalence`, and succeed
  through `EntityRef.makeResult`.
- Kept exact fixtures for BaseEntity descriptor metadata, field presence,
  primitive schemas, principals, source kinds, and barrel exports.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 17 tracked files.

## Finding

This pilot keeps the descriptor-heavy portions of EntityKernel as exact
fixtures, while moving the reusable entity-id/reference law to generated data.
It is a useful schema-first pattern for shared-kernel tests: deterministic
metadata stays pinned, and the value domain gets broad property coverage from
the source schema.

## Verification

```sh
cd packages/shared/domain && bun run beep:test -- EntityKernel.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```
