# Before/After Matrix

Status: `in-progress`

Fill this during implementation and proof. Every completed speedup task should
link to at least one row.

| Lane | Baseline command/evidence | After command/evidence | Delta | Cache state | Run count | Resource notes | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lint:fix` clean tree | `bash -lc 'time -p bun run lint:fix'` on `ontology_builder_refinement` at local dirty-free state before packet edits: `[beep-cli] lint:fix: no changed files`, `real 0.04` | Guard after implementation must use the same command shape. | Baseline is already fast; any regression above single-digit seconds blocks closure. | Warm local, no Turbo fan-out | 1 current sample; final proof needs 5 warm samples | No heavy quality lane running | Medium |
| `lint:fix` small changed-file set | Dirty packet + Yeet source files after implementation. | `bun run lint:fix`: changed-file Biome path, repeatedly checked 8 processable files, applied no fixes, and stayed between 5.58s and 8.68s on latest shell samples. | Fast path preserved; no Turbo fan-out. | Warm local, changed-file mode | Multiple current samples | Graphiti proxy only; no docgen/Turbo quality lane running before launch. | Medium |
| Yeet repair | Before implementation, repair already used prepare + affected feedback. | `bun run beep yeet repair --plan --json`: steps `prepare:lint:fix`, `prepare:docgen`, `prepare:repo-exports:catalog`, `feedback:build`, `feedback:check`, `feedback:lint`, `feedback:test`; `taskCount=348`, `packageCount=87`, `real 4.37`. | Guardrail preserved. | Warm local, plan-only | 1 after sample | Plan hydration still fetches/queries Turbo affected for repair. | High |
| Yeet verify/publish local portion | Before implementation, Batch 1/2 found verify/publish planned affected `build/check/lint/test` before full `pre-push`; current branch affected feedback had 348 tasks. | `bun run beep yeet verify --plan --json`: steps `full:pre-push`, `taskCount=0`, `packageCount=87`, `real 3.55`; `bun run beep yeet publish --message "fix(repo-cli): internalize quality helpers" --plan --json`: steps `commit:git:commit`, `full:pre-push`, `publish:git:push`, `taskCount=0`, `packageCount=87`, `real 3.82`. | Removes 4 affected feedback steps and 348 affected feedback tasks from verify/publish plan. | Warm local, plan-only | 1 after sample per mode | Full execution proof still pending; this is plan/step evidence only. | High for planning behavior, medium for end-to-end runtime until full proof |
| Repo sanity | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Build | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Docgen local | `docgen:local` plans from `origin/main...HEAD` plus dirty files, but branch-level global/docgen input changes force the full proof path. | `nice -n 10 bun run beep docgen run -p @beep/repo-cli` after a tag-only JSDoc edit generated and aggregated only `packages/tooling/tool/cli`; no tracked docs changed. | Scoped package path works for narrow repair; `docgen:local` remains conservative when global/docgen inputs changed earlier in the branch. | Warm local | 1 scoped repair sample | Full `audit:github quality` already ran full docgen; scoped repair was used only for the post-quality JSDoc warning fix. | Medium |
| Integration tests | Full quality integration lane runs `turbo run test:integration --concurrency=1`. | `audit:github quality` integration phase reported 99 successful tasks, 54 cached, 57.513s; many force-executed packages launched Vitest only to report no integration tests. | No speed change yet; clear opportunity to skip non-participating packages or make no-test probes cacheable. | Warm local, mixed cache | 1 full quality sample | Serial lane limits resource pressure but magnifies no-op package startup cost. | Medium |
| Coverage | Batch 2 dry-run: coverage is absent from PR Check and `audit:github quality`; root coverage is non-cacheable/report-only and pulls build dependencies. | Classified as `full-only` or `scheduled/report-only`; no common green-lane implementation yet. | Prevents adding slow report-only work to the fast gate. | N/A | Source/dry-run review | Do not run coverage in parallel with integration or full quality. | Medium |
| Security/Nix/SAST | Batch 2 found local pre-push includes quality, secrets, OSV, changed-file SAST, and Nix; CI splits those into named checks. | No speed change yet; proof parity and check-name preservation recorded as gating constraints. | N/A | N/A | Source/CI log review | Docker/Nix paths are resource-sensitive; do not relax without fallback proof. | Medium |
| Repo-export catalog | Batch 2 read-only probe: `repo-exports:catalog:check` red, `real 100.70`, `user 130.06`; root JSONC catalog 377,073 lines and Markdown 15,637 lines. | `bun run repo-exports:catalog` refreshed the root generated catalogs; `bun run repo-exports:catalog:check` passed and reported 92 packages, 1078 import specifiers, 15094 public export entries. Selected design: package-local generated catalog shards plus deterministic root aggregate, like docgen package `./docs` artifacts. | Current generated gate unblocked; structural speedup still pending implementation. | Warm local | 1 refresh and 1 check sample | Refresh took roughly 90s; check took roughly 117s; do not run in parallel with docgen or ts-morph-heavy lanes. | Medium |
| Lefthook | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| PR GitHub Actions wall clock | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Release/data-sync side workflows | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Slowest CI lane | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Canonical full proof | Before this implementation, Batch 1/2 found duplicate Yeet affected feedback before full pre-push and root-wide generated gates. | `bun run audit:github quality` exited 0 after build/check/lint/docgen/repo-exports/test/integration/repo-sanity/changeset status. Post-run JSDoc warnings were fixed and rechecked with targeted ESLint plus scoped repo-cli docgen. | Local quality proof passes; remaining speed work is structural, not a correctness blocker for rqt-001. | Warm local | 1 full local proof | Visible bottlenecks: full docgen, repo-export catalog check, cached test replay volume, serial integration no-op probes. | Medium |
| Check names and rulesets | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Local/CI proof parity | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Notes

- Record branch and commit for every row.
- Prefer comparable command shapes. Explain any changed shape.
- Do not compare cold baselines against warm after-runs without marking
  confidence low.
- P6 may not close while any non-deferred row required by a completed task
  still contains `TBD`.
