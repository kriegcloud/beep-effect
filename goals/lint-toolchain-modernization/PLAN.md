# Lint Toolchain Modernization Plan

## Status

Status: `pending`

This initiative runs as two **config → remediate** waves plus a research spike and a
close. Wave 1 (P1–P2) is the stable Biome + GritQL work; wave 2 (P3) adds the oxlint
lint-only lane. Each code-changing phase ends green via `/yeet` to a merged PR.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| **P0 Research & Spike** | pending | Prove GritQL-plugin-in-Biome wiring; baseline runtimes **and** violation counts; lock the advisory mechanism; finalize `research/rule-inventory.md`; draft `STYLE.md`. | **Binding gate** (all required to enter P1): (1) ≥3 GritQL rules load via `biome.jsonc` `plugins` and emit `warn`/`error` diagnostics, with the chosen path-resolution strategy recorded in `research/p0-spike-result.md`; (2) confirm exact Biome 2.5 rule ids for `noConsole`/`noVar`/`noUselessConstructor` and whether Biome has builtins for the import rules; (3) runtime baselines for the 4 migration-candidate commands + per-rule advisory violation counts captured (used to size P2 chunks); (4) fallback recorded: if path resolution is unreliable after investigation, keep those checks in `ts-morph` and note it. No P1 work before this file exists with green evidence. |
| **P1 Configuration** (user "phase 1") | pending | Build `@beep/lint-rules` (GritQL rules + presets + Vitest harness); author all GritQL rules (effect-smol custom + the CLI-replacement rules); comprehensively align `biome.jsonc` lint rules to effect-smol (formatting frozen); write `STYLE.md`; wire GritQL into turbo/CI/yeet **advisory**; deprecate migrated CLI commands + update aggregators. Capture per-rule baseline violation counts. | Rules load + unit tests green; advisory lane reports counts; parity fixtures pass; no remediation yet. |
| **P2 Remediation** (user "phase 2") | pending | Fix all P1 violations, **chunked by subsystem** — one `/yeet` cycle each for `apps`, `packages/schema`, `packages/tooling`, and remaining packages (sub-divide further if a P0 count exceeds ~300). Biome safe-fix where available, `ts-morph --write`/agent codemods otherwise; flip the new rules `warn` → `error` (mandatory) once each subsystem is clean. | Each chunk: `bun run lint` + `bun run beep yeet verify` green and merged before the next. Final: all rules mandatory; `main` green. |
| **P3a Reconcile t3code state** (P3 pre-work) | pending | Rebuild beep-specific rule state before wiring oxlint: grep beep `*.test\|*.spec` for `Effect.run*`/`ManagedRuntime.make` to build the real `LEGACY_BASELINE`; designate beep's host-process reference path (mirror `packages/shared/src/hostProcess.ts`) and configure `no-global-process-runtime`. | Baseline + path configured; the ported rules emit **zero new** violations on the current tree. |
| **P3 oxlint lane** (deferred dual) | pending | Add oxlint scoped **lint-only** (`.oxlintrc.json` + `bun run lint:oxlint` task); port the four t3code rules + any stateful/scope rules as oxlint plugins in `@beep/lint-rules`; wire advisory → mandatory; remediate; `/yeet` to merged PR. | Per SPEC: oxlint mandatory + green on Linux CI → P3 `done`; **or** stays unstable → P3 `complete-with-exception` with the 2026-09-20 re-assessment recorded. Either way the goal closes. |
| **P4 Close** | pending | Closeout reflection (`/reflect`), README/manifest status, readiness. | `bun run beep lint reflection-artifacts` passes; statuses updated; evidence linked. |

## Sequencing Notes

- P0 is a de-risking gate — do not author the full rule set before GritQL plugin
  resolution is proven on a real fixture.
- "Comprehensive" enablement means P1 turns on the whole mappable rule set (advisory);
  P2 **will** chunk remediation into one `/yeet` cycle per subsystem (`apps`,
  `packages/schema`, `packages/tooling`, remaining), sub-dividing any subsystem whose P0
  violation count exceeds ~300, so every PR stays reviewable and each merges green.
- A migrated CLI command is removed only after its GritQL replacement proves parity
  against the current tree (fixtures + baseline diff). Until then, keep both and run
  the GritQL rule advisory.
- The four t3code rules are stateful/path-aware (legacy baselines, path scoping,
  function-body scope) → oxlint in P3, not GritQL. See `research/rule-inventory.md`.

## P4 Close — Closeout Checklist

> This packet uses an expanded 5-phase structure (P0–P4); the template's P3=Close maps to
> this packet's **P4**.

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling** (GritQL
   ergonomics, Biome plugin resolution, oxlint stability, `ts-morph` startup cost), the
   **implementation** (parity strategy, remediation automation ROI), and the
   **goal/prompt**. Capture TODOs worth codifying. Frontmatter must validate against
   `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase statuses +
   `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative; update it only when the contract changes.
- Keep this plan current; archive run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/lint-toolchain-modernization/GOAL.md)" -le 4000
jq . goals/lint-toolchain-modernization/ops/manifest.json
rg -n "lint-toolchain-modernization|GOAL.md|agentLaunchers|packetAnchorDocument" goals/lint-toolchain-modernization
git diff --check -- goals/lint-toolchain-modernization
bun run lint
bun run beep yeet verify
bun run beep lint reflection-artifacts
```
