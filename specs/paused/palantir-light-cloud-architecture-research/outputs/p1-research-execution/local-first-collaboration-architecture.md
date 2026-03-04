# Local-First Collaboration Architecture

## Objective

Define offline-capable collaboration and synchronization patterns that preserve policy constraints, provenance requirements, and conflict determinism [CIT-002][CIT-006][CIT-015][CIT-016].

## Collaboration Model

- Sync strategy: local operation log + server reconciliation through AppSync subscription/sync channels [CIT-015][CIT-016].
- Conflict resolution strategy: deterministic merge policy using version vectors and conflict handlers aligned with AppSync conflict modes [CIT-016].
- Access-control propagation in offline mode: client snapshots include policy version + mandatory control tags; replay is revalidated before commit [CIT-006][CIT-010].

## Data and Security Considerations

| Concern | Architecture Handling | Evidence |
|---|---|---|
| Offline edits | Client-side op-log with signed mutation envelopes and deferred server commit | CIT-015, CIT-016 |
| Conflict merges | Deterministic server-side merge classes (`fast-forward`, `field-merge`, `manual-review`) | CIT-016 |
| ACL drift | Policy-version check on sync replay; stale-policy mutations are quarantined for re-evaluation | CIT-006, CIT-010, CIT-011 |
| Audit capture for replayed changes | Replayed writes emit audit/provenance events with original client timestamp + server accept timestamp | CIT-018, CIT-020 |
| Multi-region collaboration | Global Tables support replication where collaboration latency/recovery goals require it | CIT-017, CIT-023 |

## Conflict Class Matrix

| Conflict Class | Example | Resolution |
|---|---|---|
| Concurrent non-overlapping field updates | Two users update different fields | deterministic merge |
| Concurrent same-field updates, same trust class | Two users update same field | last-writer-with-review marker |
| Concurrent updates with marking mismatch | One update introduces higher sensitivity marking | mandatory-control gate before commit |
| Edit against stale purpose context | Purpose revoked while offline | deny replay and require renewed authorization |

## Operational Controls

1. Every replayed mutation is policy-checked with current guardrails prior to persistence.
2. Collaboration state mutations include provenance linkage to user/session/policy decision IDs.
3. Manual-review conflicts are treated as first-class workflow tasks, not silent drops.

## Residual Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Policy-time and sync-time divergence | high | Mandatory replay-time authorization and quarantine queue for stale-policy operations. |
| Cross-region replication delay and conflict bursts | medium | Apply region-aware conflict budgets and degrade to single-region writes during incident windows. |
| Offline cache compromise | medium | Encrypt local cache, minimize sensitive payload retention, and require rapid credential invalidation path. |

## Inference Notes

1. Inference: AppSync conflict primitives are sufficient for baseline local-first semantics, but higher-assurance domains may require custom merge executors.
2. Inference: policy versioning in mutation envelopes is required to prevent silent ACL drift under prolonged offline sessions.
