# Product Vision: Agentic Solo Practice Law Firm

## Thesis

An experienced IP attorney starting a solo practice should not have to assemble
AI capability from scattered tools, private memory, ad hoc prompts, and manual
office workflows. The product gives the attorney a local-first operating layer
around existing practice tools: it captures context, proposes work, maintains
evidence-backed practice memory, and automates safe administrative loops while
keeping legal judgment under attorney approval.

## Primary User

The first user is a solo intellectual-property attorney with decades of
practice history and a small set of high-trust client relationships. The system
must respect how a solo practice actually starts:

- existing email, calendar, document, billing, and website tools
- a mixed archive of prior work product, correspondence, patents, contracts,
  matter notes, and client communications
- a preference for slowing down without losing professional leverage
- limited appetite for maintaining technical infrastructure

## Jobs To Be Done

- Prepare for a client or prospect conversation from email, documents, prior
  matters, and open tasks.
- Draft or review patent, trademark, contract, licensing, and client
  communication artifacts.
- Track matter-level tasks, deadlines, evidence, and status without replacing a
  dedicated practice-management or docketing system.
- Maintain a private practice memory that can answer "what do we know, and why
  do we believe it?"
- Let an assistant handle safe office work: scheduling, reminders, inbox triage,
  document organization, and first-draft follow-ups.
- Keep legal advice, filings, and client-facing professional judgment under
  explicit attorney approval.

## Product Shape

The product is not a full law-firm SaaS replacement. It is a native local
runtime and workspace that connects to the attorney's existing tools. It owns:

- workspace and thread context
- imported artifacts and source references
- claims, evidence, provenance, and lifecycle
- proposed tasks, drafts, and approval gates
- local agent skills and connectors
- runtime audit and usage records

It references external systems for email, calendar, document storage, billing,
website/CRM, filing portals, and official docket state.

## First Product Slice

The first law proof should use synthetic fixtures for:

- a prospect email asking about a trademark or patent question
- a calendar event or meeting note
- a prior patent/contract excerpt
- a generated candidate claim about the client, matter, or IP asset
- a candidate task or draft follow-up requiring attorney approval

The proof succeeds when the system can show the source artifact, the extracted
claim, the evidence span, the candidate task, the approval state, and the
bounded context an agent would receive.

## Domain Boundaries

Law-specific language belongs in `law-practice`:

- client and contact overlays relevant to legal service
- matters and matter phases
- IP assets and legal rights
- filings, docket events, office actions, contracts, and licenses
- legal research sources and citation context

Shared professional runtime language belongs outside the law slice only when
Todox needs the same concept too.

## Non-Goals

- Do not replace legal billing, accounting, docketing, CRM, email, calendar, or
  document management in v1.
- Do not make autonomous legal-advice decisions.
- Do not ingest real privileged client data into repo fixtures.
- Do not require the IP ontology packet to be complete before the practical
  product model can move.

## Open Questions

- Which existing tools will the solo practice actually use for CRM, billing,
  website, document storage, and docketing?
- Which data can be exported from the attorney's existing firm history, and
  under what ethical and confidentiality constraints?
- Which first workflow has the highest trust/value ratio: client intake,
  drafting support, office action review, contract review, or email triage?
- What approval language should distinguish "assistant draft" from attorney
  work product?
