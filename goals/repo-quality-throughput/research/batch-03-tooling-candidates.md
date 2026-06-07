# Batch 3: Tooling Candidates

## Findings

- No repo-wide drop-in tool swap is credible yet. The repo already uses Bun,
  Turbo, Vitest, Vite/Rolldown surfaces, and `@effect/tsgo`; the next wins are
  isolated proofs around those tools, not wholesale replacement.
- The strongest tooling candidate is CI setup/install/cache work around Bun.
  Batch 2 measured `setup-monorepo-ci` at roughly 153-271s with a roughly 7 GB
  Bun cache, making this a material proofable hotspot.
- Turbo remains the right orchestration layer. The credible Turbo candidate is
  task-level affected/input proofing and package-local config experiments,
  because current root metadata changes can globally affect the graph.
- Vitest and tsgo should be optimized through scoping, timing, and ownership
  filtering. Replacing either runner/compiler weakens proof unless an isolated
  benchmark shows parity.
- OXC is credible only as a shadow parser/scanner for metadata-heavy lanes such
  as repo-exports/docgen. It should not replace `ts-morph` or TypeScript APIs
  until shadow output matches authoritative output.
- Rollup/Rolldown work is credible only for the small Vite app surface or a
  package build post-pass prototype. Rspack is not credible in this repo right
  now because the repo does not have a webpack migration surface.
- Bun's test runner and workspace filters are useful comparison tools, but not
  drop-in replacements for the current Vitest/Turbo proof lanes.

## Evidence

- `package.json` pins the active tool surface around `bun@1.3.14`,
  `turbo@^2.9.16`, `vitest@^4.1.8`, `vite@^8.0.16`,
  `@effect/tsgo@0.14.0`, and
  `@typescript/native-preview@^7.0.0-dev.20260605.1`.
- Root scripts route `build`, `check`, `test`, `lint`, and `audit` through
  repo-cli orchestration. `coverage` is a direct Turbo lane and remains
  non-cacheable/report-only.
- Batch 1/2 evidence shows 87 packages, one root `turbo.json`, no package-local
  Turbo configs, docgen around 87 task nodes/82 configs, repo-export catalog
  check around 100-117s, CI setup around 153-271s, and global affected behavior
  from root metadata/lockfile/tsconfig changes.
- `turbo.json` has cache-disabled `lint:fix`, `test:integration`, and
  `coverage`; `build` and `docgen` are concurrency-limited; global dependencies
  include root metadata and shared configs.
- Repo source has about 85 package/app `beep:check` scripts using tsgo, about
  85 `beep:test` scripts using Vitest, about 72 package builds running
  `tsc -b` followed by a Babel post-pass, 89 Vitest configs, 3 Vite configs,
  2 Next configs, and no Rspack config.
- `vitest.shared.ts` already has Bun-specific Istanbul coverage behavior and an
  OXC target setting, so Vitest/OXC work should start from config measurement,
  not replacement.
- `RepoExportsCatalog.ts` and docgen parser code use `ts-morph`; this supports
  OXC only as a shadow scanner unless type-aware output parity is proven.
- Official docs checked: Turbo run/package configuration docs, TypeScript
  native preview docs, Effect-TS tsgo source, Vite Rolldown docs, OXC parser
  docs, Vitest projects/config docs, Bun test/filter docs, Rspack migration
  docs, and Rollup JavaScript API docs.
- No files were edited and no heavy quality commands were run.

## Recommended Tasks

| Rank | Task | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- |
| 1 | Add CI setup/Bun cache A/B timing proof for `setup-monorepo-ci`. | High; targets the measured 153-271s setup hotspot and 7 GB Bun cache restore/save surface. | Low-medium; CI-only workflow behavior. | Three comparable before/after GitHub run IDs with setup substep timings, cache hit/miss data, and no lane proof weakening. | Revert setup action/cache key changes. |
| 2 | Prototype Turbo task-input affected filtering on one narrow lane. | High when root metadata changes currently fan out broadly. | Medium; affected graph semantics are proof-critical. | Compare current `turbo run <lane> --affected --dry-run=json` with task-input/package-config prototype; require fallback full lane and identical required task coverage. | Remove package-local Turbo config/future flag/input changes. |
| 3 | Filter root `type-test` and `test:integration` orchestration to real script owners. | Medium-high; Batch 2 found many graph nodes without real scripts or with build-only participation. | Low-medium; runner selection could skip a real owner if detection is wrong. | Before/after dry-run task counts plus targeted `test --types` and `test --integration` proof on the same affected range. | Restore current broad Turbo task invocation. |
| 4 | Add timing and plan output around tsgo sidecars, then shard only proven hotspots. | Medium; tsgo is already canonical, but sidecar scans/checks are opaque. | Medium; diagnostics parity is repo-law sensitive. | Repo-cli tests plus sampled timings for `dtslint-tsgo`, `test-tsgo`, and smoke checks; compare diagnostics before/after. | Keep current sequential sidecar execution path as fallback. |
| 5 | Build an OXC shadow scanner for repo-exports/docgen metadata extraction. | Medium-high if parser/JSDoc scanning is a major share of catalog/docgen cost. | Medium-high; `ts-morph` is type-aware and authoritative today. | Shadow output diff across representative packages; zero accepted behavior change until catalog/docgen output matches. | Delete shadow adapter and keep `ts-morph` path. |
| 6 | Instrument package build post-pass cost, then prototype replacing Babel pure-annotation pass for one package. | Medium if 72 package builds spend material time in Babel. | High; emitted JS, sourcemaps, and pure annotations are user-facing artifacts. | Per-package timing split; one-package byte/API/sourcemap diff; targeted build/test proof. | Revert the package build script/transform driver. |
| 7 | Run Vite/Rolldown app build microbenchmarks for the 3 Vite apps. | Low-medium; isolated app surface. | Low if benchmark-only. | Before/after app build timings and bundle diff for `canvas`, `professional-desktop`, and `stack-installer`. | Remove override/config experiment. |
| 8 | Use Bun workspace filters only as a measurement helper for package-local scripts. | Low-medium; helps quick local comparisons but does not replace Turbo graph proof. | Low if read-only/benchmark-only. | Compare Bun-filtered script timing with equivalent Turbo package filter; no CI adoption without parity. | Keep Turbo as the canonical orchestrator. |

## Rejected Ideas

- Rspack repo-wide migration; there is no webpack migration surface.
- Rollup as a direct replacement for root build.
- Bun test replacing Vitest.
- OXC/Oxlint replacing Biome, ESLint, or policy sidecars wholesale.
- Blind `@typescript/native-preview` or `@effect/tsgo` upgrades.
- Turbo launcher swaps; Batch 1 timing found only millisecond-scale overhead.
- Caching `lint:fix`.
- Adding coverage to common End-to-End Green.

## Open Questions

- Does `futureFlags.affectedUsingTaskInputs` behave safely with the repo's
  current Turbo version and root metadata churn?
- Which build phase is actually expensive: `tsc -b`, Babel pure-annotation
  post-pass, sourcemaps, or package fanout?
- For repo-exports/docgen, is the hotspot parsing/JSDoc walking, type
  resolution, process startup, or artifact writing?
- Is restoring a broad 7 GB Bun cache faster than exact-key/no-restore-key
  strategies in current GitHub runners?
- Which Vitest pool/isolation settings are best for the repo's mix of unit,
  integration, SQL, and Testcontainers tests?
- Can package-local Turbo configs be generated or checked by existing
  config-sync tooling to prevent drift?
- Are Vite app builds material enough in End-to-End Green to justify more than
  benchmark-only Rolldown work?
