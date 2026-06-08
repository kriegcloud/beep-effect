# P4 Shared Domain Identity Namespaces Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/shared/domain/test/IdentityNamespaces.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving ids from every registered identity namespace
  schema with `S.toArbitrary(spec.schema)`.
- Proved generated ids round-trip through each schema's decode/encode boundary
  and satisfy the schema-provided equivalence helper.
- Kept exact fixtures for deterministic metadata, runtime identity composers,
  and invalid composer lookalikes.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 18 tracked files.

## Finding

This pilot is a good fit for schema-derived property testing because the test
already has a registry of every identity namespace schema. One property can
exercise all entity-id schemas without hand-maintaining a pile of static ids,
while the existing fixtures still pin exact metadata strings that should not be
randomized.

## Verification

```sh
cd packages/shared/domain && bun run beep:test -- IdentityNamespaces.test.ts
bun run beep lint schema-first --write
bun run beep lint schema-first
```
