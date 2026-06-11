# Promoted Blocking Lane Clean-Run Evidence

Recorded: 2026-06-11, branch `feat/fallow-zero-dead-code`, fallow 2.89.0.

Promotion criteria for the dead-code and audit feature-matrix rows require at
least 3 clean runs (`minimumCleanRuns: 3`). Three consecutive runs of both
promoted blocking lanes were executed back-to-back via the repo-cli wrappers:

| Run | `beep quality fallow dead-code --check` | `beep quality fallow audit --check --base origin/main` |
| --- | --- | --- |
| 1 | exit 0, findingCount 0 | exit 0, introduced 0 |
| 2 | exit 0, findingCount 0 | exit 0, introduced 0 |
| 3 | exit 0, findingCount 0 | exit 0, introduced 0 |

Supporting proofs run in the same session:

- `bun run beep quality fallow envelope-check .beep/fallow/audit.json --require schemaVersion,status,command,exitStatus,baseRef,rawOutputRef` — envelope ok.
- `bun run beep quality github-checks plan-contract-check --mode pre-push --feature-matrix goals/fallow-quality-enforcement/research/feature-matrix.jsonc --expect-promoted-fallow-lanes` — plan contract ok (2 promoted lanes).
- `bun run beep quality fallow ci-contract-check .github/workflows/check.yml --expect-lanes dupes,health,boundaries,flags,security,fix-preview --expect-blocking-lanes audit,dead-code --expect-out-dir .beep/fallow --require-upload --if-no-files-found error --advisory` — CI contract ok.
- `bun goals/fallow-quality-enforcement/ops/validate-fallow-audit-baseline.ts` — zero-introduced contract holds.
- `bun goals/fallow-quality-enforcement/ops/validate-knip-parity-baselines.ts` — parity baselines match (knip 17 containers, fallow 0 issues).
