# P7-T3 Group Isolation Runbook

## Objective
Use explicit isolated groups for publish/verify/parity/replay so fixture, CI, and full-repo validation do not collide.

## Command Surface
The command surface supports explicit `--group` wiring:

- `beep kg publish --group <group-id>`
- `beep kg replay --group <group-id>`
- `beep kg verify --group <group-id>`
- `beep kg parity --group <group-id>`

Implementation reference:
- `tooling/cli/src/commands/kg.ts` (`applyGroupOverride`, group flags on publish/replay/verify/parity)

## Isolation Policy
1. Never run CI and local validations on shared `beep-ast-kg`.
2. Use per-run group IDs: `beep-ast-kg-ci-<timestamp-or-run-id>`.
3. Use per-drill groups for resilience tests: `beep-ast-kg-p7-drill-<timestamp>`.
4. Keep production/shared group for stable operational reads only.

## Rotation Policy
1. CI groups: one group per workflow run; retain for 7 days then purge.
2. Local validation groups: one group per session/day; retain for 3 days then purge.
3. Drill groups: retain until drill report is signed off, then purge.

## Evidence
Isolated group run:
- Group metadata: `outputs/p7-kg-excellence/evidence/20260228T105920Z-isolated-group.meta.txt`
- Verify: `outputs/p7-kg-excellence/evidence/20260228T105920Z-verify-both-isolated-group.json`
- Functional parity: `outputs/p7-kg-excellence/evidence/20260228T105920Z-parity-functional-isolated-group.json`
- Strict parity: `outputs/p7-kg-excellence/evidence/20260228T105920Z-parity-strict-isolated-group.json`

## Acceptance Check
- Explicit isolated group wiring exists across publish/verify/parity/replay: **PASS**
- Rotation policy documented: **PASS**

