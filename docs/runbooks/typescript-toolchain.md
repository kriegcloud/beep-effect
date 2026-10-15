# TypeScript toolchain: which compiler runs where

Use this runbook when a tool, an editor, or a dependency bump asks "which
TypeScript is this repo on?" The root uses TypeScript 7 under two names, with a separate
TS6 bridge for classic API scripts. The Effect compiler patches the native binary;
tsc-rs remains the build/check gate.

## Installed compilers and API bridge

| Package (catalog) | Version | Role |
| --- | --- | --- |
| `typescript` | `^7.0.2` | Native TypeScript 7 package; no classic `lib/typescript.js` API. |
| `@typescript/native` | `npm:typescript@^7.0.2` | The same TypeScript 7 package under the retained alias, used by patching and unstable API consumers. Alias consolidation is a separate follow-up. |
| `@typescript/typescript6` | `6.0.2` (exact) | Microsoft’s classic JS API bridge for the schema-opaque codemod/fixup, scratchpad JSDoc census; declared at root and in scratchpad. |
| `@effect/tsgo` + seven `@effect/tsgo-<platform>` packages | `0.53.0` | The Effect language service build of TypeScript 7. Editors and the independent Effect diagnostics lane use this reviewed pin; it can advance beyond the tsc-rs port. |
| `tsc-rs` + six `@tsc-rs/<platform>` optional packages | `0.6.0` | The Rust port of the TypeScript 7 compiler ([pingdotgg/ts-rust](https://github.com/pingdotgg/ts-rust)) with the Effect rules of one effect-tsgo version compiled in (0.6.0 ports 0.51.1) and its own TypeScript pinned (`7.1.0-dev.20261008.1`). Runs generated library `beep:build`, `beep:check` and `beep:check:tests` gates, the root `check:configs`, and infra's `-b` check. Framework apps retain their own build commands. |

The root `prepare` script (`effect-tsgo unpatch && node scripts/prune-tsgo-backups.mjs && effect-tsgo patch`)
copies the Effect binary over the native package's Go binary, keeping the stock
one beside it as `tsc.original`. After install, both of these print
`Version 7.0.2+effect-tsgo.0.53.0`:

```text
node_modules/.bin/tsc      -> @typescript/native/bin/tsc  (patched Go binary)
node_modules/.bin/tsgo     -> tools/tsgo-shim/tsgo.js     (execs the Effect artifact directly)
```

Docgen's example compile, `beep quality test-tsgo`, the Effect smoke canary,
rule-parity tools and the editors use the Effect compiler. The independent
`beep quality effect-diagnostics` command reports the reviewed Effect rule set.
Required Check continues enforcing the embedded shared rules during promotion.
The shim bypasses the patch on purpose: a preserved
`.original` backup can make a newer patcher mistake an older Effect compiler for
the current one (`tools/tsgo-shim/tsgo.js`).

The typecheck and build gates run on `tsc-rs` instead (adopted 2026-10-14,
`goals/tsc-rs-gates`):

```text
node_modules/.bin/tsc-rs   -> tsc-rs/bin/tsc-rs  (Go's JS launcher; execs @tsc-rs/<platform>/bin/tsc-rs)
```

`beep:build` (`tsc-rs -p tsconfig.json && bun run babel`), `beep:check`
(`tsc-rs -p tsconfig.check.json`), `beep:check:tests`
(`tsc-rs -p tsconfig.test.json --noEmit`), the root `check:configs` and infra's
`tsc-rs -b tsconfig.json` all run the Rust compiler. Measured on 2026-10-13
against tsgo 0.47.2 (`goals/tsc-rs-gates/research/measurements-2026-10-13.md`):
3.7× geomean faster on the 150 check projects at about half the peak RSS, and
identical diagnostics, Effect rules included, on 283 of 284 projects (the one
exception was upstream 7.1-dev behaviour, fixed in #1670). Rules of the road:

- The bin is Go's JavaScript launcher, not the sh/JS polyglot the package's
  postinstall would write: bun blocks the postinstall because `tsc-rs` is not
  in `trustedDependencies`, and the launcher costs about 22 ms per run. Keep it
  that way rather than trusting an install script for 22 ms.
- `--fast` stays off in generated scripts and CI (−7 % wall for +35 % CPU and
  +4.7 GB peak on the test projects; it spawns up to 16 checkers). If it is
  ever added, it goes after `-b`: `tsc-rs -b --fast`, never `--fast -b`.
- A failing `tsc-rs` exits 2, not 1. Yeet's issue parser keys on the
  diagnostic text, so the code does not matter to the gates.
- `tsc-rs --version` prints `Version 7.1.0-dev`; the `.bin/tsc` ↔ `.bin/tsgo`
  version equality test covers the Effect
  binary; `EffectTsgoEffectFnPolicy.test.ts` independently verifies the tsc-rs
  identity and that both shared Effect rules and type errors still fail Check.

## Binary paths (Linux x64)

Verified at 0.53.0. Substitute the platform triple on other machines.

- `node_modules/@effect/tsgo-linux-x64/lib/tsc` is the latest TypeScript (7.0.2)
  Effect artifact. Since 0.52 it is shipped once in `lib`, not duplicated under
  `artifacts/typescript/7.0.2`. Other upstream versions remain under
  `artifacts/typescript/<version>/tsc`.
- `effect-tsgo get-exe-path` and the `tsgo` shim resolve the correct binary from
  installed upstream metadata. Avoid hardcoding an artifact-version directory.
- `node_modules/@typescript/typescript-linux-x64/lib/tsc` is the patched native
  binary; `tsc.original` beside it remains the stock TypeScript backup.

## Independent Effect diagnostics

Effect rules come from the reviewed `@effect/tsgo` pin through:

```sh
bun run beep quality effect-diagnostics
# Bounded edit loop:
bun run beep quality effect-diagnostics --filter @beep/observability
```

`Heavy / Effect Diagnostics` is an independent parallel matrix job, outside
Heavy / Check and root `bun run check`. It remains non-required during promotion;
required Check still gates its embedded 0.51.1 Effect rules. PRs pass
`--base origin/<base>`; trusted main pushes run the full inventory. The CLI reuses the coverage lane's workspace
inventory and transitive dependent helper, including packages without coverage
scripts and lab apps. Root compiler/lockfile/runner changes select all projects;
repository prose selects none. Dirty paths join the base-to-HEAD diff locally.
The hosted job uses a 19-GiB hard cgroup ceiling, with swap disabled, via the
runner's existing user systemd manager, using the transient-service transport
used by beep-heavy. A named unit is stopped on shell exit and has an 85-minute
runtime ceiling. A missing manager fails visibly.

Use `--concurrency 1..6` or `BEEP_EFFECT_DIAGNOSTICS_CONCURRENCY`; the flag
wins over the environment. The default is **2 projects**: the eight-CPU full
sweep took 717.407s with 11.89 GiB peak job cgroup memory, versus 1497.811s
serially. Four workers reached 21.52 GiB and six exceeded 24 GiB, so neither
fits the approximately 60%-of-32-GiB budget. The H2 packet records the complete
measurements and final capped PR replay.
For historical comparison, the 2026-10-14 serial spike took 1,423.881 seconds and peaked at
8,109,752 KiB RSS. The compiler comparison took 132.424 seconds. Detailed
coverage, project-profile corrections and the new-rule census live in
`goals/effect-rules-diagnostics-lane/history/2026-10-14-spike.md`.

Discovery uses declared workspace roots, including lab apps, and selects every
`tsconfig.check.json`, `tsconfig.test.json` and existing `test/tsconfig.json`.
The last form covers the CLI tests. It excludes nested test-fixture packages.
Each project runs the installed `effect-tsgo diagnostics --project <config>
--format json --strict` command with bounded Effect concurrency. Project settings are authoritative,
including effect-drizzle's documented missedPipeableOpportunity exception.
Malformed JSON, unexpected exits, zero coverage and files without a plugin fail
the lane. Errors and warnings fail; the configured map promotes enabled rules
to error. All six 0.52 rules are armed at error; the schema-opaque-default
closing PR armed `schemaClassMissingBrand` on 2026-10-15 (the post-#1758 spike
and a full lane run found zero sites). The public catalog payload rename landed
in #1807; no catalog suppression exception remains. The two 0.53 import-style
rules remain explicitly off. Intentional named helper imports are pervasive,
and Effect barrel imports violate the code law.

All three `ignoreEffect*InTscExitCode` options remain **false** in the root and
copied profiles. Required `Heavy / Check` therefore continues failing on the
shared embedded 0.51.1 rules as well as TypeScript errors. The 0.52/0.53 rules
are absent from its map and run only in the non-required diagnostics lane.
A policy fixture proves a shared Effect-only finding and a TypeScript error
each fail tsc-rs; standalone diagnostics also rejects the shared finding.

The root and all copied compiler profiles contain only rule names known by
tsc-rs 0.6.0's embedded 0.51.1 rule set. The nine newer keys live in
`standards/effect-diagnostics.profile.json`, decoded by the CLI with a closed
schema. Each project is resolved with the pinned `get-tsconfig` resolver.
The lane validates that resolved plugin with Schema and keeps its settings and overrides, adds the nine
profile severities to its diagnosticSeverity map, and passes the complete plugin
to `effect-tsgo diagnostics --lspconfig`. This replacement option must receive
the full merged plugin; passing the nine-key profile alone loses project policy.
The profile participates in affected selection, so changing it selects all projects.
The rule-parity checker validates the combined root and lane maps against the
installed 0.53.0 catalog, while copied compiler profiles match the shared root map.

After one green main run of `Heavy / Effect Diagnostics`, promote it in this
order: mark its descriptor required, add `Heavy / Effect Diagnostics` to the
main ruleset through `beep ci ruleset`, fold the lane profile into
`tsconfig.base.json` and the copied profiles, then set all three ignore flags
true and delete the standalone profile and its overlay loader. Keep the flags false until both the
descriptor and live ruleset require the diagnostics context. The empty-project
policy canary proves the interim root map produces no unknown-rule warnings.

The eight Effect packages stay synchronized, but they no longer move with
`tsc-rs`. Both remain independently held for reviewed upgrades. The tsc-rs 0.6.0
embedded rules are still 0.51.1 and may lag. Re-couple only after tsc-rs ports
the newest rules and parity is proved, then remove the separate lane. A bump
must update the complete root severity map and explicit disabled-rule ledger,
remove retired plugin options, preserve package exceptions and repeat the
all-project census. `beep quality tsgo-rules` checks that configuration contract.

## Programmatic access

Run sync API consumers with Node: the upstream transport requires Node private
stdio handles and currently cannot run under Bun. Native-parser tests therefore
run on Node after the remaining Bun test suite.

First-party compiler tools use `TsNativeApi` from `@beep/repo-utils/TsNativeApi`.
Provide `TsNativeApi.layer(TsNativeConfig.make({ cwd, tsconfig }))` with platform
filesystem/path/child-process services at the entrypoint (for example,
`NodeServices.layer`). The layer owns one Go API process
and closes it when its scope ends. Its default executable is the installed
`@effect/tsgo` artifact; `executable` accepts an explicit override.

Call `program(tsconfig)` or `sourceFile(path)` inside `Effect.scoped`; native
handles remain valid only within that scope. `parseSource(fileName, text)` uses
a distinct virtual path per parse for syntax controls and research walkers.
Walk nodes with `node.forEachChild` and guards from
`@typescript/native/unstable/ast`. `diagnostics(tsconfig)` returns detached,
schema-decoded diagnostics. Binary resolution, protocol and missing-file
failures have typed errors. These unstable API calls are validated against the
installed package declarations and require review when upgrading TypeScript.
The programmatic API uses the Go compiler; check/build gates remain on tsc-rs.

## What still needs TS6

- **infra/Pulumi:** the Pulumi nodejs runtime loads the classic compiler API at
  deploy time and declares a `< 7` TypeScript peer. `infra/package.json` keeps
  `typescript: ^6.0.3` until the Alchemy migration removes Pulumi. A narrowly
  scoped syncpack version group permits only this package/dependency divergence.
  `infra:prepare-gha-runners` explicitly uses
  `infra/node_modules/typescript/bin/tsc`; the SDK keeps its own ^6.0.3 dependency
  and checks that its compiler is 6.x before execution.
- **Classic API scripts:** the schema-opaque goal codemod/fixup and scratchpad
  JSDoc census import `@typescript/typescript6` explicitly. Microsoft's bridge
  keeps these live tools usable without putting the classic API back under the
  root `typescript` name. The census accepts `--help` without writing reports.
- **Frozen ontology replay:** reproducing the frozen 2026-08-29
  `beep-ci-operational-ontology` TypeScript adapter needs a 6.x `typescript`
  (for example in a scratch install); preserve its bytes and digest.

The bridge is supported on the repo's Bun pin: oven-sh/bun#33834 was fixed
before Bun 1.4.0. Remove it when these scripts migrate to a supported native
API or are explicitly retired.

Effect-drizzle stays on exact tstyche `8.0.0-beta.0`. Its hosted matrix is
`5.9.3 || 6.0.3`, both exact; explicit targets load compilers from tstyche's
own store and do not load root `typescript`. TypeScript 7 coverage is on demand:

```sh
bun run --cwd packages/ecosystem/effect-drizzle beep:type-test --target next
```

On 2026-10-14 `next` resolved to `7.1.0-dev.20261014.1` and all 78 assertions
passed. It stays out of hosted checks because it moves daily; the beta excludes
7.0 (including 7.0.2) and refuses exact prerelease targets. Add an accepted exact
7.1 beta/stable to the hosted matrix when available. See
`goals/ts7-tstyche8-type-tests` for the lane-C ruling and migration evidence.
Commitlint loads its config through jiti; ts-morph vendors its compiler.
Deprecated API scanning uses oxlint + oxlint-tsgolint's bundled native compiler.

Circular dependency lint uses oxlint’s native `import/no-cycle` rule on the two
tooling source roots. It ignores type-only cycles and requires a positive checked
file count. Madge and its classic compiler parser stack are removed.

Next's build-time type checks use `experimental.useTypeScriptCli: true` in
oip-web and todox. This avoids loading the absent classic `lib/typescript.js`;
Next's native-preview auto-detection does not recognize our native alias.

## Editors

WebStorm's **Languages & Frameworks > TypeScript** picker only lists packages
named `typescript` that carry `lib/tsserver.js`. Native TypeScript 7 has no
`tsserver.js`. The old root 6.0.3 picker entry is gone on purpose. Choose
JetBrains' bundled **TypeScript 7 (Native)** service for plain TS diagnostics
and the Effect plugin’s language server for Effect diagnostics.

Effect diagnostics come from the Effect JetBrains plugin's language server,
which launches the native binary with `--lsp --stdio`. Point its **Binary mode**
at `MANUAL` with the `lib/tsc` path above, never at the
`effect-tsgo` CLI wrapper. `MANUAL` keeps the editor on the catalog's exact
`@effect/tsgo` version; `LATEST` pulls whatever npm tags latest, which can run
ahead of the repo. The plugin setting is stored in the machine-local
`.idea/effect.intellij.xml`, which `beep worktree new` copies into sibling
worktrees (`standards/git-worktrees.md`). A `MANUAL` path is absolute, so a
copied file still points at the source worktree's `node_modules`; re-point it
per worktree if the worktrees drift in `@effect/tsgo` version.

Documentation lint uses repo-owned oxlint plugins. Both lint lanes use oxlint;
ESLint and its TypeScript parser were removed in TS7 exit lane B2.
