# Workspace Thread Domain Plan

## Status

Status: `pending`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | pending | Inspect source hierarchy; run the PGlite migration smoke proof. | Required facts and blockers are recorded; PGlite proof archived. |
| P1 Implement | pending | Make the smallest changes that satisfy `SPEC.md`. | Acceptance criteria are met. |
| P2 Verify | pending | Run required checks and capture evidence. | Verification is green or blockers are documented. |
| P3 Close | pending | Prepare PR, review response, write the closeout reflection, and final readiness if requested. | Packet status and evidence are updated; a closeout reflection exists. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (what worked, what didn't, what was frustrating, what you wished existed), the
   **implementation** (improvement opportunities), and the **goal/prompt** (would
   you revise it to be clearer/easier/more efficient?). Capture TODOs worth
   codifying. Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- The `agents` rename touches many imports — regenerate the repo-exports
  catalog **last**, after the tree is stable.

## Verification Commands

```sh
test "$(wc -m < goals/workspace-thread-domain/GOAL.md)" -le 4000
jq . goals/workspace-thread-domain/ops/manifest.json
rg -n "workspace-thread-domain|GOAL.md|agentLaunchers|packetAnchorDocument" goals/workspace-thread-domain
git diff --check -- goals/workspace-thread-domain
```
