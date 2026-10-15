# Attorney Question Loop Plan

## Status

Status: `active` (P0 complete 2026-10-14; P1 contract next)

## Binding Sequencing

The schema comes first, then the contracts, then the implementation. The P3 producer and the
notice job need the P2 services. The P4 handoff needs the P0 schema merged and the
`practice-claude-mod-review-queue` follow-on to open (its review queue is the card's home). P0 starts once `review-verdict-envelope` (#1761) has merged,
because the `question` member extends its `ReviewItem` union.

## Phases

| Phase | Status | Goal | Entry criteria | Exit criteria |
| --- | --- | --- | --- | --- |
| P0 Schema | complete | `question` ReviewItem member; `AnswerRow`, `AnswerState` (`LiteralKit`) and `QuestionOption` in `@beep/law-practice-domain` `values/`. | #1761 merged. | SPEC P0 criterion; `package-verify @beep/law-practice-domain` passes. |
| P1 Contract | pending | `QuestionQueue` and write-proposal `Context.Service` contracts, the `AnswerLog` port and typed errors. No implementation bodies. | P0 exit met. | SPEC P1 criterion; the contracts type-check. |
| P2 Implementation | pending | Layers, digest selection, the proposal batch and the apply through the docket-intake calendar adapter. Tests cover the first vertical slice. | P1 exit met. | SPEC P2 criterion; `package-verify` passes for use-cases and server. |
| P3 Producer + notice | pending | docket-intake raises questions for unsettled items; the daily notice job runs as a practice service. | P2 exit met. | SPEC P3 criterion. |
| P4 Handoff | pending | Deliver `AMENDMENT-question-card.md` to the `practice-claude-mod-review-queue` owner. | P0 merged and that follow-on opened. | SPEC P4 criterion. |
| P5 Yeet: PR to mergeable | pending | Publish through Yeet and drive the PR to mergeable. | P0–P4 content final. | Mergeable per `AGENTS.md`. |
| P6 Close | pending | Write the closeout reflection and flip packet state. | P5 met. | Reflection under `history/reflections/`; README and manifest updated in the same PR. |

## Current Blockers

- None for P0: `review-verdict-envelope` merged (#1761, 90ef963d43). P0's schema contract is in
  [`research/P0-SCHEMA.md`](./research/P0-SCHEMA.md).

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
