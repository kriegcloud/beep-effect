# Unified AI Toolchain Plan

This plan executes [SPEC.md](./SPEC.md). P0 through P5 are complete for V1.
V2 is active. V3 is planned.

## Status

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0-P5 V1 | complete | Preserve schema truth layer evidence. | V1 evidence remains linked and package checks stay green. |
| V2.0 Bootstrap | complete | Reopen packet for V2/V3 execution. | `GOAL.md`, spec, plan, manifest, and bootstrap evidence are updated. |
| V2.1 Operator CLI | pending | Add root `beep ai-sync` commands. | `audit`, `check`, `drift`, and `refresh-pr` exist with tests. |
| V2.2 Broad Dogfood | pending | Validate all registered repo agent config files. | Root/package checks cover `.codex/config.toml`, `.mcp.json`, `.claude/settings.json`, `AGENTS.md`, and `CLAUDE.md`. |
| V2.3 Reports And Interop Evidence | pending | Add schema-first reports and rulesync audit/import evidence. | JSON reports decode through schemas; rulesync config/MCP evidence is tested; ruler remains research-only. |
| V2.4 Drift Auto-PR | pending | Add weekly/manual scheduled refresh PR workflow. | Known drift can be refreshed into an automation PR with focused proof plus root check. |
| V2.5 Closeout | pending | Prove V2 production-readiness. | V2 verification commands pass and closeout evidence is archived. |
| V3.1 Canonical Models | planned | Add canonical per-domain config models. | Models decode fixtures and import current native repo files. |
| V3.2 Canonical Source | planned | Introduce `.ai-sync/project.jsonc`. | File decodes, imports from native files, and is documented as the canonical source. |
| V3.3 Native Plan/Apply | planned | Emit native files safely. | Dry-run plans, loss reports, temp-dir apply tests, and native validation pass. |
| V3.4 Current-Matrix Emitters | planned | Support existing five target agents. | Claude Code, Codex, Grok Build, JetBrains AI Assistant, and Junie emitters are production-ready without guessing unknown cells. |
| V3b Expansion | planned | Add a research-gated additional-agent batch. | Fresh source-map research selects a bounded batch with current evidence. |

## V1 Closeout

Status: complete.

V1 implementation lives in `packages/tooling/library/ai-sync` as
`@beep/ai-sync`.

Evidence:

- [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md)
- [history/outputs/p1-source-of-truth-pinning-and-tier-1-codegen.md](./history/outputs/p1-source-of-truth-pinning-and-tier-1-codegen.md)
- [history/outputs/p2-tier-2-semantic-field-diff-schemas.md](./history/outputs/p2-tier-2-semantic-field-diff-schemas.md)
- [history/outputs/p3-drift-detection-pipeline.md](./history/outputs/p3-drift-detection-pipeline.md)
- [history/outputs/p4-cross-agent-transforms.md](./history/outputs/p4-cross-agent-transforms.md)
- [history/outputs/p5-first-real-consumer.md](./history/outputs/p5-first-real-consumer.md)

Do not reopen V1 gates unless current implementation contradicts the V1
completion criteria in [SPEC.md](./SPEC.md).

## V2.0 Bootstrap

Status: complete.

- Add compact `GOAL.md` launcher.
- Reframe packet status as V1 complete, V2 active, V3 planned.
- Replace non-specific P6+ follow-ups with V2/V3 phase gates.
- Record decisions in
  [history/outputs/v2-v3-bootstrap.md](./history/outputs/v2-v3-bootstrap.md).

Acceptance gate:

- `GOAL.md` exists and is under 4,000 characters.
- `ops/manifest.json` is valid JSON and marks the packet execution-capable.
- `README.md`, `SPEC.md`, and `PLAN.md` agree on V2/V3 scope.

## V2.1 Operator CLI

Status: pending.

- Add an `ai-sync` command group to `@beep/repo-cli`.
- Implement:
  - `bun run beep ai-sync audit [--json]`
  - `bun run beep ai-sync check [--json]`
  - `bun run beep ai-sync drift [--strict] [--json]`
  - `bun run beep ai-sync refresh-pr [--json]`
- Keep `@beep/ai-sync` as the reusable library and source of schema/drift
  primitives.
- Preserve the root `bun run ai-sync ...` delegate as a low-level compatibility
  shortcut unless a dedicated cleanup is planned.

Acceptance gate:

- Command definitions are tested through `@beep/repo-cli`.
- `--json` outputs decode through `@beep/ai-sync` report schemas.
- Human output is a rendering of the same decoded report values.

## V2.2 Broad Dogfood

Status: pending.

- Promote all currently registered repo agent config files to mandatory
  dogfooding inputs:
  - `.codex/config.toml`
  - `.mcp.json`
  - `.claude/settings.json`
  - `AGENTS.md`
  - `CLAUDE.md`
