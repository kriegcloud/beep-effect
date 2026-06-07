# Batch 3: Effect V4 Tools

## Findings

- No new current-PR blocker surfaced from `.repos/effect-v4/packages/tools`.
  Useful transfers are deferred or prototype candidates for `rqt-005`,
  `rqt-007`, and `rqt-010`, not replacements for the already-green Yeet,
  lint, and proof-parity work.
- Effect v4's strongest transferable pattern is JSDoc model generation plus
  fast lint replay: `@effect/jsdocs` writes a source-hashed model, and
  `@effect/oxc` checks staleness and replays diagnostics per file. This fits a
  shadow package-level docgen/JSDoc model before any authoritative reuse.
- OXC prior art is useful for focused advisory AST policy rules. It should not
  replace this repo's Biome/ESLint lanes in the current PR; Oxlint JavaScript
  plugins are still alpha in official docs.
- Effect v4's bundle tool is a bounded measurement tool, not a build
  replacement. It discovers deterministic fixtures, uses Rollup's JavaScript
  API in memory, gzips output, and emits Markdown comparison reports.
- Generator/orchestration code transfers as structure: schema-decoded config,
  discovery service, fetch/generate/post-process services, typed errors,
  warning separation, and aggregate errors. This is relevant to repo-export
  shard-v2 and docgen fingerprint commands.
- Effect v4 root orchestration is too simple for this repo's proof model.
  `beep-effect` needs Turbo-aware package ownership, fallback proofs, and
  proof-parity records.

## Evidence

- Existing task fit: `rqt-005` tracks safe docgen fingerprint reuse, `rqt-007`
  defers repo-export shards, and `rqt-010` tracks Effect v4/OXC/Rollup
  candidates.
- `SPEC.md` says `.repos/effect-v4/packages/tools` is read-only prior art and
  external tools require prototype speedup plus no proof weakening.
- Effect v4 root scripts in `.repos/effect-v4/package.json` run `jsdocs`,
  `oxlint`, `dprint`, recursive package build/docgen, and `tsgo`; no Turbo
  graph exists there.
- JSDoc model source:
  `.repos/effect-v4/packages/tools/jsdocs/src/Jsdocs.ts`.
- OXC model-backed rule:
  `.repos/effect-v4/packages/tools/oxc/src/oxlint/rules/jsdocs.ts`.
- OXC custom rules/tests:
  `.repos/effect-v4/packages/tools/oxc/src/oxlint/rules/*.ts` and
  `.repos/effect-v4/packages/tools/oxc/test/*.test.ts`.
- Bundle tool:
  `.repos/effect-v4/packages/tools/bundle/src/{Cli,Fixtures,Rollup,Reporter,Plugins}.ts`.
- Generator structure:
  `.repos/effect-v4/packages/tools/ai-codegen/src/{Config,Discovery,Generator,SpecFetcher,PostProcess,main}.ts`,
  `.repos/effect-v4/packages/tools/openapi-generator/src/{main,OpenApiGenerator,OpenApiPatch}.ts`,
  and `.repos/effect-v4/packages/tools/utils/src/Codegen.ts`.
- Official docs checked: Oxlint JavaScript plugin/config docs and Rollup
  JavaScript API.
- No files were edited and no heavy quality commands were run.

## Recommended Tasks

| Rank | Task | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- |
| 1 | Prototype a package-level JSDoc model cache inspired by `@effect/jsdocs`, stored package-locally and consumed only in shadow mode. | High for `rqt-005`; may reduce repeated docgen/JSDoc checking and unlock safe package fingerprint reuse. | Medium-high; doc correctness and stale model risk. | Compare shadow diagnostics against `docgen:local`, package docgen, and `lint:jsdoc`; require full `bun run docgen` fallback before gating. | Remove model writer/reader and package-local artifacts; return to current docgen/ESLint checks. |
| 2 | Pilot OXC for one or two syntax-only repo policy checks as advisory, not as a Biome/ESLint replacement. | Medium if it later displaces slow syntax-only ESLint work. | High due new dependency and alpha plugin status. | Add fixture tests, run five warm samples against a narrow file set, and compare diagnostics with current ESLint/Biome. | Remove `oxlint` dependency/config and advisory sidecar; keep existing lint proof unchanged. |
| 3 | Apply Effect v4 generator service split to repo-export shard-v2. | High for `rqt-007`; cleaner package shard discovery, deterministic aggregation, typed error reporting. | High; touches repo-cli, repo-codegraph, Turbo, hooks, and generated artifacts. | Package shard task dry-run/cache evidence, root aggregate byte-for-byte compare with current catalog, then `repo-exports:catalog:check`. | Disable shard mode, remove shard task/scripts, and keep root catalog generator authoritative. |
| 4 | Add a Rollup fixture reporter only as an optional bundle/treeshake measurement lane. | Low-to-medium; useful if build/size regressions become a throughput concern. | Medium; new tooling and fixture maintenance. | Deterministic fixture list, Markdown report, Rollup `bundle.close()` proof, no participation in `audit:github quality`. | Delete optional reporter package/scripts; no quality-lane change. |
| 5 | Copy generator warning/error reporting patterns into repo-cli plan/report commands. | Medium diagnostic win for CI/setup/docgen/repo-export prototypes. | Low-medium. | Unit tests for stdout/stderr separation, aggregate errors, and JSON plan stability. | Revert report-only command changes; canonical proof commands unchanged. |

## Rejected Ideas

- Current-PR replacement of Biome/ESLint with Oxlint.
- Vendoring `@effect/jsdocs` wholesale.
- Hash-only JSDoc or repo-export reuse as authoritative proof.
- Replacing Turbo orchestration with Effect v4 recursive scripts.
- Adding bundle-size checks to common End-to-End Green.

## Open Questions

- Which current JSDoc/ESLint substep is the real bottleneck after Batch 2:
  `lint:jsdoc`, deprecated API shards, docgen example typecheck, or package
  verification?
- Should an OXC pilot use current plugin APIs rather than copying Effect v4's
  older rule shape?
- Where should a shadow JSDoc model live: package-local `.beep/docgen/`,
  docgen output, or a root aggregate index?
- Can docgen fingerprints reuse example typecheck results safely, or only
  documentation diagnostics at first?
- Should bundle-size prior art stay entirely out of this packet unless another
  lane finds build/treeshake proof value?
