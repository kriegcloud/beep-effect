# #1856 guidance wave 2a: individual `fallow-ignore` review and the #1910 fixes

Lane `residue-guidance`, wave 2a, branch `feat/residue-guidance-wave2a` from `main` at
`5ae6765125`. Route: S39/S41 Claude chain, step 1 (`claude-opus-5-5` child). Fallow
3.33.1 (the repo pin). This wave covers only `fallow-ignore` directives. Wave 2b owns
the other directive kinds (`@ts-expect-error`, `@effect-diagnostics`, `biome-ignore`,
`cspell`, coverage ignores, `noqa` and the rest). Wave 3 owns the Markdown fence compile
check and the upstream-copied `.patterns` decision.

#1910 is resolved by this PR (see "#1910 fixes").

## Census

Command, run from the repository root (the wave-1 command plus `--hidden`, so that
`apps/storybook/.storybook/main.ts` is counted):

```sh
rg --only-matching -P --hidden -g '!node_modules' -g '!.beep' -g '!*.md' -g '!*.jsonl' -g '!.git' \
  '(//|/\*|\{/\*|#|<!--|\*)\s*fallow-ignore[^\n]*' -n .
```

Without `--hidden` the base count is 223. Wave 1 counted 240 at `e3ee18dfd7`. Merges
between the two bases account for the difference. Among them, #1975 (`71d48a5c50`)
deleted `packages/drivers/venice-ai` and its 10 directives, so the `retired:venice-ai`
area is gone entirely.

| Directive | Before (`5ae6765125`) | After |
| --- | --- | --- |
| `next-line code-duplication` | 97 | 69 |
| `next-line complexity` | 73 | 40 |
| `file code-duplication` | 47 | 46 |
| `file unused-file` | 6 | 6 |
| `next-line unused-type` | 1 | 1 |
| `next-line unused-export` | 1 | 1 |
| **Total** | **225** | **163** |

By root before: packages 192, apps 22, `vitest.setup.ts` 8, infra 2, scratchpad 1.
After: packages 139, apps 20, `vitest.setup.ts` 2, infra 2.

Dispositions: 10 fixed, 52 stale, 163 kept. Of the kept directives, 157 still
suppress a live finding. The other 6 are generator-uniform (see "Kept").

## Method

1. **Liveness experiment.** The directive files (154 at base) were archived. Every
   `fallow-ignore-` token in them was rewritten to an inert token, which keeps line
   numbers the same. Then `fallow dead-code`, `fallow dupes` and `fallow health`
   (`--config .fallowrc.jsonc --format json`) ran on the whole repository, and the
   files were restored from the archive. Suppressed findings are the ones in the
   stripped run that the normal run does not report. A directive is live when one
   of them is attributable to it: same file, and the finding starts on the next
   line (`next-line`) or anywhere in the file (`file`). For `code-duplication`, a
   clone instance that covers the next line also counts. All 49 suppressed health
   findings were attributable, and so were all 8 dead-code findings.
2. **Stale removal.** The 58 directives with no attributable finding were removed.
   Six of them were restored, because a generator emits them (see "Kept"). Four
   companion comments that only restated a removed directive's reason ("shared
   driver boundary idiom; ...") went with them. `fallow dead-code --stale-suppressions`
   reported 0 stale suppressions at base, even though these 52 were stale (#1855
   hand-off 1).
3. **Fixes.** Ten directives were removed by fixing the source (see "Fixes"). Each
   fix was confirmed with the directive gone: whole-repository health and dupes
   findings stayed exactly as at base.
4. **Kept reasons.** Every remaining directive was rewritten to the form
   `-- <why this is a true exception>. Owner: <package>. Exit: <what would let it be removed>.`
   It is still the `-- <reason>` form that fallow's `require-suppression-reason` rule
   (`error`) accepts. No fallow baseline, `ignorePatterns`, `ignoreExports`,
   `health.ignore` or `thresholdOverrides` entry was added (S31).
5. **Final proof.** The liveness experiment was repeated on the final tree. All 163
   remaining directives were checked: 157 are live and 6 are the generator-uniform
   set.

| Whole-repository scan | Base | After |
| --- | --- | --- |
| `fallow health`: functions above threshold | 135 | 135 |
| `fallow dupes`: clone groups / instances | 128 / 268 | 128 / 268 |
| `fallow dead-code`: issues | 0 | 0 |
| Suppressed health findings (stripped run minus normal run) | 49 | 40 |
| Suppressed dead-code findings | 8 | 8 |

## Fixes (10)

| Directive (base) | Fix |
| --- | --- |
| `vitest.setup.ts:311` complexity | `appendRequestHeader` takes the per-header branch out of `requestHeaders` |
| `vitest.setup.ts:346` complexity | `toFetchRequest` builds the Fetch `Request`; one `errorMessage` helper replaces three inline ternaries |
| `vitest.setup.ts:410` complexity | `parseJsonlChunk` uses `errorMessage` |
| `packages/tooling/tool/cli/src/commands/Corpus/Corpus.command.ts:401` complexity | ten `O.isNone(x) ? {} : { k: x.value }` spreads use the existing `internal/cli/OptionRecord.ts` `optionalProp` |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts:3071` complexity | the six-level nested ternary is a `Match.value` precedence table with `Match.withReturnType<CorpusOrganizeCategory>()` |
| `.../ServicePrograms.ts:3446` complexity | the two identifier scan loops share one `noteMatches` helper |
| `.../ServicePrograms.ts:3480` complexity | `familyByDigestOf` and `indexFamiliesByTextName` take the two index loops out of `buildFamilyByTextName` |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocMigrateRewrite.ts:94` complexity | `advanceFenceBody` owns the per-line fence state transition |
| `packages/tooling/tool/cli/src/commands/Yeet/internal/WatchMode.ts:307` complexity | `nextReviewThreadsCursor` and `pullRequestAuthorLogin` take the page and author checks out of the loop |
| `packages/drivers/occt/src/Occt.service.ts:61` code-duplication | the hand-rolled hex digest is `effect/encoding/Hex` `encode` (verified in the installed `node_modules/effect/dist/encoding/Hex.d.ts`), so the clone with `technical-drawing/scripts/generate-label-glyphs.ts` is gone |

Each fix keeps behavior, error channels, messages and ordering. `WatchMode` keeps a
local cursor helper instead of the shared `internal/github` `nextCursor`, because
that helper accepts an empty-string cursor and WatchMode rejects one. A scratch
equivalence run compared the old and new `organizeCategoryFor` on all 48 input
combinations, and the old and new `scanText` on four mixed patent and application
texts. Both matched. The scratch file was not committed. The moved
`jsdocMigrateConservationFindings` export (431 to 437) had its
`standards/schema-first.inventory.jsonc` anchor rekeyed with the same exception
reason. No row was added or removed.

## Stale (52)

