# Product Vision: Todox.ai Wealth Management Runtime

## Thesis

Todox is a local-first advisor runtime for wealth-management firms that need AI
capability without handing their client memory, workflows, and model strategy to
a single SaaS wrapper. The product gives advisors and teams a governed workspace
where agentic tools can read context, propose work, cite evidence, track cost,
and preserve supersession history.

## Primary Users

- Individual advisors who want personalized AI help without losing control of
  client context.
- Client service and operations team members who turn meetings, emails, and
  documents into follow-up work.
- Compliance reviewers who need evidence, provenance, policy context, and
  auditability.
- Firm leaders evaluating a BYO software strategy for AI adoption.

## Jobs To Be Done

- Prepare for meetings from household, account, goal, prior thread, document,
  and recent communication context.
- Turn emails, statements, meeting notes, and assistant threads into candidate
  claims, tasks, and drafts.
- Preserve client-intent changes over time instead of overwriting the latest
  extracted value.
- Share skills and agent configurations from user -> team -> organization
  with review and promotion.
- Track which model, tool, credential, user, and agent produced each action and
  what it cost.
- Give compliance a defensible view of what happened, who approved it, and
  which evidence supported it.

## Product Shape

Todox is not a CRM, portfolio accounting system, custodian, or compliance
archive replacement. It is the agentic runtime above and around those systems:

- local workspace and thread runtime
- evidence-backed expert memory
- agent capability and skill layer
- connector layer for CRM, email, calendar, documents, portfolio data, and firm
  knowledge
- candidate work queue with approvals
- usage, cost, and audit records

Existing firm systems remain source-of-record. Todox records its own runtime
truth and references external records by connector and external reference.

## First Product Slice

The first wealth proof should use synthetic fixtures for:

- an email asking whether cash should be moved to cover an upcoming payment
- a private investment statement asking "anything we need to do here?"
- a meeting follow-up proposing a next appointment
- a calendar event or meeting note
- generated candidate claims about household goals, accounts, or tasks
- a candidate task or draft response requiring advisor approval

The proof succeeds when the system can show source artifacts, evidence-backed
claims, candidate tasks, approval status, and SDK-readable bounded context.

## Differentiation

Todox competes at the runtime layer, not the notetaker layer:

- local-first control by default
- provider/model transparency
- BYO user credentials with organization policy
- evidence-first claims rather than overwrite-only extracted rows
- bitemporal lifecycle and supersession
- skills and agents that can be authored, shared, and reviewed inside the firm
- open internal contracts that future clients can wrap through MCP

## Non-Goals

- Do not replace CRM, portfolio accounting, custodians, email, calendar, or
  compliance archive systems in v1.
- Do not execute trades or make financial advice decisions autonomously.
- Do not claim SOC 2, SEC, or enterprise compliance certification before the
  product has earned it.
- Do not make a cloud-hosted SaaS control plane the default v1 assumption.

## Open Questions

- Which AdvicePeriod/Mariner systems are the first realistic connector targets?
- Which roles form the first pilot group: advisors, operations, client service,
  compliance, or a mixed champion group?
- What policy is required before client PII can be used with user-owned model
  credentials?
- Which workflow creates the most convincing first demo: meeting prep, email
  triage, statement review, or task extraction?
