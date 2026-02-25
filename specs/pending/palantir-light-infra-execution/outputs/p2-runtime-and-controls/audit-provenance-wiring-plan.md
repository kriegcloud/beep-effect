# P2 Audit Provenance Wiring Plan

## Owner

- `data-architecture`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/provenance-audit-architecture.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/policy-plane-design.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/gap-analysis.md`
- `../p2-runtime-and-controls/rrc-001-implementation-runbook.md`

## Exact Tasks

1. Define canonical correlation keys for workflow execution, session, resume token, and policy decision IDs.
2. Require policy decision reference on every privileged execution and resume outcome.
3. Wire audit event emission for resume accept/reject/replayed/expired decisions.
4. Wire provenance envelope emission that references source, transform, tool, and policy artifacts.
5. Publish validation query pack for audit/provenance completeness checks in release review.

## Entry Criteria

- G2 approved.
- Runtime event emission points are identified.
- Audit and observability storage endpoints are available.

## Exit Criteria

- Every resume decision is traceable through audit and provenance records.
- Evidence query pack is available for release gate review.
- GAP-PI1-01 closure evidence paths are documented.

## Verification Commands

```sh
rg -n "policyDecisionRef|workflowExecutionId|envelopeId|audit" apps packages tooling infra
```

```sh
aws logs describe-log-groups --log-group-name-prefix /platform-runtime
```

```sh
aws logs filter-log-events --log-group-name /platform-runtime/audit --max-items 20
```

## Rollback/Safety Notes

- If audit emission degrades runtime latency, keep writes asynchronous but never drop critical decision records.
- If provenance payload size breaches limits, switch to compact reference mode and preserve linkage fields.
- Never deploy schema-breaking audit changes without dual-read compatibility.

## Required Fields Matrix

| Signal | Required Fields |
|---|---|
| Resume decision audit record | `decisionId`, `workflowExecutionId`, `resumeTokenId`, `result`, `policyDecisionRef`, `timestamp` |
| Provenance envelope | `envelopeId`, `sourceRefs`, `transformationRefs`, `toolExecutionRefs`, `policyDecisionRefs`, `generatedAt` |
| Correlation metadata | `sessionId`, `requestId`, `traceId`, `principalId`, `environment` |
