# CI Proof

Status: `pre-follow-up-baseline-through-32a95c2665`

Use this file for PR, push, release, data-sync, Storybook, Vercel/external, and
other workflow evidence affected by quality-throughput changes.

## Workflow Runs

| Workflow | Run id | Event | Branch | Commit | Conclusion | Wall clock | Setup/cache time | Verification time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Check | `27062740621` | `pull_request` | `ontology_builder_refinement` | `32a95c2665dd66041bf0348e19dd4f5e4bda26db` | success | 8m47s | Setup ranged from skipped on Docgen to about 3m36s on Test Unit. | Slowest verification lane was Test Unit; Check, Lint, Test Integration, and Repo Sanity all passed. | Live check before the follow-up docs commit showed no failing jobs. |

## Review Threads

Thread-aware review inspection before this follow-up commit found no unresolved
actionable review threads. The only inline Codex thread was on deleted
`scripts/lint-fix-fast.ts`; it is resolved and outdated. CodeRabbit completed as
a passing status context but skipped review content because the PR exceeds its
file-count limit.

## Sampling Requirement

- Workflow/action behavior changes need three comparable before run ids and
  three comparable after run ids for each changed critical lane.
- Measurement-only instrumentation may be recorded with fewer runs, but the
  confidence must stay low until comparable before/after evidence exists.

## Required Checks

| Check name | Workflow/job | Before state | After state | Required by ruleset | Notes |
| --- | --- | --- | --- | --- | --- |
| Check | Check / Check | present | pass | unknown | `gh pr checks 214` reported pass, 7m37s. |
| Lint | Check / Lint | present | pass | unknown | `gh pr checks 214` reported pass, 6m49s. |
| Test Unit | Check / Test Unit | present | pass | unknown | `gh pr checks 214` reported pass, 8m43s. |
| Test Integration | Check / Test Integration | present | pass | unknown | `gh pr checks 214` reported pass, 4m28s. |
| Repo Sanity | Check / Repo Sanity | present | pass | unknown | `gh pr checks 214` reported pass, 4m43s. |
| Docgen | Check / Docgen | present | pass | unknown | `gh pr checks 214` reported pass, 16s; lane skipped work by workflow planning. |
| Nix Shell | Check / Nix Shell | present | pass | unknown | `gh pr checks 214` reported pass, 3m14s. |
| SAST | Check / SAST | present | pass | unknown | `gh pr checks 214` reported pass, 1m30s. |
| Secret Scanning | Check / Secret Scanning | present | pass | unknown | `gh pr checks 214` reported pass, 42s. |
| Security | Check / Security | present | pass | unknown | `gh pr checks 214` reported pass, 53s. |
| PR Size Label | Check / PR Size Label | present | pass | unknown | `gh pr checks 214` reported pass, 1m9s. |
| Build | Check / Build | present | skipped | unknown | Workflow skipped intentionally. |
| CodeRabbit | external status | present | pass | unknown | Review content skipped due PR size; no actionable finding. |
| Vercel Preview Comments | external check | present | pass | unknown | Vercel check passed. |
| Vercel - oip-web | external status | present | pass | unknown | Deployment completed. |
| Vercel - oip-web-staging | external status | present | pass | unknown | Deployment completed. |
