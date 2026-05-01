# Data Model: Law Practice Overlay

## Purpose

The law overlay extends the shared core with IP solo-practice language. It is
practical first: the existing IP-law ontology packet is grounding evidence, but
the v1 product model starts from practice operations.

## External Systems

The runtime references, but does not replace:

- email and calendar
- document storage
- billing and invoicing
- tax/accounting tools
- website/CRM tools
- filing portals and official docket systems
- official patent/trademark/copyright records

## Entities

### LegalClient

Legal-service client or prospect. References a shared `Organization`,
`Workspace`, and external CRM/contact record when available.

Key semantics:

- client/prospect status
- preferred communication channel
- engagement context
- conflict-check notes as evidence-backed claims, not casual fields

### Matter

Primary legal work container. A matter groups client, scope, tasks, artifacts,
claims, drafts, deadlines, and approvals.

Matter examples:

- patent application
- trademark filing
- contract review
- licensing negotiation
- legal research memo
- general advisory support

### Contact

Person or organization involved in legal work: client representative, inventor,
assignee, opposing party, outside counsel, examiner, vendor, or advisor.

### IpAsset

Shared parent for IP-related assets. Specialized by product needs:

- patent asset
- trademark asset
- copyright asset
- trade-secret asset
- license or contract asset

### PatentAsset

Patent application or issued patent context. References external official
records where available.

Candidate fields include:

- title
- inventors
- assignee
- jurisdiction
- application number
- publication number
- patent number
- filing dates
- classification references

Truth-changing interpretations should be claims with evidence.

### TrademarkAsset

Trademark filing or registration context. References external official records.

Candidate fields include:

- mark text/design description
- owner
- goods/services classes
- jurisdiction
- serial/registration number
- status

### ContractArtifact

Contract, license, NDA, assignment, engagement letter, or agreement being
drafted or reviewed. The artifact is shared-core content; the law overlay adds
legal classifications and matter relationships.

### FilingEvent

Reference to an official or internal filing event. The runtime may track
deadlines and source context, but official docket state remains external unless
explicitly imported as evidence.

### OfficeAction

Patent or trademark office action context. Stores references, response tasks,
deadlines, evidence, and generated draft responses.

### LegalResearchSource

Case, statute, regulation, agency guidance, article, prior work product, or
research artifact used as evidence for a claim or draft.

### LegalDraft

Generated or human-authored work product candidate. Drafts are artifacts with
approval gates before becoming client-facing or filing-ready.

## Core Relationships

- `LegalClient` has many `Matter`
- `Matter` references many `Artifact`, `Claim`, `Task`, and `ApprovalGate`
- `Matter` may concern one or more `IpAsset`
- `FilingEvent` and `OfficeAction` belong to a `Matter` and may reference an
  `IpAsset`
- `LegalDraft` is generated from artifacts, claims, research sources, and thread
  context

## Claim Examples

- Client prefers email summaries after calls.
- Inventor A contributed to claim group X.
- Matter requires response by a stated deadline.
- Contract clause creates an assignment obligation.
- Trademark filing covers a stated class of goods.

Each claim must point back to evidence: email span, document paragraph, official
record, meeting note, or attorney-entered source.

## V1 Workflows

### Client Intake

Email or form artifact -> candidate client/matter claims -> conflict/checklist
tasks -> attorney approval.

### Draft Follow-Up

Thread and matter context -> draft email artifact -> approval gate -> accepted
client communication record.

### Contract Review

Contract artifact -> candidate obligations/risks/definitions -> review tasks
and comments -> attorney acceptance.

### Patent/Trademark Docket Awareness

Official or exported docket artifact -> candidate deadline claim -> task and
reminder -> attorney confirmation.
