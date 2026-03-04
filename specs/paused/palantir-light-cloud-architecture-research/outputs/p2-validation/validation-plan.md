# Validation Plan

## Objective

Validate P1 conclusions against required architecture scenarios before implementation recommendation, using direct evidence from P1 artifacts.

## Validation Check Structure

Use `ValidationCheck` fields exactly:
- `id`
- `scenario`
- `expected`
- `evidenceRef`
- `result` (`pass` | `fail` | `partial` | `pending`)
- `notes`

## Scenario Coverage

| id | scenario | expected | validation method | primary evidenceRef |
|---|---|---|---|---|
| VC-001 | Policy precedence: mandatory vs purpose vs role controls | Deterministic deny-first precedence and conflict matrix are defined and mapped to SOC2 access controls. | Inspect precedence rules, conflict matrix, and control mapping consistency. | `outputs/p1-research-execution/policy-plane-design.md`, `outputs/p1-research-execution/compliance-control-mapping.md` |
| VC-002 | Provenance completeness for user-visible output | Provenance envelope captures source, transformation, tool execution, and policy decision lineage across high-risk workflow classes. | Inspect provenance contract and verify evidence of trace exemplars coverage expectation. | `outputs/p1-research-execution/provenance-audit-architecture.md`, `outputs/p1-research-execution/compliance-control-mapping.md` |
| VC-003 | Audit integrity and SIEM exportability | Append-only audit controls include integrity validation and export path into operations telemetry. | Inspect audit model and observability integration path. | `outputs/p1-research-execution/provenance-audit-architecture.md`, `outputs/p1-research-execution/observability-and-sre-architecture.md` |
| VC-004 | Runtime/workflow interrupt-resume correctness | Durable checkpoints, resume tokens, retries, and idempotency boundaries are specified and tied to recovery criteria. | Inspect runtime execution model and availability/control gaps. | `outputs/p1-research-execution/runtime-workflow-architecture.md`, `outputs/p1-research-execution/compliance-control-mapping.md` |
| VC-005 | Streaming continuity under failure/reconnect | Reconnect flow prevents duplicate or lost side effects with explicit dedupe/replay controls. | Inspect streaming guarantees and residual runtime risks. | `outputs/p1-research-execution/runtime-workflow-architecture.md`, `outputs/p1-research-execution/aws-first-reference-architecture.md` |
| VC-006 | Local-first conflict resolution with access constraints | Offline/online reconciliation preserves ACL and mandatory control semantics. | Inspect conflict matrix, replay policy checks, and mutation quarantine behavior. | `outputs/p1-research-execution/local-first-collaboration-architecture.md`, `outputs/p1-research-execution/policy-plane-design.md` |
| VC-007 | Cost guardrails and throttling behavior | Budget/anomaly triggers, throttles, and kill-switch criteria are defined for high-variance workload classes. | Inspect capacity/cost controls and operational runbook triggers. | `outputs/p1-research-execution/cost-and-capacity-model.md`, `outputs/p1-research-execution/observability-and-sre-architecture.md` |
| VC-008 | Compliance evidence traceability | SOC2 control mapping is complete enough to trace controls to architecture evidence with no unresolved critical gaps. | Inspect control mappings, residual gaps, and evidence linkage. | `outputs/p1-research-execution/compliance-control-mapping.md`, `outputs/p1-research-execution/source-citations.md` |

## Execution Rules

1. Every result row in `validation-results.md` must include non-placeholder `evidenceRef`.
2. Any `partial` or `fail` result must map to at least one entry in `gap-analysis.md`.
3. Any unresolved `critical` risk in `risk-register.md` blocks a go decision.
4. Recommendation must explicitly state go/no-go and unresolved critical-risk handling.

## RISK-003 Closure Plan (VC-004 and VC-005)

### Scope

Validate replay/reconnect behavior for interruptible workflows and streaming continuity under burst failure conditions to close `GAP-RT-01` / `RISK-003`.

### Non-Throwaway Runtime Target

- Target runtime alias: `platform-runtime-v1`.
- Ownership: `runtime-architecture` (platform stack boundary from `iac-operating-model.md`).
- Scope rule: RR closure evidence must come from `platform-runtime-v1`, not throwaway app runtimes.

