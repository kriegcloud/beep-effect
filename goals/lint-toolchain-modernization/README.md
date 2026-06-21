# Lint Toolchain Modernization

## Status

Lifecycle: `completed-retained`

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

**Complete (P0–P4 done).** Closeout reflection at
[`history/reflections/2026-06-21-claude.md`](./history/reflections/2026-06-21-claude.md);
`bun run beep lint reflection-artifacts` passes.

## Latest Evidence

`Complete (2026-06-21)` — merged PRs: **#270** (`@beep/lint-rules` GritQL package + advisory
Biome alignment), **#273** (review fixes), **#274** + **#275** (P2: promote clean rules to
mandatory, remove `tooling-tagged-errors`), and **#276** (P3 oxlint lint-only lane + this
closeout). Final disposition:

- **Mandatory:** `noVar`, GritQL `no-native-error`/`no-empty-named-blocks`/`prefer-array-flat-map`,
  and oxlint `no-opaque-instance-fields` (all 0 violations). `tooling-tagged-errors` CLI check removed.
- **Advisory (documented divergences in `STYLE.md`):** `noConsole`, `noUselessConstructor`,
  `no-bigint-literals` (intentional domain values), and the oxlint `namespace-node-imports`/
  `no-inline-schema-compile`/`no-manual-effect-runtime-in-tests`/`no-global-process-runtime`
  (promotion + a blocking CI lane re-assessed 2026-09-20 per the SPEC ledger).
- **Kept in `ts-morph` (Stop Conditions, evidenced):** `laws effect-fn` (GritQL = 51 false
  positives + ~98s) and `laws effect-imports` (whole-file consolidation + `--write` yeet depends on).

oxlint custom plugins are stable on Linux (spike-confirmed), so P3 is a real lane, not
"complete-with-exception". See `STYLE.md` and `research/p0-spike-result.md`.

## Notes

- Decisions are locked (see `research/recon-2026-06-20.md` decision log): **phased
  dual** (Biome+GritQL first, oxlint lint-only lane later), **keep Biome formatting**,
  **comprehensive rule enablement**, **rules live in `@beep/lint-rules`**.
- The diff will be large; that is acceptable. Each wave still merges green via `/yeet`.
- GritQL is diagnostics-only — remediation uses Biome safe-fixes, `ts-morph --write`,
  or agent edits, never silent mass rewrites.
