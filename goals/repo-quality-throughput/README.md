# Repo Quality Throughput

## Status

Lifecycle: `current-pr-proof-green`

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

Phase `P6` closeout is complete through the latest live PR proof available
before this packet-only follow-up commit. Batch 1, Batch 2, and Batch 3 reports
are persisted, selected current-PR tasks are either done or explicitly
deferred, and the final local packet verification should run before pushing any
additional evidence changes.

## Latest Evidence

Batch 3 reports now live under [`research/`](./research), including
[`research/batch-03-synthesis.md`](./research/batch-03-synthesis.md). The
latest recorded live PR proof before this follow-up commit is Check run
`27064446802` on commit `a7be8dc1e1119d095be0239b39cd812e5650ebec`; PR #214
was mergeable and all current checks were green or intentionally skipped.

Implemented current-PR wins:

- `rqt-001`: Yeet verify/publish no longer duplicate affected feedback before
  the full proof.
- `rqt-002`: `lint:fix` keeps its sub-50 ms clean-tree no-op path and
  changed-file Biome fixing path.
- `rqt-004`: proof parity and check-name guardrails are recorded.

Deferred high-value follow-ups:

- setup/cache comparable-run tuning;
- docgen package fingerprint shadow proof;
- scoped Turbo/config blast-radius proof;
- repo-export package shards plus root aggregation;
- type-test/integration participation filtering;
- opt-in Yeet fast-plus-monitor with full fallback.

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
