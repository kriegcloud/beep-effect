# Fallow Zero Dead-Code Plan

## Status

Status: `active`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Triage | done | Verify all 61 findings and lock remediation policy. | `research/triage.md` records per-finding verdicts (20 TP / 41 FP) and locked policies. |
| P1 Remediate | pending | Fix true positives (fzd-002) and eliminate false positives config-only (fzd-003). | `bun run fallow:dead-code:json` reports `total_issues: 0`. |
| P2 Rebaseline | pending | Rewrite the regression baseline at zero and refresh audit expectations (fzd-004). | Baseline reads zero; audit-baseline validator passes with new counts. |
| P3 Promote | pending | Promote dead-code + audit to blocking pre-push; close fqe-005/fqe-006 (fzd-005). | `--expect-promoted-fallow-lanes` contract passes; 3 clean runs recorded; old packet validator passes. |
| P4 Close | pending | Mergeable PR via normal yeet path (fzd-006). | `yeet monitor` green; 0 required review findings in `history/review-rounds.jsonc`. |

## Execution Notes

- Task order is strict: fzd-002 -> fzd-003 -> fzd-004 -> fzd-005 -> fzd-006
  (each depends on the previous decision gate).
- Rooting apps in `.fallowrc.jsonc` may surface new genuine findings; they
  join the wire-or-delete loop in fzd-003, never an exception list.
- The 5 `@mui/*` removals interact with `declare module` theme augmentations
  under `packages/foundation/ui-system/ui/src/themes/`; typecheck decides
  whether augmentations are deleted with the packages or the packages move to
  devDependencies (then they must NOT be added to ignoreDependencies).
- `three` is absent from the root catalog; add it there before referencing
  `catalog:` in `packages/foundation/ui-system/ui/package.json`.
- `effect` joins `packages/foundation/ui-system/ui` dependencies and `infra`
  devDependencies via `catalog:`; check `apps/professional-desktop` too.
- When updating `validate-fallow-audit-baseline.ts`, derive the new expected
  counts from a fresh `bun run fallow:audit -- --base origin/main --gate
  new-only` run, not by hand.
- Promotion wiring lives in `packages/tooling/tool/cli`; extend
  `test/quality-tasks.test.ts` and run with `npx vitest run`.
- Preserve unrelated worktree changes; archive run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/fallow-zero-dead-code/GOAL.md)" -le 4000
bun goals/fallow-zero-dead-code/ops/validate-packet.ts
bun run fallow:dead-code:json
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
git diff --check -- goals/fallow-zero-dead-code
```
