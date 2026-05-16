# Docgen And Selective Checking

## Current-State Findings

- Phase 0 explicitly makes symbol-map-backed selective docgen/example
  typechecking a research track, not an implementation commitment:
  `initiatives/repo-quality-acceleration/SPEC.md:111-125`.
- CI already tiers the docgen lane: pull requests default to affected docgen,
  skip when changed files are irrelevant, and force full docgen when docgen
  tooling changes. Non-PR events run full docgen:
  `.github/workflows/check.yml:115-190`.
- Root `docgen:affected` still runs `docs:aggregate` after affected Turbo
  docgen. In CI, the affected PR path also runs `bun run docs:aggregate`, and
  `docs:aggregate` has no affected selector in the root script:
  `package.json:91-96`.
- The Turbo `docgen` task is cacheable and package-scoped, with
  `dependsOn: ["^docgen"]`, inputs `$TURBO_DEFAULT$` minus `.beep/**`, and
  outputs `docs/**` plus `dtslint/**`: `turbo.json:107-111`.
- Current docgen generation has package-level selectivity only.
  `beep docgen generate/run` can select `--package`/`--filter` and process
  packages concurrently, but each selected package invokes the docgen binary and
  reads/parses/checks/typechecks all discovered package modules/examples:
  `packages/tooling/tool/cli/src/commands/Docgen/index.ts:350-435`.
- The generation and quality universes differ: repo-docgen generation scans
  package source for documentation generation, while `beep docgen quality`
  supports `affected`, `package`, `changed-files`, and `all` quality scopes:
  `packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts:89-108`.
- `beep docgen quality` already has useful raw material for a future
  symbol-impact index: package/file/repo paths, source anchors, stable
  identities, parsed examples, and deterministic finding codes.
- Existing metadata packets are useful inputs, not ready gates.
  `repo-exports.catalog` declares itself descriptive current-state metadata,
  `repo-codegraph-jsdoc` is exploratory/bootstrap-oriented, and
  `jsdoc-worker-eval` is read-only and advisory.

## Evidence

Commands used:

```sh
bun --silent run beep docgen status --json | jq '.summary'
bunx turbo run docgen --affected --summarize --dry-run=json --ui=stream
rg --files -g 'docgen.json' apps packages infra | wc -l
```

Local metadata probe results:

- `beep docgen status --json` reported 60 total docgen packages, all configured
  and generated.
- `turbo run docgen --affected --dry-run=json` selected no package tasks in the
  current main checkout.
- `rg --files -g 'docgen.json' apps packages infra | wc -l` returned 60.

Source paths inspected:

- `packages/tooling/tool/cli/src/commands/Docgen/index.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/Quality.ts`
- `packages/tooling/tool/docgen/src/`
- `initiatives/repo-context-topology/SPEC.md`
- `initiatives/repo-codegraph-jsdoc/SPEC.md`
- `initiatives/jsdoc-worker-eval/SPEC.md`

External primary docs:

- Turborepo `run` reference:
  <https://turborepo.dev/docs/reference/run>
- Turborepo caching docs:
  <https://turborepo.dev/docs/crafting-your-repository/caching>
- Turborepo configuration docs:
  <https://turborepo.dev/docs/reference/configuration>

## Candidate Interventions

| Rank | Intervention | Expected Impact | Risk | Cost | Verification |
|---|---|---:|---|---|---|
| 1 | Scope PR aggregation after affected docgen, or skip root aggregation on PRs and keep full aggregation on push/main. Current affected path still runs unscoped `docs:aggregate`. | High | Medium: root docs completeness and stale root docs risk. | Medium | Compare `turbo run docgen --affected --dry=json` selected packages to aggregate targets; run full `bun run docgen` as fallback proof on main/scheduled. |
| 2 | Add a read-only `docgen plan`/`docgen affected-plan` report that prints selected packages, reasons, cache status, aggregate scope, and fallback command before changing behavior. | Medium | Low | Small | Use Turbo `--dry=json` as primary comparator; assert parity with CI lane-gate decisions. |
| 3 | Narrow or split Turbo docgen task inputs after proof. Current `$TURBO_DEFAULT$` includes files generation may not consume. | Medium | Medium: missed doc-affecting inputs would be correctness debt. | Medium | Before/after `turbo run docgen --dry=json`; fixture PRs that change tests, docs, `docgen.json`, source, package exports, and root config. |
| 4 | Audit `dtslint/**` in docgen outputs. Current docgen code writes docs/examples/tsconfig and markdown, while Turbo caches `dtslint/**` as docgen output. | Low-medium | Low-medium | Small | Static search for docgen writes plus dry-run output diff; one full docgen cache restore check. |
| 5 | Promote a new read-only symbol impact index contract from `DocgenQualitySubject` plus repo export metadata. Include source ranges, content hashes, exported-from path, owner declaration, example IDs, and package dependency edges. | High later | High: stale or incomplete index could miss doc/example breakage. | Large | Golden fixtures for changed line to symbol, re-export to owner, namespace/default export, deleted symbol, moved symbol, and transitive example impact; full package fallback on any stale/missing index. |
| 6 | Add selective example typecheck as advisory first: report impacted examples from changed symbols, but continue package-level example typecheck until precision is proven. | Medium later | High if made blocking too early. | Large | Shadow mode comparing selected examples against full package docgen example typecheck across several PRs. |

## Do Not Do

- Do not treat Turbo `--affected` as symbol-level selectivity.
- Do not use `repo-exports.catalog` as a canonical quality gate without a
  freshness and authority contract; it is descriptive current-state metadata.
- Do not make `jsdoc-worker-eval` blocking or substitute worker judgment for
  deterministic `beep docgen quality`.
- Do not implement changed-line selective example typechecking before defining
  stale-index fallback and transitive impact rules.
- Do not remove full docgen/full aggregate proof from main, scheduled, or
  explicitly named local all-up commands.
- Do not run write-mode docgen/codegen/formatters as part of Phase 0.

## Open Questions

- Is current PR docgen wall-clock dominated by package docgen subprocesses,
  example `tsc`, Turbo setup/cache restore, or the unscoped aggregate step?
- Should PR docgen aggregate only selected package docs, or should root
  aggregation be skipped entirely outside full gates?
- Which artifact owns future symbol selectivity: `DocgenQualitySubject`,
  `repo-exports.catalog`, a codegraph index, or a new purpose-built impact
  index?
- How should changed lines map to leading JSDoc, exported declarations,
  re-export edges, namespace members, generated files, and deleted symbols?
- What dependency radius is required for examples that import a changed symbol
  from another package?
- Does `dtslint/**` still belong in the `docgen` Turbo outputs, or is it
  historical cache shape drift?
