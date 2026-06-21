# Lint Toolchain Modernization Spec

## Objective

Make repo quality enforcement **faster** and **closer to effect-smol's code style**,
without giving up Biome as the formatter, by:

1. Migrating pure-syntactic CLI quality checks from `ts-morph`/regex to **Biome
   GritQL** (`.grit`) plugin rules, so they run inside the single Biome pass
   instead of bespoke `ts-morph` Project loads.
2. Aligning `biome.jsonc`'s **lint-rule** enforcement to effect-smol's rule intent
   (import discipline, `no-console`, `no-var`, etc.), while keeping Biome's
   **formatting** (semicolons, ES5 trailing commas) unchanged.
3. Shipping a first-class **`@beep/lint-rules`** package
   (`packages/tooling/policy-pack/lint-rules`) that holds the repo's custom GritQL
   rules and, in a later wave, the custom **oxlint** rules — including the four
   t3code rules.
4. Remediating every violation surfaced by the new configuration and driving the
   work to merged PR(s) via `/yeet`.

The goal is complete only when local quality checks are green **and** `/yeet` has
driven the work all the way to merged PR(s) on `main` with CI green and review
comments addressed.

## Non-Goals

- Replacing Biome with oxlint as the primary linter. Oxlint is added **lint-only**;
  Biome keeps formatting and remains the primary lint engine.
- Changing Biome **formatting** options. `semicolons: "always"` and
  `trailingCommas: "es5"` stay; the divergence from effect-smol's dprint
  (`asi`, `never`, forced arrow parens) is recorded in `STYLE.md`, not "fixed".
- Adding **dprint**.
- Migrating type-aware or cross-file/graph checks off `ts-morph`: `laws dual-arity`,
  `laws terse-effect`, `lint schema-first` (inventory reconciliation),
  `lint circular` (madge graph), `lint allowlist`, `quality turbo-config-proof`,
  `quality changeset-graph`, `quality jsdoc-inventory` all stay as they are.
- Promoting any Fallow advisory lane.

## Source Hierarchy

1. User objective that created this packet (`scratch_6.md`, summarized in
   `research/recon-2026-06-20.md`).
2. `AGENTS.md`, `CLAUDE.md`, and required skills (`yeet`, `effect-first-development`,
   `schema-first-development`, `reflect`).
3. Governing standards: `standards/ARCHITECTURE.md`, `standards/architecture/07-non-slice-families.md`
   (tooling family placement), `standards/effect-laws-v1.md`.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- `biome.jsonc` — lint-rule alignment and `plugins: [...]` GritQL registration.
- **New** `packages/tooling/policy-pack/lint-rules` (`@beep/lint-rules`) — `rules/*.grit`,
  `configs/{core,schema,services}.jsonc` presets, Vitest harness, `docs/rule-guidance.md`;
  later the oxlint plugin and `.oxlintrc.json` extends.
- `packages/tooling/tool/cli` — deprecate/remove the commands migrated to GritQL and
  update the lint-policy aggregators that reference them.
- `turbo.json` + `.github/workflows/check.yml` — wire the GritQL/oxlint lanes
  (advisory first, then mandatory).
- **New** `STYLE.md` — the formatting/lint deviation record vs effect-smol.
- `.oxlintrc.json` (wave P3 only).

## Constraints

- **GritQL is diagnostics-only**: rules report, they do not rewrite. Remediation uses
  Biome safe-fixes (`fix_kind` where available), `ts-morph --write` codemods (e.g. the
  existing `laws effect-imports --write`), or agent edits — never silent mass rewrites.
- **Plugin paths**: Biome resolves GritQL plugins by path; use the agreed resolution
  approach (absolute/`node_modules` path or workspace indirection) and document it.
- **Biome formatting is frozen** for this initiative; no semicolon/trailing-comma churn.
- **No parity loss**: a CLI check may only be removed once its GritQL/oxlint replacement
  reproduces its coverage (proven by fixtures + a baseline diff on the current tree).
- **Each wave ends green**: every code-changing phase must pass `bun run beep yeet verify`
  before its PR merges.
- The new `@beep/lint-rules` package must obey tooling-family doctrine
  (`standards/architecture/07-non-slice-families.md`): no slice/product imports, no
  cross-slice coupling.
- The four t3code oxlint rules are **stateful/path-aware** (legacy baselines, file-path
  scoping, function-body scope) and therefore land as oxlint plugins in P3, not GritQL.

## Rule Overlap Decisions

These are **locked** so execution never has to decide mid-flight which rule owns a concern:

| Concern | Candidate rules | Decision |
| --- | --- | --- |
| Effect import discipline / barrels | effect-smol `no-import-from-barrel-package` vs existing `laws effect-imports` | **`laws effect-imports` owns it.** Do **not** port `no-import-from-barrel-package`: `CLAUDE.md` deliberately allows root `effect` imports for core combinators, which that rule would forbid. `laws effect-imports` encodes beep's real policy and has `--write` remediation. |
| `node:` builtins | t3code `namespace-node-imports` (style) vs `laws native-runtime` (native-API allowlist) | **Both run, complementary.** Different concerns (import alias *style* vs forbidden native APIs); they flag different things, so no dedup needed. |
| Schema compile hot-path | t3code `no-inline-schema-compile` vs `lint schema-first` (inventory) | **Both run, complementary.** Allocation-in-hot-path vs schema-first pattern inventory. |

## Advisory → Mandatory Mechanism

The transition is by **diagnostic severity**, mirroring the repo's existing
`fallow-advisory` CI job pattern (`.github/workflows/check.yml`):