- Keep validation offline in normal checks.
- Preserve secret-redaction and bounded-error-output behavior.

Acceptance gate:

- `bun run beep ai-sync check --json` reports all five files.
- `bun run --cwd packages/tooling/library/ai-sync check` validates all
  mandatory files or delegates to an equivalent package-local helper.
- `bun run check` includes the broadened dogfood gate.

## V2.3 Reports And Interop Evidence

Status: pending.

- Add schema-first report models for audit, validation, drift, refresh, and
  compatibility evidence.
- Add rulesync config/MCP import or audit evidence only for schema-backed
  surfaces already represented in V1 source metadata.
- Keep ruler as research and mapping evidence in V2; do not promise a supported
  ruler parser.
- Record mapping losses explicitly so V3 native emission can build from tested
  evidence.

Acceptance gate:

- Rulesync evidence tests cover supported and lossy/declined mappings.
- Ruler evidence is documented as research-only.
- Reports identify unsupported, N/A, and `unknown_schema` cells without
  accepting them as finished support.

## V2.4 Drift Auto-PR

Status: pending.

- Add `.github/workflows/ai-sync-drift.yml`.
- Trigger weekly and via `workflow_dispatch`.
- Refresh generated AI-sync artifacts through the root CLI.
- Run:
  - `bun run --cwd packages/tooling/library/ai-sync check`
  - `bun run --cwd packages/tooling/library/ai-sync test`
  - `bun run check`
  - `git diff --check`
- Use the existing scheduled PR pattern from `.github/workflows/data-sync.yml`.
- Open/update an automation PR only when a diff exists.
- Do not route through Yeet publish while Yeet remains proof-mode.

Acceptance gate:

- A dry run with known drift sources produces a report naming the moved source
  ids and prepares the expected generated artifact diff.
- The workflow skips PR creation when no diff exists.

## V2.5 Closeout

Status: pending.

- Archive V2 closeout evidence under `history/outputs/`.
- Update `README.md`, `PLAN.md`, and `ops/manifest.json` from V2 active to V2
  complete.
- Leave V3 planned unless V3 work begins in the same branch.

Required V2 checks:

```sh
test "$(wc -m < goals/unified-ai-toolchain/GOAL.md)" -le 4000
jq . goals/unified-ai-toolchain/ops/manifest.json
bun run beep ai-sync audit --json
bun run beep ai-sync check --json
bun run beep ai-sync drift --strict --json
bun run --cwd packages/tooling/library/ai-sync check
bun run --cwd packages/tooling/library/ai-sync test
bun run check
git diff --check -- goals/unified-ai-toolchain packages/tooling/library/ai-sync packages/tooling/tool/cli .github/workflows
```

## V3.1 Canonical Models

Status: planned.

- Add schema-first canonical per-domain models in `@beep/ai-sync`.
- Cover instructions/rules, skills, commands, hooks, plugins, MCP servers, and
  config/profile data.
- Model finite cases as discriminated unions.
- Keep native schemas separate from canonical models.

Acceptance gate:

- Current native repo files import into canonical values.
- Lossy mappings are explicit and tested.
- Unknown native cells decline with typed errors.

## V3.2 Canonical Source

Status: planned.

- Introduce `.ai-sync/project.jsonc` as the committed canonical source.
- Decode it through canonical schemas.
- Add import/report commands that show how current native files map into this
  file before any native writing exists.

Acceptance gate:

- `.ai-sync/project.jsonc` decodes.
- Import fixtures produce stable canonical JSONC.
- The file path is documented in README, SPEC, and CLI help.

## V3.3 Native Plan/Apply

Status: planned.

- Add dry-run native emission plans with target paths, diffs, validation, and
  loss reports.
- Add explicit apply commands that write only selected paths.
- Prove apply in temp directories before real checkout writes are allowed.

Acceptance gate:

- Plan mode is default and read-only.
- Apply mode validates emitted files against native schemas.
- Conflicts with existing hand-authored files are reported before writes.

## V3.4 Current-Matrix Emitters

Status: planned.

- Implement native emitters for Claude Code, Codex, Grok Build, JetBrains AI
  Assistant, and Junie.
- Decline emission for unsupported and `unknown_schema` cells.
- Preserve lossy/lossless metadata through native emission reports.

Acceptance gate:

- Each supported emitter has round-trip or import-plan-apply validation tests.
- No emitter invents undocumented Grok-native shapes.

## V3b Expansion

Status: planned.

- Refresh public source maps before selecting additional agents.
- Candidate agents must pass evidence criteria from [SPEC.md](./SPEC.md).
- Add a bounded batch only after current-matrix emitters are green.

Acceptance gate:

- Expansion candidates are selected from current public evidence.
- Unsupported or undocumented surfaces remain declined instead of guessed.
