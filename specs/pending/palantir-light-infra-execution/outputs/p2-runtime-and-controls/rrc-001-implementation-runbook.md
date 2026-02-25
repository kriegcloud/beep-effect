# P2 RRC-001 Implementation Runbook

## Owner

- `runtime-architecture`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-plan.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-results.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/gap-analysis.md`
- `../p1-foundation-build/terraform-opentofu-sst-boundaries.md`

## Exact Tasks

1. Implement `RRC-001.v1` contract types and conformance tests in `platform-runtime-v1` (`RT-T001`, `RT-T002`).
2. Implement resume-token validation, replay detection, and auth/policy revalidation (`RT-T003`, `RT-T004`, `RT-T005`).
3. Implement checkpoint persistence, side-effect fence store, and dedupe metrics (`RT-T006`, `RT-T007`, `RT-T008`).
4. Implement audit and provenance linkage for every resume decision (`RT-T009`, `RT-T010`).
5. Build and run RR scenario harness (`RR-001` to `RR-006`) and publish aggregate closure report (`RT-T011`, `RT-T012`).

## Entry Criteria

- G2 approved.
- Foundation stack and control-plane dependencies are deployed.
- Runtime team has write access to `platform-runtime-v1` deployment targets.

## Exit Criteria

- Duplicate side-effect critical incidents: `0`.
- Duplicate event rate: `<= 1 per 10,000` replayed events.
- Interrupted workflow resume success: `>= 99.5%`.
- All `RT-T001` through `RT-T012` task artifacts are published.

## Verification Commands

```sh
rg -n "RRC-001|ResumeDecision|SideEffectFenceRecord|resumeToken" apps packages tooling infra
```

```sh
bun run check
```

```sh
bun run test
```

```sh
rg -n "RR-001|RR-002|RR-003|RR-004|RR-005|RR-006" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation/rr-execution-runbook.md
```

## Rollback/Safety Notes

- Keep resume path changes behind a deploy-time feature flag until RR thresholds are met.
- If duplicate side effects are detected above threshold, block promotion and revert to the last validated runtime release.
- Preserve checkpoint and fence stores during rollback for forensic analysis.

## Workstream Mapping

| Workstream | Tasks | Deliverable |
|---|---|---|
| WP-RT-001 | RT-T001, RT-T002 | `RRC-001.v1` contract and tests |
| WP-RT-002 | RT-T003, RT-T004, RT-T005 | deterministic resume decision engine |
| WP-RT-003 | RT-T006, RT-T007, RT-T008 | checkpoint/fence persistence and metrics |
| WP-RT-004 | RT-T009, RT-T010 | audit and provenance linkage |
| WP-RT-005 | RT-T011, RT-T012 | RR execution harness and closure report |