Fallow reports nothing at these spots once the directive is gone. They are 24
complexity directives (functions now under the ceilings) and 28 code-duplication
directives (27 `next-line`, 1 `file`; clones that are gone). One of them, `scratchpad/effect-ontology/Schema/PosInt.ts`,
sits under a fallow `ignorePatterns` path, so it never applied. Ten of the stale
directives sat on tagged-union `$I.annoteSchema` calls ("preserve the selected guard
through Effect's tagged-union rebuild"): 3 in `Pandoc.model.ts`, 4 in the
architecture-lab error and repository unions, and 1 each in the agents, govinfo and acp
unions. That clone no longer exists anywhere, and no directive with that reason remains.

## Kept (163)

Each kept directive's reason is in the table below and inline. The main classes are:

- 24 consumer-local `PosInt.ts` files. The upstream-first ruling forbids a shared
  replacement. Exit: effect/Schema ships a positive-integer schema, or the ruling
  admits a shared export.
- 9 `@beep/ui` story files and 11 `@beep/effect-drizzle` dialect mirrors.
- Repeated driver-boundary, error-boundary and process-hardening idioms across
  sibling drivers. Exit: a foundation capability package owns the idiom.
- 5 `@beep/ffmpeg` directives that the base text called a "shared driver boundary
  idiom". They are actually intra-file twins across the frame and clip operations,
  and the reasons now say so.
- Complexity in single-transaction CLI planners, such as the `EffectImports` matrix,
  the JSDoc migrate pipeline and the Atlas projection.
- Spawned-by-path entries (`unused-file`) and two oip-web content contracts.
- **Generator-uniform (6).** `beep sync-data-to-ts --target vocab-terms` writes one
  `code-duplication` directive into every `rdf/src/Vocab/generated/*.terms.ts` file.
  The template line in `VocabTerms.ts` is counted by the census regex but sits in a
  string. Only `Dcterms.terms.ts` currently clones the identity `CoreVocab` list.
  Removing the five dead copies by hand would drift the generated files from their
  generator, and making the template conditional per vocabulary would encode a
  detector threshold. The template and all six outputs carry one reason with the
  exit (derive the terms from `@beep/identity` instead of copying them).
  `sync-data-to-ts --target vocab-terms --check` reports 0 of 1 targets drifted.

## #1855 hand-offs (fallow rules unchanged)

1. **Stale-suppression coverage.** `fallow dead-code --stale-suppressions` reported 0
   while 52 `complexity`/`code-duplication` directives were stale. Fallow's staleness
   check covers only dead-code tokens. Wave-4 frontier: a repo-side staleness proof
   for health and dupes directives, such as the liveness experiment above made
   mechanical.
2. **React hook-binding cognitive tax** (6 directives, each marked "#1855 detector
   frontier" inline): `VaultSyncPanel.tsx:295`, `chat-composer.tsx:197`, `:402`,
   `GroupPane.tsx:297` (`TabStrip`, cyclomatic 1), `Session.document.tsx:113`
   (cyclomatic 2), `graph3d.stories.tsx:54`. Fallow's React model adds one cognitive
   point per hook binding, so components with no branching cross the ceiling of 8.
3. **CRAP from the static coverage estimate** (5 directives): `vitest.setup.ts:184`
   (cognitive 1), `StepExec.ts:635`, `EffectImports.ts:1632`, `witness.iife.ts:309`,
   `SafeRemoteHost.ts:186` (cognitive 1). `fallow health` runs with
   `coverage_model: static_estimated`, and these functions fail only on CRAP.
4. **Audit attribution artifacts.** These are true clones, kept on their own merits.
   Their base reasons say the diff-attributed audit charged pre-existing clones to
   unrelated edits: the 9 story files, plus `button.tsx`, `Chalk.browser.ts`,
   `AnnotatedTextGraph.ts` and `Session.model.ts`.

## #1910 fixes

| Item | Disposition |
| --- | --- |
| 1. `.claude/skills/quality-review-fix-loop/SKILL.md:53` | Already fixed on this base by `426d494b34` (#1928): the checklist names `apps/architecture-lab-proof/test/`. Verified, no edit. |
| 2. `.patterns/error-handling.md:92`, `S.Defect()` stacks | #1928 switched all four cause fields to `S.Defect({ includeStack: true })`. The installed `Schema.d.ts` (`Defect(options?: ErrorOptions)`) documents `{ includeStack: true }` as the option that keeps string stacks in encoded errors. This PR adds an inline comment saying so, and changes the fence's `S.Number` fields to `S.Finite` and its truthy `this.cause` test to `!== undefined`, so the fence passes the Effect language-service diagnostics. Runtime proof: encoding a `NetworkError` whose cause is `new Error("boom")` keeps `cause.stack`, and plain `S.Defect()` drops it (`{"includeStack":true,"defaultHasStack":false}`). |
| 3. `.patterns/error-handling.md:457`, retry predicate | #1928 made it the plain `(error): boolean => ...` predicate. Verified, no edit. |
| 4. `docs/agent-memory-infra/trustgraph-clone.md:61` | #1928 converted the inline citations. This PR converts the five remaining labels (the `capability-map.md:9-31` citation and the four "Sources read" entries) to links at `0044891dc9`. `git log --diff-filter=D -- goals/trustgraph-port/SPEC.md` names `cd7670d5d0` (#401) as the deletion, and its parent `0044891dc9` still contains `SPEC.md`, `PLAN.md`, `README.md` and `research/capability-map.md`. The banner names both commits. |

Fence proof: the NetworkError/SystemError fence (verbatim) and the `Effect.catchIf`
fence body, with a declared `operation` stand-in, type-check with zero errors.
The check used `tsc-rs` with the repo `tsconfig.base.json`, `noEmit`, and the Effect
language-service plugin active, in the scratch directory `.beep/fence-proof/`
(not committed).

## Verification

| Gate | Result |
| --- | --- |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0; introduced 0, inherited-adjacent 15 (non-blocking) |
| `bun run beep quality fallow dead-code --base origin/main --check` | exit 0; 0 findings |
| `bun run beep quality fallow health --base origin/main --check` | exit 0; 0 findings |
| `bunx turbo run check` for the 67 changed workspace packages (dependency dists built through `^build`) | 196/196 tasks successful |
| `bun run check:configs` (root `vitest.setup.ts`) | exit 0 |
| `@beep/repo-cli` corpus-command, corpus-preservation, corpus-provenance-index, jsdoc-migrate, yeet-watch-mode tests | 220/220 on Bun (`bunx --bun vitest`) and 220/220 on Node (`bunx vitest`) |
| Bun-shim consumers under Node (`research-daily`, `reviewer-bootstrap`, ai-metrics `ingest`) | 13/13 and 84/84 |
| `@beep/occt` tests | 80/80 on Bun and on Node |
| Biome on the 154 changed TypeScript files and `.patterns/error-handling.md` | clean after `biome format --write` on three files |
| oxlint (`--disable-nested-config`) on the changed TypeScript files | 0 errors; 1 inherited warning (`vitest.setup.ts:29`, unchanged line) |
| `bun run beep lint effect-vitest` | introduced=0 resolved=0 |
| `bun run lint:schema-first` | introduced=0, stale_entries=0 after the line rekey |
| `jsdoc:inventory:check` + `jsdoc:ratchet:check` | increased=0 |
| `bun run beep lint schema-catalog` | current |
| `bun run beep laws retired-effect-paths` | findings=0 |
| `bun run beep knowledge refs --check` | 0 live gated observations |
| `bun run beep sync-data-to-ts --target vocab-terms --check` | 0 of 1 targets drifted |
| `bun run beep goals doctor` | no new blocking findings |
| `bun run beep quality package-verify` | 67/67 run one at a time. `@beep/repo-cli` and `@beep/occt` ran the full verify (code changes); the 65 comment-only packages ran `--quick`. 66 pass. `@beep/repo-cli` docgen passes, but its audit fails on one test, `knowledge-doctor-evaluators` ("reads the same packets ... as the live filesystem"). That test compares `HEAD` packet manifests with the working tree, so this lane's uncommitted `ops/manifest.json` statusNote edit trips it. With the base manifest restored temporarily, the test passes (14/14). Attribution: environment-only (dirty tree); it clears once the change is committed. The audit log's TS2589 lines are synthetic `ci-lane` test fixture output, not builds. |

No changeset. The public exports of published packages are unchanged: the edits are
comments, private helpers and one private `hexOf` body.

## Per-directive dispositions (225)

Base lines are at `5ae6765125`. For kept directives, the reason column gives the
current line and the inline reason.

| Path | Base line | Directive | Disposition | Reason (kept: current line and inline reason) |
| --- | --- | --- | --- | --- |
| `vitest.setup.ts` | 184 | next-line complexity | kept | line 184: CRAP finding comes from fallow's static coverage estimate; the probe is a flat 13-way conjunction of function-property checks over the Bun shim API with cognitive 1. Owner: repo root (vitest.setup.ts). Exit: remove once fallow health reads the measured coverage for this file (#1855 detector frontier) or the branches collapse. |
| `vitest.setup.ts` | 219 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `vitest.setup.ts` | 273 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `vitest.setup.ts` | 311 | next-line complexity | fixed | `requestHeaders` split: header append moved to `appendRequestHeader` |
| `vitest.setup.ts` | 346 | next-line complexity | fixed | Fetch request building moved to `toFetchRequest`, with a shared `errorMessage` |
| `vitest.setup.ts` | 410 | next-line complexity | fixed | `parseJsonlChunk` uses the shared `errorMessage` helper |
| `vitest.setup.ts` | 494 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `vitest.setup.ts` | 506 | next-line complexity | kept | line 509: recursive walker keeps Bun.Glob's dotfile, symlink, directory and file semantics in one traversal (cognitive 26). Owner: repo root (vitest.setup.ts). Exit: delete with the Bun shim when Vitest runs these suites on Bun natively. |
| `infra/src/CiTurboCache.ts` | 57 | next-line code-duplication | kept | line 57: each infra stack module owns its AWS schemas under its own file-local identity. Owner: @beep/infra. Exit: move the shared bucket-name schema into one infra schema module when a third stack needs it. |
| `infra/src/CiTurboCache.ts` | 73 | next-line code-duplication | kept | line 73: each infra stack module owns its AWS schemas under its own file-local identity. Owner: @beep/infra. Exit: move the shared schema into one infra schema module when a third stack needs it. |
| `apps/labs/semantica/test/helpers/EyeOracleChild.ts` | 1 | file unused-file | kept | line 1: tests spawn this EYE oracle child process by file path, so no import reaches it. Owner: @beep/semantica. Exit: remove when the oracle runs in-process or fallow learns spawned entries. |
| `apps/oip-web/src/content/OipContent.model.ts` | 101 | next-line unused-type | kept | line 101: the schema-annotation policy requires the type companion although only the ReviewStatus value is consumed. Owner: @beep/oip-web. Exit: remove when the policy stops requiring a type alias per schema value or a consumer imports the type. |
| `apps/oip-web/src/content/OipContent.model.ts` | 364 | next-line unused-export | kept | line 364: nested public content schema is consumed through HeroContent rather than imported directly. Owner: @beep/oip-web. Exit: remove when a consumer imports HeroClip or the hero clip stops being a public contract. |
| `apps/labs/semantica/test/helpers/CrashProbeChild.ts` | 1 | file unused-file | kept | line 1: tests spawn this crash-probe child process by file path, so no import reaches it. Owner: @beep/semantica. Exit: remove when the probe runs in-process or fallow learns spawned entries. |
| `apps/oip-web/src/components/MattersCarousel.tsx` | 7 | file unused-file | kept | line 7: the carousel is unmounted while the selected-matters review gate is closed and is kept for re-enable. Owner: @beep/oip-web. Exit: remove when OipHomePage mounts it again, or delete the file if the section is dropped. |
| `apps/storybook/.storybook/main.ts` | 36 | next-line code-duplication | kept | line 36: the Lexical prod-module strip plugin is copied into both Vite composition roots (professional-desktop is the other). Owner: @beep/storybook. Exit: import it from a shared Vite tooling module once one exists, or delete when Lexical ships fixed pure annotations. |
| `apps/storybook/.storybook/main.ts` | 57 | next-line code-duplication | kept | line 57: the `.ts`-to-`.tsx` resolver is copied into both Vite composition roots (professional-desktop is the other). Owner: @beep/storybook. Exit: import it from a shared Vite tooling module once one exists, or delete when Vite applies the TypeScript source fallback. |
| `apps/oip-web/src/app/sw.ts` | 1 | file unused-file | kept | line 1: Serwist compiles this service-worker entry outside the app import graph. Owner: @beep/oip-web. Exit: remove when fallow's Next plugin recognizes Serwist service-worker entries. |
| `apps/professional-desktop/vite.config.ts` | 28 | next-line code-duplication | kept | line 28: the `.ts`-to-`.tsx` resolver is copied into both Vite composition roots (Storybook is the other). Owner: @beep/professional-desktop. Exit: import it from a shared Vite tooling module once one exists, or delete when Vite applies the TypeScript source fallback. |
| `apps/labs/ciops/src/main.ts` | 11 | next-line code-duplication | kept | line 11: labs scaffold bootstrap is intentionally identical to apps/labs/api-docs. Owner: @beep/ciops. Exit: replace with a shared labs launcher when the lab graduates. |
| `apps/labs/ciops/src/projection/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/ciops. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `apps/labs/semantica/src/schema/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/semantica. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `apps/professional-desktop/test/setup.dom.ts` | 14 | next-line code-duplication | kept | line 14: jsdom matchMedia shim repeats the browser setup that sibling UI test setups need. Owner: @beep/professional-desktop. Exit: import a shared DOM test setup from @beep/test-utils once it provides one. |
| `apps/labs/ciops/src/Api.ts` | 14 | next-line code-duplication | kept | line 14: labs health-endpoint scaffold intentionally mirrors apps/labs/api-docs. Owner: @beep/ciops. Exit: replace with a shared labs health endpoint when the lab graduates. |
| `apps/labs/semantica/scripts/generate-g-entailment.ts` | 1 | file unused-file | kept | line 1: package script run directly with Bun, outside the import graph. Owner: @beep/semantica. Exit: remove when the generator moves into a repo-cli command or the package declares it as a fallow entry. |
| `apps/professional-desktop/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/professional-desktop. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `apps/labs/semantica/src/canary/RuntimeProbeChild.ts` | 1 | file unused-file | kept | line 1: the C2 canary spawns this runtime probe child by file path, so no import reaches it. Owner: @beep/semantica. Exit: remove when the probe runs in-process or fallow learns spawned entries. |
| `apps/professional-desktop/src/sync/VaultSyncPanel.tsx` | 295 | next-line complexity | kept | line 295: fallow's React model adds one cognitive point per hook binding; cognitive 15 comes from six atom-hook bindings plus the status and panel-state conditionals, so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/professional-desktop. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `apps/practice-kg-mcp/src/smoke.ts` | 240 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `apps/professional-desktop/src/chat/ui/ThemeToggle.tsx` | 47 | next-line code-duplication | kept | line 47: sun glyph mirrors the oip-web theme toggle. Owner: @beep/professional-desktop. Exit: replace both copies with a shared @beep/ui icon. |
| `apps/professional-desktop/src/App.tsx` | 720 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `apps/labs/lejeune-bolt-workbench/src/domain/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/lejeune-bolt-workbench. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/workspace/server/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/workspace-server. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/tooling/tool/cli/test/yeet-watch-mode.test.ts` | 222 | next-line complexity | kept | line 222: scripted command router keeps independent per-family poll cursors in one fixture. Owner: @beep/repo-cli. Exit: split per command family when the router gains another family. |
| `packages/tooling/tool/cli/src/internal/schema/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/repo-cli. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/tooling/tool/cli/test/yeet-settle.test.ts` | 1010 | next-line complexity | kept | line 1010: fixture routes the git and GitHub command families to fixed census responses (cognitive 9). Owner: @beep/repo-cli. Exit: replace with a table-driven command fixture from the shared repo-run test kit once one exists. |
| `packages/foundation/ui-system/ui/stories/components/table.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/select.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/resizable.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/navigation-menu.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/hover-card.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/dialog.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/conversation.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/command.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/foundation/ui-system/ui/stories/components/collapsible.stories.tsx` | 1 | file code-duplication | kept | line 1: Storybook story variants repeat the canonical markup on purpose so the docs panel shows each story's own source; shared render helpers would hide that usage. Owner: @beep/ui. Exit: remove when the docs panel can render a shared helper's source, or when a variant stops being a teaching copy. |
| `packages/tooling/tool/cli/src/commands/Yeet/internal/WatchMode.ts` | 307 | next-line complexity | fixed | cursor and author checks moved to `nextReviewThreadsCursor` and `pullRequestAuthorLogin` |
| `packages/tooling/tool/cli/src/commands/Yeet/internal/WatchMode.ts` | 964 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/internal/process/StepExec.ts` | 635 | next-line complexity | kept | line 635: CRAP finding comes from fallow's static coverage estimate; the fail-closed admission binding keeps explicit and inherited identities in one check with cognitive 7. Owner: @beep/repo-cli. Exit: remove once fallow health reads the measured coverage for this file (#1855 detector frontier) or the branches collapse. |
| `packages/tooling/tool/cli/src/commands/Yeet/internal/Status.ts` | 1033 | next-line complexity | kept | line 1033: GraphQL cursor and page validity checks form one pagination loop (cognitive 14). Owner: @beep/repo-cli. Exit: move onto the internal/github `ghGraphqlPage` and `nextCursor` helpers that Reply uses. |
| `packages/tooling/tool/cli/src/commands/Yeet/internal/Reply.ts` | 992 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/ui/src/components/button.tsx` | 7 | next-line code-duplication | kept | line 7: jsdoc-carrier migration rewrote only comment carriers, so the audit attributes this pre-existing twin as introduced; button and ui/button share the CVA variant tables. Owner: @beep/ui. Exit: delete one button module once consumers import a single variant table. |
| `packages/foundation/ui-system/editor/src/chat/chat-composer.tsx` | 197 | next-line complexity | kept | line 197: fallow's React model adds one cognitive point per hook binding; cognitive 12 comes from five hook bindings plus the streaming and attachment conditionals, so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/editor. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `packages/foundation/ui-system/editor/src/chat/chat-composer.tsx` | 402 | next-line complexity | kept | line 402: fallow's React model adds one cognitive point per hook binding; cognitive 14 comes from 15 props and three hook bindings with cyclomatic 1, so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/editor. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `packages/foundation/ui-system/editor/src/chat/chat-composer.tsx` | 559 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/editor/src/chat/atoms.ts` | 768 | next-line complexity | kept | line 768: the Enter handler orders visible-menu and IME, code-block, newline and send ownership (cognitive 11). Owner: @beep/editor. Exit: split when the composer keymap moves to a Lexical command priority table. |
| `packages/tooling/library/qa-capture/src/witness/witness.iife.ts` | 192 | next-line complexity | kept | line 192: browser IIFE bundled by Bun.build; its helpers cannot hoist to module scope without breaking the single-IIFE bundle. Owner: @beep/qa-capture. Exit: remove when the witness bundles as an ES module. |
| `packages/tooling/library/qa-capture/src/witness/witness.iife.ts` | 309 | next-line complexity | kept | line 309: CRAP finding comes from fallow's static coverage estimate; the selector-priority ladder's order is the contract, and live capture rounds exercise it rather than Node unit tests. Owner: @beep/qa-capture. Exit: remove once fallow health reads the measured coverage for this file (#1855 detector frontier) or the branches collapse. |
| `packages/foundation/ui-system/dock/src/internal/Reducer.ts` | 333 | next-line complexity | kept | line 333: activation coordinates selection, visibility, maximization and events atomically (cognitive 11). Owner: @beep/dock. Exit: split when dock events derive from a state diff instead of per-command emission. |
| `packages/foundation/ui-system/dock/src/internal/Reducer.ts` | 369 | next-line code-duplication | kept | line 369: activation rebuilds the workspace after replacing the target tabs, like the other tab transitions. Owner: @beep/dock. Exit: share one replace-tabs-and-rebuild helper once a third transition needs it. |
| `packages/foundation/ui-system/dock/src/internal/Reducer.ts` | 508 | next-line code-duplication | kept | line 508: hiding the maximized group clears maximization while preserving other state, like the close transition. Owner: @beep/dock. Exit: share one clear-maximization helper once a third transition needs it. |
| `packages/foundation/ui-system/dock/src/internal/Reducer.ts` | 697 | next-line code-duplication | kept | line 697: docking rebuilds the floating source tree while preserving its box, like floating-group removal. Owner: @beep/dock. Exit: share one rebuild-with-box helper once a third transition needs it. |
| `packages/foundation/ui-system/dock/src/internal/Reducer.ts` | 866 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/library/mcpb-kit/src/internal/steps.ts` | 173 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/library/mcpb-kit/src/McpbKit.package.ts` | 152 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/dock/src/Dock.models-tree.ts` | 1417 | next-line code-duplication | kept | line 1417: floating-group removal rebuilds its tree while preserving its box, like the docking transition. Owner: @beep/dock. Exit: share one rebuild-with-box helper once a third transition needs it. |
| `packages/tooling/tool/cli/src/commands/Worktree/Fleet.service.ts` | 135 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/library/ai-sync/src/generator.ts` | 382 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/dock-react/src/internal/GroupPane.tsx` | 84 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/dock-react/src/internal/GroupPane.tsx` | 227 | next-line code-duplication | kept | line 226: pointer-down captures the drag snapshot for its paired move handler, like the floating pane. Owner: @beep/dock-react. Exit: share one drag-snapshot hook once a third pane needs it. |
| `packages/foundation/ui-system/dock-react/src/internal/GroupPane.tsx` | 237 | next-line code-duplication | kept | line 236: listener registration and its teardown must name the same closures inline so removeEventListener matches them. Owner: @beep/dock-react. Exit: replace with an atom-owned listener scope that releases its own listeners. |
| `packages/foundation/ui-system/dock-react/src/internal/GroupPane.tsx` | 297 | next-line complexity | kept | line 296: fallow's React model adds one cognitive point per hook binding; cognitive 11 comes from 11 hook bindings with cyclomatic 1, so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/dock-react. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `packages/foundation/ui-system/dock-react/src/internal/GroupPane.tsx` | 520 | next-line complexity | kept | line 519: cognitive 14 comes from branching over tab and box options and the floating variants. Owner: @beep/dock-react. Exit: split the floating variant into its own component when its options diverge further. |
| `packages/foundation/ui-system/dock-react/src/internal/FloatingPane.tsx` | 79 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/ui-system/dock-react/src/internal/FloatingPane.tsx` | 143 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.plan.ts` | 144 | next-line code-duplication | kept | line 144: config-updater helper twin of the CreatePackage/TsconfigSync copy, converged after the tstyche removal and the JSDoc grammar migration. Owner: @beep/repo-cli. Exit: consolidate both onto `@beep/repo-utils` (workspaceGlobsFrom/readPackageJsonFile) and delete the twins. |
| `packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.plan.ts` | 196 | next-line code-duplication | kept | line 196: config-updater helper twin of the CreatePackage/TsconfigSync copy, converged after the tstyche removal and the JSDoc grammar migration. Owner: @beep/repo-cli. Exit: consolidate both onto `@beep/repo-utils` (workspaceGlobsFrom/readPackageJsonFile) and delete the twins. |
| `packages/tooling/tool/cli/src/commands/SyncDataToTs/targets/VocabTerms.ts` | 110 | next-line code-duplication | kept (generator) | line 110: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/tooling/tool/cli/test/proof-job.test.ts` | 1741 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/library/ai-metrics/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/repo-ai-metrics. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/shared/domain/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/shared-domain. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/ontology/use-cases/src/aggregates/Session/Session.sparql.ts` | 442 | next-line complexity | kept | line 442: lexical scan separates a top-level LIMIT from comments, literals and subqueries (cognitive 32). Owner: @beep/ontology-use-cases. Exit: replace with a SPARQL parser once the ontology slice adopts one. |
| `packages/ontology/ui/src/aggregates/Session/Session.inspector.tsx` | 79 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/ontology/ui/src/aggregates/Session/Session.document.tsx` | 113 | next-line complexity | kept | line 113: fallow's React model adds one cognitive point per hook binding; the toolbar region binds document actions, view controls, dirty state and errors (cognitive 24, cyclomatic 2), so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/ontology-ui. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/TurboConfigProof.ts` | 456 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Quality/internal/QualityArtifactSupport.ts` | 377 | next-line complexity | kept | line 377: the segment and candidate double loop mirrors the workspace-glob grammar (cognitive 28). Owner: @beep/repo-cli. Exit: replace with effect/FileSystem glob support or the repo-utils workspace glob helper. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/QualityArtifactSupport.ts` | 573 | next-line complexity | kept | line 573: path-safe walk keeps canonicalization, cycle, exclusion and suffix gates together (cognitive 20). Owner: @beep/repo-cli. Exit: split when a shared path-safe walker exists in repo-utils. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/PackageVerify.ts` | 228 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocMigrateRewrite.ts` | 94 | next-line complexity | fixed | per-line fence state moved to `advanceFenceBody` |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocMigrateRewrite.ts` | 570 | next-line complexity | kept | line 576: one auditable rewrite pipeline (consume carriers, split the lead, normalize tags, reassemble, prove conservation). Owner: @beep/repo-cli. Exit: delete with the jsdoc migrate command once the JSDoc grammar migration is retired. |
| `packages/ontology/domain/src/aggregates/Session/Session.model.ts` | 290 | next-line code-duplication | kept | line 290: jsdoc-carrier migration rewrote only comment carriers, so the audit attributes this pre-existing twin as introduced; the domain Session and the use-cases ports both default PrefixMap to empty. Owner: @beep/ontology-domain. Exit: share one empty PrefixMap default from the domain once use-cases may import it. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocMigrateApply.ts` | 595 | next-line complexity | kept | line 595: the apply pipeline follows the migration SPEC section 5 order (bind, rewrite, quarantine, write, format) as one sequence. Owner: @beep/repo-cli. Exit: delete with the jsdoc migrate command once the JSDoc grammar migration is retired. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocMigrateApply.ts` | 782 | next-line complexity | kept | line 782: the verify decision tree mirrors the migration SPEC section 7 matrix case by case. Owner: @beep/repo-cli. Exit: delete with the jsdoc migrate command once the JSDoc grammar migration is retired. |
| `packages/tooling/tool/cli/src/commands/Quality/internal/JSDocDocumentationInventory.ts` | 403 | next-line complexity | kept | line 403: flat pass keeps the documented section-order state machine in one rule boundary (cognitive 52). Owner: @beep/repo-cli. Exit: split into per-section rules when the JSDoc inventory moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` | 1149 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` | 1154 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts` | 2150 | next-line complexity | kept | line 2148: each chunk must fold reuse, journal, red and proof state in order (cognitive 16). Owner: @beep/repo-cli. Exit: split once the GitHub check wave state moves into a schema-backed reducer. |
| `packages/law-practice/use-cases/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/law-practice-use-cases. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/tooling/tool/cli/src/commands/Quality/FallowQuality.command.ts` | 781 | next-line code-duplication | kept | line 781: raw-count dispatch mirrors the normalizer match for each fallow output shape. Owner: @beep/repo-cli. Exit: derive the count from the normalizer table when fallow output shapes share one summary field. |
| `packages/tooling/tool/cli/src/commands/Qa/Qa.session.ts` | 381 | next-line code-duplication | kept | line 381: two public round resolvers share a signature; the decode branch is already extracted to roundOrDiscovered. Owner: @beep/repo-cli. Exit: merge the two public resolvers when their callers can share one API. |
| `packages/tooling/tool/cli/src/commands/Laws/Laws.command.ts` | 289 | next-line complexity | kept | line 289: CLI adapter keeps flag validation, JSON and text rendering, and exit semantics in one command transaction covered by fixtures. Owner: @beep/repo-cli. Exit: split once laws output rendering moves to a shared report renderer. |
| `packages/tooling/tool/cli/src/commands/Qa/JudgePack.ts` | 804 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Qa/JudgeIngest.ts` | 172 | next-line code-duplication | kept | line 172: every `beep qa` subcommand repeats this service-acquisition and round-layout prologue with its own error wording. Owner: @beep/repo-cli. Exit: extract a shared Qa round-layout prologue once a third caller needs different wording rules. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 486 | next-line complexity | kept | line 486: one export-graph traversal validates workspace and publish routes together; ambiguity and missing-route fixtures cover each branch. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 827 | next-line complexity | kept | line 827: ts-morph syntax matrix preserves aliases, type-only bindings, namespaces and manual-review reasons; fixtures cover each branch. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1080 | next-line complexity | kept | line 1080: atomic ts-morph merge matrix preserves default, namespace, named-import and trivia semantics; collision fixtures cover each branch. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1154 | next-line complexity | kept | line 1154: ts-morph export matrix preserves aliases, namespaces, stars, type-only bindings and review reasons; fixtures cover each branch. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1184 | next-line code-duplication | kept | line 1184: named import and export planners mirror syntax-specific alias and manual-review semantics. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1259 | next-line complexity | kept | line 1259: closed syntax census keeps dynamic import, require, import-type and import-equals findings in one review ledger. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1354 | next-line complexity | kept | line 1354: counter mirrors the closed unsupported-syntax census so measured totals and review detection cannot drift. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1407 | next-line complexity | kept | line 1407: one source transaction preserves shebang and trivia while rewriting import and export declarations atomically. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1632 | next-line complexity | kept | line 1632: CRAP finding comes from fallow's static coverage estimate; the policy predicate keeps exclusion, scope, candidate, documentation and family-promotion gates together with cognitive 7. Owner: @beep/repo-cli. Exit: remove once fallow health reads the measured coverage for this file (#1855 detector frontier) or the branches collapse. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1680 | next-line complexity | kept | line 1680: one command transaction coordinates the inert ratchet, three corpus modes, persistence and the strict verdict behind one summary schema. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1832 | next-line code-duplication | kept | line 1832: executable and fenced-source scans fold the same public counters into one summary ledger. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/EffectImports.ts` | 1846 | next-line code-duplication | kept | line 1846: Markdown-file and JSDoc walkers keep distinct persistence ownership while folding the same fence-summary schema. Owner: @beep/repo-cli. Exit: split the matrix by syntax kind when another import form is supported, or retire it if the law moves to a Biome GritQL rule. |
| `packages/tooling/tool/cli/src/commands/Laws/AllowlistCheck.ts` | 104 | next-line code-duplication | kept | line 104: each laws allowlist check keeps a command-local document schema. Owner: @beep/repo-cli. Exit: share one allowlist document schema when the allowlist formats converge. |
| `packages/tooling/tool/cli/src/commands/Qa/Extract.ts` | 816 | next-line code-duplication | kept | line 816: every `beep qa` subcommand repeats this service-acquisition and round-layout prologue with its own error wording. Owner: @beep/repo-cli. Exit: extract a shared Qa round-layout prologue once a third caller needs different wording rules. |
| `packages/tooling/tool/cli/src/commands/Qa/Extract.ts` | 825 | next-line code-duplication | kept | line 825: every `beep qa` subcommand repeats this service-acquisition and round-layout prologue with its own error wording. Owner: @beep/repo-cli. Exit: extract a shared Qa round-layout prologue once a third caller needs different wording rules. |
| `packages/law-practice/server/test/DocketIntake.fixture.ts` | 26 | next-line code-duplication | kept | line 26: test-only Linux-shaped memory file system; the app test support has the same layer and neither may import the other's test files. Owner: @beep/law-practice-server. Exit: import it from @beep/test-utils once it ships a memory FileSystem layer. |
| `packages/law-practice/server/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/law-practice-server. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/tooling/tool/cli/src/commands/Explore/Atlas.ts` | 434 | next-line complexity | kept | line 434: the pass tracks generated markers while preserving authored status prose (cognitive 15). Owner: @beep/repo-cli. Exit: split when README status moves to a schema-backed frontmatter field. |
| `packages/tooling/tool/cli/src/commands/Explore/Atlas.ts` | 536 | next-line complexity | kept | line 536: every stream defect must land in one validation ledger before projection (cognitive 11). Owner: @beep/repo-cli. Exit: split when the stream file gains a schema decoder that reports defects itself. |
| `packages/tooling/tool/cli/src/commands/Explore/Atlas.ts` | 621 | next-line complexity | kept | line 621: each packet is read, validated and projected as one ordered transaction (cognitive 20). Owner: @beep/repo-cli. Exit: split when the atlas projection moves to a schema-backed packet decoder. |
| `packages/tooling/tool/cli/src/commands/CreatePackage/CreatePackage.command.ts` | 897 | next-line code-duplication | kept | line 897: config-updater helper twin of the CreatePackage/TsconfigSync copy, converged after the tstyche removal and the JSDoc grammar migration. Owner: @beep/repo-cli. Exit: consolidate both onto `@beep/repo-utils` (workspaceGlobsFrom/readPackageJsonFile) and delete the twins. |
| `packages/tooling/tool/cli/src/commands/CreatePackage/CreatePackage.command.ts` | 1213 | next-line complexity | kept | line 1213: legacy scaffold handler keeps flag validation and file planning in one transaction (cognitive 92). Owner: @beep/repo-cli. Exit: remove when create-package moves to the operation-plan executor. |
| `packages/tooling/tool/cli/src/commands/CreatePackage/ConfigUpdater.ts` | 226 | next-line code-duplication | kept | line 226: config-updater helper twin of the CreatePackage/TsconfigSync copy, converged after the tstyche removal and the JSDoc grammar migration. Owner: @beep/repo-cli. Exit: consolidate both onto `@beep/repo-utils` (workspaceGlobsFrom/readPackageJsonFile) and delete the twins. |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 896 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 1633 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 2419 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3001 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3071 | next-line complexity | fixed | nested ternary became a `Match.value` precedence table |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3091 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3147 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3276 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3320 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3446 | next-line complexity | fixed | two scan loops share one `noteMatches` helper |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3480 | next-line complexity | fixed | index loops moved to `familyByDigestOf` and `indexFamiliesByTextName` |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3535 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/tooling/tool/cli/src/commands/Corpus/internal/ServicePrograms.ts` | 3668 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `scratchpad/effect-ontology/Schema/PosInt.ts` | 14 | file code-duplication | stale | fallow reports nothing here with the directive removed (the path is in fallow `ignorePatterns`) |
| `packages/tooling/tool/cli/src/commands/Corpus/Corpus.command.ts` | 401 | next-line complexity | fixed | ten Option spread ternaries use the existing `optionalProp` helper |
| `packages/tooling/tool/cli/src/commands/Corpus/Corpus.command.ts` | 519 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/architecture-lab/use-cases/src/entities/Worker/Worker.repository.ts` | 156 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/architecture-lab/use-cases/src/entities/Worker/Worker.errors.ts` | 162 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.repository.ts` | 152 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/architecture-lab/use-cases/src/aggregates/WorkItem/WorkItem.errors.ts` | 204 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/capability/langextract/src/VerifiedSpan/VerifiedSpan.model.ts` | 559 | next-line code-duplication | kept | line 559: consumer-local copy of the retired `@beep/schema` ISOStr wire; langextract has no dependency on @beep/skill-contract, which owns the other copy. Owner: @beep/langextract. Exit: import upstream when effect/Schema ships a verbatim ISO date-time string schema. |
| `packages/foundation/capability/technical-drawing/src/TechnicalDrawing.errors.ts` | 66 | next-line code-duplication | kept | line 66: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/technical-drawing. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/foundation/capability/file-processing/src/test.ts` | 92 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/capability/file-processing/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/file-processing. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/agents/use-cases/src/entities/ProviderInstance/ProviderInstance.errors.ts` | 153 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/capability/chalk/src/Chalk.browser.ts` | 58 | next-line code-duplication | kept | line 58: jsdoc-carrier migration rewrote only comment carriers, so the audit attributes this pre-existing twin as introduced; the browser and node chalk surfaces share the public model re-export block. Owner: @beep/chalk. Exit: re-export the block from one shared module once both entry points can import it. |
| `packages/agents/server/src/AssistantTurn/ScanState.ts` | 233 | next-line complexity | stale | fallow reports nothing here with the directive removed |
| `packages/epistemic/use-cases/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/epistemic-use-cases. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/foundation/modeling/schema/src/SafeRemoteHost.ts` | 186 | next-line complexity | kept | line 186: CRAP finding comes from fallow's static coverage estimate; flat SSRF checks keep each blocked network class independently auditable with cognitive 1. Owner: @beep/schema. Exit: remove once fallow health reads the measured coverage for this file (#1855 detector frontier) or the branches collapse. |
| `packages/foundation/modeling/schema/src/SafeRemoteHost.ts` | 191 | next-line code-duplication | kept | line 191: the SSRF blocklist mirrors nlp-mcp DatasetLoader so each security boundary audits independently. Owner: @beep/schema. Exit: have DatasetLoader import SafeRemoteHost, then delete both directives. |
| `packages/foundation/modeling/lexical/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/lexical-schema. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/epistemic/server/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/epistemic-server. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/foundation/capability/nlp-processing/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/nlp-processing. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/foundation/capability/nlp-processing/src/Graph/AnnotatedTextGraph.ts` | 276 | next-line code-duplication | kept | line 276: jsdoc-carrier migration rewrote only comment carriers, so the audit attributes this pre-existing twin as introduced; AnnotatedTextGraph and TextGraph share node construction. Owner: @beep/nlp-processing. Exit: extract one node constructor once both graphs share a node schema. |
| `packages/epistemic/domain/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/epistemic-domain. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/law-practice/domain/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/law-practice-domain. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/Skos.terms.ts` | 40 | next-line code-duplication | kept (generator) | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/SchemaOrg.terms.ts` | 40 | next-line code-duplication | kept (generator) | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/Rdfs.terms.ts` | 40 | next-line code-duplication | kept (generator) | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/foundation/modeling/rdf/src/Uri.ts` | 92 | next-line code-duplication | kept | line 92: URI and IRI reference checks share one shape but keep separate identities and messages. Owner: @beep/rdf. Exit: derive both from one parameterized check factory if a third reference kind is added. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/Rdf.terms.ts` | 40 | next-line code-duplication | kept (generator) | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/drivers/onepassword-cli/src/OnePasswordCli.service.ts` | 71 | next-line code-duplication | kept | line 71: the process-hardening spec keeps stdout/stderr ownership inside each driver, so sibling drivers repeat the spawn options. Owner: @beep/onepassword-cli. Exit: import a shared spawn helper once a foundation capability package owns process hardening. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/Owl.terms.ts` | 40 | next-line code-duplication | kept (generator) | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/foundation/modeling/rdf/src/Vocab/generated/Dcterms.terms.ts` | 40 | next-line code-duplication | kept | line 40: generator-emitted vocabulary tuple; beep sync-data-to-ts --target vocab-terms writes this directive into every terms file, and only the dcterms tuple currently clones the identity CoreVocab list. Owner: @beep/repo-cli (vocab-terms target). Exit: drop it from the generator template and regenerate once the terms derive from @beep/identity CoreVocab instead of a copy. |
| `packages/ecosystem/effect-drizzle/src/sqlite/table.ts` | 9 | file code-duplication | kept | line 9: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/foundation/modeling/pandoc-ast/src/Pandoc.model.ts` | 2082 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/modeling/pandoc-ast/src/Pandoc.model.ts` | 3615 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/foundation/modeling/pandoc-ast/src/Pandoc.model.ts` | 4046 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/ecosystem/effect-drizzle/src/sqlite/schema.ts` | 10 | file code-duplication | kept | line 10: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/model.ts` | 9 | file code-duplication | kept | line 9: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/kit.ts` | 6 | file code-duplication | kept | line 6: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/extras.ts` | 9 | file code-duplication | kept | line 9: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/derive.ts` | 6 | file code-duplication | kept | line 6: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/combinators.ts` | 10 | file code-duplication | kept | line 10: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/sqlite/Column.ts` | 7 | file code-duplication | kept | line 7: pg and sqlite are deliberately mirrored dialect implementations; shared logic already lives in src/core and the rest is per-dialect vocabulary that evolves independently (doc 14 family). Owner: @beep/effect-drizzle. Exit: lift the mirrored block into src/core when a third dialect lands or the two vocabularies converge. |
| `packages/ecosystem/effect-drizzle/src/pg/table.ts` | 19 | file code-duplication | kept | line 19: unique-constraint naming mirrors pg/schema.ts so table-local and assembly-level extras render identical SQL names (doc 14 family). Owner: @beep/effect-drizzle. Exit: move the naming into src/core when sqlite needs the same rule. |
| `packages/drivers/occt/src/Occt.service.ts` | 61 | next-line code-duplication | fixed | hand-rolled hex digest replaced by `effect/encoding/Hex` `encode` |
| `packages/drivers/occt/src/Occt.errors.ts` | 57 | next-line code-duplication | kept | line 57: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/occt. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/ecosystem/effect-drizzle/src/pg/derive.ts` | 30 | file code-duplication | kept | line 30: collectMaxLengths and collectExactLengths are parallel dual-signature AST walkers over distinct check kinds (doc 14 family). Owner: @beep/effect-drizzle. Exit: share one walker spine when a third length check kind is added. |
| `packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts` | 489 | next-line code-duplication | kept | line 489: the SSRF blocklist mirrors @beep/schema SafeRemoteHost so each security boundary audits independently. Owner: @beep/nlp-mcp. Exit: import SafeRemoteHost from @beep/schema, then delete both directives. |
| `packages/ecosystem/effect-drizzle/src/pg/combinators.ts` | 14 | file code-duplication | kept | line 14: the varchar and char tri-mode combinators walk the same evolveSchemas seam over independent column vocabularies (doc 14 family). Owner: @beep/effect-drizzle. Exit: collapse into one combinator factory if the two vocabularies converge. |
| `packages/drivers/obs/src/Obs.models.ts` | 30 | next-line code-duplication | kept | line 30: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/obs. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/exiftool/src/Exiftool.service.ts` | 95 | next-line code-duplication | kept | line 95: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/exiftool/src/Exiftool.service.ts` | 103 | next-line code-duplication | kept | line 103: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/uspto-mcp/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/uspto-mcp. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/exiftool/src/Exiftool.models.ts` | 14 | next-line code-duplication | kept | line 14: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/exiftool/src/Exiftool.models.ts` | 34 | next-line code-duplication | kept | line 34: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/hubspot/src/HubSpot.errors.ts` | 230 | next-line code-duplication | kept | line 230: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/hubspot. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/exiftool/src/Exiftool.errors.ts` | 18 | next-line code-duplication | kept | line 18: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/exiftool/src/Exiftool.errors.ts` | 82 | next-line code-duplication | kept | line 82: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/exiftool. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/govinfo/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/govinfo. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/graph-3d/stories/graph3d.stories.tsx` | 54 | next-line complexity | kept | line 54: fallow's React model adds one cognitive point per hook binding; cognitive 12 comes from six state, memo and effect hook bindings in the demo story, so splitting would only fragment hook ownership (#1855 detector frontier). Owner: @beep/graph-3d. Exit: remove when the component sheds bindings or fallow stops counting hook bindings as branches. |
| `packages/drivers/tika/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/tika. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/poppler/src/internal/PosInt.ts` | 1 | file code-duplication | kept | line 1: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/poppler. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/govinfo/src/domain/contracts/Search/Search.contract.ts` | 219 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/poppler/src/Poppler.service.ts` | 7 | file code-duplication | kept | line 7: each process driver (tika, tesseract, poppler) owns its spawn-and-capture step; drivers do not depend on each other and no shared capture helper exists below repo-cli. Owner: @beep/poppler. Exit: import a foundation-level capture helper once one exists. |
| `packages/drivers/phoenix/src/Phoenix.errors.ts` | 229 | next-line code-duplication | kept | line 229: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/phoenix. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/m365/src/M365.errors.ts` | 323 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/m365/src/M365.errors.ts` | 328 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/tesseract/src/Tesseract.service.ts` | 7 | file code-duplication | kept | line 7: each process driver (tika, tesseract, poppler) owns its spawn-and-capture step; drivers do not depend on each other and no shared capture helper exists below repo-cli. Owner: @beep/tesseract. Exit: import a foundation-level capture helper once one exists. |
| `packages/drivers/openai-compat/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/openai-compat. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/sanity/src/Sanity.errors.ts` | 218 | next-line code-duplication | kept | line 218: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/sanity. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/sanity/src/Sanity.errors.ts` | 247 | next-line code-duplication | kept | line 247: Sanity cause normalization keeps provider-specific HTTP labels, mirroring sibling drivers. Owner: @beep/sanity. Exit: import a shared cause normalizer once a foundation capability package exports one. |
| `packages/drivers/openclaw/src/internal/spawn.ts` | 49 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/pdf-tools/src/PdfTools.service.ts` | 217 | next-line code-duplication | kept | line 217: driver-boundary idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/pdf-tools. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/openai/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/openai. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/drizzle/src/Drizzle.errors.ts` | 126 | next-line code-duplication | kept | line 126: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/drizzle. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/pdf-tools/src/PdfTools.errors.ts` | 56 | next-line code-duplication | kept | line 56: error-boundary cause-reflection idiom repeated across sibling drivers that must not depend on each other; no foundation capability owns it yet. Owner: @beep/pdf-tools. Exit: import it and delete this copy once a foundation capability package exports the idiom. |
| `packages/drivers/box/src/Box.errors.ts` | 643 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/anthropic/src/internal/PosInt.ts` | 14 | file code-duplication | kept | line 14: consumer-local PosInt composition replacing the retired `@beep/schema` export; the upstream-first ruling (standards/architecture/DECISIONS.md, 2026-09-29) forbids a shared helper. Owner: @beep/anthropic. Exit: delete this file and import upstream when effect/Schema ships a positive-integer schema, or when that ruling admits a shared export. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 313 | next-line code-duplication | kept | line 313: ffmpeg owns stream-to-text collection so output errors stay driver-local. Owner: @beep/ffmpeg. Exit: use effect/Stream text collection directly once it preserves the driver error channel. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 1652 | next-line code-duplication | kept | line 1652: intra-file twin: extractFrames and extractFramesAt encode and render their manifests the same way; each operation keeps its own FFmpegError operation tag and message. Owner: @beep/ffmpeg. Exit: extract one helper parameterized by operation name and message when another frame or clip operation is added. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 1733 | next-line code-duplication | kept | line 1733: intra-file twin: extractFrames and extractFramesAt commit the temporary manifest the same way; each operation keeps its own FFmpegError operation tag and message. Owner: @beep/ffmpeg. Exit: extract one helper parameterized by operation name and message when another frame or clip operation is added. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 2046 | next-line code-duplication | kept | line 2046: intra-file twin: extractFrames and extractFramesAt resolve the manifest path inside the output directory the same way; each operation keeps its own FFmpegError operation tag and message. Owner: @beep/ffmpeg. Exit: extract one helper parameterized by operation name and message when another frame or clip operation is added. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 2390 | next-line code-duplication | kept | line 2390: intra-file twin: extractClip, renderGif and writeContainerMetadata share the decode-and-resolve request prologue; each operation keeps its own FFmpegError operation tag and message. Owner: @beep/ffmpeg. Exit: extract one helper parameterized by operation name and message when another frame or clip operation is added. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 2426 | next-line code-duplication | kept | line 2426: intra-file twin: extractClip, renderGif and writeContainerMetadata share the decode-and-resolve request prologue; each operation keeps its own FFmpegError operation tag and message. Owner: @beep/ffmpeg. Exit: extract one helper parameterized by operation name and message when another frame or clip operation is added. |
| `packages/drivers/ffmpeg/src/FFmpeg.service.ts` | 2509 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/ai-provider-cli/src/AiProviderCli.service.ts` | 147 | next-line code-duplication | kept | line 147: the process-hardening spec keeps stdout/stderr ownership inside each driver, so sibling drivers repeat the spawn options. Owner: @beep/ai-provider-cli. Exit: import a shared spawn helper once a foundation capability package owns process hardening. |
| `packages/drivers/acp/src/Acp.errors.ts` | 1303 | next-line code-duplication | stale | fallow reports nothing here with the directive removed |
| `packages/drivers/acp/test/helpers.ts` | 58 | next-line code-duplication | kept | line 58: test transport stays independent from the package-internal process adapter so tests do not exercise the code under test. Owner: @beep/acp. Exit: remove if the internal adapter becomes a public test seam. |

## Reversal

Revert the PR. Every directive comes back with its base text. The ten fixed
functions, the occt digest, the `.patterns/error-handling.md` fence edits, the
trustgraph citations and the schema-first anchor (437 back to 431) return to their
`5ae6765125` content.
