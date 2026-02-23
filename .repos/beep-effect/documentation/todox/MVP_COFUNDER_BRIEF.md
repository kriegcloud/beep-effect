# TodoX Wealth Management MVP Brief (For Non-Technical Stakeholders)

Audience: Wealth management domain expert (UHNW) who does not need implementation details.

Date: 2026-02-09

## Executive Summary (What We Are Shipping First)

TodoX MVP is a **read-only Gmail sync + knowledge graph + meeting-prep** product demo for wealth management firms.

It solves one specific pain: **advisors spend too much time reconstructing client context from email threads**, and that context is difficult to audit, delegate, or reuse.

The MVP outcome is a single screen (`/knowledge`) where an advisor can:

- Connect Google (Gmail) with minimal permissions
- Ingest a small set of client email threads into a “documents” system of record
- Extract a small set of wealth-specific facts and relationships into a knowledge graph
- Generate **meeting prep** that is **always backed by clickable evidence** (source snippets highlighted inside the email text)

This is the core differentiator: **Evidence Always**. TodoX does not ask you to “trust the AI.” It shows you exactly where every claim came from.

## Why The Ontology + Knowledge Graph Is A Differentiator (Plain Language)

Most wealth software stores information as disconnected records: a client in one system, tasks in another, emails in an inbox, “context” living in an advisor’s memory. TodoX’s differentiator is that it turns that context into a **shared, computable map**.

### What “Ontology” Means Here

An ontology is a **shared vocabulary** for the firm’s world. It defines:

- The “things that exist” in the business (Household, Client, Account, Life Event, Action Item, Meeting, etc.)
- The allowed relationships between them (“owns account,” “belongs to household,” “has action item,” “experienced life event”)

This matters because wealth conversations are full of ambiguity. The ontology is how we keep the system precise: an “account” is not just text in an email; it is a typed object connected to a household, with evidence.

### What A “Knowledge Graph” Means Here

A knowledge graph is the **network** created when we connect those things together:

- **Nodes**: the entities (Household, Client, Account, etc.)
- **Edges**: the relationships (owns, belongs-to, has-action-item, etc.)
- **Evidence**: every node and edge is backed by source text (highlighted snippets in emails/documents)

The practical payoff is that TodoX can answer questions by following relationships, not by searching keywords.

### How It Works In The MVP (At A High Level)

1. TodoX ingests emails into a “documents” system of record (each email becomes a durable document snapshot).
2. An extraction step identifies entities and relationships using the ontology (for example: “Thompson Household owns Traditional IRA ending 4521”).
3. TodoX stores those entities/relationships into the graph, and pins each one to evidence inside the source email.
4. When you ask for meeting prep, TodoX pulls a **bounded slice of the graph** for that household (recent comms, open actions, life events, accounts) and generates a briefing that links back to evidence.

### Why This Becomes More Powerful Over Time

This structure makes later integrations additive instead of disruptive:

- When we add documents, CRM, custodian feeds, or calendar, we do not start over; we attach those sources to the same ontology and extend the graph.
- Firm-specific “house styles” become possible (e.g., what the firm considers a risk flag, or how action items should be phrased) without losing auditability.

Most importantly, the knowledge graph is the foundation for “AI that understands relationships” rather than “AI that summarizes a blob of text.”

## The Problem (In Wealth Management Terms)

For UHNW households, the “truth” of what is happening with the client is spread across:

- Advisor inbox threads (client + spouse + CPA + attorney + assistant)
- Follow-ups and action items buried in replies
- Attachments (statements, PDFs, forms, K-1s, trust docs)
- A web of accounts, entities, and life events that are rarely explicit in any single system

The cost is not just time. It is:

- Missed details before meetings
- Unclear delegation to ops/associates
- Repeated “context rebuilding” across the team
- Higher compliance risk because narratives and rationales are reconstructed manually

TodoX is designed to become a **relationship-first memory system** for the firm, built from the communications stream.

## What The MVP Does (And What It Does Not Do)

### MVP Does

- Ingest selected Gmail messages into TodoX (initially a seeded wealth-management demo dataset)
- Store those emails as durable “documents” with versions
- Extract a minimal wealth-management ontology:
  - Household
  - Client
  - Account (one or two types are enough for the demo, e.g., Traditional IRA)
  - Life Event (retirement, graduation)
  - Action Item (send RMD worksheet, schedule call, request custodian form)
- Build a graph showing how these entities relate
- Produce meeting prep (summary, recent comms, open actions, risks/open questions)
- Show evidence for every extracted fact and every meeting-prep bullet

### MVP Does Not

- Trade execution, money movement, or “do things” in accounts
- Portfolio advice, tax advice, or legal advice
- Calendar sync (we may display a meeting date if it is present in email content)
- Real-time Gmail push/webhooks (the demo can run on-demand sync)
- Outlook, CRM, custodian integrations
- Full “entity resolution” across many sources (Gmail only for MVP)
- Dashboards, collaboration features, or role-based workflows beyond what is required for the demo narrative

## The 5-Minute Demo Script (How We Show It To A Firm)

This is the demo story we consider “pass/fail.” It should work from a clean login without any manual backdoors.

1. Connect Gmail
   - Go to Settings -> Connections
   - Link Google
   - If additional permissions are needed later, TodoX prompts for re-consent with a clear explanation

2. Open a client household
   - Search “Thompson household” (synthetic demo household)
   - See the household node plus the core connected client node

3. Show extraction from a real email
   - Open an email in the thread
   - Show extracted items (account detail, life event, action item)
   - Click any item to jump to its source snippet in the email text

