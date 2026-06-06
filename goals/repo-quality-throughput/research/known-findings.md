# Known Findings

These facts seed the new research. Agents should cite or verify them when they
matter, but should not spend a research lane rediscovering only these points.

## Prior `lint:fix` Regression

- Root `lint:fix` flows through `beep-cli lint --fix`, so the real command path
  is repo-cli behavior plus Turbo/package wiring, not only a root script.
- Turbo cache could not fix the original regression because `lint:fix` was
  explicitly non-cacheable.
- Biome fixing needs `biome check --write --files-ignore-unknown=true` for lint
  and organize-import fixes. `biome format --write` alone is not a trustworthy
  `lint:fix` fast path.
- The changed-file fast path and repo-cli root path must stay aligned. A fast
  script that bypasses repo-cli is not a durable solution.
- Useful proof for the `lint:fix` lane includes a clean-tree run, a small
  changed-file run, repo-cli tests, export catalog verification when exports
  change, and the broader affected lint lane.

## Prior Acceleration Packet

The superseded packet at
[`goals/repo-quality-acceleration`](../../repo-quality-acceleration) already
found these candidate areas:

- GitHub Actions setup/cache behavior can dominate PR wall clock.
- Turbo credential/env hashing and pass-through handling can affect cache reuse.
- Docgen needs better timing and summary visibility.
- Lint policy sidecars may need grouping or bounded concurrency.
- Unit and type-test invocations may have redundant setup/graph cost.
- PR docgen aggregation needs explicit affected/full fallback semantics.
- A quality safety map is required before relaxing or tiering checks.
- Changed-surface JSDoc/doc warning enforcement should start in shadow mode.

Current-source follow-up is required before ranking these as new work:

- Turbo credential handling may already be pass-through-only in current
  `turbo.json`; if so, keep it as a regression guard rather than a fresh task.
- Bounded lint policy grouping may already exist in repo-cli; if so, tune or
  prove it instead of rediscovering it.
- Quality proof surface mapping may already exist through `GithubCheckMode` and
  repo proof surfaces; remaining work should focus on coverage, parity gaps,
  and branch-protection naming.

The older packet was intentionally research-first and said no behavior changes
belonged in Phase 0. This packet supersedes that stance: research remains
required, but implementation and proof are part of completion.

## Current Assumptions To Re-Verify

- Yeet should become the primary fast-plus-monitor developer path only after
  this packet proves it with local and CI evidence.
- Root defaults should remain canonical, but package-local configs may reduce
  blast radius for measured hotspots.
- Package-level docgen fingerprinting is a plausible first selectivity step.
  Symbol/example-level selectivity remains prototype-only until it proves
  sound against full docgen.
- Performance success is measured with a before/after matrix, not a single
  magic threshold.
- Coverage, build, integration tests, repo-sanity, security/Nix/SAST, hooks,
  non-Check workflows, and Turbo launcher overhead are first-class lanes for
  this packet unless the synthesis explicitly excludes one with evidence.
