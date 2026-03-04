# Provenance and Audit Architecture

## Objective

Define an end-to-end traceability model that links user-visible outcomes to source inputs, policy decisions, tool actions, and workflow state transitions [CIT-002][CIT-005][CIT-006][CIT-018].

## Provenance Flow

| Step | Provenance Artifact | Evidence |
|---|---|---|
| Ingestion | Source reference, integrity hash, source classification tags | CIT-006, CIT-007 |
| Transformation | Lineage edges with input/output references, transform IDs, and execution timestamps | CIT-006, CIT-007 |
| Agent/tool execution | Tool invocation trace, policy decision ID, workflow execution ID | CIT-008, CIT-012, CIT-013 |
| User response | Output lineage envelope including source citations and processing path summary | CIT-002, CIT-005 |

## Audit Model

- Append-only event strategy: all privileged control-plane events and sensitive data-access events emit immutable audit records with integrity validation checks [CIT-018].
- Who/what/when/where/why coverage:
  - `who`: principal identity and role context
  - `what`: action + resource identifiers
  - `when`: event timestamp + workflow stage
  - `where`: service/runtime and region metadata
  - `why`: purpose context and policy decision reference [CIT-006][CIT-010]
- SIEM export posture: CloudWatch-aligned telemetry + audit stream forwarding for centralized detection and response [CIT-020].

## Provenance Envelope Contract

```ts
{
  envelopeId: string,
  outputClass: string,
  sourceRefs: Array<string>,
  transformationRefs: Array<string>,
  toolExecutionRefs: Array<string>,
  policyDecisionRefs: Array<string>,
  citationRefs: Array<string>,
  generatedAt: string
}
```

## Control Alignment

1. Policy decisions must be referenceable from provenance envelopes for processing integrity controls [CIT-036][CIT-037].
2. Audit records must support integrity verification and post-incident forensic replay [CIT-018][CIT-023].
3. Encryption keys and key usage boundaries must be traceable for confidentiality controls [CIT-019][CIT-036].

## Residual Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Retention/legal hold and deletion requests can conflict | high | Separate legal-hold policy state from operational retention schedules and require explicit policy override logging. |
| Provenance payload bloat on high-volume workflows | medium | Use compact lineage pointers with materialized expansion only during investigations. |
| Cross-service timestamp skew affects replay accuracy | medium | Standardize UTC event-time normalization and ordering heuristics at ingest. |

## Inference Notes

1. Inference: explicit provenance envelopes are required because audit logs alone do not capture full semantic transformation context for user-visible outputs.
2. Inference: a unified envelope contract reduces P2 validation ambiguity for VC-002, VC-003, and VC-008 scenarios.
