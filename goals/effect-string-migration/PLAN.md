# effect/String migration Plan

## Status

Status: `in-progress`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Inspect source hierarchy and confirm scope. | Required facts and blockers are recorded. |
| P1 Implement | in-progress | Migrate the census sites wave by wave, then arm the rule. | Acceptance criteria are met. |
| P2 Verify | pending | Run required checks and capture evidence. | Verification is green or blockers are documented. |
| P3 Yeet: PR to mergeable | pending | Publish through yeet and drive the PR to mergeable: required checks green, review comments answered and resolved. | `mergeStateStatus` is `CLEAN`; zero unresolved review threads. |
| P4 Close | pending | Write the closeout reflection and flip packet state. | Packet status and evidence are updated; a closeout reflection exists. |

## Waves

Each wave is one PR that migrates whole packages and changes no pin. The last
wave moves `@effect/tsgo` to 0.55+ and arms `preferEffectString` at `error`.

| Wave | Packages | Sites | State |
| --- | --- | ---: | --- |
| 1 | libpff, box-provisioning, qa-capture, ontology-use-cases, brand, agents-domain, freshbooks, repo-docgen, ontology-server, tika, nlp, hubspot, workspace-domain | 193 | in review |
| 2+ | remaining 62 packages and the root (1,220 sites), repo-cli last | 1,220 | pending |

Wave proof, per package: the package's tests, `package-verify --quick`, and a
temporary local `@effect/tsgo` 0.55.0 install with `preferEffectString` armed,
running `bun run beep quality effect-diagnostics --filter <pkg>`; the package's
own files must report zero `preferEffectString` and zero other findings. The
temporary install is reverted before commit. Coverage is compared per changed
source file against main's version on the same machine (lcov uncovered counts).

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
test "$(wc -m < goals/effect-string-migration/GOAL.md)" -le 4000
jq . goals/effect-string-migration/ops/manifest.json
rg -n "effect-string-migration|GOAL.md|agentLaunchers|packetAnchorDocument" goals/effect-string-migration
git diff --check -- goals/effect-string-migration
```
