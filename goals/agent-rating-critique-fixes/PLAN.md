# Agent Rating Critique Fixes Plan

## Status

P0 in progress (2026-10-21): rating exported, packet bootstrapped via
`bun run beep goals bootstrap` (report-first archetype, phases remapped
below), landing from worktree `agent-rating-critique-fixes` on branch
`docs/agent-rating-critique-fixes`.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Land rating + packet | in-progress | Ship `research/repository-rating.md` (11 dimensions, overall 8/10) and this canonical packet. | Packet validates (doctor, jq, diff --check, GOAL ≤ 4000 chars); PR merged to `main` (Yeet mergeability is the pre-merge check). |
| P1 Cheap wins | pending | §1/§8 deductions: dedupe `AGENTS.md` model pins to one table, delete duplicated runbook prose, fix 3 stale model names, skill frontmatter conformance, root vitest depth-5 glob. | SPEC P1 boxes checked with before/after counts; Agent + Documentation re-scored ≥ 8 by spot audit. |
| P2 Silent-green + gate honesty | pending | §6/§7 deductions: strip `passWithNoTests` where suites exist, absolute coverage floors or recorded rationale, promote or exception-list warn-only rules, S11 recommendation to operator. | Canary deleted-suite fails loudly; Testing re-scored ≥ 9 by spot audit. |
| P3 Maintainability splits | pending | §9/§10 deductions: split the 4 named mega-files (≤ 2,500 lines each), exclude/relocate generated registries from `src` audits. | `wc -l` before/after recorded; each touched package passes `package-verify`. |
| P4 Re-rate + Close | pending | Re-run the identical 11-dimension rubric; land `research/re-rating-YYYY-MM-DD.md`; close the packet. | Overall ≥ 8.5 or follow-up packets named per missed target; reflection landed; `proposedCloseout` (`completed-retained`) recorded in `ops/manifest.json` by the final PR, operative status `active` until completion refresh verifies the merge. |

Each fix phase is its own PR citing the rating section it addresses.
Phases may run in parallel lanes where surfaces do not overlap (P1 docs
vs P2 config vs P3 code), but each lands separately.

## P4 Closeout Checklist

- [ ] Reflection at `history/reflections/<date>-<agent>.md`;
      `bun run beep lint reflection-artifacts` passes.
- [ ] `proposedCloseout` (`completed-retained` + final PR) recorded in
      `ops/manifest.json`; operative status stays `active` until
      `bun run beep goals completion refresh` verifies the merge.
- [ ] Re-rating report linked from `README.md` Latest Evidence.

## Execution Notes

- Preserve unrelated worktree changes; one worktree per phase lane.
- Keep `SPEC.md` normative; update it only when the contract changes,
  with a Decision Log row.
- Friction found while executing a phase is recorded in the phase PR and
  in `research/SOURCES.md` §5, not saved for closeout.

## Verification Commands

```sh
test "$(wc -m < goals/agent-rating-critique-fixes/GOAL.md)" -le 4000
jq . goals/agent-rating-critique-fixes/ops/manifest.json
rg -n "agent-rating-critique-fixes|GOAL.md|agentLaunchers|packetAnchorDocument" goals/agent-rating-critique-fixes
git diff --check -- goals/agent-rating-critique-fixes
bun run beep goals doctor
```
