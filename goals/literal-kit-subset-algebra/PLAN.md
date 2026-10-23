# LiteralKit subset algebra and match family Plan

## Status

Status: `complete`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | done | Panel review, `/adhd`, `/grill-with-docs` rulings. | Rulings in `research/2026-10-22-grill-rulings.md`. |
| P1 Implement | done | Kit surface, builders, errors, codemod rule and migration, doctrine rows, typeperf fixtures. | Dependents type-check green. |
| P2 Verify | done | Run required checks and capture evidence. | Verification is green or blockers are documented. |
| P3 Yeet: PR to mergeable | done (#2080 merged `7055b05c88`) | Publish through yeet and drive the PR to mergeable: required checks green, review comments answered and resolved. | `mergeStateStatus` is `CLEAN`; zero unresolved review threads. |
| P4 Close | done (reflection; proposedCloseout) | Write the closeout reflection and flip packet state. | Packet status and evidence are updated; a closeout reflection exists. |

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses and a typed `proposedCloseout` with status `completed-retained`
   and finalPullRequest. Keep `initiative.status` operative until completion
   evidence verifies; do not close the external execution/session ledger from a proposal.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/literal-kit-subset-algebra/GOAL.md)" -le 4000
jq . goals/literal-kit-subset-algebra/ops/manifest.json
rg -n "literal-kit-subset-algebra|GOAL.md|agentLaunchers|packetAnchorDocument" goals/literal-kit-subset-algebra
git diff --check -- goals/literal-kit-subset-algebra
```
