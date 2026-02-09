# P0 Decisions (Locked Contracts)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Phase**: P0 (Decisions + contracts)  
**Status**: In progress (rows marked `LOCKED` are authoritative)  
**Primary synthesis**: `outputs/R0_SYNTHESIZED_REPORT_V2.md`  
**Decision changelog**: `outputs/P0_DECISIONS_CHANGELOG.md`  

This document exists to prevent repeated rediscovery of demo-fatal constraints (OAuth linking, evidence-of-record, idempotency identity mapping, org isolation). If a decision is not recorded here, it is not considered “locked.”

## Scope Reminder (Non-Negotiable)

MVP is: **Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence**.

Non-goals (explicit): calendar sync, webhooks/push watch, Outlook/IMAP, doc editor, multi-source entity resolution.

## Decision Protocol (No Drift)

- When a row is marked `LOCKED`, it becomes a contract.
- Any change to a `LOCKED` row requires:
  - updating the row (short rationale in `Notes`)
  - adding an entry to `outputs/P0_DECISIONS_CHANGELOG.md`
  - re-checking affected acceptance gates in `outputs/P1_PR_BREAKDOWN.md`

## Decision Table (Fill / Lock)

| ID | Topic | Options | Recommended | Status | Owner | Notes |
|---:|-------|---------|------------|--------|-------|------|
| D-01 | OAuth UX surface | A) new route, B) settings tab `connections` | **B** | **LOCKED** | Spec | Reuse existing `settingsTab=connections` wiring. |
| D-02 | Typed scope expansion contract | A) string matching, B) tagged error payload | **B** | **LOCKED** | Spec | Must include `missingScopes` + relink parameters. |
| D-03 | Provider account identifier stored in `document_source` | A) IAM `account.id`, B) external `accountId/email` | **A** | **LOCKED** | Spec | Store as typed string (no FK) to avoid cross-slice DB coupling. |
| D-04 | Document materialization granularity | A) 1 Gmail message = 1 document, B) attachments as docs | **A (MVP)** | **LOCKED** | Spec | B can follow later without breaking mapping invariants. |
| D-05 | Gmail-sourced document mutability | A) immutable/locked, B) editable with policy | **A (MVP)** | **LOCKED** | Spec | Prevents divergence from source-of-truth and simplifies evidence semantics. |
| D-06 | Idempotency hash inputs (`sourceHash`) | A) subject+body+headers, B) include attachments list, C) include normalized MIME | **B (MVP)** | **PROPOSED** | TBD | Deterministic hash. Minimum: normalized body + attachments list metadata. Lock exact normalization rules. |
| D-07 | Soft delete semantics for `document_source` | A) strict unique forever, B) partial unique on `deleted_at IS NULL` | **B (recommended)** | **PROPOSED** | TBD | Enables re-materialization after deletion; requires partial unique index and clear semantics. |
| D-08 | Relation evidence resolvability invariant | A) require `extractionId` when evidence present, B) add `relation.evidenceDocumentId` | **A (recommended)** | **PROPOSED** | TBD | Avoid schema growth; enforce write-time invariant: evidence implies resolvable extraction/document. |
| D-09 | Evidence-of-record | A) RDF store, B) SQL spans via `knowledge.mention` | **B** | **LOCKED** | Spec | RDF may exist, but UI evidence comes from SQL spans. |
| D-10 | Meeting prep persistence model | A) response-only, B) persist bullets + citations | **B** | **LOCKED** | Spec | Required by P2 at latest for restart-safe auditability. |
| D-11 | Knowledge Base UI route | A) reuse `/knowledge-demo`, B) reuse `/2d-force-graph`, C) new `/knowledge` | **C** | **LOCKED** | Spec | Single demo surface; other pages become dev tools only. |
| D-12 | Workflow topology for extraction | A) single-node durable (`SingleRunner`), B) multi-node cluster | **A (MVP)** | **PROPOSED** | TBD | MVP targets durable single-node; revisit for scale (P4). Must document table prefixing if moving to multi-node. |
| D-13 | Storage posture | A) AWS S3 only, B) add GCS support, C) unify via abstraction | **A (initial)** | **LOCKED** | Spec | IaC/runbooks assume GCP compute; cross-cloud is a deliberate risk. |
| D-14 | Org isolation enforcement location | A) repo query filters only, B) DB RLS + filters | **B (target)** | **PROPOSED** | TBD | MVP requires cross-org tests at minimum; target is RLS + filters for defense-in-depth. |

## Locked Contract Drafts (Must Be Finalized)

### C-01: Typed Scope Expansion Error Payload

Goal: deterministic incremental consent UX (no string matching).

Minimum fields:
- `tag`: `"GoogleScopeExpansionRequiredError"` (or a domain-specific wrapper tag)
- `providerId`: `"google"`
- `missingScopes`: `string[]` (must match `@beep/google-workspace-domain` scope constants)
- `relinkHint`: `{ mode: "link" | "relink"; }` (and any other fields required by `iam.oauth2.link`)

Non-goal: define UI; just guarantee machine-readable remediation details.

### C-02: Evidence.List Contract (Minimum Viable)

Goal: power “Evidence Always” UI (entity, relation, meeting-prep bullet).

Request filters (one-of, plus org scoping):
- `entityId?`
- `relationId?`
- `meetingPrepBulletId?`
- `documentId?`

Response must include:
- `documentId` (internal Documents ID)
- `startChar`, `endChar` (offsets into the canonical stored document content)
- `text` (snippet; server-truncated)
- `confidence?`
- `kind`: `"mention" | "relation" | "bullet"`
- `source`: `{ extractionId?: string; ontologyId?: string; }`

Invariant: every evidence item is resolvable to `documentId + offsets` without optional joins.

### C-03: Gmail → Documents Mapping Invariants

Minimum mapping key:
- `(organizationId, providerAccountId, sourceType="gmail", sourceId=gmailMessageId)`

Minimum stored metadata for MVP:
- `threadId`
- `sourceHash` (idempotency)
- `sourceInternalDate?` (optional)

Invariant: repeat materialization runs do not produce duplicate documents and do not drift IDs.

## Notes / Known Pitfalls (Keep Visible)

- If Connected Accounts UI is not shipped early, the Gmail demo will regress into manual endpoint calls.
- If evidence spans do not include `documentId + offsets`, UI highlighting will be nondeterministic and auditability claims fail.
- If relation evidence can be written without a resolvable document join, the system will produce dead links and degrade trust quickly.

## P0 Exit Checklist (Pass/Fail)

P0 is complete only when:

- [ ] All `PROPOSED` decisions above are either `LOCKED` or explicitly deferred with a phase and rationale.
- [ ] `C-01` typed scope expansion contract is finalized (fields + tag names) and referenced in `outputs/P1_PR_BREAKDOWN.md`.
- [ ] `C-02` Evidence.List contract is finalized and referenced in `outputs/P1_PR_BREAKDOWN.md`.
- [ ] `C-03` Gmail→Documents invariants are finalized (including `sourceHash` normalization).
- [ ] Any changes to this file since the last session are recorded in `outputs/P0_DECISIONS_CHANGELOG.md`.

