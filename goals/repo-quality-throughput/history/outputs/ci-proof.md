# CI Proof

Status: `template`

Use this file for PR, push, release, data-sync, Storybook, Vercel/external, and
other workflow evidence affected by quality-throughput changes.

## Workflow Runs

| Workflow | Run id | Event | Branch | Commit | Conclusion | Wall clock | Setup/cache time | Verification time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Sampling Requirement

- Workflow/action behavior changes need three comparable before run ids and
  three comparable after run ids for each changed critical lane.
- Measurement-only instrumentation may be recorded with fewer runs, but the
  confidence must stay low until comparable before/after evidence exists.

## Required Checks

| Check name | Workflow/job | Before state | After state | Required by ruleset | Notes |
| --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | TBD |
