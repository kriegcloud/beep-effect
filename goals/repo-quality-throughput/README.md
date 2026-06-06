# Repo Quality Throughput

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

Supersedes: [`goals/repo-quality-acceleration`](../repo-quality-acceleration)

## Mission

Make the repo's End-to-End Green lane materially faster without weakening the
authoritative proof. End-to-End Green means the path from a developer edit to a
mergeable pull request: local repair, local blocker checks, commit/push,
GitHub Actions feedback, review comments, and final merge readiness.

The packet must run wide research, synthesize ranked implementation tasks, and
then implement the highest-impact current-PR wins until additional changes show
diminishing returns or require a separate risky design gate.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/repo-quality-throughput/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`research/known-findings.md`](./research/known-findings.md) - seed facts
   agents must not rediscover.
5. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
6. [`ops/prompts/`](./ops/prompts/) - reusable parallel-agent prompts.
7. [`tasks/`](./tasks/) - synthesized task inventory and schema.
8. [`history/outputs/baseline-methodology.md`](./history/outputs/baseline-methodology.md) -
   benchmark protocol.
9. [`history/`](./history/) - evidence, benchmark notes, and closeouts.

## Current Phase

Phase `P1` Batch 1 evidence has been persisted and synthesized. Next action:
run Batch 2 from
[`ops/prompts/batch-02-hotspots.md`](./ops/prompts/batch-02-hotspots.md), then
perform the Batch 2 closeout before launching Batch 3.

## Latest Evidence

Batch 1 reports now live under [`research/`](./research), and
[`history/outputs/research-synthesis.md`](./history/outputs/research-synthesis.md)
selects the first current-PR candidates. Clean-tree `lint:fix` currently proves
the repo-cli no-op path in `real 0.04`.

## Notes

- This packet is deliberately broader than the older acceleration packet. It
  covers local commands, Yeet, Turbo, docgen, hooks, GitHub Actions, setup/cache
  behavior, security gates, release/storybook/data-sync side lanes, and config
  blast radius.
- Research is not enough. Completion requires implementation of the ranked
  current-PR wins and before/after evidence.
- Keep repo-owned quality behavior inside `@beep/repo-cli`,
  `@beep/repo-utils`, or package/workflow configuration. Do not reintroduce
  one-off root scripts for durable quality semantics.
