# Data Model: Shared Core

## Purpose

This document defines the storage-neutral runtime model shared by the first Law
and Todox product proofs. It describes product truth, not database tables. Table
shape, migrations, and adapters belong in implementation plans after the data
loop is specified.

## Modeling Rules

- Every durable entity is organization-scoped.
- Every durable entity records principal attribution and schema version.
- Claims are evidence-backed assertions, not overwrite-only profile fields.
- Candidate writes are distinct from accepted authoritative state.
- Read models are rebuildable projections.
- External systems are referenced by connector and external reference, not
  copied as authoritative replacement systems.

## Core Entities

### Organization

Tenant root. For a solo practice, `orgId = id`. For a firm, organizations may
carry parent/child relationships, license tier, and settings.

Owns policy scope, membership scope, and local runtime boundaries.

### User

Human account inside an organization. A user may be an attorney, advisor,
operations user, compliance reviewer, administrator, or developer/operator.

### Team

Group of users with shared workspace access, skills, and promotion rules.
Optional for solo use, first-class for Todox.

### Membership

Relationship between a user, organization, and optional team. Carries role,
status, and policy-relevant permissions.

### Principal

Actor reference used by all provenance and audit fields. Variants include user,
service account, agent, connector account, and system component.

### Workspace

User or team work area. A workspace groups threads, artifacts, projects, tasks,
skills, connector bindings, and policy scope.

### Thread

Durable sequence of user, assistant, agent, and tool turns. UI may say "chat";
the model says `Thread` because branching, replay, and sub-agent lineage matter.

### Message / Turn

Structured unit inside a thread. A turn may include messages, tool calls, tool
results, generated artifacts, and activities.

### Artifact

Imported or generated content. Examples: email, calendar event, PDF, contract,
statement, transcript, assistant output, memo, draft response.

Artifacts preserve source metadata and may include source spans used by
evidence records.

### Project

Multi-step unit of work. Examples: a patent filing project, contract review,
client onboarding, quarterly review, statement review.

### Task

Concrete work item. A task may be human-created, agent-proposed, artifact-
derived, project-scoped, client/matter/household-scoped, and approval-gated.

### ApprovalGate

Explicit decision point for promoting candidate work or authorizing a risky
action. Approval gates record requested action, reviewer principal, decision,
decision time, and evidence context.

### Agent

Configured assistant identity with scope, tools, skills, model binding, and
policy constraints. An agent acts as a `Principal` and may act on behalf of a
user or team.

### Skill

Versioned instruction/capability package. Skills may be private to a user,
shared with a team, or promoted to organization-level use after review.

### Connector

Runtime representation of an external system integration. Connectors reference
email, calendar, file systems, CRMs, custodians, practice tools, model
providers, or local native capabilities. The connector entity is product-facing;
its implementation may use MCP or another adapter under the hood.

### Claim

Evidence-backed assertion about a subject. Claims carry lifecycle state,
confidence, asserted time, observed/effective/event time where relevant, source,
and provenance.

Canonical lifecycle starts as:

- `candidate`
- `accepted`
- `contested`
- `superseded`
- `deprecated`

### Evidence

Source support for a claim, task, draft, or approval. Evidence points to an
artifact, source span, source record, thread turn, or external reference.

### Activity

Append-only provenance record describing an action that generated, used,
invalidated, revised, approved, rejected, or exported runtime truth.

Activities are the "why/how" record behind entity state.

### UsageRecord

Append-only record for model/tool/agent usage. Carries activity, provider,
model, credential reference, tokens or units, latency, cost, and actor
attribution.

## Read Models

Read models are projections:

| Read Model | Purpose |
|---|---|
| KnowledgeGraph | Query accepted claims, subjects, evidence, and supersession paths. |
| ThreadTimeline | Render thread history, tool calls, activities, and cost rollups. |
| WorkQueue | Power task/project/approval views. |
| ComplianceView | Query activities, claims, approvals, usage, and retention context. |
| InboxView | Show notifications, mentions, approvals, and agent-completed work. |
| ContextPacket | Bound evidence-bearing context for an SDK or MCP client request. |

## Candidate Write Flow

1. Agent reads bounded context through the SDK.
2. Agent proposes a claim, task, artifact, comment, or draft.
3. Runtime stores it as candidate state with evidence and activity provenance.
4. A human or policy reviewer accepts, edits, rejects, or requests revision.
5. Accepted state appears in current views and downstream read models.

This flow is required for regulated work. Direct authoritative agent writes are
out of scope for v1.
