# P0 Decisions (Locked Contracts)

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`  
**Phase**: P0 (Decisions + contracts)  
**Status**: LOCKED (authoritative contract surface)  
**Primary synthesis**: `outputs/R0_SYNTHESIZED_REPORT_V3.md`  
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
| D-06 | Idempotency hash inputs (`sourceHash`) | A) hash Gmail raw payload, B) hash persisted document payload, C) hybrid | **B (MVP)** | **LOCKED** | Spec | Compute `sourceHash = sha256(canonicalJson({ title, content }))` where `content` is the exact persisted string used for highlighting. Do not include provenance-only / mailbox-state fields (labels, historyId, etc.) in the hash. Do not apply lossy whitespace normalization that would drift offsets. |
| D-07 | Soft delete semantics for `document_source` | A) strict unique forever (tombstone + resurrect), B) partial unique on `deleted_at IS NULL` | **A** | **LOCKED** | Spec | Keep mapping identity stable. Delete sets `deleted_at`; re-sync resurrects mapping and reuses `documentId` (new version only if `sourceHash` changes). |
| D-08 | Relation evidence model | A) embed evidence on relation row, B) enforce `extractionId` when evidenced, C) dedicated `relation_evidence` table | **C (future-proof)** | **LOCKED** | Spec | Plan and implement a dedicated `relation_evidence` table so relation citations are first-class and do not rely on optional joins. In MVP, we may still carry a minimal `relation.evidence` field for convenience, but UI evidence must come from `relation_evidence` rows. |
| D-09 | Evidence-of-record | A) RDF store, B) SQL spans via `knowledge.mention` | **B** | **LOCKED** | Spec | RDF may exist, but UI evidence comes from SQL spans. |
| D-10 | Meeting prep persistence model | A) response-only, B) persist bullets + citations | **B** | **LOCKED** | Spec | Demo requirement: `/knowledge` UI must not ship without persisted bullets + citations; PR4 is blocked on PR5. |
| D-11 | Knowledge Base UI route | A) reuse `/knowledge-demo`, B) reuse `/2d-force-graph`, C) new `/knowledge` | **C** | **LOCKED** | Spec | Single demo surface; other pages become dev tools only. |
| D-12 | Workflow topology for extraction | A) single-node durable (`SingleRunner`), B) multi-node cluster | **A (MVP)** | **LOCKED (MVP)** | Spec | MVP targets durable single-node. If/when moving to multi-node, require explicit table prefixing/ownership and a new topology decision record. |
| D-13 | Storage posture | A) AWS S3 only, B) add GCS support, C) unify via abstraction | **A (initial)** | **LOCKED** | Spec | IaC/runbooks assume GCP compute; cross-cloud is a deliberate risk. |
| D-14 | Org isolation enforcement location | A) repo query filters only, B) DB RLS + filters | **B (target)** | **LOCKED (target)** | Spec | Not overkill for production. Phase it: MVP requires cross-org tests + repo filters; staging/prod adds RLS for defense-in-depth. |
| D-15 | LLM tool boundary (query/code generation) | A) safe-buttons-only (approved RPC/tools), B) free-form SQL/code generation, C) hybrid | **A (MVP)** | **LOCKED (MVP)** | Spec | For MVP, the LLM cannot emit executable SQL/code. It can only select from approved RPC/tools (GraphRAG.Query, Evidence.List, MeetingPrep.Generate, etc.). |
| D-16 | Prompt minimization policy | A) send full raw docs, B) send slices only + citations, C) hybrid by workflow | **C (MVP)** | **LOCKED (MVP)** | Spec | Extraction may require raw content. Meeting prep/Q&A must use GraphRAG context slices + citations; never send full inbox/thread content by default. |
| D-17 | Output disclosure policy | A) always redact PII, B) allow evidence-cited disclosure, C) role-based | **B (MVP)** | **LOCKED (MVP)** | Spec | Default: disclose sensitive details only when evidence-cited and necessary for the task; otherwise redact/minimize. UI must include a compliance-safe disclaimer and avoid guarantees. Role-based expansion can follow later. |
| D-18 | Offset drift / evidence pin strategy | A) pin to doc version + offsets, B) heuristic remap on content changes, C) store anchors only | **A (MVP)** | **LOCKED** | Spec | Evidence spans must be pinned to a specific canonical document version and offset unit so UI highlighting stays deterministic across re-runs and future versions. |

## Locked Contracts (Authoritative)

### C-01: Typed Scope Expansion Error Payload (LOCKED)

Goal: deterministic incremental consent UX (no string matching).

Wire contract (JSON) returned on scope failure:

```ts
export type GoogleScopeExpansionRequiredErrorPayload = {
  tag: "GoogleScopeExpansionRequiredError";
  providerId: "google";
  missingScopes: readonly string[]; // full scope URLs (must match @beep/google-workspace-domain constants)
  relink: {
    callbackURL: "/settings?settingsTab=connections";
    errorCallbackURL: "/settings?settingsTab=connections&relink=failed";
    scopes: readonly string[]; // full required scope set for the attempted operation
  };
  // Optional but recommended for UX copy/debugging (mirrors domain error fields):
  currentScopes?: readonly string[];
  requiredScopes?: readonly string[];
  message?: string;
};
```

Example:

```json
{
  "tag": "GoogleScopeExpansionRequiredError",
  "providerId": "google",
  "missingScopes": ["https://www.googleapis.com/auth/gmail.readonly"],
  "relink": {
    "callbackURL": "/settings?settingsTab=connections",
    "errorCallbackURL": "/settings?settingsTab=connections&relink=failed",
    "scopes": ["https://www.googleapis.com/auth/gmail.readonly"]
  }
}
```

Invariants:
- Client branches on `tag` (and optionally `providerId`), not substring matching or `instanceof`.
- Implementation note: internal Effect errors will typically carry `_tag`; the server boundary MUST emit the wire contract field `tag` (not `_tag`) to keep client matching stable.
- `missingScopes` MUST be a subset of `relink.scopes`.
- `relink.scopes` MUST be the full required scope set for the attempted operation (not "missing only") to avoid accidental scope regression.
- `callbackURL`/`errorCallbackURL` are owned by TodoX Settings → Connections (D-01) and must remain stable.

Non-goal: define UI; just guarantee machine-readable remediation details.

### C-06: Provider Account Selection Required Error Payload (LOCKED)

Goal: make multi-account flows deterministic (no “pick first linked account”) and force callers to select a
specific `providerAccountId` for any Gmail sync/extraction operation.

Wire contract (JSON) returned when an operation requires `providerAccountId` and none is provided:

```ts
export type ProviderAccountSelectionRequiredErrorPayload = {
  tag: "ProviderAccountSelectionRequiredError";
  providerId: "google";
  requiredParam: "providerAccountId";
  candidates: ReadonlyArray<{
    providerAccountId: string; // IAM `account.id`
    accountId?: string; // external provider account identifier (optional label for UI)
    scope?: string; // optional; for UX display/debugging only
  }>;
  select: {
    callbackURL: "/settings?settingsTab=connections";
  };
  message?: string;
};
```

Invariants:
- Client branches on `tag` (and `providerId`), not substring matching or `instanceof`.
- Implementation note: internal Effect errors will typically carry `_tag`; the server boundary MUST emit the wire contract field `tag` (not `_tag`) to keep client matching stable.
- The server MUST NOT select a default provider account when `providerAccountId` is missing.
- `candidates` MUST NOT include tokens or secrets (access/refresh tokens, id tokens).
- Candidates are scoped to the current authenticated user and current org’s allowed connections (if configured).

### C-02: Evidence.List Contract (Canonical, MVP) (LOCKED)

Goal: power “Evidence Always” UI (entity, relation, meeting-prep bullet).

Request filters (one-of, plus org scoping):
- `entityId?`
- `relationId?`
- `meetingPrepBulletId?`
- `documentId?`

Response must include:
- `documentId` (internal Documents ID)
- `documentVersionId` (required; see C-05)
- `startChar`, `endChar` (offsets into the canonical stored document content; see C-05 offset unit)
- `text` (snippet; server-truncated)
- `confidence?`
- `kind`: `"mention" | "relation" | "bullet"`
- `source`: `{ mentionId?: string; relationEvidenceId?: string; meetingPrepBulletId?: string; extractionId?: string; ontologyId?: string }`

Invariant: every evidence item is resolvable to `documentId + documentVersionId + offsets` without optional joins.

Evidence-of-record example (pinned to an immutable document version):

```json
{
  "documentId": "doc_123",
  "documentVersionId": "docv_456",
  "startChar": 120,
  "endChar": 165,
  "kind": "relation",
  "source": { "relationEvidenceId": "relev_789" }
}
```

Offset semantics (LOCKED; see C-05):
- Offsets are 0-indexed.
- Range is half-open: `[startChar, endChar)` (endChar is exclusive).
- When filtering by `meetingPrepBulletId`, every returned evidence item MUST include `source.meetingPrepBulletId`
  so the UI can attribute evidence rows to the bullet deterministically.

Canon note (prevents drift between R8 vs R12):
- `Evidence.List` is the only canonical evidence surface. Any other “evidence” shapes (RDF provenance, `entity.mentions` JSONB, `relation.evidence` JSONB) are implementation details and must not be used by UI directly.
- Relation evidence must be returned from `relation_evidence` rows (D-08) so it never depends on `relation.extractionId -> extraction.documentId` to resolve a span.

### C-04: PII + AI Guardrails (Minimum Viable)

Goal: align with regulated-industry patterns: trusted executor, tool boundaries, minimization, and auditability.

MVP invariants:
- The LLM cannot execute arbitrary SQL/code (safe-buttons/tool boundary only).
- Meeting prep and Q&A operate on minimized context slices with citations, not raw email bodies by default.
- Logs never contain raw email bodies/attachments/subjects; secrets and sensitive headers are `Redacted`.

Reference summary: `outputs/R15_PII_AI_ARCHITECTURE_RESEARCH_SUMMARY.md`.

### C-05: Offset Drift Invariant Contract (LOCKED)

Goal: make evidence highlighting deterministic and audit-safe by preventing silent offset drift.

Invariant:
- Every evidence span is pinned to a specific immutable content blob:
  - `documentId` + `documentVersionId` (preferred), and `startChar` / `endChar`.
- Offsets are defined in a single unit end-to-end: **JS string indices (UTF-16 code units)**.
- Offsets are 0-indexed and half-open: `[startChar, endChar)` (endChar is exclusive).
- The canonical content string used for highlighting is the exact persisted `document_version.content` (or equivalent).

Rules:
- No lossy post-processing of persisted content that can change length (whitespace normalization, HTML re-serialization, redaction transforms) without creating a new document version.
- Evidence spans must never be "updated in place" to point at a different version; new evidence must be created for the new version.
- `Evidence.List` must return `documentVersionId` with offsets so the UI can fetch and highlight against the exact version that was cited.

### C-03: Gmail → Documents Mapping Invariants

Minimum mapping key (LOCKED):
- `(organizationId, providerAccountId, sourceType="gmail", sourceId=gmailMessageId)`

Minimum stored metadata for MVP (LOCKED):
- `sourceThreadId` (Gmail thread id; required to power PR2B thread read model)
- `sourceHash` (idempotency; see D-06)
- `sourceInternalDate?` (optional; provenance/sort)
- `sourceHistoryId?` (optional; incremental change detection)

Materialization invariants (LOCKED):
- Identity is stable:
  - Re-running materialization for the same mapping key MUST reuse the same `documentId`.
  - Gmail message IDs are only unique per mailbox, so `providerAccountId` scoping is mandatory (ties to PR2A).
- Idempotent updates:
  - If `sourceHash` is unchanged: MUST NOT create a new document version or mutate the canonical content string.
  - If `sourceHash` changed: MUST create a new document version and update the mapping row’s `sourceHash` (and provenance metadata).
  - `sourceHash` MUST be derived only from fields that affect the persisted `title/content` (exclude provenance-only fields like `sourceHistoryId`, labels, or any mailbox state that can change without content changing).
- Tombstone + resurrect (D-07):
  - Deleting a mapping sets `deleted_at` (tombstone) and MUST NOT allow a second mapping row with the same key.
  - Re-sync MUST resurrect the mapping row (clear `deleted_at`) and reuse the same `documentId` (new version only if `sourceHash` changes).
- Boundary safety:
  - `providerAccountId` is IAM `account.id` stored as a typed string (no cross-slice DB FK).
  - Gmail-sourced documents are locked/immutable for MVP (D-05) to preserve evidence semantics.

## Notes / Known Pitfalls (Keep Visible)

- If Connected Accounts UI is not shipped early, the Gmail demo will regress into manual endpoint calls.
- If evidence spans do not include `documentId + documentVersionId + offsets`, UI highlighting will be nondeterministic and auditability claims fail.
- If relation evidence can be written without a resolvable document join, the system will produce dead links and degrade trust quickly.

## P0 Exit Checklist (Pass/Fail)

P0 is complete only when:

- [x] All `PROPOSED` decisions above are either `LOCKED` or explicitly deferred with a phase and rationale.
- [x] `C-01` typed scope expansion contract is finalized (fields + tag names) and referenced in `outputs/P1_PR_BREAKDOWN.md`.
- [x] `C-06` provider account selection required contract is finalized and referenced in `outputs/P1_PR_BREAKDOWN.md`.
- [x] `C-02` Evidence.List contract is locked and referenced in `outputs/P1_PR_BREAKDOWN.md`.
- [x] `C-03` Gmail→Documents invariants are finalized (including `sourceHash` normalization).
- [x] Any changes to this file since the last session are recorded in `outputs/P0_DECISIONS_CHANGELOG.md`.
