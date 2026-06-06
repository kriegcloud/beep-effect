# Batch 1: Docgen Cost Model

## Measured Facts

- Current docgen universe: 87 packages, 82 configured/generated, 5 not
  configured.
- Full docgen dry-run had 87 task nodes, 82 real commands, 81 local hits, 6
  misses, and about 984s reported saved from local cache.
- Current `--affected` docgen expands to all packages because root/global
  inputs changed.
- Local planner equivalent counted 793 changed files, 42 package targets, and 9
  full-proof reasons.

## Source-Backed Observations

- Root `docgen` runs Turbo package docgen with concurrency 3, then unscoped
  aggregation.
- `docgen:local` already models package inputs, full-proof inputs, selected
  packages, Turbo expansion, cache status, and selected aggregation.
- Package docgen parses modules, checks modules, extracts/writes examples, runs
  `tsc --noEmit` for examples, and writes markdown.
- Example execution defaults off, but example typechecking is still performed
  for packages with examples.

## Duplicate Or Stale Findings Avoided

- Did not reuse older 60-package figures; current package count is 87.
- Did not promote symbol/example selectivity without a shadow soundness model.
- Did not run full write-mode docgen.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Add read-only docgen cost/plan report. | Medium direct, high diagnostic | Low | `beep docgen status`, dry-run, local plan. |
| 2 | Add package-level docgen fingerprint reuse in shadow before gated reuse. | High | Medium | Shadow compare against full docgen. |
| 3 | Scope aggregation after affected/scoped docgen. | Medium-high | Medium | Selected aggregate target proof plus full fallback. |

## Do Not Do

- Do not merge symbol/example selectivity until shadow mode proves sound.
- Do not remove full push/main/manual docgen fallback.

## Open Questions

- Is CI docgen dominated by generation, example `tsc`, aggregation, setup, or
  Turbo launcher/setup?
- Should `dtslint/**` remain a docgen Turbo output?