- **Advisory** (P1, and P3 entry): each new GritQL/oxlint rule ships at `severity = "warn"`.
  `bun run lint` does **not** fail on warnings (no `--error-on-warnings`), so CI reports the
  diagnostics without blocking. Capture per-rule counts.
- **Mandatory** (P2, and P3 exit): flip each rule to `severity = "error"` in its rule file
  and confirm `biome.jsonc` enables it; `bun run lint` now fails on any occurrence.
- No new CI job is required for the GritQL path (rules run inside the existing single
  `bun run lint` pass, `check.yml:192`). The oxlint lane (P3) is added as a separate
  `bun run lint:oxlint` task, advisory until promoted.

## Parity Gate

A migrated CLI check is removed only after a runnable parity proof, not by inspection:

1. Build a Vitest harness at `packages/tooling/policy-pack/lint-rules/test/parity/` that runs
   **both** the old CLI command and the new GritQL/oxlint rule over the same fixture set
   (5–10 fixtures incl. edge cases) and the current repo tree.
2. Normalize each to JSONL `{rule, file, line, message}` and diff.
3. **Accept** the replacement only when: (a) every violation the old check flags is also
   flagged by the new rule (old ⊆ new — no coverage loss), and (b) new-only diagnostics are
   triaged (true gaps vs false positives), with false positives driven to zero or allowlisted.
4. Until accepted, run both (new rule advisory). The harness is committed and reviewable.

## Acceptance Criteria

- [ ] `@beep/lint-rules` exists under `packages/tooling/policy-pack/lint-rules`, builds,
      and its rule unit tests pass.
- [ ] The GritQL-eligible CLI checks (`lint tooling-tagged-errors`, the filename portion
      of `lint tooling-schema-first`, `laws effect-fn --check`, and `laws effect-imports
      --check` lint path) are replaced by GritQL rules with proven parity; the superseded
      CLI commands are removed or marked deprecated and dropped from the lint aggregators.
- [ ] `biome.jsonc` enables the full effect-smol-mappable lint-rule set (import discipline,
      `noConsole`, `noVar`, etc.); Biome formatting options are unchanged.
- [ ] `STYLE.md` documents, with rationale, every deviation in a table (rule | effect-smol
      intent | beep choice | status): formatting kept (semicolons/ES5 vs ASI/never),
      `useImportType: separatedType` kept, `no-import-from-barrel-package` not ported, plus
      every rule intentionally skipped/deferred. Minimum ≥5 documented deviations.
- [ ] After any CLI command removal, no dangling references remain (help text, aggregators,
      `package.json` scripts, README) — verified by grep.
- [ ] The four t3code rules (`namespace-node-imports`, `no-global-process-runtime`,
      `no-inline-schema-compile`, `no-manual-effect-runtime-in-tests`) plus the
      effect-smol custom rules are enforced (GritQL where syntactic, oxlint lint-only
      lane in P3 where stateful/path-aware).
- [ ] All resulting violations are remediated: `bun run lint` and `bun run beep yeet verify`
      are green locally.
- [ ] `/yeet` has driven the work to merged PR(s) on `main` with CI (`check.yml`) green
      and review comments addressed.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/lint-toolchain-modernization/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/lint-toolchain-modernization/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/lint-toolchain-modernization` | Passes |
| Rule package tests | `bun test` in `packages/tooling/policy-pack/lint-rules` | Passes |
| GritQL rules load | `bun run lint` (Biome resolves `plugins`, emits expected diagnostics) | Rules active |
| Migrated-check parity | Fixture suite + baseline diff vs pre-migration `ts-morph` output | No coverage loss |
| Repo lint green | `bun run lint` | Zero errors |
| No dangling refs | `rg -n "tooling-tagged-errors\|effect-fn\|<removed cmds>" packages/tooling/tool/cli package.json README.md` | Zero live refs (or `@deprecated`) |
| STYLE.md complete | `test "$(rg -c '\|' STYLE.md)" -ge 5` | ≥5 deviation rows (STYLE.md lives at repo root per Target Surfaces) |
| Quality gate | `bun run beep yeet verify` | Green per wave |
| Reflection gate | `bun run beep lint reflection-artifacts` | Passes |
| Merge evidence | `gh pr list --state merged` + `gh run list --branch main` | PR(s) merged, CI green |

## Stop Conditions

- Biome's GritQL plugin resolution cannot load workspace `.grit` rules reliably after
  reasonable investigation (escalate: keep the check in `ts-morph`).
- A migrated GritQL/oxlint rule cannot reproduce the original CLI check's coverage
  without type information.
- oxlint's custom-plugin API is too unstable to gate CI on Linux (keep P3 advisory-only).
- The implementation would exceed named scope (e.g. touching formatting or type-aware
  checks).
- Verification requires unnamed credentials, cost, destructive side effects, or policy
  approval.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Biome formatting kept (not effect-smol's dprint ASI/`never`) | `biome.jsonc` formatter | repo | Avoids whole-repo reformat; Biome cannot replicate dprint ASI exactly; user decision | Revisit only if a dedicated formatting-parity initiative is opened |
| oxlint deferred to P3, advisory-first | CI lint lane | repo | oxlint custom-plugin API is alpha (Windows/type-aware gaps) | Promote to mandatory when "stable" (oxlint lint lane runs green on Linux CI for 3+ consecutive weeks with no custom-plugin-API breakage). Re-assess **2026-09-20**. |

**P3 exit is closeable either way:** (a) oxlint reaches mandatory + green and all four t3code
rules pass → P3 `done`, goal `done`; or (b) oxlint stays too unstable → P3
`complete-with-exception` (lane live + advisory), the ledger row above carries the
2026-09-20 re-assessment, and a follow-up promotion is tracked separately. The goal does
**not** stay perpetually open waiting on oxlint stability.
