# #1856 guidance wave 3: Markdown TypeScript fence compile gate and the upstream-copied `.patterns` decision

Lane `residue-guidance`, wave 3, branch `feat/residue-guidance-wave3` from `main` at
`599b553267` (waves 2a, 2b and 2c merged). Route: S39/S41 Claude chain, step 1
(`claude-opus-5-5` child) for the design, the law, its tests, the three `.patterns`
files and the packet. This is the final #1856 wave.

## Surface

The guidance surface follows the wave-1 classification, plus package and app READMEs
as the brief requires. Inclusion roots, all over git-tracked regular files (symlinks
such as the `CLAUDE.md` links to `AGENTS.md` count once, through their target):

| Root | Rule |
| --- | --- |
| `.patterns/**/*.md` | all |
| `standards/**/*.md` | all |
| `docs/**/*.md` | minus `docs/_internal/**` (private) and `docs/generated/**` |
| `.claude/skills/**/*.md` | minus the vendored skills `skills-lock.json` records (`shadcn`, `portless`, `oracle`, `grill-me`, `teach`, `turborepo`) |
| `.claude/agents/*.md`, `.codex/**/*.md` | all |
| `AGENTS.md`, `CLAUDE.md` | every regular file of that name |
| `packages/**/README.md`, `apps/**/README.md` | all |

Out of scope, never on the surface: `goals/`, `explorations/` and `research/`
(immutable history), `scratchpad/`, `vendor/` and `.repos/` (not guidance or not ours),
any `node_modules/` or `.claude/worktrees/` tree, and every `test/fixtures/` tree (test
inputs: the two vendored-vitest fixture READMEs under the repo-cli tests hold 26 fences).
Vendored skills are upstream-owned and digest-pinned, so their 84 fences are not ours to
edit. `.md` and `.mdx` both count; no `.mdx` file exists on the surface.

Fences inside a `<!-- docgen:api-reference:start -->` … `end` region are rendered by
docgen from source JSDoc, whose examples docgen's own example typecheck already compiles;
the region also holds docgen's `**Signature**` declaration blocks. Only
`packages/ecosystem/effect-drizzle/README.md` has such a region (590 of its 595 fences).

## Census

One method for before and after: the law's own fence collector and compiler. "Before"
replays it over `git show 599b553267:<file>` for every surface file of
`git ls-tree -r 599b553267`, in two compiles, because the compiler hides every semantic
diagnostic while any staged fence has a syntax error (12 syntax failures, then the rest).
"After" is `bun run beep laws markdown-fences --check` on the working tree.

| Area | Files with fences | Fences | Generated | Checked before | Failing before | Opt-outs after | Checked after | Failing after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `.claude/skills` (local) | 13 | 90 | 0 | 90 | 77 | 5 | 85 | 0 |
| `.patterns` | 5 | 64 | 0 | 64 | 54 | 6 | 58 | 0 |
| `standards` | 10 | 96 | 0 | 96 | 71 | 4 | 92 | 0 |
| package and app READMEs | 118 | 839 | 590 | 249 | 29 | 0 | 249 | 0 |
| `AGENTS.md`/`CLAUDE.md` | 1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 |
| `docs`, `.claude/agents`, `.codex` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **147** | **1090** | **590** | **500** | **231** | **15** | **485** | **0** |

Surface: 526 tracked files before and after; 147 hold a TypeScript fence. Checks:
1090 = 500 + 590; 500 = 485 + 15; 231 = 77 + 54 + 71 + 29 + 0; 147 = 13 + 5 + 10 + 118 + 1.
No fence was added or deleted by this wave, so its fence count is unchanged.

