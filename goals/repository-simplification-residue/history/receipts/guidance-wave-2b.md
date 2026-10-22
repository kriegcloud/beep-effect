# #1856 guidance wave 2b: individual review of the TypeScript suppression directives

Lane `residue-guidance`, wave 2b, branch `feat/residue-guidance-wave2b` from `main` at
`63542e50f2`. Route: S39/S41 Claude chain, step 1 (`claude-opus-5-5` child).
`@effect/tsgo` 0.55.0 and tsc-rs (the repo pins). This wave covers only the
TypeScript-level directives: `@ts-expect-error`, `@ts-ignore` and `@effect-diagnostics`.
Wave 2a (#2064) owns `fallow-ignore`. Wave 2c owns `biome-ignore`, `cspell`, coverage
ignores, `noqa`, `oxlint-disable` and `shellcheck`. Wave 3 owns the Markdown TypeScript
fence compile check and the upstream-copied `.patterns` decision.

## Census

Command, run from the repository root (the wave-1 method, restricted to the three kinds):

```sh
rg --only-matching -P -n -g '!node_modules' -g '!.beep' -g '!*.md' -g '!*.jsonl' \
  '(//|/\*|\{/\*|#|<!--|\*)\s*(@ts-expect-error|@ts-ignore|@effect-diagnostics)' .
```

Wave 1 counted 121 + 2 + 131 = 254 at `e3ee18dfd7`. Merges since then moved the counts
(effected-promotion moved test suites out of `scratchpad/test`, and new negative type
tests landed in `@beep/public-site` and `@beep/jsonl`).

| Kind | Matches before (`63542e50f2`) | Real directives before | Matches after | Real directives after |
| --- | --- | --- | --- | --- |
| `@ts-expect-error` | 143 | 142 | 141 | 140 |
| `@ts-ignore` | 2 | 0 | 2 | 0 |
| `@effect-diagnostics` | 104 | 98 | 100 | 94 |
| **Total** | **249** | **240** | **243** | **234** |

The census pattern also matches 9 lines that are not directives, and they stay: the two
`@ts-ignore` hits are a string literal in a runner test input and the regular expression
that detects the directive; three `@effect-diagnostics` hits are JSDoc in
`Quality.command.ts`; four are quoted in immutable effected-promotion review logs.

By root, real directives before: packages 128, scratchpad 105, `vitest.setup.ts` 6,
`vitest.shared.ts` 1. After: packages 126, scratchpad 102, `vitest.setup.ts` 5,
`vitest.shared.ts` 1.

`@effect-diagnostics` header lines can name several rules. Counted per rule, the 98
directives carried 140 rule entries (122 in `scratchpad/test`, 11 in `scratchpad/party`,
7 at the root). After: 13 removed as stale, 3 fixed in source, 8 narrowed from
`skip-file` to `-next-line`, 116 kept.

## Method

1. **`@ts-expect-error` liveness.** Every directive sits in a file that a typed check
   compiles: the owning package's `check` (including its `tsconfig.test.json` overlay) or
   `tsc-rs -p scratchpad/tsconfig.json`. An unused `@ts-expect-error` is TS2578, so a
   check without TS2578 proves every directive still suppresses an error. All package
   checks passed with 0 errors, and the scratchpad check reported no TS2578.
2. **`@effect-diagnostics` liveness.** Every `@effect-diagnostics` token in the 90
   scratchpad files was rewritten to an inert token (line numbers unchanged), `tsc-rs -p
   scratchpad/tsconfig.json` ran, and the files were restored from a tar archive. A rule
   entry is live when the stripped run reports more diagnostics of that rule in that file
   than the normal run. The same experiment ran on `vitest.setup.ts` and
   `vitest.shared.ts` with `tsc-rs -p tsconfig.configs.json`.
3. **Reason form.** Every kept directive now carries
   `-- <why>. Owner: <package>. Exit: <condition>.` on its own line. Both
   parsers accept trailing text after the rule list: a probe with the reason appended
   still suppressed under tsc-rs and under `effect-tsgo diagnostics --file`, and
   removing the header made the same probe report again. The two root exemptions are the
   exception: `beep quality tsgo-rules` compares those lines exactly and rejects
   trailing text, so their reasons stay in the comment block above them.
4. **Fixes.** Where the flagged pattern had a direct Effect-native or type-correct form,
   the source changed and the directive went (see "Fixed in source").
5. **Final proof.** The scratchpad check after the change reports exactly the base error
   set (354 inherited errors, compared as file, code and message, ignoring line shifts).

## Fixed in source (2 `@ts-expect-error`, 3 rule entries)

| Directive (base) | Fix |
| --- | --- |
| `packages/foundation/ui-system/ui/src/components/speech-input.tsx:425` and `:473` `@ts-expect-error` ("inert is not yet in React types") | React 19 types `inert` as `boolean`, so the prop is `inert={!speechInput.isConnected}`. The old value `""` was a latent bug: React 19 treats an empty string as `false` for this boolean attribute and logs a console error. A `renderToStaticMarkup` probe shows the old disconnected form rendering `<div></div>` with the warning and the new form rendering `<div inert=""></div>`. So the disconnected input is now actually inert, which is what the code intended. |
| `scratchpad/test/cli/entrypoints.test.ts` `asyncFunction` | The one async test is `it.effect` with `Effect.promise(() => import(...))`. 4/4 on Node and Bun. |
| `scratchpad/party/scripts/mail-census.ts` and `identity-evidence.ts` `preferSchemaOverJson` | `JSON.stringify(summary, null, 2)` is `jsonStringifyPretty` from `@beep/repo-utils/JsonUtils` (`SchemaGetter.stringifyJson({ space: 2 })`). A mail-census run on an empty index writes a byte-identical file before and after. |

## Stale (13 rule entries; 6 directive lines deleted)

- `vitest.setup.ts` `processEnv:skip-file`: nothing reports with it gone. The only
  `process.env` use passes the whole object, which the rule does not flag; the
  fast-check env read it once covered is no longer in the file. The rule left the
  `effectDiagnosticsDirectiveExemptions` table, the `EffectDiagnosticsExemptRule` domain
  and `test/quality-tsgo-directives.test.ts` in `@beep/repo-cli` in the same change, so
  the gate admits five shim lines. The `vitest.shared.ts` comment that counted "three"
  exemptions now says two.
- Whole headers deleted: `scratchpad/test/lockfiles/{documents,importers,PnpmEnvLockfile}.test.ts`
  (`nodeBuiltinImport`), `scratchpad/test/cli/CliFailure.spans.test.ts` and
  `CliMain.logging.test.ts` (`strictEffectProvide`).
- Rules dropped from a header that keeps other live rules: `strictEffectProvide` in
  `CliUiTest.throttle`, `DetachedProcess`, and the four `workspaces/integration`
  suites `ConfigDependencyFetch`, `ConfigDependencyResolution`,
  `WorkspaceSnapshotsHookReplay` and `WorkspaceSnapshotsNested`; `multipleEffectProvide` in
  `PackageManagerInstaller`.
- `scratchpad/test/sbom/reachability.test.ts` carried two header lines. They are merged
  into one, and the separate reason-only comment lines above five headers were folded
  into the inline reasons.

## Narrowed (8 rule entries)

`scratchpad/party` is the active party-slice lab (#2005), not retired code. Its six file
headers became: two `-next-line` directives in each entry script (the usage
`console.error` before the runtime starts, and the one entry-point `Effect.provide`,
which the rule's own message says may be disabled at an entry point), and a `-next-line`
`schemaSync:off` on the single synchronous decode in each of the two plain Vitest
suites. `fixtures/acme.ts` keeps `schemaSync:skip-file` with a reason: five
module-load decodes of encoded fixture records are the point of that fixture.

## Kept

- **`@ts-expect-error` (140).** 134 are negative type tests, or fixtures that feed a
  type-invalid input to the runtime validator a test covers (`invariant:` in
  effect-drizzle). Their exit is "remove if the API is meant to accept this". TS2578
  enforces it, because the directive fails the check the moment the call compiles. Six
  are type gaps:
  - `scratchpad/encode-keys-probe.ts:23`: Effect's `S.Class` requires `S.Struct`
    fields, and a struct piped through `S.encodeKeys` is a `decodeTo`. This is the
    probe's recorded answer.
  - `scratchpad/beep/Port.ts:96`: Effect's `S.encodeKeys` is typed for `S.Struct`,
    wider than the local `Renamable.pipe` parameter.
  - `scratchpad/beep/Port.ts:265` and `:316`: `@beep/effect-drizzle` `pg.jsonb`'s
    `Field.ValidateEncoded` proof is a conditional type, which stays deferred for a
    generic schema parameter.
  - `packages/ecosystem/effect-drizzle/test/fixtures.ts:853` and
    `sqlite-fixtures.ts:238`: the physical-name fallback is runtime-only until model
    statics preserve column-name literals.
- **`@effect-diagnostics` (94 lines).** 79 scratchpad test headers (75 effected-lab
  suites under the 2026-10-09 operator ruling, "Tests, entry-point headers" in
  `scratchpad/effected/DIAGNOSTIC_EXCEPTIONS.md`, and 4 beep-lab suites) carry 109 live
  rule entries: `nodeBuiltinImport` 46, `strictEffectProvide` 29,
  `multipleEffectProvide` 7, `asyncFunction` 7, `processEnv` 5, `processEnvInEffect` 5,
  `missingPipeableSignature` 4, `globalTimers` 3, `newPromise` 2, `globalRandom` 1. Each rule is named, and each line now says why the
  rule fires in that file: a native digest oracle, a synchronous source-tree scan at
  test collection, on-disk fixtures, real temp trees and processes, Vitest's async
  `vi.mock` contract, `fetch` doubles, real-timer Ink components, or a real
  environment variable the test sets and restores. The effected exit is the module's
  graduation through effected-promotion, which ports the test to `@effect/vitest`
  `layer()` and Effect platform services; the beep-lab exit is moving its digests to
  Effect Crypto, which its sources also still lack. That port is a whole-suite rewrite of
  upstream-shaped tests, not a directive edit. Rewriting the sequential `Effect.provide`
  chains into `Layer.mergeAll` would change which layer serves which (later provides
  feed earlier ones), so those stay. The 9 party lines and the 6 root exemptions are
  above.
- No directive is a blanket disable: no `*:off`, no unnamed `skip-file`.
- `scratchpad` is outside the scanned roots of `beep quality tsgo-rules` and of `beep
  quality effect-diagnostics` (no compiler script), so its directives are still enforced
  only by this receipt and the effected lab's own exception file. That is unchanged.

No inventory, exception, baseline or allowlist row is added (S31). The root directive
allowlist shrinks by one rule.

## Verification

Dependency dists were rebuilt first (`bun run build`, 176/176 tasks). Every command ran
alone through `beep-heavy` with stdin from `/dev/null`.

| Gate | Result |
| --- | --- |
| `bun run --cwd <pkg> check` (tsc-rs `tsconfig.check.json` plus the `tsconfig.test.json` overlay) for `@beep/effect-drizzle`, `utils`, `jsonl`, `public-site`, `identity`, `html`, `schema`, `managed-section`, `law-practice-use-cases`, `ui` and `repo-cli` | exit 0, 0 errors each, so no TS2578 and every kept `@ts-expect-error` is live |
| `tsc-rs -p scratchpad/tsconfig.json --noEmit` | the same 354 inherited errors as the base (file, code and message compared); no TS2578; no new Effect diagnostic |
| `bun run check:configs` (root `vitest.setup.ts`, `vitest.shared.ts`) | exit 0 without `processEnv:skip-file` |
| `bun run beep quality tsgo-rules` | exit 0; 130 rules at error, 5 declared off |
| `bun run beep quality effect-diagnostics --filter <pkg>` for the 11 changed packages | exit 0; 0 errors, 0 warnings in every project; `scratchpad` has no compiler script, so the lane selects nothing for it (unchanged) |
| `effect-tsgo diagnostics --file` on the changed scratchpad code files | 0 errors each |
| Tests, Node (`bunx vitest`) and Bun (`bunx --bun vitest`): changed test files of the 9 comment-only packages, effect-drizzle `unit`/`sqlite-unit`, the full `@beep/ui` suite, `quality-tsgo-directives`, party suite, scratchpad cli entrypoints | all pass on both runtimes (ui 55/55, directive policy 47/47, party 53/53, entrypoints 4/4) |
| Effected-lab suites of the changed test files (Node, the lab's runtime) | lockfiles, npm, package-json, sbom, config-file pass. `CliMessage`, `Status.hostileGlyph`, `ProcessGuard`, `DetachedProcess`, `GitHubMarkdown` and `PackageManagerInstaller` fail identically with the base file content restored (inherited). `PackedInstall.e2e` failed once in the 20-file run and passes alone (13/13 + 1 skipped), as at base: concurrency flake |
| `bun effected/audit.ts check cli` | red at the canary step ("effect diagnostics are not live: the canary ... was not flagged") before any module diagnostics run; the lab's own tsgo harness, inherited and unrelated |
| mail-census probe run, base vs lane | byte-identical summary file; usage path still exits 2 |
| oxlint `--disable-nested-config` on the 119 changed files | exit 0; 1 inherited warning (`vitest.setup.ts` node:crypto import, line moved 29 to 27) |
| Biome `check` on the changed files | exit 0 (scratchpad paths are outside Biome's includes) |
| `bun run beep lint effect-vitest` | introduced=0 resolved=0 |
| `bun run lint:schema-first` | introduced=0 |
| `jsdoc:inventory:check` + `jsdoc:ratchet:check` | increased=0 |
| `bun run beep lint schema-catalog` | current |
| `bun run beep laws retired-effect-paths` | findings=0 (a first run caught `effect/unstable/cli` in a new reason; corrected to `effect/cli`) |
| `bun run beep knowledge refs --check` | 0 live gated observations |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0; introduced 0, inherited-adjacent 4 |
| `bun run beep quality package-verify` | full for `@beep/ui` (audit, docgen), `@beep/repo-cli` (audit 1,350 s, docgen) and `@beep/scratchpad` (audit skipped by the package, docgen); `--quick` (lint, check) for the 9 comment-only packages; all pass |
| `bun run beep goals doctor` | blocking_new=0, blocking_inherited=0 |
| `bun run beep sync-data-to-ts --target vocab-terms --check` | 0 of 1 targets drifted |

No changeset: every changed package is private, and `@beep/repo-cli` and `@beep/scratchpad`
are in the `.changeset` ignore list.

## Route, model and reversal

Route S39/S41 Claude chain, step 1: a `claude-opus-5-5` child working in the
`rsc-residue-guidance-w2b` worktree; no fallback was taken. Reversal: revert the PR. The
directives return with their old text, the five deleted headers and the deleted rule
names come back, the shim regains `processEnv:skip-file` with its allowlist entry and
test row, `speech-input` returns to `inert=""` (which React 19 ignores), the cli
entrypoints test becomes `async` again and the party scripts call `JSON.stringify`.

## Per-directive dispositions

Line numbers are after this change unless marked `(base)`. "Kept" `@ts-expect-error`
reasons are quoted without their `Owner`/`Exit` tail, which is in the source line;
`@effect-diagnostics` reasons are the inline text.

| Path | Line | Kind | Disposition | Reason |
| --- | --- | --- | --- | --- |
| `goals/effected-promotion/history/port-reviews/**` | 4 lines | `@ts-expect-error`, `@effect-diagnostics` | not a directive | quoted in immutable review logs |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 282 | `@ts-expect-error` | kept | invariant: text requires a string-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 284 | `@ts-expect-error` | kept | invariant: integer requires a number-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 286 | `@ts-expect-error` | kept | invariant: bigint number-mode requires a number-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 288 | `@ts-expect-error` | kept | invariant: bytea requires a Uint8Array-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 330 | `@ts-expect-error` | kept | invariant: the array carrier must agree with its element descriptor. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 337 | `@ts-expect-error` | kept | invariant: pg.enum rejects broad string schemas. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 340 | `@ts-expect-error` | kept | invariant: string date mode requires a string-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 343 | `@ts-expect-error` | kept | invariant: json requires an object- or array-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 347 | `@ts-expect-error` | kept | invariant: the outer array carrier must match its element declaration. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 352 | `@ts-expect-error` | kept | invariant: declared dimensions must match the encoded array depth. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 359 | `@ts-expect-error` | kept | invariant: array fields cannot be primary keys. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 369 | `@ts-expect-error` | kept | invariant: primary-key fields cannot become arrays. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 379 | `@ts-expect-error` | kept | invariant: array fields cannot use identity generation. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 390 | `@ts-expect-error` | kept | invariant: identity fields cannot become arrays. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 400 | `@ts-expect-error` | kept | invariant: array fields cannot be optimistic versions. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 411 | `@ts-expect-error` | kept | invariant: version fields cannot become arrays. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 421 | `@ts-expect-error` | kept | invariant: optimistic versions require integer-family columns. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 432 | `@ts-expect-error` | kept | invariant: version fields cannot use identity generation. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 443 | `@ts-expect-error` | kept | invariant: identity-generated fields cannot be versions. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 454 | `@ts-expect-error` | kept | invariant: version fields cannot be generated. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 465 | `@ts-expect-error` | kept | invariant: generated fields cannot be versions. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 475 | `@ts-expect-error` | kept | invariant: optimistic versions require number-encoded integer columns. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 482 | `@ts-expect-error` | kept | invariant: optimistic versions cannot override explicit variant membership. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 492 | `@ts-expect-error` | kept | invariant: extras callbacks must return valid PostgreSQL extra nodes. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 500 | `@ts-expect-error` | kept | invariant: kit default columns cannot be overridden. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 508 | `@ts-expect-error` | kept | invariant: Date declarations require explicit pg.timestamp metadata. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 516 | `@ts-expect-error` | kept | invariant: declaration-backed objects do not derive JSON storage. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 535 | `@ts-expect-error` | kept | invariant: text requires a string-encoded schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 556 | `@ts-expect-error` | kept | invariant: optimistic version fields cannot locate repository rows. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 564 | `@ts-expect-error` | kept | invariant: repository locators must be primary-key or unique fields. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 588 | `@ts-expect-error` | kept | invariant: nullable unique fields cannot locate repository rows. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 595 | `@ts-expect-error` | kept | invariant: repositories reject models with physical column-name overrides. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 608 | `@ts-expect-error` | kept | invariant: native repositories reject models with an optimistic version field. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 616 | `@ts-expect-error` | kept | invariant: repositories reject models with physical column-name overrides. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 625 | `@ts-expect-error` | kept | invariant: repository locators must be primary-key or unique fields. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 657 | `@ts-expect-error` | kept | invariant: multiple inline primary keys require a composite table node instead. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 666 | `@ts-expect-error` | kept | invariant: a model may declare at most one optimistic-version field. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 677 | `@ts-expect-error` | kept | invariant: optimistic versions cannot be nullable. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 685 | `@ts-expect-error` | kept | invariant: nullable schemas cannot be primary keys. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 696 | `@ts-expect-error` | kept | invariant: default and generated are mutually exclusive. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 708 | `@ts-expect-error` | kept | invariant: generated and default are mutually exclusive. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 745 | `@ts-expect-error` | kept | invariant: uuid and text SQL identities are not interchangeable. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 753 | `@ts-expect-error` | kept | invariant: different EntityId SQL domains are not interchangeable. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 766 | `@ts-expect-error` | kept | invariant: every reference target must be present in EffectDrizzle.schema. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 795 | `@ts-expect-error` | kept | invariant: scalar and array SQL identities are incompatible. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 810 | `@ts-expect-error` | kept | invariant: foreign-key array depths must match. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 825 | `@ts-expect-error` | kept | invariant: foreign keys must target an inline primary-key or unique column. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 853 | `@ts-expect-error` | kept | boundary: physical-name fallback is runtime-only until model statics preserve literals. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1021 | `@ts-expect-error` | kept | invariant: runtime mirror survives type suppression. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1031 | `@ts-expect-error` | kept | invariant: runtime mirror survives type suppression. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1058 | `@ts-expect-error` | kept | invariant: SET NULL requires nullable encoded source. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1062 | `@ts-expect-error` | kept | invariant: runtime schema assembly mirrors SET NULL validation. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1069 | `@ts-expect-error` | kept | invariant: SET DEFAULT requires a declared database default. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1073 | `@ts-expect-error` | kept | invariant: runtime schema assembly mirrors SET DEFAULT validation. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1085 | `@ts-expect-error` | kept | invariant: dynamic widened keys defer to the runtime model validator. |
| `packages/ecosystem/effect-drizzle/test/fixtures.ts` | 1094 | `@ts-expect-error` | kept | invariant: dynamic widened keys defer to the runtime model validator. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 112 | `@ts-expect-error` | kept | invariant: native repositories reject models with an optimistic version field. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 135 | `@ts-expect-error` | kept | invariant: PostgreSQL descriptors cannot enter SQLite models. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 143 | `@ts-expect-error` | kept | invariant: SQLite descriptors cannot enter PostgreSQL models. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 152 | `@ts-expect-error` | kept | invariant: optimistic versions cannot override explicit variant membership. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 158 | `@ts-expect-error` | kept | invariant: SQLite JSON mode accepts only arrays and string-keyed records. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 164 | `@ts-expect-error` | kept | invariant: SQLite JSON mode rejects declaration-backed byte arrays. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 172 | `@ts-expect-error` | kept | invariant: declaration-backed objects do not derive SQLite JSON storage. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 181 | `@ts-expect-error` | kept | invariant: optimistic versions cannot be nullable. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 198 | `@ts-expect-error` | kept | invariant: foreign keys must target an inline primary-key or unique column. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 238 | `@ts-expect-error` | kept | boundary: physical-name fallback is runtime-only until model statics preserve literals. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 308 | `@ts-expect-error` | kept | invariant: NUMERIC string mode is representation-lossy; use text(). |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 366 | `@ts-expect-error` | kept | invariant: runtime mirror survives type suppression. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 376 | `@ts-expect-error` | kept | invariant: runtime mirror survives type suppression. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 401 | `@ts-expect-error` | kept | invariant: runtime model construction mirrors SET NULL validation. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 404 | `@ts-expect-error` | kept | invariant: SET NULL requires nullable encoded source. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 408 | `@ts-expect-error` | kept | invariant: runtime schema assembly mirrors SET NULL validation. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 413 | `@ts-expect-error` | kept | invariant: runtime model construction mirrors SET DEFAULT validation. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 416 | `@ts-expect-error` | kept | invariant: SET DEFAULT requires a declared database default. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 422 | `@ts-expect-error` | kept | invariant: runtime schema assembly mirrors SET DEFAULT validation. |
| `packages/ecosystem/effect-drizzle/test/sqlite-fixtures.ts` | 441 | `@ts-expect-error` | kept | invariant: dynamic widened keys defer to the runtime model validator. |
| `packages/foundation/modeling/html/test/Html.form-control.test.ts` | 133 | `@ts-expect-error` | kept | unsupported is not one of the standard input states. |
| `packages/foundation/modeling/html/test/Html.form-control.test.ts` | 135 | `@ts-expect-error` | kept | command presence is correlated with the nonSubmit case. |
| `packages/foundation/modeling/html/test/Html.script.test.ts` | 247 | `@ts-expect-error` | kept | data-block MIME types are schema-refined rather than arbitrary strings. |
| `packages/foundation/modeling/html/test/Html.script.test.ts` | 249 | `@ts-expect-error` | kept | unsupported is not an author-conforming script state. |
| `packages/foundation/modeling/html/test/Html.test.ts` | 112 | `@ts-expect-error` | kept | exercise constructor validation for excluded document child kinds. |
| `packages/foundation/modeling/identity/test/Fibered.test.ts` | 145 | `@ts-expect-error` | kept | The pullback excludes the count point. |
| `packages/foundation/modeling/identity/test/Fibered.test.ts` | 158 | `@ts-expect-error` | kept | A total section over x and y must include y. |
| `packages/foundation/modeling/identity/test/Fibered.test.ts` | 171 | `@ts-expect-error` | kept | Member hooks must preserve the tagged member shape. |
| `packages/foundation/modeling/identity/test/IdentityRegistry.test.ts` | 115 | `@ts-expect-error` | kept | Registry entries require a composer with IRI and CURIE bindings. |
| `packages/foundation/modeling/jsonl/test/EnvelopeTypes.test.ts` | 55 | `@ts-expect-error` | kept | a payload schema requiring services must be rejected at registration. |
| `packages/foundation/modeling/jsonl/test/EnvelopeTypes.test.ts` | 90 | `@ts-expect-error` | kept | the payload must match the schema registered for the tag. |
| `packages/foundation/modeling/jsonl/test/EnvelopeTypes.test.ts` | 93 | `@ts-expect-error` | kept | the tag must be one the registry defines. |
| `packages/foundation/modeling/jsonl/test/EnvelopeTypes.test.ts` | 96 | `@ts-expect-error` | kept | a payload belonging to a DIFFERENT tag is rejected. |
| `packages/foundation/modeling/jsonl/test/ErrorDeviations.test.ts` | 47 | `@ts-expect-error` | kept | `known` is required; upstream has no default for it. |
| `packages/foundation/modeling/jsonl/test/ErrorDeviations.test.ts` | 56 | `@ts-expect-error` | kept | `event` is required; upstream has no default for it. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 360 | `@ts-expect-error` | kept | The selected tag controls the payload type. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 362 | `@ts-expect-error` | kept | A foreign tag is not in the registry. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 364 | `@ts-expect-error` | kept | A patch must contain fields of the selected payload. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 366 | `@ts-expect-error` | kept | Narrowing a query requires a runtime event filter. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 368 | `@ts-expect-error` | kept | Scope filters cannot justify event narrowing. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 372 | `@ts-expect-error` | kept | A projection cannot narrow through its callback alone. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 375 | `@ts-expect-error` | kept | Pure codecs must reject service-requiring schemas at registration. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 377 | `@ts-expect-error` | kept | Encoding uses the payload for the supplied event tag. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 379 | `@ts-expect-error` | kept | Piped encoding preserves the selected tag's payload type. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 381 | `@ts-expect-error` | kept | Effectful piped encoding also rejects foreign tags. |
| `packages/foundation/modeling/jsonl/test/jsonl.test.ts` | 383 | `@ts-expect-error` | kept | Omission is accepted, explicit undefined is not. |
| `packages/foundation/modeling/managed-section/test/Section.test.ts` | 16 | `@ts-expect-error` | kept | commentStyle is required — no silent "#" default. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 88 | `@ts-expect-error` | kept | file routes take no path. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 90 | `@ts-expect-error` | kept | file routes take no path. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 92 | `@ts-expect-error` | kept | lab URLs go through labRoute. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 94 | `@ts-expect-error` | kept | unknown route. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 100 | `@ts-expect-error` | kept | the union includes file routes and labs. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 103 | `@ts-expect-error` | kept | the union includes a file route. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 111 | `@ts-expect-error` | kept | a nested path is relative. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 113 | `@ts-expect-error` | kept | a nested path is non-empty. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 185 | `@ts-expect-error` | kept | uppercase is not a lowercase DNS label. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 187 | `@ts-expect-error` | kept | underscore is not a DNS label character. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 189 | `@ts-expect-error` | kept | a DNS label may not start with a hyphen. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 191 | `@ts-expect-error` | kept | a DNS label may not end with a hyphen. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 193 | `@ts-expect-error` | kept | a dot leaves more than one label. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 195 | `@ts-expect-error` | kept | a port is not part of the portless name. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 197 | `@ts-expect-error` | kept | the label may not be empty. |
| `packages/foundation/modeling/public-site/test/PublicSite.test.ts` | 200 | `@ts-expect-error` | kept | a dynamic name must be decoded through LabPortlessName first. |
| `packages/foundation/modeling/schema/test/Conformance.test.ts` | 94 | `@ts-expect-error` | kept | The registered annotation key rejects scalar payloads. |
| `packages/foundation/modeling/schema/test/Conformance.test.ts` | 98 | `@ts-expect-error` | kept | Direct attachment requires metadata validated and branded by Annotation. |
| `packages/foundation/modeling/schema/test/collectAnnotationsAt.test.ts` | 18 | `@ts-expect-error` | kept | The raw collector does not accept a caller-selected payload type. |
| `packages/foundation/modeling/utils/test/Struct.test.ts` | 75 | `@ts-expect-error` | kept | the typed path rejects an index past the tuple, and the test proves the runtime still answers undefined. |
| `packages/foundation/ui-system/ui/src/components/speech-input.tsx` | 425 (base) | `@ts-expect-error` | fixed in source | React 19 types `inert` as boolean; the prop is now `inert={!speechInput.isConnected}` |
| `packages/foundation/ui-system/ui/src/components/speech-input.tsx` | 473 (base) | `@ts-expect-error` | fixed in source | same as line 425 |
| `packages/law-practice/use-cases/test/LegalPositionRelatorPolicy.test.ts` | 276 | `@ts-expect-error` | kept | the derivation is defined over (kind, content); a kind-only map is unrepresentable. |
| `packages/law-practice/use-cases/test/LegalPositionRelatorPolicy.test.ts` | 278 | `@ts-expect-error` | kept | the derivation is defined over (kind, content); a content-only map is unrepresentable. |
| `packages/law-practice/use-cases/test/LegalPositionRelatorPolicy.test.ts` | 280 | `@ts-expect-error` | kept | the correlative derivation is likewise defined only over the pair. |
| `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts` | 382, 410, 622 | `@effect-diagnostics` | not a directive | JSDoc text and examples of the gate |
| `scratchpad/beep/Port.ts` | 96 | `@ts-expect-error` | kept | TS2345: Effect's S.encodeKeys is typed for S.Struct, and its result is wider than Renamable.pipe's parameter. |
| `scratchpad/beep/Port.ts` | 265 | `@ts-expect-error` | kept | TS2345: pg.jsonb's Field.ValidateEncoded object proof stays deferred for a generic schema parameter; callers pass object or array schemas. |
| `scratchpad/beep/Port.ts` | 316 | `@ts-expect-error` | kept | TS2345: pg.jsonb's Field.ValidateEncoded object proof stays deferred for the generic optionalNull carrier, which keeps an object or array encoding. |
| `scratchpad/effected/runner/Exports.ts` | 231 | `@ts-ignore` | not a directive | regular expression that detects the directive |
| `scratchpad/encode-keys-probe.ts` | 23 | `@ts-expect-error` | kept | probe Q1's answer: S.Class requires S.Struct fields, and a struct piped through S.encodeKeys is a decodeTo, so Effect's S.Class rejects it. |
| `scratchpad/party/fixtures/acme.ts` | 1 | `@effect-diagnostics` `schemaSync:skip-file` | kept | the fixture is written in encoded form and decoded synchronously at module load, so tests import plain values and the decode boundary is exercised. |
| `scratchpad/party/scripts/identity-evidence.ts` | 1 (base) | `@effect-diagnostics` `globalConsole:skip-file strictEffectProvide:skip-file preferSchemaOverJson:skip-file` | split: preferSchemaOverJson fixed in source; the other two narrowed to next-line | same helper as mail-census |
| `scratchpad/party/scripts/identity-evidence.ts` | 340 | `@effect-diagnostics-next-line` `globalConsole:off` | kept | the usage error is written before the Effect runtime starts. |
| `scratchpad/party/scripts/identity-evidence.ts` | 352 | `@effect-diagnostics-next-line` `strictEffectProvide:off` | kept | this is the script's entry point, where the platform layer is provided once. |
| `scratchpad/party/scripts/mail-census.ts` | 1 (base) | `@effect-diagnostics` `globalConsole:skip-file strictEffectProvide:skip-file preferSchemaOverJson:skip-file` | split: preferSchemaOverJson fixed in source; the other two narrowed to next-line | `JSON.stringify(summary, null, 2)` is `jsonStringifyPretty` from `@beep/repo-utils/JsonUtils` (output byte-identical on a probe run) |
| `scratchpad/party/scripts/mail-census.ts` | 68 | `@effect-diagnostics-next-line` `globalConsole:off` | kept | the usage error is written before the Effect runtime starts. |
| `scratchpad/party/scripts/mail-census.ts` | 74 | `@effect-diagnostics-next-line` `strictEffectProvide:off` | kept | this is the script's entry point, where the platform layer is provided once. |
| `scratchpad/party/scripts/review-page-demo.ts` | 1 (base) | `@effect-diagnostics` `globalConsole:skip-file strictEffectProvide:skip-file` | narrowed to two next-line directives | one hit each |
| `scratchpad/party/scripts/review-page-demo.ts` | 74 | `@effect-diagnostics-next-line` `globalConsole:off` | kept | the usage error is written before the Effect runtime starts. |
| `scratchpad/party/scripts/review-page-demo.ts` | 78 | `@effect-diagnostics-next-line` `strictEffectProvide:off` | kept | this is the script's entry point, where the platform layer is provided once. |
| `scratchpad/party/test/Graph.adapter.test.ts` | 1 (base) | `@effect-diagnostics` `schemaSync:skip-file` | narrowed to next-line | one hit |
| `scratchpad/party/test/Graph.adapter.test.ts` | 68 | `@effect-diagnostics-next-line` `schemaSync:off` | kept | plain Vitest cases decode encoded test records synchronously. |
| `scratchpad/party/test/IdentityEvidence.test.ts` | 1 (base) | `@effect-diagnostics` `schemaSync:skip-file` | narrowed to next-line | one hit |
| `scratchpad/party/test/IdentityEvidence.test.ts` | 111 | `@effect-diagnostics-next-line` `schemaSync:off` | kept | plain Vitest cases decode encoded test records synchronously. |
| `scratchpad/party/test/Party.competency.test.ts` | 258 | `@ts-expect-error` | kept | client-facing proof cannot enter a deposition outline. |
| `scratchpad/test/beep/MemoryAdmission.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because Node's real createHash is the digest oracle the module is checked against. |
| `scratchpad/test/beep/MemoryContracts.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because Node's real createHash is the digest oracle the module is checked against. |
| `scratchpad/test/beep/MemoryRecurrence.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because Node's real createHash is the digest oracle the module is checked against. |
| `scratchpad/test/beep/ProductMemory.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because Node's real createHash is the digest oracle the module is checked against. |
| `scratchpad/test/cli/CliFailure.spans.test.ts` | 2 (base) | `@effect-diagnostics` `strictEffectProvide:skip-file` | stale, deleted | stale: `strictEffectProvide` reported nothing with the header removed |
| `scratchpad/test/cli/CliFailure.test.ts` | 5 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliHelpRouting.test.ts` | 6 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliInteractive.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliLinks.edges.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/CliLinks.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliLog.options.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliLog.status.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/CliLog.test.ts` | 6 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliLogger.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/CliMain.logging.test.ts` | 5 (base) | `@effect-diagnostics` `strictEffectProvide:skip-file` | stale, deleted | stale: `strictEffectProvide` reported nothing with the header removed |
| `scratchpad/test/cli/CliMessage.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/CliPrompt.test.ts` | 5 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/CliRuntime.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/Doc.test.ts` | 72 | `@ts-expect-error` | kept | "timeot" is not a status name in the core vocabulary. |
| `scratchpad/test/cli/Doc.test.ts` | 337 | `@ts-expect-error` | kept | "timeot" is not a status name in the core vocabulary. |
| `scratchpad/test/cli/FailureDetails.cancelled.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/Glyphs.test.ts` | 1 | `@effect-diagnostics` `processEnv:skip-file` | kept | processEnv because it sets and restores TERM to prove Glyphs never reads the process. |
| `scratchpad/test/cli/Loggers.policy.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/Status.hostileGlyph.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/Status.test.ts` | 70 | `@ts-expect-error` | kept | "timeot" is not a status name. |
| `scratchpad/test/cli/Token.test.ts` | 98 | `@ts-expect-error` | kept | renamed to cyanBright. |
| `scratchpad/test/cli/boundary.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/cli/entrypoints.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept; fixed in source: `asyncFunction` | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/cli/erasableSyntax.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/cli/helpers/live.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/helpers/renderContext.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/ui/CliUi.dual.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/cli/ui/CliUiTest.test.ts` | 1 | `@effect-diagnostics` `globalTimers:skip-file` | kept | globalTimers because the Ink components under test schedule their state changes on real timers. |
| `scratchpad/test/cli/ui/CliUiTest.throttle.test.ts` | 1 | `@effect-diagnostics` `asyncFunction:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | asyncFunction because Vitest's vi.mock factory is async by contract. |
| `scratchpad/test/cli/ui/inkLoad.test.ts` | 1 | `@effect-diagnostics` `asyncFunction:skip-file` | kept | asyncFunction because Vitest's vi.mock factory is async by contract. |
| `scratchpad/test/cli/ui/inkMissing.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file multipleEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); multipleEffectProvide because the sequential provides keep the layer order the assertions depend on. |
| `scratchpad/test/cli/ui/tsdocLinks.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/cli/ui/wizard.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file asyncFunction:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); asyncFunction because Vitest's vi.mock factory is async by contract. |
| `scratchpad/test/cli/ui/zeroSize.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/config-file/ConfigFileKeyTyping.test.ts` | 44 | `@ts-expect-error` | kept | a wider shape would be handed a value missing `extra`. |
| `scratchpad/test/config-file/ConfigFileKeyTyping.test.ts` | 46 | `@ts-expect-error` | kept | the same pin applies to testLayer. |
| `scratchpad/test/config-file/ConfigFileKeyTyping.test.ts` | 73 | `@ts-expect-error` | kept | a wider shape would be handed a value missing `extra`. |
| `scratchpad/test/engine/ProcessGuard.test.ts` | 1 | `@effect-diagnostics` `asyncFunction:skip-file globalTimers:skip-file newPromise:skip-file` | kept | asyncFunction because ProcessGuard's load contract takes native async callbacks; globalTimers because the assertions order events against native timer phases; newPromise because it settles native timer phases. |
| `scratchpad/test/engine/entrypoints.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/engine/purity.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/github-actions/ActionsProvenance.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/github-actions/DetachedProcess.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file asyncFunction:skip-file processEnv:skip-file processEnvInEffect:skip-file globalTimers:skip-file newPromise:skip-file globalRandom:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; asyncFunction because it polls a detached native child that outlives the Effect scope; processEnv because it sets and restores a parent-only variable and passes PATH to prove what the child inherits; processEnvInEffect because it sets and restores a parent-only variable and passes PATH to prove what the child inherits; globalTimers because the child poll waits on a real timer; newPromise because it adapts node:http server callbacks and the child poll; globalRandom because a random parent-only value proves the child does not inherit it. |
| `scratchpad/test/github-actions/GitHubMarkdown.test.ts` | 288 | `@ts-expect-error` | kept | a non-string-encoded field makes `options` required. |
| `scratchpad/test/github-actions/GitHubMarkdown.test.ts` | 290 | `@ts-expect-error` | kept | and its column entry cannot omit `format`. |
| `scratchpad/test/github-actions/PackageManagerInstaller.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file nodeBuiltinImport:skip-file asyncFunction:skip-file` | kept; stale rule(s) removed: `multipleEffectProvide` | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; asyncFunction because the fetch doubles must be async functions shaped like globalThis.fetch. |
| `scratchpad/test/github-actions/Secret.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file nodeBuiltinImport:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/github-actions/ambientReads.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/github-actions/pnpmExe.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because Node's real createHash is the digest oracle the module is checked against. |
| `scratchpad/test/github-actions/reachability.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/github-actions/results.ts` | 1 | `@effect-diagnostics` `asyncFunction:skip-file missingPipeableSignature:skip-file` | kept | asyncFunction because the fetch doubles must be async functions shaped like globalThis.fetch; missingPipeableSignature because the factories are internal test helpers with a direct-call contract. |
| `scratchpad/test/lockfiles/Lockfile.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/lockfiles/PnpmEnvLockfile.test.ts` | 1 (base) | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | stale, deleted | stale: `nodeBuiltinImport` reported nothing with the header removed |
| `scratchpad/test/lockfiles/documents.test.ts` | 1 (base) | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | stale, deleted | stale: `nodeBuiltinImport` reported nothing with the header removed |
| `scratchpad/test/lockfiles/fixtures.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it reads the on-disk lockfile fixtures and hashes them with Node's real SHA backend as the oracle. |
| `scratchpad/test/lockfiles/fixtures.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/lockfiles/importers.test.ts` | 1 (base) | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | stale, deleted | stale: `nodeBuiltinImport` reported nothing with the header removed |
| `scratchpad/test/markdown/e2e/support/corpus.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/markdown/e2e/support/span.ts` | 1 | `@effect-diagnostics` `missingPipeableSignature:skip-file` | kept | missingPipeableSignature because the factories are internal test helpers with a direct-call contract. |
| `scratchpad/test/markdown/tools/generate-entities.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because this one-shot generator writes the entity table to disk outside any Effect runtime. |
| `scratchpad/test/npm/reachability.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/package-json/Format.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/package-json/Funding.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/runner/Runner.test.ts` | 307 | `@ts-ignore` | not a directive | string literal in a test input |
| `scratchpad/test/sbom/IdentityToken.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/sbom/SlsaProvenance.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file processEnv:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load; processEnv because it sets and restores GITHUB_SERVER_URL to prove the ambient value is ignored. |
| `scratchpad/test/sbom/conformance.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/sbom/reachability.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file nodeBuiltinImport:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/sbom/reachability.test.ts` | 3 (base) | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | merged into the line-1 header | one header per file |
| `scratchpad/test/workspaces/ConfigDependencyFetch.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/ConfigDependencyHooksSubprocess.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/DuplicateCheck.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/workspaces/PackageManagerDetectorDouble.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/workspaces/PeerCheck.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it loads on-disk fixture files synchronously at module load. |
| `scratchpad/test/workspaces/SourceBoundary.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/VersioningStrategy.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). |
| `scratchpad/test/workspaces/WorkspacesSync.test.ts` | 1 | `@effect-diagnostics` `strictEffectProvide:skip-file nodeBuiltinImport:skip-file` | kept | strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09); nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/e2e/PackedInstall.e2e.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file processEnvInEffect:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; processEnvInEffect because it asserts the Bun runner's npm_config_user_agent. |
| `scratchpad/test/workspaces/e2e/RunBinStdin.e2e.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/entrypoints.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/fixtures.ts` | 1 | `@effect-diagnostics` `missingPipeableSignature:skip-file` | kept | missingPipeableSignature because the factories are internal test helpers with a direct-call contract. |
| `scratchpad/test/workspaces/integration/ConfigDependencyFetch.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file processEnv:skip-file processEnvInEffect:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; processEnv because it points PATH and the fake-pnpm variables at a real fake pnpm binary and restores them; processEnvInEffect because it points PATH and the fake-pnpm variables at a real fake pnpm binary and restores them. |
| `scratchpad/test/workspaces/integration/ConfigDependencyResolution.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file processEnvInEffect:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; processEnvInEffect because it sets and restores PNPM_HOME for the real resolution ladder. |
| `scratchpad/test/workspaces/integration/SourceBoundarySelf.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/integration/WorkspaceSnapshotsHookReplay.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file processEnv:skip-file processEnvInEffect:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; processEnv because it hands the replayed hook subprocess a marker path through the real environment; processEnvInEffect because it hands the replayed hook subprocess a marker path through the real environment. |
| `scratchpad/test/workspaces/integration/WorkspaceSnapshotsNested.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept; stale rule(s) removed: `strictEffectProvide` | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/integration/layering.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/integration/node-sync.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host. |
| `scratchpad/test/workspaces/integration/peerClosure.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/integration/self.int.test.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | nodeBuiltinImport because it scans the lab's own source tree synchronously at test collection. |
| `scratchpad/test/workspaces/integration/utils/configDependencyFixtures.ts` | 1 | `@effect-diagnostics` `nodeBuiltinImport:skip-file missingPipeableSignature:skip-file` | kept | nodeBuiltinImport because it builds real temp trees or spawns real processes that the code under test must see on the host; missingPipeableSignature because the factories are internal test helpers with a direct-call contract. |
| `vitest.setup.ts` | 20 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | admitted exemption (nodeBuiltinImport:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
| `vitest.setup.ts` | 21 | `@effect-diagnostics` `asyncFunction:skip-file` | kept | admitted exemption (asyncFunction:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
| `vitest.setup.ts` | 22 | `@effect-diagnostics` `newPromise:skip-file` | kept | admitted exemption (newPromise:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
| `vitest.setup.ts` | 23 | `@effect-diagnostics` `globalTimers:skip-file` | kept | admitted exemption (globalTimers:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
| `vitest.setup.ts` | 24 | `@effect-diagnostics` `globalRandom:skip-file` | kept | admitted exemption (globalRandom:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
| `vitest.setup.ts` | 24 (base) | `@effect-diagnostics` `processEnv:skip-file` | stale, deleted | no processEnv finding in the file (`env: process.env` passes the object and is not flagged); the exemption rule left the `Quality.command.ts` table and its test |
| `vitest.shared.ts` | 4 | `@effect-diagnostics` `nodeBuiltinImport:skip-file` | kept | admitted exemption (nodeBuiltinImport:skip-file); reason in the comment block above, as `beep quality tsgo-rules` compares the line exactly |
