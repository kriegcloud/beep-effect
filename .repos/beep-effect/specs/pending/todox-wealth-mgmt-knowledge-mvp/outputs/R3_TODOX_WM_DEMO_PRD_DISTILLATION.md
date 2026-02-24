# TodoX Wealth Mgmt Demo PRD Distillation

## Scope and Source Notes
This distillation uses:
- `documentation/todox/PRD.md` for product, ontology, Gmail extraction, GraphRAG meeting prep, and compliance requirements.
- `specs/completed/knowledge-graph-poc-demo/sample-data/emails.md` as a reference for how the extraction demo was previously structured (note: that dataset is not wealth-management specific).

Constraint/ambiguity to call out: “any related docs” is broad; I limited it to the two docs above to keep the output minimal and credible. If a wider set is intended (e.g., other knowledge specs or integration specs), say which ones.

## Demo Goal (Minimal, Credible, Small)
Demonstrate a **wealth-management Gmail → knowledge graph → meeting prep** flow in 5 minutes:
1. Gmail thread(s) are ingested.
2. A small, wealth-specific knowledge graph is built with provenance.
3. A meeting-prep query returns a structured briefing grounded in extracted evidence.

No calendar sync, dashboards, or multi-channel comms. Just Gmail + KG + meeting prep.

## Must-Have Entities (Minimal Ontology)
These are the smallest set that preserves credibility for a wealth management demo while staying aligned with the PRD’s ontology and meeting prep use cases.

1. **Client**
2. **Household**
3. **Account** (at least one subtype like `TraditionalIRA` or `RothIRA`)
4. **LifeEvent** (e.g., `Retirement`, `Graduation`)
5. **ActionItem**
6. **Meeting** (or `CalendarEvent` as a label only, not full calendar integration)
7. **Email** (as a source document entity)
8. **Mention** (provenance link to the email span)

Minimal supporting value objects:
- Date
- Role (advisor, CPA) if present in the email content

## Must-Have Relations
Minimum typed relations for a coherent prep briefing:

1. `belongsToHousehold(Client → Household)`
2. `ownsAccount(Client → Account)`
3. `experiencedEvent(Client → LifeEvent)`
4. `hasActionItem(Client|Household → ActionItem)`
5. `hasEvidentialMention(AnyEntity → Mention)`
6. `mentions(Email → Mention)` or equivalent linking Email to Mention
7. `scheduledFor(Meeting → Date)` (if meeting date is in email)

If only one relation beyond household/account is possible, keep `hasActionItem` because it directly feeds prep output and compliance tracking.

## Must-Have Queries
These are the smallest set of queries required for the demo narrative:

1. **Seed entity lookup**
   - Input: “Thompson household”
   - Output: Household entity + canonical client entity

2. **2-hop subgraph traversal** (GraphRAG-like, but can be a simplified traversal)
   - From: Household or Client
   - Includes: accounts, life events, recent emails, action items

3. **Meeting prep aggregation**
   - Input: “Prepare me for the Thompson meeting on 2026-02-10”
   - Output: structured briefing (summary, recent comms, open actions, evidence links)

Minimum fields in query response:
- Entity labels and types
- Evidence snippets or source references (email id + span)
- Confidence scores (even if mocked) for traceability

## Minimal Data Needed (Credible Demo Dataset)
The existing POC sample emails are not wealth-management specific. For credibility, the demo needs 3-5 synthetic Gmail threads centered on one household:

Required content per dataset:
- A meeting invite or email that includes a specific meeting date.
- At least one account detail (e.g., Traditional IRA ending 4521, Roth conversion).
- At least one life event (e.g., retirement, graduation).
- At least one action item (e.g., “send RMD worksheet,” “set up Roth IRA”).
- At least one compliance-sensitive phrase requiring safe handling (e.g., “guaranteed returns” to be flagged as not allowed).

## 5-Minute Demo Script
Timebox assumes a prepared dataset is already ingested.

1. **00:00–00:45 Setup and Context**
   - “We connected Gmail and ingested recent client threads.”
   - Show a Gmail thread list filtered by the Thompson household.

2. **00:45–02:00 Knowledge Graph Extraction**
   - Open a single email.
   - Show extracted entities: Client, Household, Account, LifeEvent, ActionItem.
   - Click an entity to show evidence span provenance.

3. **02:00–03:15 Knowledge Graph View (Minimal)**
   - Show the Thompson household node and 1–2 hops.
   - Demonstrate `ownsAccount` and `experiencedEvent` edges.

4. **03:15–04:30 Meeting Prep Command**
   - Run: `/meeting-prep Thompson 2026-02-10` (or equivalent UI action).
   - Show structured output: summary, recent comms, open actions, compliance reminders.

5. **04:30–05:00 Compliance Check Highlight**
   - Point to evidence linking the output to emails.
   - Mention that recommendations are framed as historical or conditional, not guaranteed.

## What Not to Build Yet (Explicit Non-Goals)
Keep scope minimal. Do not build the following for this demo:

1. Full Gmail sync, threading, or offline Zero sync
2. Google Calendar integration (only display meeting date derived from email)
3. Liveblocks dashboards or multi-user presence
4. Document editor or Lexical-based page model
5. Full agent SDK with commands beyond meeting prep
6. Entity resolution across multiple data sources (only Gmail)
7. Multi-tenant RBAC/ABAC UI; enforce only basic org isolation
8. Real-time webhooks; a one-time ingest is enough for demo
9. Outlook/Salesforce/Schwab integrations
10. Advanced compliance reporting dashboards

## Compliance and Security Constraints to Reflect in the Spec
From `documentation/todox/PRD.md` sections on Security & Compliance and agent rules:

1. **Provenance for every extracted fact**
   - Evidence spans are mandatory (PRD: “Evidence Always”, provenance tracking).

2. **Auditability**
   - Immutable audit log entries for extraction and meeting-prep actions.
   - Log who ran meeting prep and which sources were used.

3. **Regulatory retention policy**
   - Communications and audit logs retention expectations (FINRA/SEC) should be noted.

4. **Data isolation**
   - Organization isolation enforced via RLS/Org ID in tables.

5. **PII handling**
   - Redacted storage/logging of sensitive data.

6. **No guarantees, no tax/legal advice**
   - Meeting prep output must avoid guaranteed returns language.
   - Include standard compliance disclaimer if a recommendation is present.

7. **Minimum Gmail scopes**
   - Extraction should be read-only (gmail.readonly) for demo.

8. **Consent and access**
   - Only authorized users can view client data; avoid cross-household leakage.

## Minimal Spec Checklist (for implementation alignment)
1. Gmail ingestion for a pre-seeded dataset
2. Extract entities/relations with evidence links
3. Store minimal graph (entities, relations, mentions)
4. Simple graph traversal for meeting prep
5. Meeting prep output format aligned with `/meeting-prep` PRD example
6. Compliance-safe language in outputs

## Open Gaps and Risks
1. The current sample email dataset is not wealth-management specific and must be replaced.
2. If meeting date is not present in emails, the demo must mock that field or use a synthetic invite.
3. Without explicit evidence links, the demo fails the compliance requirement.
4. Any cross-source entity resolution is out of scope and should be avoided in the demo narrative.
