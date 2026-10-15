# Attorney Question Loop Plan

## Status

Status: `active` (P0 merged #1801; P1, P2, P3a and P3b complete; P3c service wiring next)

## Binding Sequencing

The schema comes first, then the contracts, then the implementation. The P3 producer and the
notice job need the P2 services. The P4 handoff needs the P0 schema merged and the
`practice-claude-mod` P1b queue gate. P0 starts once `review-verdict-envelope` (#1761) has merged,
because the `question` member extends its `ReviewItem` union.

## Phases

| Phase | Status | Goal | Entry criteria | Exit criteria |
| --- | --- | --- | --- | --- |
| P0 Schema | complete | `question` ReviewItem member; `AnswerRow`, `AnswerState` (`LiteralKit`) and `QuestionOption` in `@beep/law-practice-domain` `values/`. | #1761 merged. | SPEC P0 criterion; `package-verify @beep/law-practice-domain` passes. |
| P1 Contract | complete | `QuestionQueue` and write-proposal `Context.Service` contracts, the `AnswerLog` port and typed errors. No implementation bodies. | P0 exit met. | SPEC P1 criterion; the contracts type-check. |
| P2 Implementation | complete | Layers, digest selection, the proposal batch and the apply through the docket-intake calendar adapter. Tests cover the first vertical slice. | P1 exit met. | SPEC P2 criterion; `package-verify` passes for use-cases and server. |
| P3 Producer + notice | in-progress | P3a: the docket-intake producer (needs-review items become `question` items) and the daily notice (`DailyNotice` plus a `NoticeMailbox` adapter over `@beep/m365`). P3b: the workstation review hub, an authenticated HTTP MCP app exposed only on the tailnet, with JSONL item, answer and verdict logs, and tools to list open items and record answers and verdicts. P3c: wire the hub, producer and notice job as practice services. | P2 exit met. | SPEC P3 criterion; the hub's tools are tested in-process; the services run under systemd. |
| P4 Handoff | pending | Deliver `AMENDMENT-question-card.md` to the `practice-claude-mod-review-queue` owner. | P0 merged and that follow-on opened. | SPEC P4 criterion. |
| P5 Yeet: PR to mergeable | pending | Publish through Yeet and drive the PR to mergeable. | P0–P4 content final. | Mergeable per `AGENTS.md`. |
| P6 Close | pending | Write the closeout reflection and flip packet state. | P5 met. | Reflection under `history/reflections/`; README and manifest updated in the same PR. |

## Current Blockers

- None. The answer-log transport is decided: a workstation review hub over the tailnet (SPEC
  Decision Log, data-plane).
- The pane side, where the attorney's review queue calls the hub, belongs to the
  `practice-claude-mod-review-queue` follow-on through the amendment. The hub's tool names and
  schemas are its contract.

## Closeout Checklist

Before marking the packet closed:

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Its YAML frontmatter must
   validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts`.
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.

## Verification Commands

```sh
test "$(wc -m < goals/attorney-question-loop/GOAL.md)" -le 4000
jq . goals/attorney-question-loop/ops/manifest.json
rg -n "attorney-question-loop|GOAL.md|agentLaunchers|packetAnchorDocument" goals/attorney-question-loop
git diff --check -- goals/attorney-question-loop
```
