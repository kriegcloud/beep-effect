# Yeet Agent Ergonomics

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Harden the Yeet operator path for autonomous agents: publish survives dirty
worktrees and stale bases, every failure class emits a machine-readable
verdict and packet, and the flow runs commit-to-mergeable-PR without leaving
the Yeet command surface.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/yeet-agent-ergonomics/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/session-findings.md`](./research/session-findings.md) - the
   operator-session evidence behind each enhancement plus per-enhancement
   file-level designs.
6. [`history/`](./history/) - evidence and closeouts.

## Relationship To Other Packets

This packet succeeds [`goals/yeet-pr-closeout-loop`](../yeet-pr-closeout-loop/)
for operator-ergonomics concerns. It absorbs two items from that packet's
Follow-Up Optimization Backlog ("Yeet failure packets expose known failed
sub-lanes directly" and the proof-lock portion of "Quality scheduling is
machine-aware") and explicitly supersedes its non-goal "Do not auto-resolve
review threads": this packet adds review-thread write-backs behind explicit
per-thread operator flags. Nothing is ever automatic; the read-first closeout
default is unchanged.

## Current Phase

P4 Verify + publish. P0-P3 are implemented and committed (grounding,
correctness, flow completion, QoL + docs). Next concrete action: dogfood
`bun run beep yeet publish --staged-only --pr --monitor` for the final commit,
then run P5 closeout gates.

## Latest Evidence

Phase commits on `goals/yeet-agent-ergonomics`: P1 `c964826034`,
P2 `4d01d9373f`, P3 `ee579dacf7`. Focused suites green (58 yeet + 43
quality-tasks tests); `research/grounding.md` records the verified code map.

## Notes

- The driving evidence is a real operator session (2026-06-11) that took a
  dependency catalog update through repair/verify/publish/closeout to merged
  PR #226 and logged every point of friction.
- One PR, one commit per implementation phase (P1, P2, P3). The publish of
  that PR must dogfood the new `--staged-only`, `--pr`, and closeout
  write-back capabilities.
