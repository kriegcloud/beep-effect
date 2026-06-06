# Repo Quality Throughput Plan

## Status

Status: `implementation-active`

## Operating Posture

The research is done. This packet now exists to make the next agent implement
performance improvements, not to discover them again. Old reports and prompts
remain as evidence, but they are not active launch steps.

Use bounded local verification, keep at most one heavy local lane running, and
use GitHub Actions for repeated full-lane proof.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research Archive | complete | Preserve Batch 1-3 reports as evidence. | Reports stay under `research/`; prompts are historical only. |
| P1 Packet Conversion | complete | Replace closed/research wording with implementation-only steering. | GOAL, README, PLAN, SPEC, manifest, and tasks all agree. |
| P2 Repo-Exports Shards | complete | Implement tracked package-local shards, shard-aware lookup, and root index. | `repo-exports:catalog` and `:check` pass with measured before/after evidence. |
| P3 Test Participation | complete | Fix missed integration owners and filter no-op type/integration graph work. | Dry-run task counts shrank and focused real test proof passed. |
| P4 Docgen Reuse | complete | Add proof manifests, shadow parity, and gated package-level reuse. | Local proof reuse skips current packages with full fallback preserved. |
| P5 Scoped Config | complete | Add a dry-run harness and safe task-input/package-overlay changes. | Affected dry-runs prove reduced blast radius without stale caches. |
| P6 CI / Yeet / Prototypes | complete | Add CI timing/order wins, guarded Yeet monitor, and bounded prototypes. | PR checks preserve names, pass, and show measured or instrumented wins. |
| P7 Close | in-progress | Run quality-review-fix-loop, push, monitor PR, and address comments. | PR is mergeable with selected tasks done or blocker-waived. |

## Active Task Order

No selected implementation task remains. Continue with P7 closeout.

Do not spend implementation time on `rqt-001`, `rqt-002`, `rqt-004`, or the
now-complete `rqt-003`, `rqt-005`, `rqt-006`, `rqt-007`, `rqt-008`, and
`rqt-009`, plus the rqt-010 prototype gate/waiver closure, except to preserve their
guardrails. Do not resurrect `rqt-011` or `rqt-012`.

## Implementation Rules

- Work from `tasks/tasks.jsonc` and update each task's `done` record when
  implemented.
- A selected task may move to `deferred` only after blocker-quality evidence is
  recorded with owner, fallback, and waiver.
- Prefer `@beep/repo-cli`, `@beep/repo-utils`, and `@beep/repo-codegraph` for
  durable behavior.
- Preserve check names and the authoritative full proof.
- Keep package-local config overlays narrow and proven by resolved Turbo task
  definitions.
- Keep symbol/example-level docgen selectivity shadow-only; package-level reuse
  may become active only after full fallback proof agrees.
- Yeet fast-plus-monitor stays explicit, guarded, and PR-branch-only.

## Proof Requirements

Record before/after rows in `history/outputs/before-after-matrix.md` for every
completed task. At minimum, cover:

- `lint:fix` clean tree and small changed-file set;
- repo-export generation/check time and root artifact size;
- type-test and integration dry-run task counts plus real proof;
- docgen full fallback, package proof manifest reuse, and aggregation behavior;
- Turbo affected-package/task counts for scoped config changes;
- CI setup/cache timing, Nix/release ordering wins, and check-name preservation;
- Yeet monitor plan/output and explicit pre-push fallback;
- canonical full quality proof and PR wall clock.

## Verification Commands

Packet validation:

```sh
test "$(wc -m < goals/repo-quality-throughput/GOAL.md)" -le 4000
jq . goals/repo-quality-throughput/ops/manifest.json
jq . goals/repo-quality-throughput/tasks/tasks.schema.json
git diff --check -- goals/repo-quality-throughput
```

Implementation proof, adjusted only when a task records a safer equivalent:

```sh
bun run lint:fix
bun run repo-exports:catalog
bun run repo-exports:catalog:check
bun run test
bun run docgen
bun run audit:github quality
bun run beep yeet verify --plan --json
gh pr checks --watch
```

## Stop Conditions

- A proposed speedup weakens proof without a named full fallback.
- Local proof repeatedly makes the workstation unusable despite bounded runs.
- Verification requires secrets, destructive actions, cost, or policy approval.
- The same blocker repeats after reasonable investigation and cannot be
  resolved without user input.
