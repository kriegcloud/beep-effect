# Observability Kernel and Instrumentation Catalog Plan

## Status

Status: `completed-retained`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Confirm defect repros, catalog placement, effect snapshot. | Placement decision logged; repro tests red. |
| P1 Defects + split | complete | Fix the five defects; split kernel from server wiring. | Regression tests green. |
| P2 Catalog + registry | complete | Catalog schema, registry with beep.* v2, EmitterContext, TelemetryTier, lint, enrichment. | Decode + lint tests green; doctrine regenerated. |
| P3 Migrate | complete | Metric/name migrations; effect bump. | Repo check green. |
| P4 Yeet | complete | PR to mergeable. | Merge gate passes. |
| P5 Close | complete | Reflection; packet flip. | completed-retained. |

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- 2026-10-14 PR 4 (#1806, closeout): the agent-attribution keys in `@beep/repo-ai-metrics` and `layerCatalogEnrichment` (stamping plus shape-only ceilings on the emit path) finish P2. P3 landed in PR 2 (counter migration, span-name fixes) and PR 3 (#1796, effect 4.0.4). This PR flips the packet to `completed-retained` and carries the reflection.

- 2026-10-14 PR 2: the catalog kernel subpath `@beep/observability/catalog`, the `beep observability catalog` harvest/check command and cheap-gates lane, the generated catalog and doctrine section, the desktop metric migration, and the span-name fixes. The kernel/`server` split of P1 is satisfied by the existing root vs `/server` entry points, with the catalog in the kernel. P2 still owes the agent-attribution key set (`beep.harness`, `beep.provider`, `beep.provider_account`, `beep.route`, `beep.model_role`, `beep.emitter`, `beep.lane`, `beep.session`) as an `@beep/repo-ai-metrics` instruments file, and exporter-side `beep.package`/`beep.family` enrichment.

- 2026-10-14 PR 1: the five defects (DevTools/OTLP ordering, DevTools span end/events, `layerConsoleLogger` tracer bridge and dual form, pluggable `OtlpSerialization`) are fixed with regression tests; `package-verify @beep/observability` passes. The kernel/`server` split is the rest of P1.

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/observability-kernel-catalog/GOAL.md)" -le 4000
jq . goals/observability-kernel-catalog/ops/manifest.json
rg -n "observability-kernel-catalog|GOAL.md|agentLaunchers|packetAnchorDocument" goals/observability-kernel-catalog
git diff --check -- goals/observability-kernel-catalog
```