### Runtime Contract Artifact (`RRC-001`)

`RRC-001` defines the minimum production runtime interfaces required before RR execution can produce closure-grade evidence.

```ts
type ResumeTokenPayload = {
  tokenId: string
  workflowExecutionId: string
  sessionId: string
  principalId: string
  policyVersion: string
  authContextHash: string
  issuedAt: string
  expiresAt: string
}

type CheckpointRecord = {
  workflowExecutionId: string
  checkpointId: string
  checkpointSeq: number
  stage: string
  sideEffectFenceIds: ReadonlyArray<string>
  emittedAt: string
}

type SideEffectFenceRecord = {
  fenceId: string
  workflowExecutionId: string
  operationClass: string
  idempotencyKey: string
  firstCommittedAt: string
  commitCount: number
  lastObservedAt: string
}

type ResumeRequest = {
  resumeToken: string
  requestedAt: string
  requestId: string
}

type ResumeDecision = {
  decision: "accepted" | "rejected" | "expired" | "replayed"
  reason: string
  workflowExecutionId: string
  checkpointSeq: number
  policyDecisionRef: string
}
```

### `RRC-001` Invariants

1. Resume acceptance requires auth-context + policy-version revalidation.
2. Checkpoint sequence is monotonic and never regresses for a workflow execution.
3. Side-effect fences enforce single-commit behavior per `idempotencyKey`.
4. Every resume decision is traceable via audit and provenance references.
5. Duplicate resume attempts for the same token are rejected or treated as replay without new side effects.

### Entry Criteria

- `RRC-001` is approved for `platform-runtime-v1` and versioned (`RRC-001.v1`).
- Resume token contract is implemented with policy/auth revalidation.
- Idempotency key strategy and replay fence behavior are implemented for side-effecting steps.
- Audit/provenance correlation IDs are emitted for workflow, session, and decision paths.

Current status check (2026-02-25): the architecture-level criteria exist in P1 artifacts, but RR execution is scope-gated because the current `apps/web` runtime is explicitly throwaway and out of production-validation scope.

### Exit Criteria (all required)

1. Duplicate side-effect critical incidents: `0`.
2. Duplicate event rate across replayed events: `<=1 per 10,000`.
3. Interrupted workflow resume success (non-manual): `>=99.5%`.
4. All test runs produce complete evidence packets using the template in `validation-results.md`.
5. `RRC-001` invariants are satisfied in every executed RR scenario.

### `RRC-001` Acceptance Criteria

| acceptanceId | criterion | threshold | RR Link | required evidence |
|---|---|---|---|---|
| AC-RT-001 | Resume tokens are uniquely bound to workflow/session/principal and expire deterministically. | 100% token validation coverage in executed RR runs. | RR-001, RR-003 | Token validation logs + resume decision records. |
| AC-RT-002 | Checkpoint sequence does not regress across retries/reconnects. | 0 sequence regressions. | RR-001, RR-002, RR-004 | Checkpoint stream snapshots per run. |
| AC-RT-003 | Replay fence prevents duplicate side effects for repeated resumes/retries. | Duplicate side-effect critical incidents = 0. | RR-002, RR-004, RR-006 | Side-effect fence records + dedupe metrics. |
| AC-RT-004 | Resume path revalidates auth/policy context before continuation. | 100% resume attempts have decision records with policy refs. | RR-005 | Resume decision audit trail + policy decision refs. |
| AC-RT-005 | Resume/replay decisions are fully auditable and provenance-linked. | 100% runs have trace/log/policy/envelope references. | RR-001..RR-006 | Evidence packets with complete `auditProvenanceRefs`. |
| AC-RT-006 | Resilience targets are met under burst reconnect conditions. | Duplicate rate <=1/10,000 and resume success >=99.5%. | RR-004 | Aggregated metrics report for burst profile. |

### Stress Scenarios

