# Batch 1: Timing Baseline

## Measured Facts

- Local host had 8 CPUs and about 62 GiB RAM during the read-only timing pass.
- Turbo version was `2.9.16`; Bun was `1.3.14`.
- Turbo launcher overhead was not material: local binary median was about 61ms;
  `bunx turbo --version` median was about 70ms.
- `turbo run lint check test type-test build test:integration coverage docgen
  --affected --dry-run=json` expanded to 696 task entries because the branch was
  globally affected.
- Recent successful PR Check runs showed wall times ranging roughly 494s to
  946s, with Lint and Test Unit often the slowest jobs.
- CI setup restored about 7055MB of Bun cache in sampled logs. Setup commonly
  consumed 140s to 270s in critical jobs.
- Release and Storybook jobs also paid shared setup action cost.

## Source-Backed Observations

- Setup/cache/install time is a cross-lane hotspot because every PR matrix job
  pays it.
- Lint/Test Unit verification time varies significantly across recent PR runs,
  so future claims need comparable run ids and cache state.
- Turbo launcher replacement is low priority because measured startup
  difference is around 9ms.

## Duplicate Or Stale Findings Avoided

- Did not rank Turbo launcher cleanup as a high-impact speedup.
- Did not treat the current all-affected branch as a typical small PR baseline.
- Did not rerun full slow local quality lanes.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Add CI setup substep timing and tune cache policy only after CI evidence. | High if setup dominates. | Medium | Three comparable before/after run ids per changed lane. |
| 2 | Explain Lint/Test Unit variance from Turbo summaries and CI logs. | High when those jobs are critical path. | Medium | Affected dry-runs, CI summaries, job logs. |
| 3 | Keep Turbo launcher as low-rank cleanup. | Low | Low | Five fast samples and no lockfile mutation. |

## Do Not Do

- Do not change cache policy without checking release, Storybook, and data-sync.
- Do not claim CI speedups from a single noisy runner sample.

## Open Questions

- Is restoring a 7GB Bun cache faster than exact-key restore or cold install on
  GitHub-hosted runners?
- Why does Lint verification sometimes jump from sub-minute to over 10 minutes?
