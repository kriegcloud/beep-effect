# <Goal Title> Spec

## Objective

<State the final result in observable terms.>

## Non-Goals

- <Out-of-scope behavior, package, workflow, migration, or policy.>

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- <Package, app, docs, workflow, or artifact this goal may change.>

## Constraints

- <Hard requirement, boundary rule, compatibility concern, or quality bar.>

## Acceptance Criteria

- [ ] <Observable result that proves the goal is complete.>
- [ ] <Observable result that proves the goal is complete.>
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/<slug>/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/<slug>/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/<slug>` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The implementation would exceed named scope.
- Verification requires credentials, cost, destructive side effects, or policy
  approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
