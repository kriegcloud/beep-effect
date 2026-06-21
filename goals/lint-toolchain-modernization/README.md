# Lint Toolchain Modernization

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Speed up repo quality enforcement and align it to effect-smol's code style by
migrating pure-syntactic CLI checks to **Biome GritQL** rules, aligning
`biome.jsonc` lint rules to effect-smol (formatting kept), shipping a
**`@beep/lint-rules`** package, and adding a later **oxlint** lint-only lane for
the t3code custom rules — then remediating every violation and merging via `/yeet`.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/lint-toolchain-modernization/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan (5 phases / 2 config→remediate waves).
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`tasks/tasks.jsonc`](./tasks/tasks.jsonc) - execution task inventory.
6. [`research/recon-2026-06-20.md`](./research/recon-2026-06-20.md) - grounded recon + decisions.
7. [`research/rule-inventory.md`](./research/rule-inventory.md) - rule-by-rule engine/severity/status.

## Current Phase

**P1 Configuration (near-complete; advisory wired, lint green)** — P0 gate PASSED. The
`@beep/lint-rules` package ships 4 GritQL rules + presets + a Vitest harness + a parity
harness; `biome.jsonc` enables `noConsole`/`noVar`/`noUselessConstructor` + the GritQL
plugins **advisory**; `STYLE.md` records ≥12 deviations; `turbo.json` lint inputs updated.
Remaining: `/yeet` this additive PR to merged. **P2** then remediates + flips rules
mandatory + removes the superseded `tooling-tagged-errors` CLI check.

## Latest Evidence

`P1 advisory green (2026-06-21)` — `bun run lint`, package `bun test` (13), `bun run beep
tsconfig-sync --check`, `lint schema-first`, `lint deprecated-apis`, and the jsdoc eslint
lane all pass. Advisory counts: `noConsole` 128, `noVar` 0, `noUselessConstructor` 4,
`no-bigint-literals` 446 (23 source-only; rest are test/`LiteralKit` data),
`no-empty-named-blocks` 1, `prefer-array-flat-map` 4, `no-native-error` 0 (parity ∅⊆∅).
Two checks proven non-viable as GritQL and kept in `ts-morph` with evidence: `effect-fn`
(51 false positives + ~98s on `apps` from `within` traversal) and `effect-imports`
(whole-file consolidation + `--write` needed by yeet). See `research/p0-spike-result.md`
and `STYLE.md`.

## Notes

- Decisions are locked (see `research/recon-2026-06-20.md` decision log): **phased
  dual** (Biome+GritQL first, oxlint lint-only lane later), **keep Biome formatting**,
  **comprehensive rule enablement**, **rules live in `@beep/lint-rules`**.
- The diff will be large; that is acceptable. Each wave still merges green via `/yeet`.
- GritQL is diagnostics-only — remediation uses Biome safe-fixes, `ts-morph --write`,
  or agent edits, never silent mass rewrites.
