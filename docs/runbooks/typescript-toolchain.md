# TypeScript toolchain: which compiler runs where

Use this runbook when a tool, an editor, or a dependency bump asks "which
TypeScript is this repo on?" The answer is two versions on purpose, and the
Effect compiler is patched over one of them.

## Four packages, four roles

| Package (catalog) | Version | Role |
| --- | --- | --- |
| `typescript` | `^6.0.3` | Programmatic (JS) compiler API only. Never runs a repo typecheck; its `bin/tsc` is shadowed. |
| `@typescript/native` | `npm:typescript@^7.0.2` | The TypeScript 7 Go compiler. Owns the hoisted `node_modules/.bin/tsc`. |
| `@effect/tsgo` + seven `@effect/tsgo-<platform>` packages | `0.53.0` | The Effect language service build of TypeScript 7. Editors and the independent Effect diagnostics lane use this reviewed pin; it can advance beyond the tsc-rs port. |
| `tsc-rs` + six `@tsc-rs/<platform>` optional packages | `0.6.0` | The Rust port of the TypeScript 7 compiler ([pingdotgg/ts-rust](https://github.com/pingdotgg/ts-rust)) with the Effect rules of one effect-tsgo version compiled in (0.6.0 ports 0.51.1) and its own TypeScript pinned (`7.1.0-dev.20261008.1`). Runs every `beep:build`, `beep:check` and `beep:check:tests`, the root `check:configs`, and infra's `-b` build. |

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
Heavy / Check and root `bun run check`. It is a required context and the only
gate for Effect rules; tsc-rs in Heavy / Check reports them but no longer fails
on them. PRs pass
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
to error. Five 0.52 rules are armed at error. `schemaClassMissingBrand` remains
off in the lane profile as of 2026-10-14; the schema-opaque-default closing PR
flips that one key
(the post-#1758 spike found zero sites). The public catalog payload rename landed
in #1807; no catalog suppression exception remains. The two 0.53 import-style
rules remain explicitly off. Intentional named helper imports are pervasive,
and Effect barrel imports violate the code law.

All three `ignoreEffect*InTscExitCode` options are **true** in the root and
copied profiles. Required `Heavy / Check` fails on TypeScript errors only; tsc-rs
still prints its embedded 0.51.1 Effect findings, but every Effect rule, shared or
newer, gates through the required diagnostics lane. A policy fixture proves an
Effect-only finding leaves tsc-rs at exit 0 while standalone diagnostics rejects
it, and a TypeScript error still fails tsc-rs.

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

Promotion followed the first green main run (job 116271099290 on ce5780ed67:
291 projects, 73,884 file visits, zero findings, 14m17s). The descriptor and
ruleset 10240248 both require `Heavy / Effect Diagnostics`, and the three
ignore flags are true. The standalone profile stays: an empty-project canary
with the nine keys folded into the root map exits 0 with the flags true, but
tsc-rs 0.6.0 prints nine TS377134 unknown-rule warnings for every project.
Fold the profile into `tsconfig.base.json` and delete it, with its overlay
loader, when tsc-rs ports those rules. The empty-project policy canary keeps
proving that the root map produces no unknown-rule warnings.

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

## Why `typescript@6` cannot go yet

TypeScript 7.0 shipped without the classic programmatic API that tools import
from the `typescript` module. Microsoft targets a stable API for 7.1. Until a
consumer releases against that API, it needs the 6.x package under the
`typescript` name. The tstyche row was refreshed 2026-10-14; other rows were
checked 2026-09-24:

| Tool | Needs `typescript@6`? | Why |
| --- | --- | --- |
| tstyche 8.0.0-beta.0 | no, for effect-drizzle's explicit targets | downloads `5.9.3` and `6.0.3` (hosted matrix) plus `next` (on demand) to its own store; TS7 backend uses the 7.1 sync/ast API. No root `typescript@6` API is loaded for this matrix. |
| commitlint (`cosmiconfig-typescript-loader`) | no direct API use | declares a TypeScript peer; `commitlint.config.ts` is loaded through jiti |
| ts-morph 28 | no | `@ts-morph/common` vendors its own TypeScript 6.0.2 |

Deprecated API scanning uses oxlint 1.88.0 + oxlint-tsgolint 7.0.2004 (bundled
TypeScript 7.0.2), independently of the JS compiler API.

The hold lives in `syncpack.config.ts` (the "Held back" update group) so
`deps:update` cannot collapse the split. Reassess the root `typescript@6` hold
when the remaining classic-API consumers support TypeScript 7.1; only then drop `typescript@6` and
re-point consumers that resolve the `typescript` name at the native package.
The separate exact tstyche beta hold ends when stable 8.0 passes the same
effect-drizzle assertions.

Effect-drizzle's hosted matrix is `5.9.3 || 6.0.3`, both exact, so `beep:check`
stays reproducible. TypeScript 7 coverage is an on-demand local run:
`bun run --cwd packages/ecosystem/effect-drizzle beep:type-test --target next`.
On 2026-10-14 `next` resolved to `7.1.0-dev.20261014.1` and all 78 assertions
passed. It stays out of the hosted matrix because `next` moves daily and the beta
refuses exact prerelease targets, including the tsc-rs pin
`7.1.0-dev.20261008.1`. When tstyche lists a 7.1 beta or stable, add that exact
version to the hosted matrix. The beta intentionally excludes 7.0, including
7.0.2. Only the `*` target selects the installed TypeScript; explicit targets
use stock store compilers, without the repo's Effect patch.
See `goals/ts7-tstyche8-type-tests` for the errors and migration evidence.

Microsoft's `@typescript/typescript6` bridge (alias `typescript` to 7 and give
old consumers 6 under a second name) was blocked by a Bun alias-resolution bug
(oven-sh/bun#33834). The fix merged 2026-08-06 and Bun 1.4.0 shipped after it,
so the bridge is now available on the repo's Bun pin. Adopting it is a separate
decision; nothing here depends on it.

## Editors

WebStorm's **Languages & Frameworks > TypeScript** picker only lists packages
named `typescript` that carry `lib/tsserver.js`. Native TypeScript 7 has no
`tsserver.js`, so that picker can never host the Effect compiler and will keep
showing `node_modules/typescript` at 6.0.3. Leave it there, or choose
JetBrains' bundled "TypeScript 7 (Native)" entry for plain TS diagnostics.

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