| scenarioId | scenario | failure injection | expected |
|---|---|---|---|
| RR-001 | Disconnect before side-effect commit ack | Drop client connection after submit, before ack delivery | Exactly one committed side effect after reconnect and replay. |
| RR-002 | Disconnect after side-effect commit, before checkpoint confirmation | Kill session after side effect but before checkpoint callback | Replay fence prevents duplicate external mutation. |
| RR-003 | Token reuse / duplicate reconnect attempt | Reuse same resume token concurrently from two clients | One session accepted, duplicate attempt rejected or fenced without side effects. |
| RR-004 | Burst reconnect storm | Inject 2-3x reconnect churn during workflow retries | Continuity preserved; duplicate side effects remain under threshold. |
| RR-005 | Mid-stream auth context change | Revoke or alter authz context during reconnect window | Resume path revalidates authz and denies stale context resumes safely. |
| RR-006 | Downstream timeout + retry cascade | Force transient dependency timeouts to trigger retries | Idempotency keys + retry budget prevent duplicate terminal writes. |

### Execution Procedure

1. Run each scenario with baseline load and burst load profiles.
2. Capture run metadata, injected fault details, and observed outcomes.
3. Record side-effect counters, replay counters, and resume outcomes per run.
4. Attach audit/provenance trace references for each executed scenario.
5. Classify each scenario as `pass` / `fail` and aggregate closure decision for `RISK-003`.

### Evidence Requirements

- Completed evidence packet per run (template in `validation-results.md`).
- Log/trace identifiers for each scenario execution.
- Metric snapshot proving duplicate-rate and resume-success thresholds.
- Explicit decision statement for `RISK-003`: `closed` or `remains open`.

## `RRC-001` Implementation Work Package

### Workstreams

| workstreamId | workstream | owner | output |
|---|---|---|---|
| WP-RT-001 | Contract and schema implementation for `ResumeTokenPayload`, `CheckpointRecord`, `SideEffectFenceRecord`, `ResumeRequest`, `ResumeDecision` | runtime-architecture | Versioned runtime contract module (`RRC-001.v1`) |
| WP-RT-002 | Resume decision engine (token validation, expiry, replay detection, auth/policy revalidation) | runtime-architecture | Deterministic resume decision path + decision telemetry |
| WP-RT-003 | Checkpoint + side-effect fence persistence and lookup | runtime-architecture | Monotonic checkpoint store + dedupe fence store |
| WP-RT-004 | Audit/provenance linkage for resume and replay decisions | data-architecture | Trace/log/policy/envelope linkage for every resume decision |
| WP-RT-005 | RR stress harness and fault injection runner for RR-001..RR-006 | runtime-architecture | Executable stress run pipeline + generated evidence packets |

### Workstream Acceptance Mapping

| workstreamId | must satisfy |
|---|---|
| WP-RT-001 | AC-RT-001 |
| WP-RT-002 | AC-RT-001, AC-RT-004 |
| WP-RT-003 | AC-RT-002, AC-RT-003 |
| WP-RT-004 | AC-RT-005 |
| WP-RT-005 | AC-RT-006 and complete RR evidence coverage |

### Execution Order

1. Implement `WP-RT-001` and approve `RRC-001.v1`.
2. Implement `WP-RT-002` and `WP-RT-003` to enable replay-safe runtime behavior.
3. Implement `WP-RT-004` to make resume/replay decisions auditable.
4. Implement `WP-RT-005` and run RR-001..RR-006 on baseline + burst profiles.
5. Update `validation-results.md`, `gap-analysis.md`, and `risk-register.md` with measured outputs.

### Closure Gate

`GAP-RT-01` and `RISK-003` can only close when:
- all `WP-RT-001..WP-RT-005` are complete;
- all `AC-RT-001..AC-RT-006` are satisfied; and
- RR evidence packets show no critical duplicate side effects.

### Implementation Backlog (Task Cards)

