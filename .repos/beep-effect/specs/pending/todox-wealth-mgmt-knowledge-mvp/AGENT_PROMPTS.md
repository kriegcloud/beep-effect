# Agent Prompts: Todox Wealth Mgmt Knowledge MVP

## Orchestrator Delegation Protocol (Hard Rule)

Research stream roles:

- **Explorers** produce focused `R*` markdown reports in `outputs/` (e.g. OAuth flow, mapping tables, UI plan).
- **Synthesizer** maintains/updates the single orchestrator input: `outputs/R0_SYNTHESIZED_REPORT_V3.md`.
- **Orchestrator** reads **only** `R0` for research context.

Implication:

- Do not load `R1–R16` directly into the orchestrator context.
- If `R0` is missing information, request an explorer report (`outputs/R10_...md`) and have the synthesizer fold it into `R0` before proceeding.

## Scope Enforcement (Repeat Everywhere)

- The MVP is: Gmail → Documents → Knowledge graph → `/knowledge` UI → meeting prep with persisted evidence.
- Non-goals are enforced (calendar sync, webhooks, doc editor, multi-source resolution, Outlook/IMAP).
- No happy-path mocks for the demo flow.
- SQL is the evidence-of-record for UI; RDF provenance is not sufficient for “Evidence Always”.

## Handoff Policy (Explicit 50% Context Gate)

- **Handoff gate**: when context feels ~50% consumed (or before starting a large/risky task), STOP and write a checkpoint handoff even if the phase is not complete.
- Minimum checkpoint artifacts:
  - `handoffs/HANDOFF_P[N].md`
  - `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`

Keep checkpoint handoffs short and executable: current state, decisions made, next steps, verification commands.

## Decision Drift Gate (P0 Contracts)

- Any change to a `LOCKED` row in `outputs/P0_DECISIONS.md` MUST add an entry to:
  - `outputs/P0_DECISIONS_CHANGELOG.md`
- Any PR plan change driven by decision changes MUST update:
  - `outputs/P1_PR_BREAKDOWN.md`

## PR Breakdown Strategy (Implementation Execution Plan)

This spec expects incremental PRs with acceptance gates. Suggested PR sequence:

Gate style (non-negotiable):
- Gates must be atomic `- [PASS/FAIL] ...` statements (grep-friendly; no prose gates).
- Verification commands must be shell-safe (prefer single quotes around `rg` patterns; avoid backticks inside double-quotes in `zsh`).

1. **PR0: Connected Accounts + typed scope expansion error**
   - Add Connections UI path for Google link/relink/unlink.
   - Add a typed error contract that includes `missingScopes` and relink parameters.
   - Gate: missing scopes yields a deterministic relink prompt; user can link/relink entirely via UI.

2. **PR1: Gmail -> Documents materialization + idempotency**
   - Documents-owned `document_source` mapping keyed by `(organizationId, providerAccountId, sourceId)`.
   - Materialization policy (message-to-document) locked for MVP.
   - Gate: repeated runs do not duplicate documents; no cross-slice DB foreign keys introduced.

3. **PR2: Extraction persistence + embeddings**
   - Persist entities/relations/mentions to SQL; compute/store embeddings for extracted entities.
   - Gate: graph/query paths return real data after restart; GraphRAG/meeting prep is not empty due to missing embeddings.

4. **PR2A: Multi-account selection + `providerAccountId` enforcement**
   - Make provider account selection explicit end-to-end (no “pick first linked account” behavior).
   - Gate: two linked Google accounts cannot be mixed; Gmail sync/extraction requires `providerAccountId`.

5. **PR2B: Thread aggregation read model**
   - Add Knowledge-owned thread tables and deterministic ordering/anchors for meeting prep and evidence.
   - Gate: thread view is deterministic across re-sync and restarts.

6. **PR2C: Ontology registry wiring**
   - Make ontology selection deterministic and deployable (select by registry id).
   - Gate: extraction selects ontology by id; unknown id fails with a typed error.

7. **PR3: Evidence surfaces + relation evidence-of-record**
   - Implement `Evidence.List` (entity/relation/bullet evidence) returning `documentId + documentVersionId + offsets`.
   - Relation evidence must come from `relation_evidence` rows (no `relation.extractionId -> extraction.documentId` join path).
   - Gate: evidence panel can highlight source text deterministically for at least one entity and one relation.

8. **PR5: Meeting-prep evidence persistence (demo requirement)**
   - Persist meeting-prep bullets and citations durably.
   - Gate: “Evidence Always” still holds after server restart and over repeated runs.

9. **PR4: `/knowledge` UI wiring (single route)**
   - Implement/choose a single Knowledge Base route wired to real RPCs.
   - Blocker: do not ship `/knowledge` UI without persisted evidence-backed meeting prep (PR4 blocked on PR3 + PR5).
   - Gate: end-to-end demo narrative works without visiting dev/demo routes.

## Acceptance Gates (Non-Negotiable)

- OAuth linking and incremental consent are UI-driven (no manual endpoint usage).
- Evidence spans returned to the UI always include `documentId + documentVersionId + offsets`.
- Relation evidence never becomes unresolvable due to optional joins.
- Every meeting-prep claim shown in the demo has at least one evidence span.
- Multi-tenant isolation is preserved on every demo query path (including embeddings and provenance).
- Demo output includes compliance-safe language (no guarantees) plus a disclaimer.
