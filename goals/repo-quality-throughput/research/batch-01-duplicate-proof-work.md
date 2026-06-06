# Batch 1: Duplicate Proof Work

## Measured Facts

- Branch was one commit ahead of origin during the read-only pass.
- `turbo query ls` found 87 packages.
- Affected query for build/check/lint/test against `origin/main...HEAD`
  produced 348 tasks, all from global dependency changes.
- Dry-run for build/check/lint/test showed 348 tasks, 243 cache hits, and 105
  misses.
- Affected docgen dry-run showed 87 tasks, 81 cache hits, and 6 misses.

## Source-Backed Observations

- Yeet feedback plans `build`, `check`, `lint`, and `test`, then verify/publish
  run full `pre-push` proof afterward.
- Full local pre-push includes quality, secrets, security, SAST, and Nix.
- Hooks are scoped fast guards, not duplicates of full proof.
- Coverage exists locally but is not part of PR Check or local pre-push proof.

## Duplicate Or Stale Findings Avoided

- Did not classify hooks as removable duplicates; they are fast local guards.
- Did not propose dropping secrets/security/SAST/Nix.
- Did not treat all-package affected output as a Turbo defect; root/global
  inputs explain it.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Collapse Yeet feedback when full `pre-push` immediately subsumes it. | High | Medium | Yeet plan JSON, repo-cli tests, full pre-push proof. |
| 2 | Combine or reduce redundant unit/type Turbo setup if safe. | Medium | Medium | Dry-run task set compare and unit/type lane proof. |
| 3 | Add setup/cache timing and A/B restore policy. | High potential | Medium | Comparable CI runs. |

## Do Not Do

- Do not remove full pre-push or PR checks.
- Do not make Yeet canonical until proof-mode gates pass.
- Do not add coverage to fast paths until classified.

## Open Questions

- Should Yeet skip affected feedback only when full pre-push is guaranteed next,
  or become an explicit fast-plus-monitor mode?
- Is PR build push-only by design?