| taskId | workstreamId | task | owner | dependsOn | doneWhen |
|---|---|---|---|---|---|
| RT-T001 | WP-RT-001 | Implement `RRC-001.v1` schemas and version marker in target runtime. | runtime-architecture | none | All `RRC-001` types are encoded/decoded in runtime boundary tests with zero schema drift. |
| RT-T002 | WP-RT-001 | Add contract conformance tests for `ResumeRequest` and `ResumeDecision`. | runtime-architecture | RT-T001 | Contract tests cover accept/reject/expired/replayed decisions and pass in CI. |
| RT-T003 | WP-RT-002 | Implement resume-token validation and expiry checks. | runtime-architecture | RT-T001 | 100% resume attempts produce deterministic validation outcome records. |
| RT-T004 | WP-RT-002 | Implement replay detection for duplicate resume-token usage. | runtime-architecture | RT-T003 | Duplicate token use cannot trigger additional side effects and yields `replayed` or `rejected` decision. |
| RT-T005 | WP-RT-002 | Implement auth-context and policy-version revalidation on resume path. | runtime-architecture | RT-T003 | Every accepted resume has matching policy/auth validation evidence (`AC-RT-004`). |
| RT-T006 | WP-RT-003 | Implement checkpoint persistence with monotonic sequence guarantees. | runtime-architecture | RT-T001 | Sequence regression tests show `0` regressions under retry/reconnect cases. |
| RT-T007 | WP-RT-003 | Implement side-effect fence store keyed by idempotency key. | runtime-architecture | RT-T001 | Fence records enforce single-commit behavior across retries and reconnects. |
| RT-T008 | WP-RT-003 | Add dedupe metrics export (`duplicateRatePer10000`, side-effect duplicate count). | runtime-architecture | RT-T007 | Metrics are queryable and used by RR aggregate evaluation. |
| RT-T009 | WP-RT-004 | Emit audit records for every resume decision with policy decision refs. | data-architecture | RT-T005 | 100% resume decisions have audit entries with policy refs and correlation IDs. |
| RT-T010 | WP-RT-004 | Emit provenance envelope refs for resume/replay outcomes. | data-architecture | RT-T009 | 100% RR runs include non-empty `auditProvenanceRefs` in evidence packets. |
| RT-T011 | WP-RT-005 | Build RR fault-injection runner for RR-001..RR-006 (baseline + burst). | runtime-architecture | RT-T004, RT-T006, RT-T007 | Runner executes all RR scenarios and emits evidence packet artifacts. |
| RT-T012 | WP-RT-005 | Execute RR campaign and publish aggregate closure report for `RISK-003`. | runtime-architecture | RT-T008, RT-T010, RT-T011 | RR report proves duplicate rate <=1/10,000, resume success >=99.5%, and zero critical duplicate side effects. |

### Sprint Sequence (Execution Plan)

| sprint | dates (UTC) | scope | planned tasks | sprint exit criteria |
|---|---|---|---|---|
| Sprint 1 | 2026-02-26 to 2026-03-02 | Contract + persistence foundations | RT-T001, RT-T002, RT-T003, RT-T006, RT-T007 | `RRC-001.v1` contract implemented, token validation path available, checkpoint and fence stores operational in target runtime. |
| Sprint 2 | 2026-03-03 to 2026-03-07 | Decision hardening + observability linkage | RT-T004, RT-T005, RT-T008, RT-T009, RT-T010 | Replay detection, auth/policy revalidation, dedupe metrics, and audit/provenance linkage are complete. |
| Sprint 3 | 2026-03-08 to 2026-03-11 | RR execution + closure evidence | RT-T011, RT-T012 | RR-001..RR-006 baseline + burst runs completed and closure report published with threshold compliance evidence. |

### Critical Path

Primary critical path:
- RT-T001 -> RT-T003 -> RT-T005 -> RT-T009 -> RT-T010 -> RT-T011 -> RT-T012

Secondary critical path:
- RT-T001 -> RT-T007 -> RT-T008 -> RT-T012

Any slip on these paths moves the closure forecast.

### Forecast

- Forecasted `RISK-003` closure date: `2026-03-11` (UTC), assuming no critical-path delays.

### Sprint 1 Day-by-Day Plan (2026-02-26 to 2026-03-02)

