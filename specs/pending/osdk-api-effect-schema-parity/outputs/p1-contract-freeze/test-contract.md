# P1 Test Contract

## Decision status

- Frozen on 2026-02-26.
- Scope: verification matrix for type parity, runtime schema behavior, and API/export compatibility.

## Test lanes

| Lane | Objective | Primary tools | First enforcement phase |
|---|---|---|---|
| Compile integrity | Ensure ontology package compiles as phase scope expands | `tsc` via package `check` | P2 |
| Type parity | Prove heavy generic behavior remains equivalent to upstream intent | `tstyche` | P2 |
| Runtime schema behavior | Validate decode/encode/tagged-union behavior for data-bearing schemas | `vitest` | P2 |
| Export parity | Verify stable and unstable exports match contract and aliases | scripted export diff + `tsc` fixtures | P6 |
| Compatibility aliases | Verify `Ontology*` aliases remain source-compatible | `tstyche` + targeted runtime smoke tests | P6 |
| Final readiness | Run repository-wide quality gates | `check`, `lint`, `test`, `docgen` | P7 |

## Required test artifacts

1. `packages/common/ontology/test/types/*.test-d.ts` (or equivalent tstyche files) for generic parity fixtures.
2. `packages/common/ontology/test/runtime/*.test.ts` for runtime schema decode/encode behavior.
3. `outputs/p6-public-surface/export-parity-matrix.md` with stable and unstable evidence.
4. `outputs/p7-verification/command-evidence.md` with command log summary and outcomes.

## Required command matrix

1. Phase startup discovery commands:
   - `bun run beep docs laws`
   - `bun run beep docs skills`
   - `bun run beep docs policies`
2. P2-P6 minimum verification:
   - `bun run --cwd packages/common/ontology check`
   - `bun run --cwd packages/common/ontology test`
   - `bun run test:types`
3. P7 release gate verification:
   - `bun run check`
   - `bun run lint`
   - `bun run test`
   - `bun run docgen`
4. If prompt/handoff/agent-instruction text changes in a phase:
   - `bun run agents:pathless:check`

## Failure policy

1. No phase closes with failing compile, lint, test, or docgen checks.
2. Skipped parity tests require explicit justification in the phase output report.
3. Export parity mismatches are blocking until either corrected or documented as intentional compatibility shims with evidence.

## Acceptance criteria

- Type and runtime verification requirements are explicit for every phase gate.
- Export and alias compatibility have enforceable checks before final verification.
- The test matrix is complete and can be executed without architecture-level decisions.
