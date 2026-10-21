# Effected kit promotion Spec

## Objective

Promote the ported `@effected/*` kit (`scratchpad/effected/<module>`, port
completed 2026-10-14 through #1592, #1628 and #1659) into dedicated `@beep/*`
workspace packages that follow `standards/ARCHITECTURE.md`, then use those
packages to delete or shrink the one-off modules, tooling and third-party
dependencies they duplicate, and drop the last npm `@effected/*` dependency
(`@effected/github`).

The operator's motivation: depend less on the upstream maintainer, and use the
kit's structure to split this repo's capabilities into dedicated packages.

## Non-Goals

- Re-reviewing the port. The port's review rounds are done; their reports are
  archived under `history/port-reviews/<module>/`.
- Publishing any package to npm (D-11).
- Converging `@beep/md` and `@beep/markdown` on one tree. That stays an
  evidence-gated option (D-02).
- Promoting a package ahead of its first consumer where the architecture gate
  requires one (D-05).

## Source Hierarchy

1. The operator's request of 2026-10-20 that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. `standards/ARCHITECTURE.md`, `standards/architecture/07-non-slice-families.md`,
   `standards/architecture/DECISIONS.md`.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. `research/promotion-map-2026-10-20.md` (the discovery workflow's package
   map, verified reuse sites and markdown merge designs), `ops/`, `history/`.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- New packages under `packages/foundation/{modeling,capability}/*`,
  `packages/drivers/*` and `packages/tooling/{library,test-kit}/*`, one per
  row of the package map (`research/promotion-map-2026-10-20.md`, "Package
  map").
- `scratchpad/effected/**` and `scratchpad/test/**`: each module leaves in the
  PR that promotes it; the modules still waiting import promoted ones by
  package name.
- `packages/foundation/modeling/identity/src/packages.ts` (identity composers,
  registered by `bun run beep create-package`).
- Root wiring that `create-package` and `tsconfig-sync` own (aliases,
  references, workspaces, syncpack, fallow boundaries, `bun.lock`) and
  `_typos.toml`.
- Adoption phase: reuse sites in `packages/tooling/**`, `packages/foundation/**`,
  `packages/drivers/**` and the rest of the repo, as listed in the research
  map with verdict `confirmed` or `partial`.

## Constraints

- Packages are bootstrapped only with `bun run beep create-package`.
- Family ceilings hold for every edge (ARCHITECTURE.md "Family And Kind
  Dependency Rules"). Modules whose provisional home broke a ceiling are split
  (D-01).
- A `foundation/capability` package lands only with at least two named
  importers (07 "Specific Homes Before Capability").
- Promotion is behaviour-preserving. A test may be retargeted (paths,
  identities) but never deleted, skipped or weakened. Real bug fixes are
  recorded as deviations in the package README's Port notes.
- Upstream MIT notices are kept: each package `LICENSE` carries both the
  beep-effect and the upstream copyright line.
- No `standards/` debt or exception inventory grows from new findings (S31).
  Findings that move with relocated code are handled per D-17.
- One owner per concept. A duplicate that exists during the transition is
  listed in the Exception Ledger with its removal condition; no compatibility
  alias is left behind.

## Acceptance Criteria

- [ ] Every promotable module in the package map lives in its package, and
      every deferred one (D-05) is listed with the consumer that will trigger it.
- [ ] Every promoted package passes
      `bun run beep quality package-verify <@beep/package>`.
- [ ] `@effected/github` is gone from the root catalog, `@beep/repo-cli` and
      `bun.lock`.
- [ ] `$ScratchpadId` has no importer under `scratchpad/effected/**`.
- [ ] The duplicates in the Exception Ledger are retired, each in the PR that
      migrates its consumers.
- [ ] The confirmed and partial reuse sites are migrated or carry a recorded
      reason in `history/reuse-ledger.md`.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/effected-promotion/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/effected-promotion/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/effected-promotion` | Passes |
| Package gate | `bun run beep quality package-verify <@beep/package>` per promoted package | Exit 0 |
| Identity registry | `bun run beep lint identity-registry` | Passes |
| Typos | `typos --exclude '.beep/**' --exclude 'scratchpad/**'` | No findings |
| Remaining kit | `bun run --cwd scratchpad check` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

The operator declined to answer the placement questions directly on
2026-10-21 and had the orchestrator resume the work. Under the autonomy
charter each decision below takes the option the discovery workflow
recommended (or, for D-02, the judge's pick over the reviewer's), and the
operator reviews them asynchronously.

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-21 | D-01 Package map: 30 packages in five topological waves plus four deferred, from `research/promotion-map-2026-10-20.md`. Five modules split: `npm` (pure half `@beep/npm-spec`), `sbom` (pure `@beep/sbom`, deferred `@beep/sigstore`), `tsconfig-json` (`@beep/tsconfig` + `@beep/repo-tsconfig`), `cli` (`@beep/cli-kit`, deferred `@beep/ink`), `github-actions` (`@beep/github-reporting` + `@beep/github-actions`). `walker`, `env`, `config-file`, `xdg` and `cli` move to `foundation/capability`. | The port's provisional homes (port D12) broke 15 family ceilings; drivers cannot import tooling and modeling cannot import drivers or capability. | Re-run placement for one module and move its package with `bun run beep create-package` + delete; no consumer depends on a placement before the adoption phase. |
| 2026-10-21 | D-02 Markdown: layered. The kit module becomes `@beep/markdown` (syntax layer: CommonMark 0.31.2 + GFM parser, positioned nodes, edits, formatting, visitor). `@beep/md` stays the semantic, persisted model and gains only the subpaths `Md.syntax` (bridge to `Md.Document` with losses and a source map) and `Md.parse`, kept out of `src/index.ts` and the `Md` object. Typed frontmatter and its YAML/TOML/JSON codecs are `@beep/markdown` subpaths. Parsed raw HTML bridges as escaped text by default. Admonitions and math are bridge recognizers first. MDX nodes sit behind a separate subpath. | Judge score 8.4 vs 6.6 (merge) vs 5.0 (single AST). `@beep/md` is imported by slice packages and `Md.Document` is a persisted jsonb/RPC type, so a merge would pull the parser and yaml/toml/jsonc into their closure; one owner per tree level answers the two-owner concern. | Fold `@beep/markdown` into `@beep/md` later; the bridge corpus and a writer differential test decide whether one tree is worth it. |
| 2026-10-21 | D-03 `@beep/commands` is a driver and the shared process runner. The `effect-child-process-hardening` exception row "Driver-local output folds" retires in that packet's Decision Log in the first PR that moves a driver onto `@beep/commands`. | Routing step 2 puts generic external-binary wrappers in drivers; its own removal condition ("a stable existing package boundary gains another compatible caller") is met by the 22 verified call sites. | Keep drivers on their local folds and restrict `@beep/commands` to tooling. |
| 2026-10-21 | D-04 Sequencing: one PR per wave promotes its packages; capability packages land together with at least two named importers; duplicate retirement (`@beep/schema` Jsonc/Semver/Glob, `@beep/utils` Glob, `@beep/test-utils` MemoryFileSystem, `repo-utils` TSConfig/PackageJson) and reuse-site migration run in adoption PRs, each owner switch in one PR with no alias. | Keeps wave PRs mechanical and reviewable, satisfies the capability gate, and avoids workspace cycles (`@beep/jsonc`, `@beep/glob`, `@beep/semver` import `@beep/schema`). | Merge an adoption step into its wave PR. |
| 2026-10-21 | D-05 Deferred until a first consumer: the npm registry/publish half, `@beep/sigstore`, `@beep/ink`, and `engine` (to fold into `@beep/mcp-kit`). Their files stay in `scratchpad/effected` and are tracked in `PLAN.md`. | Capability gate and consumer-backed packages; none sits on another package's dependency path after the npm-spec and sbom splits. | Promote one with `create-package` when its consumer appears. |
| 2026-10-21 | D-06 `jsonl`'s `Journal` stays a subpath of `@beep/jsonl`. | Its deps are effect and modeling only; abstract-FileSystem services have modeling precedent (`utils/FileSystem.ts`). | Split it to a capability package once it has two importers. |
| 2026-10-21 | D-07 `@beep/memfs` (tooling/test-kit) owns the in-memory FileSystem; `@beep/test-utils/MemoryFileSystem` retires in the PR that migrates its consumers. | Same upstream engine twice; a dedicated package keeps consumers off test-utils' database deps. | Fold `@beep/memfs` into `@beep/test-utils`. |
| 2026-10-21 | D-08 `@beep/package-json` owns the generic package.json model; `@beep/repo-utils` keeps the beep `family`/`kind` metadata as an extension plus JSON Schema emission. | One owner per concept; drivers cannot import tooling, so the reusable model lives in foundation. | Keep the repo-utils model and use the kit only for edits. |
| 2026-10-21 | D-09 `@beep/tsconfig` owns the tsconfig model (passthrough, tsc merge semantics); the strict closed checks become a validator in `@beep/repo-tsconfig`. | Two document models for one capability; docgen is the strict model's only consumer. | Keep both models. |
| 2026-10-21 | D-10 The github-actions reporting suite is its own modeling package, `@beep/github-reporting`. | Pure text models; the driver root is not browser-safe and repo-cli Reviewer/CI summaries are named reuse sites. | Keep it as a driver subpath. |
| 2026-10-21 | D-11 No ecosystem packages. | Ecosystem members carry no `@beep/*` runtime dependency; every kit module depends on identity and schema. | Open a publication goal and de-beep the chosen packages through `14-ecosystem-packages.md`. |
| 2026-10-21 | D-12 Upstream-first census (ARCHITECTURE.md upstream-first rule, DECISIONS 2026-09-29) against `effect@4.0.5` `effect/encoding`: `Yaml` exports only a throwing `parse(input): unknown`; `Toml` exports only a throwing `parse`; `Ndjson` exports streaming `encode`/`decode`/`duplex` (+ schema variants) and `NdjsonError`. Uncovered by upstream: YAML/TOML offset ASTs and CSTs, comment-preserving edits, formatting, linting, multi-document streams, anchors, typed decode, diagnostics; JSONL line slices, envelopes, journals and byte-offset errors. `@beep/yaml`, `@beep/toml` and `@beep/jsonl` are justified. Streaming-only JSONL sites stay on `effect/encoding/Ndjson`. | The rule forbids a new modeling concept where upstream covers its intent; upstream covers only the throwing parse and plain streaming. | Retire a package if a future effect release covers its facets. |
| 2026-10-21 | D-13 Names: `@beep/runtime-env` (env), `@beep/managed-section` (templates), `@beep/npm-spec`, `@beep/commands`; the rest keep upstream names. | The upstream `templates` and `env` names mislead; `commands` collides with no package. | Rename through `create-package` + delete before the package has consumers. |
| 2026-10-21 | D-14 `@beep/runtime-env` owns colour-level detection with Node's FORCE_COLOR-first precedence; `@beep/chalk` and `@beep/colors` delegate (adoption phase). | One owner per capability. | Keep the three detectors. |
| 2026-10-21 | D-15 Packages whose tests import internals export `./internal/*` (as `@beep/dock` and `@beep/chalk` do) instead of the scaffold's `null`. | Repo law sends tests through `@beep/*` aliases; the port's tests exercise internals directly. | Move those tests behind public entry points and restore `null`. |
| 2026-10-21 | D-16 `_typos.toml` excludes the vendored conformance suites and data lists (yaml-test-suite, toml-test, the schema.org vocabulary, the SPDX lists) and allows six deliberate words (`adjascent`, `abd`, `compilability`, `anc`, `raison`, `fnd`); three real prose typos in `@beep/glob` comments were fixed. | The typos hook excluded `scratchpad/**`; the text is byte-faithful upstream data or a test vector. | Remove the entries and fix or rename at the source. |
| 2026-10-21 | D-17 (superseded by D-19) Effect-vitest findings the port had adjudicated (per-module `.canon-exceptions.json`, archived under `history/canon-exceptions/`) move with their tests. Each one is first retried as a behaviour-preserving fix; the rest carry their port reason into `standards/effect-vitest.inventory.jsonc`. This is a relocation (the repo-wide count does not rise), not new debt under S31. | The exception files were the scratchpad's inventory for the same detectors. | Fix the tests and drop the rows. |
| 2026-10-21 | D-18 The port's per-module `.review/` reports and canon exception files are archived under `history/`; `PORT_LEDGER.json`, `OPPORTUNITIES.md`, `TESTS_NOT_PASSING.md` and the port runner retire with the last scratchpad module. | Keep provenance without shipping lab files in packages. | Move them back. |
| 2026-10-21 | D-19 Operator decision 25, relayed by the orchestrator (verbatim): "keep S31; refactor the promoted effected code to zero findings before merge, low-finding packages first." No relocation exemption and no baselining: the 60 effect-vitest rows of D-17 are withdrawn and their tests fixed. Wave 1 splits: 1a ships `@beep/spdx`, `@beep/schema-org`, `@beep/github-references`, `@beep/github-commands`, `@beep/commands`, `@beep/jsonl`, `@beep/managed-section`, `@beep/jsonc`, `@beep/semver`; 1b follows with the D-07 memfs retirement and the complexity/duplication refactor of `@beep/memfs`, `@beep/toml`, `@beep/git`, `@beep/glob`, `@beep/yaml`, checked against the conformance oracles. | Moving the kit out of `scratchpad/` exposed it to schema-first (222), fallow audit (344 complexity, 170 duplication, 3 dead code), fallow health (50) and effect-vitest (62) gates it was exempt from. | Operator ruling; reversible only by the operator. |
| 2026-10-21 | D-20 Wave 1a is cut from `main` in its own lane (`feat/effected-promotion-w1a`): its nine modules are re-promoted with the promotion script and their already-green package directories overlaid from `feat/effected-promotion-w1`; wave 1b is rebuilt the same way on `main` after 1a merges. | Ships the low-finding packages first without waiting on the yaml refactor. | Land both waves from one branch. |
| 2026-10-21 | D-21 `@beep/managed-section` moves from wave 1a to 1b: its tests run on `@beep/memfs` (`MemoryFileSystem`, seed and volume types), whose API differs from the `@beep/test-utils` copy (`layer`, `make`), so it ships with memfs instead of rewriting its tests twice. Wave 1a is the other eight. | The orchestrator's list followed the finding counts; this is a dependency, not a count. | Rewrite its tests onto `@beep/test-utils/MemoryFileSystem` and ship it in 1a. |
| 2026-10-21 | D-22 Schema-first conventions for promoted packages: plain-data schemas are branded `S.Opaque` (construct with `X.make`, never `new` or `instanceof`); functions that take option records accept the unbranded `X.Encoded` shape so callers keep passing literals (`RunOptions.Encoded`, `AnnotationProperties.Encoded`, jsonl `AppendOptions.Encoded`); helpers return `Option`, not `null`/`undefined`. Two observable shifts: an `S.is` guard over an opaque schema is structural (schema-org `isNodeRef` now accepts any `{ "@id": string }`, equivalent in practice because every typed relation field admits only `NodeRef`), and `X.make` copies nested data (one commands property test moved from reference identity to deep equality). | Operator decision 25 requires zero schema-first findings; the `Encoded` parameter keeps the pre-conversion call shape. | Revert a package's conversion together with its schema-first findings (not allowed under S31). |
| 2026-10-21 | D-23 Cross-package duplication in wave 1b moves into `@beep/utils`, one helper per clone group: `Text.lineCharacterAt` with a declarative newline grammar (toml default; jsonc `unicodeSeparators`; yaml also `crlfLookahead: "prefix"`, which keeps yaml's character 0 against jsonc/toml's -1 at the `\n` of a CRLF pair), `Schema.makeTextDecodeTo` for the yaml/jsonc `schema` dual, `Number.makeCapAssertion` for glob/toml cap guards (each keeps its own error class and message), and `Record.setOwnProperty` for toml's `__proto__`-safe assignment. glob gains a `@beep/utils` dependency; yaml and toml do not depend on jsonc. | Decision 25 requires zero introduced duplication; `@beep/utils` is the modeling-family helper home all four packages may import, so no new package or jsonc coupling is needed. | Inline the helpers back into each package (reintroduces the clone groups). |
| 2026-10-21 | D-24 `@beep/git` renames the `GitmodulesDecodeError` payload field `name` to `submodule` (constructor, annotation key and encoded JSON key). | The field shadowed `Error.name`, so logs and `String(error)` showed the submodule instead of the error type (`errorPayloadShadowsName`); the package is new in this wave, so no published consumer breaks. | Restore the field name with an Effect diagnostics exemption (not allowed under S31). |
| 2026-10-21 | D-25 D-07 executes in wave 1b: `@beep/test-utils/MemoryFileSystem` and `FileSystemConformance` are deleted and their consumers (17 packages, 64 `layer` and 31 `make` sites) import `MemoryFileSystem` from `@beep/memfs/MemoryFileSystem`. The old conformance suite blamed the source path on `copy({ overwrite: false })` AlreadyExists; memfs blames the destination (a recorded upstream fix), and no consumer calls that path. memfs gains a Bun conformance run of its `FileSystemContract`, replacing the deleted Bun suite, and repo-cli's Effect-diagnostics directive allowlist drops the deleted file. | One engine instead of two removes 51 clone groups; memfs's contract is the newer copy of the same upstream suite. | Restore the test-utils copy from git history and point consumers back. |
| 2026-10-21 | D-26 `DEFAULT_REGISTRY` (`https://registry.npmjs.org`) moves from the lab's `npm/NpmRegistry.ts` to `@beep/npm-spec/RegistryKind`, beside `classifyRegistry` and the registry labels. The lab's `NpmRegistry` and `github-actions` `PackageManagerInstaller` import it from there; neither the lab `npm` index nor `NpmRegistry` re-exports it. | It is a pure constant the pure registry vocabulary already classifies against, and `PackageManagerInstaller` needs it without linking the HTTP registry client; one owner, no alias. | Move the constant back into `NpmRegistry.ts` and repoint its two importers. |
| 2026-10-21 | D-27 The `npm` split (D-01): the twelve IO-free modules (`CatalogAssemblyError`, `CatalogResolver`, `DependencySection`, `DependencySpecifier`, `IntegrityHash`, `Manifest`, `PackageManagerCache`, `PackageManagerPin`, `RegistryCredential`, `RegistryKind`, `ReleaseAgeGate`, `WorkspaceResolver`) and the composite no-op `Default` layer move to `@beep/npm-spec`; `NpmExecutor`, `NpmRegistry`, `PackagePublish`, `PackageTarball` and `PublishError` stay in `scratchpad/effected/npm` as the deferred registry/publish driver (D-05). The lab `npm` index exports only that half, with no compatibility re-exports; lab importers (`lockfiles`, `package-json`, `workspaces`, `github-actions`) import `@beep/npm-spec/<Module>` leaves. | The kept modules reach `effect/http` and subprocesses and have no consumer yet; the moved ones are what the lockfile, package.json and workspace models need. `BasicCredential`, `TokenCredential` and `DefaultCacheDirectoryOptions` become branded `S.Opaque` values under D-22. | Move the five driver modules into `@beep/npm-spec` (breaks its modeling ceiling) or fold the package back into the lab module. |
| 2026-10-21 | D-28 The `tsconfig-json` split (D-01, D-09): the document model (`CompilerOptions`, `CompilerOptionsFromProgrammatic`, `JsxConfig`, `PortableTsconfig`, `ResolvedTsconfig`, `TsconfigJson`, `TsEnumCodec`) moves to `@beep/tsconfig`; `TsconfigDiscovery`, `TsconfigLoader`, `TsconfigLoaderSync` and `internal/extendsTarget.ts` stay in `scratchpad/effected/tsconfig-json` until `@beep/repo-tsconfig` (wave 3) takes them with its docgen consumer. `ResolvedTsconfig`, `PortableTsconfig` and `PortableTsconfigOptions` become branded `S.Opaque` (D-22). | The loaders read the filesystem and resolve `extends` through `walker`, which a modeling package cannot import; the model is pure. | Move the loaders into `@beep/tsconfig` once `walker` is a dependency it may take, or fold the package back. |
| 2026-10-21 | D-29 The lab's import-graph tests treat each split package and its lab half as one lab module: `layering.int.test.ts` maps `@beep/npm-spec` to `npm` and `@beep/tsconfig` to `tsconfig-json` (so `@lab/workspaces -> @lab/npm` stays a required edge), and the `github-actions` reachability test confines the `@beep/npm-spec` edge to `PackageManagerInstaller` with its exact leaf set (`IntegrityHash`, `PackageManagerPin`, `RegistryKind`). The lab workspaces gate types its release-age contributions as `PartialReleaseAgeGate.Encoded` and builds gates with `PartialReleaseAgeGate.make`. | Keeps the upstream layering and confinement invariants checking the same edges after the move. | Give the packages their own lab layers in `lab-layers.json`. |
| 2026-10-21 | D-30 `@beep/tsconfig` keeps its `S.StructWithRest` passthrough schemas (`CompilerOptions`, `Reference`, `WatchOptions`, `TypeAcquisition`, `TsconfigJson`, `ProgrammaticCompilerOptions`) unbranded, building them from non-exported `<X>Fields` structs, while closed plain-data schemas (`ResolvedTsconfig`, `PortableTsconfig`, `PortableTsconfigOptions`) are branded `S.Opaque` per D-22 and `ResolvedTsconfig.merge` validates through `make`. | A passthrough document must accept and preserve unknown compiler options and stay assignable to the TypeScript compiler's `ts.CompilerOptions` without casts; a brand would break that contract, and the schema-first lint accepts the rest-struct form. | Brand the passthrough schemas and add casts at the `ts.CompilerOptions` boundary. |
| 2026-10-21 | D-31 Wave 2b ships as three PRs after wave 2a (#1988) merges, in this order: 2b-1 `@beep/walker` with its five adopter sites and the lab retargets; 2b-2 `@beep/github` with the repo-cli swap and the `@effected/github` retirement; 2b-3 `@beep/runtime-env` with the `@beep/chalk`/`@beep/colors` delegation. Wave 2c follows 2b-1 as the glob adoption PR (retires `@beep/utils/Glob`, `@beep/schema/Glob` and `FsUtils.walkFiles`/`globFiles`, with the Bun `node:fs` glob census). The `@beep/markdown` wave formerly labelled 2c becomes 2d. This amends D-04 ("one PR per wave") for wave 2 as D-20 did for wave 1. 2b-1 is cut on a local stack over the 2a head and rebases once #1988 merges. | The adversarial review of `research/wave-2b-plan-2026-10-21.md` counted the github port at 250 or more findings against 40-60 for walker and runtime-env, and the three PRs share the identity, catalog, `bun.lock` and `PROMOTED`-map files, so they merge in sequence. walker is the smallest, preserves behaviour and unblocks 2c; runtime-env goes last because it is the only one with intended CI-visible behaviour changes. | Fold 2b-1..2b-3 (and 2c) back into one wave-2b PR. |
| 2026-10-21 | D-32 `@beep/walker` scope (2b-1). Adopters, counted by package for the capability gate: `@beep/repo-utils` (`Root` `findRepoRoot`, `TSMorph` `resolveFileEntrypointTsConfig`, `FsUtils` `findNearestPackageDir`) and `@beep/repo-cli` (`Drawings.review` review-directory lookup, `TestTsgoPrograms` `findOwningPackageDir`); the optional `ai-metrics` JSONL discovery stays out. `findRepoRoot` provides the posix `effect/Path` layer internally so its requirement stays `FileSystem`; this locks in posix path semantics, as the old `/`-only string code already did. Intended shifts, each pinned by a test: a relative `findRepoRoot` start ascends to `.` and stops there (before, `parentDir` turned `"a"` into `/` and probed the filesystem root); results are normalized (`/repo/` returns `/repo`); `resolveFileEntrypointTsConfig` compares its inclusive repo-root ceiling in normalized form; `findOwningPackageDir` containment is segment-aware (`/repo-worktrees/...` no longer resolves against `/repo`), probes `repoRoot` itself (same result) and dies on a relative `repoRoot` (every caller passes `findRepoRoot` output); `findReviewDir` stops at the first matching ancestor instead of stat-ing all of them (same hit). Every ascent is capped at `Walker.ascend`'s default 256 levels (unbounded before). In the package, the option records follow D-22 (`AscendOptions`, `DescendOptions`, `DescendRecordOptions`, `CompileAndExpandOptions`, `UnreadableDirectory`, `DescendResult` are branded `S.Opaque`; functions take `X.Encoded`), the tests import `./internal/*` (D-15), and the span names are `Walker.<function>`. `@beep/utils/Glob`, `@beep/schema/Glob`, `FsUtils.walkFiles`/`globFiles` and repo-cli `Lint/internal/WorkspaceWalk.ts` stay until wave 2c. | The review confirmed the family ceilings (capability over modeling `@beep/glob`, `@beep/identity`, `@beep/schema`; tooling may import any foundation kind) and that two packages import walker in the same PR. Providing posix `Path` internally keeps `findRepoRoot`'s signature for its many callers. The glob retirement changes dialect, IO and performance at 22 call sites and needs its own census (D-31). | Restore the hand-rolled ascents from git history and drop the `@beep/walker` dependency from both adopters (walker then fails the capability gate and returns to the lab). |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Duplicate semver model | `@beep/schema/Semver` beside `@beep/semver` | effected-promotion | Transitional during D-04 | The adoption PR that migrates `@beep/schema/Semver` consumers deletes it |
| Duplicate JSONC model | `@beep/schema/Jsonc`, repo-cli `internal/cli/Jsonc.ts`, `jsonc-parser` users, beside `@beep/jsonc` | effected-promotion | Transitional during D-04 | Adoption PR for jsonc consumers |
| Duplicate glob matching | `@beep/schema/Glob`, `@beep/utils/Glob`, repo-cli `internal/GlobPattern.ts`, beside `@beep/glob` | effected-promotion | Transitional during D-04 | Wave 2c glob adoption PR (D-31) for `@beep/schema/Glob` and `@beep/utils/Glob`; repo-cli `internal/GlobPattern.ts` in the glob reuse phase |
| `@effected/github` npm dependency | root catalog, `@beep/repo-cli` | effected-promotion | Replaced by `@beep/github` (wave 2) | Wave 2 PR |
| Duplicate directory traversal | `FsUtils.walkFiles`/`globFiles` in `@beep/repo-utils` and repo-cli `Lint/internal/WorkspaceWalk.ts` beside `@beep/walker` `Walker.descend`/`compileAndExpand` | effected-promotion | Transitional during D-04 and D-32; `walkFiles` importers are repo-cli `RestorationTransformations` and `FlattenMedia` (the libpff driver has its own local walker and does not import `@beep/repo-utils`) | Wave 2c glob adoption PR (D-31) |