After review round 1 (#2135) the lane merged `main` at `e70bf22d9a`. That merge brought
two new fences in `packages/foundation/modeling/md/README.md` (#2121), both compiling, so
the current run reads 526 files, 147 with fences, 1092 fences, 487 checked, 15 opt-outs,
590 generated and 0 failing (1092 = 487 + 15 + 590). The base replay was re-run with the
round-1 end-of-file fix and compiles until a pass finds no new failure (3 passes); it
still finds 231 failing fences at `599b553267`, with the same per-file counts, and the
fixed gate caught no guidance fence on the current tree, so no fix or opt-out was added.

Reconciliation with wave 1's "324 fences": wave 1 counted `ts`, `tsx`, `typescript`,
`js`, `javascript` and `mts` fences on its own 342-file surface, which had no package
READMEs and included the vendored skills, and it did not distinguish nested fences. This
wave's surface and language set differ, so the two numbers are not comparable; the 1090
here is the single census every number in this receipt derives from.

## Checker design

Design order: schema, then service contract, then implementation.

- **Schemas** (`packages/tooling/tool/cli/src/commands/Laws/MarkdownFences.model.ts`):
  `MarkdownFenceLanguage` (`LiteralKit`: `ts`, `tsx`, `typescript`, `mts`, `cts`),
  `MarkdownFenceDisposition` (`checked`, `opt-out`, `generated`), `MarkdownFence` (path,
  1-based opening line, info string, language, body, disposition),
  `MarkdownFenceDiagnostic` (path, line, column, code, message), the check verdict
  `MarkdownFenceVerdict` (`S.TaggedUnion`: `passed`, `failed` with diagnostics,
  `skipped`), `MarkdownFencesOptions` (cwd, strictness, path prefix) and
  `MarkdownFencesSummary`. The staged project's tsconfig is a schema too
  (`FenceProjectConfig`), encoded through the package's `JsonStringCodec`.
- **Service** (`MarkdownFences.ts`): `MarkdownFenceTypechecker`, a `Context.Service` with
  one operation, `typecheck(repoRoot, fences)`, returning Markdown-mapped diagnostics or a
  typed `MarkdownFencesExecutionError` (`Laws.errors.ts`). Its live layer stages each
  fence as `fence-<n>.ts(x)` in a scoped temp directory under `.beep/`, writes a tsconfig
  that extends the root `tsconfig.json` (so its `paths` resolve `@beep/*` to package
  source and `effect/*` to the installed package, with no workspace build), overrides
  `files`, `include`, `composite`, `incremental`, `tsBuildInfoFile`, unused-local checks
  and `moduleDetection: force`, and switches the Effect language-service plugin's lint
  diagnostics off. It runs `node_modules/.bin/tsc-rs --noEmit --pretty false` once
  through the repo's `runCaptured` and removes the staging directory on exit. A
  nonzero exit with an error line that maps to no staged fence (a config or dependency
  error) is an execution error, never a silent pass.
- **Reuse**: the fence parser is the line-anchored, marker-run-exact pattern the schema
  tag idiom law already used; it moved to `Laws/internal/TypeScriptFences.ts`
  (`TypeScriptFence` schema plus `typescriptFences`), and `SchemaTagIdioms.ts` now reads
  fences through it. File listing reuses `scanTrackedTextFiles`; the vendored-skill set
  reuses the skills-lock reader; the opt-out token is docgen's existing
  `SKIP_TYPE_CHECKING_FENCE_METADATA` (`skip-type-checking`), imported from
  `@beep/repo-docgen/Core`, so JSDoc and Markdown share one convention.
- **Opt-out**: `skip-type-checking` must be a whole info-string word
  (`ts skip-type-checking`). A checked fence containing `@ts-ignore` or `@ts-nocheck`
  fails with a `fence-suppression` diagnostic; a negative example proves its failure with
  `@ts-expect-error` instead.
- **Command and lane**: `bun run beep laws markdown-fences [--check] [--json] [--path <prefix>]`,
  root script `lint:markdown-fences`, Turbo task `//#lint:markdown-fences` (`cache: false`:
  any workspace source edit can change a verdict), the `lint:markdown-fences` cheap-gate
  preflight lane in `GithubChecks.ts`, the `lint:policy:medium` task list in
  `Quality/Tasks.ts`, the Turbo config proof list, and a row in
  `docs/runbooks/turbo-cache-inputs.md`.
- **What "compiles" means**: tsc syntactic and semantic diagnostics, under the root
  compiler options (strict, `exactOptionalPropertyTypes`), with unused locals and
  parameters allowed. Each fence is its own module; no scope is shared between fences.

## Fixes

Fence repair ran in three parallel lanes on disjoint files, then one fix lane for the
first independent review; the three `.patterns` decision files were rewritten in this
session. Repairs, in priority order: missing imports with current leaf paths, current
Effect v4 and `@beep/*` APIs (verified against `node_modules/effect/dist/*.d.ts` and
package sources), small typed stubs (`declare const` or an inline schema) for symbols an
example assumes, `tsx` info strings for JSX, and `@ts-expect-error` on the failing line
of a deliberate negative example. No `@ts-ignore`, `@ts-nocheck`, `as any`, `any` type or
`as unknown as` was added (checked on the added lines of the diff).

| File | Failing before | Fixed | Opt-outs |
| --- | ---: | ---: | ---: |
| `.claude/skills/atom-reactivity-specialist/references/api-reference.md` | 13 | 12 | 1 |
| `.claude/skills/atom-reactivity-specialist/references/examples-antipatterns.md` | 10 | 10 | 0 |
| `.claude/skills/atom-reactivity-specialist/references/service-pattern.md` | 7 | 7 | 0 |
| `.claude/skills/crispen/references/crispening.md` | 6 | 2 | 4 |
| `.claude/skills/effect-first-development/references/always-never-core.md` | 8 | 8 | 0 |
| `.claude/skills/effect-first-development/references/observability-runtime.md` | 8 | 8 | 0 |
| `.claude/skills/effect-first-development/references/resilience-recovery.md` | 5 | 5 | 0 |
| `.claude/skills/jsdoc-annotation-specialist/references/annotation-patterns.md` | 8 | 8 | 0 |
| `.claude/skills/schema-first-development/references/local-primitives.md` | 4 | 4 | 0 |
| `.claude/skills/schema-first-development/references/pattern-catalog.md` | 1 | 1 | 0 |
| `.claude/skills/schema-first-development/references/repo-laws.md` | 7 | 7 | 0 |
| `.patterns/effect-library-development.md` | 12 | 12 | 0 |
| `.patterns/error-handling.md` | 15 | 15 | 0 |
| `.patterns/jsdoc-documentation.md` | 2 | 2 | 0 |
| `.patterns/module-organization.md` | 13 | 7 | 6 |
| `.patterns/testing-patterns.md` | 12 | 12 | 0 |
| `packages/drivers/commands/README.md` | 1 | 1 | 0 |
| `packages/drivers/ffmpeg/README.md` | 1 | 1 | 0 |
| `packages/drivers/github/README.md` | 2 | 2 | 0 |
| `packages/drivers/openai-compat/README.md` | 3 | 3 | 0 |
| `packages/drivers/pacer/README.md` | 1 | 1 | 0 |
| `packages/drivers/pretext/README.md` | 1 | 1 | 0 |
| `packages/drivers/runpod/README.md` | 1 | 1 | 0 |
| `packages/drivers/wink/README.md` | 1 | 1 | 0 |
| `packages/ecosystem/effect-drizzle/README.md` | 2 | 2 | 0 |
| `packages/foundation/capability/api-transport/README.md` | 1 | 1 | 0 |
| `packages/foundation/capability/mcp-kit/README.md` | 1 | 1 | 0 |
| `packages/foundation/modeling/jsonl/README.md` | 1 | 1 | 0 |
| `packages/foundation/ui-system/dock/README.md` | 1 | 1 | 0 |
| `packages/foundation/ui-system/editor/README.md` | 1 | 1 | 0 |
| `packages/tooling/library/ai-sync/README.md` | 1 | 1 | 0 |
| `packages/tooling/library/repo-utils/README.md` | 1 | 1 | 0 |
| `packages/tooling/test-kit/memfs/README.md` | 9 | 9 | 0 |
| `standards/ARCHITECTURE.md` | 7 | 7 | 0 |
| `standards/architecture/04-rich-domain-model.md` | 3 | 3 | 0 |
| `standards/architecture/05-layer-composition.md` | 4 | 2 | 2 |
| `standards/architecture/08-testing.md` | 6 | 4 | 2 |
| `standards/architecture/09-errors-across-boundaries.md` | 4 | 4 | 0 |
| `standards/architecture/12-observability.md` | 4 | 4 | 0 |
| `standards/effect-first-development.md` | 31 | 31 | 0 |
| `standards/schema-first-development-prompt.md` | 12 | 12 | 0 |
| **Total (41 files)** | **231** | **216** | **15** |

Check: 231 = 216 fixed + 15 opted out; every opt-out sits in a file that had failing fences.

Notable API currency fixes: `S.Defect()` (a function in v4), `S.fromJsonString(S.Unknown)`,
`PlatformError` narrowing through its real `reason`, `HttpClient` instead of native
`fetch`, `Pipeable.Class` instead of a prototype assertion, `S.Class` `.make`
constructors, Atom `Atom.modify`, and the effect-drizzle continuation fences, which now
repeat their kit setup so each compiles alone.

## Opt-outs (15, each reviewed)

| Fence | Reason |
| --- | --- |
| `.claude/skills/atom-reactivity-specialist/references/api-reference.md:117` | AtomContext cheat sheet: a placeholder `subscribe` body (`{ ... }`) and independent `get.*` calls show signatures, not one computation. |
| `.claude/skills/crispen/references/crispening.md:122` | Before/after excerpt of a heading family that elides its children schema and annotations with `...`; rebuilding the domain would change the abbreviated transformation it teaches. |
| `.claude/skills/crispen/references/crispening.md:143` | Bare schema-field excerpt (no containing struct) illustrating field defaults only. |
| `.claude/skills/crispen/references/crispening.md:154` | Bare schema-field excerpt illustrating one nullable property becoming an `Option` with its constructor default. |
| `.claude/skills/crispen/references/crispening.md:162` | Combinator excerpt that elides the segmentation algorithm, which is the subject of the example. |
| `.patterns/module-organization.md:134` | Verbatim upstream `packages/effect/src/index.ts` barrel excerpt; `./Function.ts` resolves only in the Effect tree. |
| `.patterns/module-organization.md:191` | Upstream module-file excerpt; its `./Cause.ts`-style imports are the point and resolve only in the Effect tree. |
| `.patterns/module-organization.md:239` | Upstream `internal/array.ts` excerpt with `../Function.ts` imports. |
| `.patterns/module-organization.md:439` | One `const TypeId` per upstream module, listed together; each line comes from a different module, so they redeclare one name by design. |
| `.patterns/module-organization.md:576` | Upstream file-extension rule shown with `./*.ts` imports. |
| `.patterns/module-organization.md:590` | Upstream import-organization excerpt with `./*.ts` and `./internal/*.ts` imports. |
| `standards/architecture/05-layer-composition.md:246` | The "God Layer" negative example: its `/internal/` imports of the illustrative `iam`/`billing` slices are the lesson, and those packages do not exist. |
| `standards/architecture/05-layer-composition.md:268` | The paired positive example: its canonical `/layer` imports are the lesson. |
| `standards/architecture/08-testing.md:58` | Domain test that must import the slice model under test; the illustrative `iam` package does not exist, and an inline copy would test the copy. |
| `standards/architecture/08-testing.md:235` | Fixture-import example: the two package imports are the lesson. |

## The three upstream-copied `.patterns` files

`.patterns/README.md` promised three labeled upstream references; the effect-first skill
links to `testing-patterns.md#specialized-option-result-and-exit-assertions`. Decisions
(SPEC Decision Log, 2026-10-23):

- **`testing-patterns.md`: rewritten for this repository.** Agents are routed to it, and
  its subject is how this repository tests. It defers to
  `standards/architecture/08-testing.md` for layering and runners, its examples declare
  their code under test inline instead of importing `../src/*.js`, and all 15 fences
  compile. The linked anchor is unchanged.
- **`effect-library-development.md`: rewritten for this repository.** The copy was already
  half-adapted (`$I`, `S.Opaque`, Biome and docgen commands), so the "upstream" label was
  inaccurate. It is now a companion to `standards/effect-first-development.md`; commands
  are the repo's, HTTP uses `effect/http/HttpClient`, and the `return yield*` rationale is
  corrected (a bare `yield*` failure already stops the generator; the rule keeps narrowing
  and intent visible). All 14 fences compile.
- **`module-organization.md`: kept as a labeled upstream reference.** It describes the
  Effect library's own source tree; the architecture standard owns this repository's
  module layout. Its scope section records the decision; the eight portable patterns
  compile against public modules, and the six upstream source excerpts are the opt-outs
  above. Its truncated JSDoc examples were repaired and use `**Example** (Title)`.

`.patterns/README.md` now lists one upstream reference, describes the two rewritten files
as repository guidance, and names the compile gate.

## Independent review

Two review rounds on separate Codex sessions read the fence-repair diff and, in round 2,
the three rewritten files. Round 1: 4 P1 and 6 P2 (repairs that erased a layer's output or
an error channel, an invented `SystemError` class, a narrowed public error union, retry and
`Layer.fresh` examples made vacuous, and import-boundary lessons hidden in comments). All
were fixed; the import-boundary examples were restored from the base and opted out above.
Round 2: every round-1 finding resolved; 1 P1 and 5 P2 new, all in the rewritten
`.patterns` files (the `return yield*` claim, native `fetch`, a non-`Effect.fn` helper, a
hand-written Option tag check, native `self.map`, a type assertion), all fixed. Review
loops stop after round 2.

## Review round 1 (#2135)

- **PRRT_kwDOPbO_N86vqjmy (P1), end-of-file syntax errors dropped.** A staged fence body
  ends in a newline and the stager adds another, so tsc reports an unclosed `{`, `(`,
  string or template one or two lines past the body, and the verdict's line range
  dropped it: the gate passed those fences. `mapFenceDiagnostics` now clamps every
  diagnostic of a staged fence to the fence's last body line (`bodyLineCount`), and the
  verdict range ends on that same line, so no diagnostic inside a staged fence file is
  dropped. Regression: `laws-markdown-fences-command.test.ts` "fails unclosed braces,
  parentheses and templates reported at the end of a staged fence" (three fences, each
  must fail on its last body line); it failed with the old mapping (`strictFailure`
  false) and passes with the fix. `laws-markdown-fences.test.ts` adds a pure end-of-file
  mapping case. Census: no newly caught fence (see Census).
- **PRRT_kwDOPbO_N86vqjm- (P2), module doc.** The `MarkdownFences.ts` module doc now names
  `@ts-ignore` and `@ts-nocheck` as the rejected directives, matching
  `SUPPRESSION_PATTERN`, and documents the end-of-file attribution.

Round-1 reruns, each alone through `beep-heavy` with `</dev/null`: repo-cli `bun run check`
exit 0 and `tsc-rs -p test/tsconfig.json` 0 errors; the four law test files 46/46 on Node
and on Bun; coverage of `MarkdownFences.ts`, `MarkdownFences.model.ts`,
`internal/TypeScriptFences.ts` and `SchemaTagIdioms.ts` 100% lines, functions, branches
and statements; `beep laws markdown-fences --check` `failed=0`; schema-tag-idioms 0
findings; schema-first `introduced=0`; effect-vitest `introduced=0`; fallow audit
`introduced=0`; Biome and oxlint clean; retired-effect-paths 0 findings.

## Verification

Every command ran alone through `beep-heavy` with `</dev/null`, from the worktree root
unless a package path is shown.

| Gate | Result |
| --- | --- |
| `bun run beep laws markdown-fences --check` (whole surface) | 526 files, 1090 fences, 485 checked, 15 opt-out, 590 generated, `failed=0`, exit 0; after the round-1 fix and the `main` merge: 1092 fences, 487 checked, 15 opt-out, 590 generated, `failed=0` |
| `@beep/repo-cli` typed check (`tsc-rs -p tsconfig.check.json`, `test/tsconfig.json`, `scripts/tsconfig.json`) | 0 errors each |
| New and affected tests on Bun (`bunx --bun vitest run`: both markdown-fences files, schema-tag-idioms pair, `quality-tasks`, `root-tasks-turbo-inputs`) | 6 files, 317 tests passed |
| Same law tests on Node (`bunx vitest run`, four law files) | 4 files, 45 tests passed |
| Coverage of the new and changed law files (Node, v8) | `MarkdownFences.ts`, `MarkdownFences.model.ts`, `internal/TypeScriptFences.ts`, `SchemaTagIdioms.ts`: 100% lines, functions, branches and statements |
| `bun run beep quality package-verify @beep/repo-cli` | build and check passed; tests 7536 passed, 1 failed: `knowledge-doctor-evaluators.test.ts:516` compares `HEAD` goal-packet manifests with the working tree, and this uncommitted branch edits `ops/manifest.json`. Attribution: environment-only (dirty tree); it passes once the change is committed. The audit stops at that test, so docgen and lint ran separately below. |
| `bun run --cwd packages/tooling/tool/cli docgen` | succeeded, 3449 examples typechecked |
| `bun run --cwd packages/tooling/tool/cli beep:lint` (Biome) | 0 errors |
| `bun run beep lint package-scripts` | 180 manifests, 0 drifting |
| `bun run beep quality cache-policy` | 28 root configuration drifts before the request; after `bun run beep cache baseline --request research/cache-baseline-request-guidance-wave-3.json`: 0 blocking |
| `bun run beep lint effect-vitest` | `introduced=0` |
| `bun run beep lint schema-first` | parity ratchet `introduced=0`; the one candidate (`TypeScriptFence` type alias) was modeled as a schema |
| `bun run fallow:audit:check` (`BEEP_PROOF_BASE=origin/main`) | `introduced=0` (10 inherited-adjacent), exit 0, after the command's report lines stopped cloning the retired-effect-paths command |
| `jsdoc:inventory:check` then `jsdoc:ratchet:check` | `increased=0`, zero-legacy findings 0 |
| `bun run beep observability catalog --write`, `bun run beep lint schema-catalog --write` | `@beep/repo-cli` shards regenerated |
| `bun run beep skills update` then `--check` | lock refreshed for the edited local skills; `current` |
| `goals:doctor` | no new blocking findings |
| `knowledge:refs-check` | 0 live gated observations |
| `lint:retired-effect-paths`, `lint:schema-tag-idioms`, `lint:effect-imports`, `lint:effect-imports-markdown`, `lint:retired-iri-authorities` | 0 findings each |
| `lint:oxlint`, `lint:typos`, `lint:policy-fingerprint` | clean, clean, current |

## Route and model evidence

- Session: `claude-opus-5-5` child (Claude chain step 1) of the residue orchestrator.
- Fence repair lanes, fix lane and both reviews: `codex exec --model gpt-6.1-sol -c 'model_reasoning_effort="medium"' -s workspace-write --cd <worktree> --add-dir <scratchpad>`;
  every log header reads `model: gpt-6.1-sol`, `reasoning effort: medium`. Six sessions:
  skills, standards, READMEs and `.patterns`, round-1 fixes, review round 1, review round 2.

## Reversal

Revert the PR. The `markdown-fences` law, its model, the shared fence module, the lane
wiring and both test files disappear; `SchemaTagIdioms.ts` returns to its private fence
pattern; every edited guidance file, `skills-lock.json` and the generated catalogs
return to their `599b553267` content; and the `//` cache-baseline review returns to its
previous stamp (request and basis under `research/*guidance-wave-3*`).
