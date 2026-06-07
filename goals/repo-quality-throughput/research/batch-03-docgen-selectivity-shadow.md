# Batch 3: Docgen Selectivity Shadow

## Findings

- Package-level docgen fingerprinting is the safe selectivity boundary.
  Current `docgen:local` already distinguishes package-local inputs from
  full-proof inputs, carries `fallbackCommand: "bun run docgen"`, and refuses
  scoped execution when root/tooling inputs change.
- Package fingerprint reuse should start as shadow-only metadata, then graduate
  only behind full fallback. A cache hit may skip a package only when the
  fingerprint, prior successful proof record, expected docs output, config
  shape, tool version/source hash, and dependency radius all match.
- The fingerprint should be a separate package proof manifest, not
  `DocgenQualitySubject.contentHash`. Quality subjects hash JSDoc/declaration
  text, but do not cover package docs output, example tsconfig, package config,
  root/global inputs, dependency changes, or generator implementation changes.
- Symbol/example selectivity should remain shadow/prototype. The generator
  reads all package modules, parses/checks package-wide docs, extracts
  examples, writes an examples directory, creates one examples tsconfig, and
  runs one package-level `tsc --noEmit` before writing markdown.
- Aggregation is a safer near-term target than symbol selectivity.
  `docgen:local` already aggregates selected packages one at a time, but CI
  affected PR docgen still runs unscoped `bun run docs:aggregate` after
  affected Turbo docgen.

## Evidence

- `SPEC.md` requires docgen work to reduce unchanged-package, example
  typecheck, or aggregation cost while retaining full fallback; symbol-level
  selectivity is a non-goal without correctness model and shadow proof.
- `tasks/tasks.jsonc` already names `rqt-005` as package-level fingerprint
  reuse before symbol-level selectivity.
- Batch 1 found 87 docgen task nodes, 82 real docgen configs, 81 local hits,
  and 6 misses, with current affected docgen expanding to all packages because
  root/global inputs changed.
- `Docgen/internal/Local.ts` lists package-local input files/prefixes and
  full-proof root/tooling inputs, selects packages from changed files, records
  full-proof reasons, reports selected packages/Turbo command/fallback command,
  and aggregates selected packages.
- `packages/tooling/tool/docgen/src/Core.ts` extracts examples package-wide,
  writes them out, typechecks one examples project, parses modules, checks
  modules, creates markdown, and writes package markdown as one workflow.
- `Docgen/internal/Quality.ts` has subject identities and content hashes useful
  for shadow impact reports but narrower than generation correctness.
- `Quality.command.ts` keeps canonical local quality on full docgen generation
  plus aggregation.
- `.github/workflows/check.yml` has affected/full docgen lane gating, but
  affected mode still runs unscoped root aggregation.
- No files were edited and no full docgen/quality lanes were run.

## Recommended Tasks

| Rank | Task | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- |
| 1 | Add `docgen:local` package fingerprint shadow report with fingerprint, selected inputs, full-reason inputs, dependency radius, prior-proof status, and would-reuse/would-run decision. | High diagnostic unlock; turns `rqt-005` into implementable proof metadata. | Low-medium; report must not mutate or gate. | `bun run docgen:local -- --plan --json`; fixture tests for root input, package source, docs, docgen config, and dependency changes. | Remove/disable shadow fields; existing planner behavior remains. |
| 2 | Add gated package-level reuse only after shadow parity. | High for docgen-heavy PRs with unchanged packages and warm proof manifests. | Medium-high; stale docs or missed example breakage if fingerprint is incomplete. | Shadow-vs-full comparison over representative PRs, then `bun run docgen`, `bun run audit:github quality`, and CI Docgen. | Disable reuse flag/default; fall back to current Turbo/package docgen. |
| 3 | Align affected CI aggregation with selected package aggregation. | Medium; removes repeated root copy work after affected package docgen. | Medium; root docs completeness/staleness must be explicit. | Compare selected packages from Turbo/docgen plan to aggregate targets; full `bun run docgen` fallback proof. | Restore `bun run docs:aggregate` after affected Turbo docgen. |
| 4 | Build symbol/example selectivity shadow index from quality subjects plus generated example IDs. | Medium future unlock. | High if promoted early. | Compare predicted impacted examples/docs with full package outputs and typecheck failures on every full package run. | Delete shadow index/report; no production behavior changes. |
| 5 | Add soundness fixture suite for future selectivity. | High safety gate before promotion. | Low-medium. | Fixture runner proves uncertain cases escalate to package/full docgen. | Remove fixtures; no runtime behavior changes. |

## Rejected Ideas

- Making symbol/example selectivity blocking in this packet.
- Using `DocgenQualitySubject.contentHash` as the package generation proof key.
- Skipping full docgen fallback on root package, lockfile, tsconfig, Turbo, or
  docgen tooling changes.
- Typechecking only changed example files as a correctness proof.
- Relying on Turbo cache status alone as a durable proof manifest.
- Skipping root aggregation entirely without a docs-completeness policy and
  full fallback.

## Open Questions

- Where should shadow manifests live: ignored `.beep/docgen/**`, package-local
  generated metadata, Turbo summaries, or CI artifacts?
- Should package fingerprints include direct workspace dependency fingerprints,
  full transitive closure, or defer dependency expansion to Turbo `^docgen`?
- What proof window is enough before gated reuse: N green PRs, a fixed fixture
  suite, or both?
- Is docgen wall clock currently dominated by generation, example `tsc`,
  aggregation, Turbo setup/cache, or GitHub setup?
- Does `dtslint/**` still belong in the `docgen` Turbo outputs?
- Should CI Docgen use `docgen:local --plan --json` as the canonical affected
  planner, or keep shell gating and add parity checks?
