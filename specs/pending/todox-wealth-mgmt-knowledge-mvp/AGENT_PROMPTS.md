# Agent Prompts: Todox Wealth Mgmt Knowledge MVP

## Orchestrator Delegation Protocol (Hard Rule)

Research stream roles:

- **Explorers** produce focused `R*` markdown reports in `outputs/` (e.g. OAuth flow, mapping tables, UI plan).
- **Synthesizer** maintains/updates the single orchestrator input: `outputs/R0_SYNTHESIZED_REPORT_V2.md`.
- **Orchestrator** reads **only** `R0` for research context.

Implication:

- Do not load `R1–R9` directly into the orchestrator context.
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

4. **PR3: Evidence surfaces + relation evidence resolvability**
   - Implement `Evidence.List` (entity/relation/bullet evidence) returning `documentId + offsets`.
   - Fix relation evidence so it always resolves to a source document (no optional join dead ends).
   - Gate: evidence panel can highlight source text deterministically for at least one entity and one relation.

5. **PR4: `/knowledge` UI wiring (single route)**
   - Implement/choose a single Knowledge Base route wired to real RPCs.
   - Gate: end-to-end demo narrative works without visiting dev/demo routes.

6. **PR5 (Hardening): Meeting-prep evidence persistence**
   - Persist meeting-prep bullets and citations durably.
   - Gate: “Evidence Always” still holds after server restart and over repeated runs.

## Acceptance Gates (Non-Negotiable)

- OAuth linking and incremental consent are UI-driven (no manual endpoint usage).
- Evidence spans returned to the UI always include `documentId + offsets`.
- Relation evidence never becomes unresolvable due to optional joins.
- Every meeting-prep claim shown in the demo has at least one evidence span.
- Multi-tenant isolation is preserved on every demo query path (including embeddings and provenance).
- Demo output includes compliance-safe language (no guarantees) plus a disclaimer.
