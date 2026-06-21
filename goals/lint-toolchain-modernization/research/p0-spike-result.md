# P0 Spike Result — GritQL-in-Biome wiring, rule ids, baselines

Status: **PASS — P1 unblocked.** Date: 2026-06-20. Engine versions: Biome `2.5.0`,
bun `1.3.14`, node `v26.3.0`.

This file is the binding P0 gate artifact required by `PLAN.md` ("No P1 work before
this file exists with green evidence"). Every claim below is backed by a runnable
command; the spike fixtures live in `/tmp/grit-spike` and `/tmp/grit-layout`
(throwaway, not committed — reproduction steps are inline).

---

## Gate item 1 — ≥3 GritQL rules load via `biome.jsonc` `plugins` and emit diagnostics

**Result: PASS.** Three `.grit` plugins registered in a Biome config `plugins` array
loaded and emitted diagnostics over a fixture in a single Biome pass.

Reproduction (`/tmp/grit-spike`): `biome.json` with
`"plugins": ["./rules/no-new-error.grit", "./rules/no-bigint-literal.grit", "./rules/no-js-ext-import.grit"]`,
each rule using the Biome plugin form:

```grit
language js

`new Error($message)` as $err where {
  register_diagnostic(
    span = $err,
    message = "Use a tagged error (TaggedErrorClass from @beep/schema) instead of native Error.",
    severity = "warn"
  )
}
```

`bunx biome lint --config-path=. fixture.ts` emitted all three diagnostics
(`new Error` → warn, `console.log` → error, relative `.js` import → warn),
`Checked 1 file in 5ms`.

### Path-resolution strategy (LOCKED)

- Biome resolves each `plugins[]` entry **relative to the directory of the config
  file**. A root `biome.jsonc` (`root: true`) referencing a rule in a deeply nested
  package resolves correctly:
  - Reproduction (`/tmp/grit-layout`): root config
    `"plugins": ["./packages/tooling/policy-pack/lint-rules/rules/no-new-error.grit"]`
    flagged `packages/app/src/sample.ts` (`nested-path rule fired`, exit 0 warn).
- **Chosen strategy:** in the repo-root `biome.jsonc`, list each rule by its
  **repo-root-relative path** under the new package, e.g.
  `"./packages/tooling/policy-pack/lint-rules/rules/no-bigint-literals.grit"`.
  No `node_modules` indirection or absolute paths required; nothing to build.
- **Caveat for P1:** Biome `plugins` takes explicit **file** paths (no directory/glob
  expansion observed) — every rule file must be listed individually. Keep the array
  generated/sorted to avoid drift, or add a `lint policy` check that asserts every
  `rules/*.grit` is registered.
- **turbo cache:** `turbo.json`'s `lint` task `inputs` currently lists
  `$TURBO_ROOT$/biome.jsonc` but **not** the `.grit` files. P1 must add the
  `@beep/lint-rules` rule files (or the package dir) to the `lint` task inputs so rule
  edits invalidate the lint cache.

### Severity → advisory/mandatory mechanism (LOCKED)

`register_diagnostic(..., severity = "warn" | "error")` is honored per-rule, and that
is the entire advisory→mandatory lever:

| Scenario | Biome exit | Meaning |
| --- | --- | --- |
| Only `severity="warn"` diagnostics, default flags | **0** | Advisory — CI does not block |
| Any `severity="error"` diagnostic | **1** | Mandatory — CI blocks |
| Warn-only **with** `--error-on-warnings` | **1** | Alternate global lever (not used) |

The repo runs lint as `biome check .` per package (see
`CreatePackage/Handler.ts:1347`, `OperationPlanPackageJson.ts:86`) with **no
`--error-on-warnings`**, so warn-severity rules are inherently advisory under
`bun run lint`. P1 ships every new rule at `severity="warn"`; P2 flips each to
`"error"` once its subsystem is clean. **No new CI job is needed** for the GritQL path
(rules run inside the existing single `bun run lint` Biome pass, `check.yml:192`).

---

## Gate item 2 — Biome 2.5 rule ids + import builtins

Confirmed via `biome explain <rule>` (Biome 2.5.0):

| Intent | Biome rule id (group/name) | Default severity | Fix | Current state in `biome.jsonc` | P1 action |
| --- | --- | --- | --- | --- | --- |
| `no-console` | `lint/suspicious/noConsole` | warn | unsafe | absent | enable `error` + overrides (tests/examples/CLI/scripts/stories) |
| `no-var` | `lint/suspicious/noVar` | warn | unsafe | absent | enable `error` (0 violations) |
| `no-useless-constructor` | `lint/complexity/noUselessConstructor` | info | unsafe | `off` (`biome.jsonc:112`) | re-enable `error` (4 violations) |
| inline type imports | `lint/style/useImportType` | warn | safe | `error`/`separatedType` | **KEEP** `separatedType` (divergence; STYLE.md) |
| filename casing | `lint/style/useFilenamingConvention` | info | none | absent | **builtin candidate** for the `pascal-case-file` migration, override-scoped to the tooling CLI (see gate item 3) |

**Import builtins:** Biome 2.5 has **no** `noEmptyNamedBlocks`, **no**
`noDuplicateImports`, no bigint-literal rule, and no `.js`-extension-import rule
(`biome explain` → "Unrecognized option"). It *does* expose
`useNodejsImportProtocol` (style/info), `noBarrelFile`, `noReExportAll`,
`noNamespaceImport`, `noExportedImports`, `noImportCycles`. Consequences:

- `import/no-empty-named-blocks`, `no-bigint-literals` → **GritQL** (P1). Confirmed: no builtin.
- `import/no-duplicates`, `import/no-self-import` → **oxlint** (P3); no Biome builtin
  (`noDuplicateImports` unrecognized).
- `no-import-from-barrel-package`/`noBarrelFile` → **NOT enabled** (CLAUDE.md allows root
  `effect` imports; `laws effect-imports` owns import discipline). Already locked.

---

## Gate item 3 — Runtime baselines + per-rule violation counts (P2 sizing)

### Migration-candidate CLI command baselines (current tree, `main`)

| Command | Wall time | Exit | Violations on current tree |
| --- | --- | --- | --- |
| `beep lint tooling-tagged-errors` | 1.5s | 0 | **0** (clean) |
| `beep lint tooling-schema-first` | 1.5s | 1 | **69 total** — 57 `[pascal-case-file]`, 3 `[export-interface]`, 1 `[schema-annotation]`, 8 `[tagged-union-pattern]`. **Only the 57 filename violations are in migration scope**; the rest stay in `ts-morph` (`lint schema-first` inventory). |
| `beep laws effect-fn --check` | 5.3s | 0 | **0** (scanned 1601 files) |
| `beep laws effect-imports --check` | 4.8s | 0 | **0** (touched 0) |
| `beep laws native-runtime --check` | 6.8s | 0 | **0** (18 allowlisted) |

**Speed motivation confirmed:** the three `ts-morph` `laws` commands cost ~17s combined
(full `Project` loads); the equivalent GritQL rules run inside the existing Biome pass
(`Checked 2763 files in 124ms` for one rule repo-wide). The migrated checks are also
**clean today**, so migrating them adds near-zero P2 remediation — the P2 cost comes from
the newly-enabled `biome.jsonc` + GritQL rule set, sized below.

### New-rule accurate counts (AST-based, via `biome lint --only=<rule> --reporter=summary .`)

`--only` enables a rule ad-hoc without editing config — used to measure real counts.
**Critical:** ripgrep over-counts because this repo is JSDoc-`@example`-dense
(e.g. naive `console\.` grep = 6931, real AST `noConsole` = **127**). Use Biome counts.

| Rule | Engine | Accurate count | Notes |
| --- | --- | --- | --- |
| `suspicious/noConsole` | biome-builtin | **127 warnings** | over 2763 files; small. Needs overrides for tests/examples/CLI/scripts/stories before flipping to error. |
| `suspicious/noVar` | biome-builtin | **0** | trivial. (The "Found 1 error" in runs is `.ai/mcp/mcp.json` JSON parse, pre-existing & unrelated.) |
| `complexity/noUselessConstructor` | biome-builtin | **4 infos** | trivial. |
| `no-bigint-literals` | gritql | ~**25** (ripgrep, code lines) | no builtin; needs GritQL rule to count exactly in P1. |
| `import/no-empty-named-blocks` | gritql | **0** | no `import {}` in tree. |
| `pascal-case-file` (filename) | biome-builtin (scoped) | **57** | matches the current `tooling-schema-first` filename violations; see parity note. |

**P2 chunk sizing:** every migration-candidate + new rule is small (largest is noConsole
at 127, mostly auto-allowlistable). No subsystem is projected to exceed the ~300
threshold that forces sub-division. The dominant P2 work is GritQL/biome-builtin
remediation that Biome safe-fix (`noConsole`/`noVar`/`noUselessConstructor` all have
fixes) or targeted edits can clear. Final per-rule counts get re-captured at P1 advisory
entry (after overrides are set).

---

## Gate item 4 — Fallback decision

**Path resolution is reliable → no `ts-morph` fallback needed for the wiring.** But the
spike surfaced two rules that must NOT be ported as written, recorded here and destined
for `STYLE.md`:

1. **`no-js-extension-imports` — DO NOT PORT.** beep's `tsconfig.base.json` sets
   `module: "NodeNext"` + `moduleResolution: "nodenext"`, which **requires** `.js`
   extensions on relative imports (verified: `packages/shared` has 28 `.js` relative
   imports, **0** extensionless). effect-smol forbids `.js` because it uses bundler
   resolution. Porting this rule would flag ~838 *correct, required* imports as errors.
   This is a hard, NodeNext-driven divergence — new STYLE.md row alongside
   `no-import-from-barrel-package`.

2. **`pascal-case-file` filename check — route to builtin, prove parity, else keep
   ts-morph.** GritQL `file($name, $body)` *can* see the file, but the canonical Biome
   tool is the builtin `style/useFilenamingConvention` (`filenameCases` + `match`
   regex), **override-scoped** to `packages/tooling/tool/cli/src/**` only (enabling it
   repo-wide flags thousands of legitimately-named files). The current ts-morph check
   strips only `.ts` so compound-extension files (`X.command.ts`, `X.errors.ts`,
   `X.service.ts`) fail its `^[A-Z][A-Za-z0-9]*$` basename test — P1 must reproduce that
   exact semantics through `useFilenamingConvention`'s `match`/`filenameCases` and prove
   parity (fixtures + the 57-violation baseline diff). If it can't, **keep the ts-morph
   filename check** (Stop Condition: "a migrated rule cannot reproduce coverage") and
   record the exception.

---

## P1 advisory results (captured after wiring, 2026-06-21)

All new rules ship `severity = "warn"` (advisory); `bun run lint` stays green. Counts via
`biome lint --reporter=summary` over the tree (excluding `dist`/`.repos`/`*.gen.*`/the
lint-rules fixtures):

| Rule | Engine | Advisory count | P2 disposition |
| --- | --- | --- | --- |
| `suspicious/noConsole` | biome-builtin | 128 | remediate (Effect.log / overrides for tests/examples/CLI/scripts/stories), flip error |
| `suspicious/noVar` | biome-builtin | 0 | flip error (clean) |
| `complexity/noUselessConstructor` | biome-builtin | 4 | remediate (safe-fix), flip error |
| `no-native-error` (tooling src) | gritql | 0 | flip error; remove `lint tooling-tagged-errors` |
| `no-bigint-literals` | gritql | **446 (23 source-only)** | **scope to source (exclude tests/fixtures)** before any flip — 423 are legitimate `LiteralKit`/test data; or keep advisory (STYLE.md divergence) |
| `no-empty-named-blocks` | gritql | 1 | remediate, flip error |
| `prefer-array-flat-map` | gritql | 4 | remediate, flip error |

Source-level enforceable total ≈ **160**; no subsystem exceeds the ~300 sub-division
threshold. The big headline number (446 bigint) is test/domain data, not a real backlog.

**P1→P2 sequencing decision (recorded):** the P1 PR is purely **additive** (new
`@beep/lint-rules` package + advisory `biome.jsonc`/`turbo.json` wiring + `STYLE.md` +
research). Per the SPEC Parity Gate ("run both until accepted"), the migrated `ts-morph`
CLI checks keep running (blocking) alongside the advisory GritQL rules; **CLI
deprecation/removal from the lint aggregators is coupled with the P2 mandatory flip** of
the replacing rule, so enforcement never regresses.

## Decisions carried into P1 (delta to `rule-inventory.md`)

- **Add divergence:** `no-js-extension-imports` → NOT ported (NodeNext). STYLE.md row.
- **Re-route:** `pascal-case-file` engine `gritql` → **`biome-builtin`
  (`useFilenamingConvention`, override-scoped)**, parity-gated; ts-morph fallback if parity fails.
- **Confirm:** `noVar` lives in group **`suspicious`** (not `style`).
- **Confirm:** `noUselessConstructor` default severity is **info** (re-enable at `error`).
- **Wiring:** add `@beep/lint-rules` rule files to `turbo.json` `lint` task `inputs`.
- **Advisory by default:** `bun run lint` uses `biome check .` w/o `--error-on-warnings`;
  ship rules at `warn`, no new CI job for the GritQL path.