4. Show the knowledge graph
   - Center panel: household graph with 1 to 2 hops
   - Demonstrate “owns account,” “experienced life event,” and “has action item”

5. Generate meeting prep (and prove it is grounded)
   - Click “Meeting Prep”
   - TodoX produces a structured briefing
   - Every bullet has evidence links that highlight the exact source text
   - The output explicitly avoids “guaranteed return” language and includes a compliance-safe disclaimer

## Evidence Always (Why This Is Not Another Chatbot)

The biggest failure mode for AI in regulated environments is “confident nonsense.”

TodoX’s core rule is that **anything shown as a fact must be backed by evidence**:

- Evidence is a highlighted span inside a specific email snapshot
- If the email changes, TodoX creates a new version and the old citation still points to the old version
- Advisors can review the source instantly, and compliance teams can audit what the system displayed and why

This is how we turn “AI” into something defensible:

- Better trust from advisors
- Better delegation (associates can see where tasks came from)
- Lower compliance risk (audit trail is built-in, not an afterthought)

## Consent, Security, and Privacy (Plain Language)

TodoX is built for a world where client communications contain PII and sensitive financial details.

### Consent (Incremental Permissions)

TodoX starts with the minimum Gmail permissions needed for read-only ingestion.

If we add a capability that requires a new permission later, TodoX:

- Detects it precisely
- Shows which new permission is missing and why
- Takes the user through a re-link flow (incremental consent)

### Account Separation (No “Wrong Inbox” Risk)

We assume a firm can link multiple Google accounts.

TodoX requires an explicit account selection for sync and extraction. This prevents a subtle but serious failure mode: “first linked account wins” leading to the wrong mailbox being used.

### Data Handling (What We Store and How)

For the MVP demo:

- We treat each Gmail message as a durable document with a stable internal identity
- Re-sync is idempotent (no duplicate emails) and safe to re-run
- We avoid leaking raw email content into logs or telemetry

For production (post-MVP hardening), the plan includes:

- Encryption at rest for raw bodies and sensitive fields
- Strict minimization when generating summaries or meeting prep
- Audit trails for evidence access and meeting prep generation

### AI Safety Model (No “Free-Form Agent” In Production Paths)

The MVP architecture does not allow an AI model to execute arbitrary queries or code.

Instead, it can only call a small set of approved operations (think “safe buttons”):

- Fetch a bounded graph slice
- List evidence for a specific item
- Generate meeting prep using a limited, cited context

This is the same direction taken by regulated deployments: limit what the AI can do, and keep the real data access inside a trusted system.

## What TodoX Becomes After This MVP

Today, `apps/todox` is a playground with many experimental pages.

After the MVP spec is implemented, TodoX becomes a focused product surface built around production vertical slices:

- A real “Connections” experience (firm-usable, not developer-only)
- A real “Knowledge Base” experience:
  - Graph visualization as a daily navigation model for households
  - Evidence-backed entity and relationship views
  - A meeting prep workspace that can be reused and audited

In other words, we will **delete most of the current TodoX feature bloat** and replace it with a small number of screens that represent the core advisor workflow.

Once this foundation is proven, TodoX can expand into:

- Thread-level narratives (email conversation aggregation) designed for “what happened since last meeting”
- Multi-source ingestion (calendar, documents, CRM, custodians)
- Firm-specific ontologies and “house style” meeting prep
- Roles and workflows (advisor vs associate vs compliance)
- “Always-on” monitoring (flag material changes, missing follow-ups, compliance-sensitive phrasing)

## What Makes This Game-Changing For A Wealth Firm

This MVP is intentionally narrow because it is building the trust foundation.

The long-term effect, if the evidence-first approach works, is:

- A household knowledge graph that is not trapped in one advisor’s head
- Faster, more consistent meeting preparation
- More reliable delegation to associates (action items with source proof)
- A compliance posture based on traceability rather than screenshots and manual notes

## Pilot Success Criteria (What We Will Measure)

During a pilot, we should measure outcomes that a wealth firm cares about:

- Time to prep for a meeting (before vs after)
- Action item capture rate (missed follow-ups reduced)
- Trust score: how often advisors click evidence and accept it as correct
- Compliance safety: “no uncited claims” and no prohibited phrasing in outputs
- Multi-account correctness: no accidental cross-inbox use

## FAQ (Wealth-Management Specific)

### Does TodoX give advice?

No. The MVP is meeting prep and context reconstruction. Any outputs are framed as “what the client said” and “what tasks are open,” not recommendations.

### Can it hallucinate?

Any system can generate incorrect text, which is why we enforce “Evidence Always.” If a statement cannot be cited, it should not be presented as a fact.

### What if an email changes or a sync is rerun?

TodoX stores versioned snapshots. Evidence is pinned to the exact version it came from. Re-sync does not silently move citations.

### Are we sending client emails to a model vendor?

The MVP is designed to minimize what leaves the trusted server and to constrain AI to safe, approved operations. Extraction may require raw content server-side, but meeting prep is designed to use bounded context slices with citations.

### How does this relate to compliance recordkeeping?

The design direction is to make meeting prep and evidence access auditable. Retention policies are part of the production plan, even if the MVP uses a minimal baseline.

### What about attachments (statements, PDFs)?

The MVP focuses on the email message body for the demo. Attachments are planned next because they are high-value sources for accounts and holdings, but they add parsing complexity.

## What We Need From A Pilot Firm

- A small set of test accounts (or a synthetic dataset that matches real patterns)
- Clear boundaries on what is acceptable to ingest in a pilot environment
- A few high-value workflows to prioritize (meeting prep, action tracking, life events, household structure)
- A compliance review of disclaimers, retention expectations, and “acceptable AI assistance” posture
