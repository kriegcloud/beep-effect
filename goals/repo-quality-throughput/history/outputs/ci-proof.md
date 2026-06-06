# CI Proof

Status: `green-through-a7be8dc1`

Use this file for PR, push, release, data-sync, Storybook, Vercel/external, and
other workflow evidence affected by quality-throughput changes.

## Workflow Runs

| Workflow | Run id | Event | Branch | Commit | Conclusion | Wall clock | Setup/cache time | Verification time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Check | `27064446802` | `pull_request` | `ontology_builder_refinement` | `a7be8dc1e1119d095be0239b39cd812e5650ebec` | success | 8m13s workflow span; slowest job `Check` at 8m09s | Docgen skipped setup; verification jobs spent about 2m17s-2m53s in `Setup monorepo CI`. | `Check` 8m09s, `Lint` 6m15s, `Test Unit` 6m25s, `Test Integration` 5m19s, `Repo Sanity` 5m02s, `Docgen` 17s, `Nix Shell` 3m47s, `SAST` 1m27s, `Secret Scanning` 45s, `Security` 56s, `PR Size Label` 1m11s. | Live check before the packet-only follow-up push showed no failing jobs and the PR remained mergeable. |

## Review Threads

Thread-aware review inspection before this packet-only follow-up commit found
no unresolved actionable review threads. The only inline Codex thread was on
deleted `scripts/lint-fix-fast.ts`; it is resolved and outdated. CodeRabbit
completed as a passing status context but skipped review content because the PR
exceeds its file-count limit.

`gh pr view 214` reported `mergeable=MERGEABLE` for head
`a7be8dc1e1119d095be0239b39cd812e5650ebec`.

## Sampling Requirement

- Workflow/action behavior changes need three comparable before run ids and
  three comparable after run ids for each changed critical lane.
- Measurement-only instrumentation may be recorded with fewer runs, but the
  confidence must stay low until comparable before/after evidence exists.

## Required Checks

| Check name | Workflow/job | Before state | After state | Required by ruleset | Notes |
| --- | --- | --- | --- | --- | --- |
| Check | Check / Check | present | pass | no required checks reported | `gh pr checks 214` reported pass, 8m09s. |
| Lint | Check / Lint | present | pass | no required checks reported | `gh pr checks 214` reported pass, 6m15s. |
| Test Unit | Check / Test Unit | present | pass | no required checks reported | `gh pr checks 214` reported pass, 6m25s. |
| Test Integration | Check / Test Integration | present | pass | no required checks reported | `gh pr checks 214` reported pass, 5m19s. |
| Repo Sanity | Check / Repo Sanity | present | pass | no required checks reported | `gh pr checks 214` reported pass, 5m02s. |
| Docgen | Check / Docgen | present | pass | no required checks reported | `gh pr checks 214` reported pass, 17s; lane skipped work by workflow planning. |
| Nix Shell | Check / Nix Shell | present | pass | no required checks reported | `gh pr checks 214` reported pass, 3m47s. |
| SAST | Check / SAST | present | pass | no required checks reported | `gh pr checks 214` reported pass, 1m27s. |
| Secret Scanning | Check / Secret Scanning | present | pass | no required checks reported | `gh pr checks 214` reported pass, 45s. |
| Security | Check / Security | present | pass | no required checks reported | `gh pr checks 214` reported pass, 56s. |
| PR Size Label | Check / PR Size Label | present | pass | no required checks reported | `gh pr checks 214` reported pass, 1m11s. |
| Build | Check / Build | present | skipped | no required checks reported | Workflow skipped intentionally. |
| CodeRabbit | external status | present | pass | no required checks reported | Review content skipped due PR size; no actionable finding. |
| Vercel Preview Comments | external check | present | pass | no required checks reported | Vercel check passed. |
| Vercel - oip-web | external status | present | pass | no required checks reported | Deployment completed. |
| Vercel - oip-web-staging | external status | present | pass | no required checks reported | Deployment completed. |
