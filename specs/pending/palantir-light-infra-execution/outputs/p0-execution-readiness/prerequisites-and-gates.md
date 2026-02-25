# P0 Prerequisites and Gates

## Owner

- `platform-program-management`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/implementation-readiness-checklist.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`

## Exact Tasks

1. Freeze locked-input snapshot and publish execution start record dated `2026-02-25`.
2. Validate prerequisite categories: account access, IAM role access, IaC toolchain, CI identity, and incident contacts.
3. Define gate checklist and approval workflow for G0 through G4.
4. Assign gate approvers and backup approvers for each gate.
5. Publish escalation path with response-time targets for blocked gates.

## Entry Criteria

- Infra execution spec directory and manifest exist.
- Locked input documents are accessible in the prior spec directory.
- Program manager and platform leads are assigned.

## Exit Criteria

- G0 and G1 criteria are documented and approvers are named.
- Gate checklist has no unowned control item.
- Escalation path includes owner, backup, and response-time target.

## Verification Commands

```sh
rg -n "G0|G1|G2|G3|G4" specs/pending/palantir-light-infra-execution/outputs/p0-execution-readiness/prerequisites-and-gates.md
```

```sh
rg -n "platform-program-management|approval|escalation" specs/pending/palantir-light-infra-execution/outputs/p0-execution-readiness/prerequisites-and-gates.md
```

## Rollback/Safety Notes

- If G0 fails, stop all downstream phase activity.
- If G1 fails, block P1 start and run a corrective action meeting within one business day.
- Any change to gate criteria requires approval from `platform-program-management` and `security-architecture`.

## Gate Checklist

| Gate | Control | Approver Role | Backup Role |
|---|---|---|---|
| G0 | Locked inputs acknowledged with no decision changes | platform-program-management | release-management |
| G1 | Environment, secrets, and access prerequisites complete | platform-security | platform-devops |
| G2 | Foundation stack and network/security baseline validated | platform-foundation | security-architecture |
| G3 | Runtime controls and CI/CD drift controls validated | runtime-architecture | data-architecture |
| G4 | Cutover readiness and rollback drill validated | release-management | runtime-architecture |
