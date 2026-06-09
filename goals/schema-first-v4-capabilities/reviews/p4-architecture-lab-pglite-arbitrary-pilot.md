# P4 Architecture Lab PgLite Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated
  `packages/architecture-lab/server/test/integration/WorkItemDrizzleRepository.pglite.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added always-on property coverage deriving values from existing architecture
  lab domain source schemas:
  - `WorkItemId`;
  - `WorkItemTitle`;
  - `WorkerId`;
  - `WorkerOrganizationId`.
- Proved generated values encode, decode, and re-encode through their domain
  schemas.
- Kept the PgLite repository lifecycle and worker persistence tests behind the
  existing integration gate.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 0 tracked files.

## Review Notes

This pilot intentionally does not force the PgLite integration branch to run on
machines without the configured database/testcontainer environment. The
schema-derived law runs at file load as a normal test, while the repository
tests remain gated by `BEEP_TEST_DATABASE_URL` or
`BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers`.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/architecture-lab/server && bun run beep:test:integration -- WorkItemDrizzleRepository.pglite.test.ts
cd packages/architecture-lab/server && bun run check
cd packages/architecture-lab/server && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