| date (UTC) | day | primary tasks | dependency gate | day-end deliverable |
|---|---|---|---|---|
| 2026-02-26 | Thu | RT-T001 (start): implement `RRC-001.v1` schema module + version marker scaffolding. | none | Contract module compiles with all required type surfaces present. |
| 2026-02-27 | Fri | RT-T001 (finish) + RT-T003 (start): token validation and expiry checks. | RT-T001 must be merge-ready before RT-T003 logic hardening. | `RRC-001.v1` schema implementation completed; token validation path functional for happy-path requests. |
| 2026-02-28 | Sat | RT-T003 (finish) + RT-T006 (start): checkpoint persistence with monotonic sequence contract. | RT-T003 complete to ensure checkpoint writes include validated execution context. | Resume-token validation complete; checkpoint persistence storage API with monotonic semantics drafted. |
| 2026-03-01 | Sun | RT-T006 (finish) + RT-T007 (start/finish): side-effect fence store and keying model. | RT-T006 checkpoint identity model finalized before fence key contracts lock. | Checkpoint persistence + side-effect fence persistence available for integration tests. |
| 2026-03-02 | Mon | RT-T002 (finish) + Sprint 1 exit verification: conformance tests and readiness review for Sprint 2 handoff. | RT-T001, RT-T003, RT-T006, RT-T007 must be complete. | Contract conformance tests pass; Sprint 1 exit criteria met and Sprint 2 unblocked. |

Sprint 1 critical checks:
- `RRC-001.v1` schema and conformance tests are stable.
- Resume-token validation is deterministic for accept/reject/expired paths.
- Checkpoint and fence stores are ready for replay detection integration in Sprint 2.

### Sprint 2 Day-by-Day Plan (2026-03-03 to 2026-03-07)

| date (UTC) | day | primary tasks | dependency gate | day-end deliverable |
|---|---|---|---|---|
| 2026-03-03 | Tue | RT-T004 (start) + RT-T005 (start): replay detection and auth/policy revalidation implementation. | Sprint 1 exit criteria must be complete. | Resume decision hardening work has active implementation path for replay + revalidation. |
| 2026-03-04 | Wed | RT-T004 (finish) + RT-T005 (finish): decision-path integration and validation tests. | RT-T003 must be complete for decision engine dependencies. | Replay and revalidation logic complete with deterministic decision outcomes. |
| 2026-03-05 | Thu | RT-T008 (start/finish): dedupe metrics export and query checks. | RT-T007 must be complete (fence model locked). | Metrics pipeline exposes duplicate-rate and side-effect duplicate counters. |
| 2026-03-06 | Fri | RT-T009 (start/finish): audit records for resume decisions with policy refs. | RT-T005 complete before audit linkage finalization. | Audit emission complete for resume decision events. |
| 2026-03-07 | Sat | RT-T010 (start/finish) + Sprint 2 exit verification. | RT-T009 complete before provenance linkage closure. | Provenance linkage for resume/replay outcomes complete; Sprint 3 RR execution unblocked. |

Sprint 2 critical checks:
- Replay detection path is active and deterministic (`RT-T004`).
- Auth/policy revalidation gates are enforced for resume acceptance (`RT-T005`).
- Dedupe metrics + audit/provenance linkage are available for RR evidence packets (`RT-T008`, `RT-T009`, `RT-T010`).

### Sprint 3 Day-by-Day Plan (2026-03-08 to 2026-03-11)

| date (UTC) | day | primary tasks | dependency gate | day-end deliverable |
|---|---|---|---|---|
| 2026-03-08 | Sun | RT-T011 (start): RR runner/fault-injection harness setup for RR-001..RR-006. | Sprint 2 exit criteria must be complete. | RR runner can execute scenario skeletons and emit packet stubs. |
| 2026-03-09 | Mon | RT-T011 (finish): baseline profile RR execution and packet generation. | RT-T004, RT-T008, RT-T010 complete for trustworthy packet fields. | Baseline RR packets generated for all scenarios with traceable evidence refs. |
| 2026-03-10 | Tue | RT-T012 (start): burst profile RR execution + aggregate metrics validation. | RT-T011 complete with full scenario coverage. | Burst RR packets and preliminary aggregate report drafted. |
| 2026-03-11 | Wed | RT-T012 (finish) + closure review: publish final closure report and update risk/gap artifacts. | Duplicate-rate and resume-success thresholds must be met. | `RISK-003` closure report published; P2 artifacts updated with go/no-go reevaluation inputs. |

Sprint 3 critical checks:
- RR-001..RR-006 run in baseline and burst profiles with complete packets.
- Aggregate report proves duplicate rate <=1/10,000 and resume success >=99.5%.
- Closure package updates `validation-results.md`, `gap-analysis.md`, and `risk-register.md` in one review cycle.
