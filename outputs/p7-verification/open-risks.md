# P7 Open Risks

## Summary
- Open blockers: 3
- Classification: all open blockers are **pre-existing**
- New unresolved issues introduced during P7 verification: none

## Risk register

| Risk ID | Severity | Status | Classification | Description | Proof |
| --- | --- | --- | --- | --- | --- |
| R1 | High | Open | Pre-existing | Root `bun run check` fails with large TypeScript error set, concentrated in `packages/ai/sdk/test/*` plus strict type failures in ontology runtime test under root config. | `outputs/p7-verification/logs/required-08.log` |
| R2 | Medium | Open | Pre-existing | Root `bun run lint` fails at `@beep/identity#lint` due formatter-required change in `packages/common/identity/src/packages.ts`. | `outputs/p7-verification/logs/required-09.log` |
| R3 | Medium | Open | Pre-existing | Root `bun run docgen` fails at `@beep/utils#docgen` due missing `@since` tag on `packages/common/utils/src/Struct.ts` (`export * from "effect/Struct"`). | `outputs/p7-verification/logs/required-11.log` |

## Non-blocking observations
- S01-S05 scenario command failures were invocation/config mismatches with repo tstyche file matching rules; resolved by targeted config path.
- S08 was a new assertion mismatch in a custom verifier file; resolved in S09.
- Memory proxy checks are healthy (`status: ok`, `rejected: 0`) with evidence in `outputs/p7-verification/logs/memory-proxy-health.log`.

## Closure criteria
1. R1 closes when root `bun run check` passes.
2. R2 closes when root `bun run lint` passes.
3. R3 closes when root `bun run docgen` passes.
4. After 1-3, rerun the full required suite and regenerate this report set.
