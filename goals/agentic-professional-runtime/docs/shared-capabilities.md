# Shared Capabilities

## Runtime Capabilities

### Native First-Run Onboarding

The native app should guide a user through:

- local dependency checks
- local runtime bootstrap
- workspace creation
- model credential connection
- Claude Desktop and OpenClaw client configuration
- optional developer/operator client setup for Codex and Claude Code
- synthetic fixture import for demos and tests

This is first-run onboarding inside the native app, not a separate installer
product in v1.

### Tenancy And Policy

The runtime assumes an organization root for every install. A solo law practice
is a one-person organization; a wealth firm may add teams, roles, membership
policy, and promotion rules.

Core shared language:

- organization
- user
- team
- membership
- principal
- role and policy scope

### Workspace And Thread Runtime

The workspace layer owns the user's working surface:

- workspace
- thread
- turn/message
- artifact
- project
- task
- approval gate
- notification/comment where needed

The UI may call the surface "chat" where appropriate, but the model should use
`Thread` for durable branching and agent execution history.

### Artifact Ingestion

The first proof covers:

- email artifacts
- calendar artifacts
- document artifacts
- assistant-thread artifacts

Realtime calls and phone answering remain product-vision items until the data
loop is proven.

### Epistemic Runtime

The epistemic layer owns:

- claim
- evidence
- subject
- source span
- provenance activity
- lifecycle state
- supersession and contestation
- usage and cost records

Claims are not summaries. They are durable assertions with evidence and history.

### Agent Capability

The agents layer owns:

- agent definitions
- skill definitions and versions
- commands
- context packs
- connectors
- model/provider bindings
- credential references
- user/team/org promotion rules

Agents can read and propose candidate writes in v1. Acceptance is explicit.

### SDK And Client Adapters

The Effect/TypeScript SDK is the canonical interface. Client adapters wrap it:

- native app UI
- MCP server
- Claude Desktop configuration
- OpenClaw configuration
- developer/operator clients

MCP is important, but it is not the source of truth for the runtime model.

## Shared-Kernel Promotion Rules

Promote a concept into `shared/*` only when:

- both Law and Todox need the same product meaning
- the concept is driver-neutral
- the owning vertical cannot legally expose it directly across slices
- the package README records the promotion
- runtime and Layer limits are explicit

Likely shared-kernel candidates:

- `Organization`
- `Principal`
- source-kind vocabulary
- base entity metadata
- candidate/accepted lifecycle vocabulary
- activity/provenance actor references
- usage-record vocabulary when both proofs need the same shape

Do not promote:

- law matter types
- wealth household/account/holding language
- workflow implementations
- live connector adapters
- driver-specific persistence concerns
- one-off convenience helpers

## V1 Shared Capability Success

The shared capability layer succeeds when both product proofs can use the same
runtime data loop without either vertical importing from the other:

1. ingest a synthetic artifact
2. create candidate claims and tasks
3. attach evidence and activity provenance
4. require approval before authoritative promotion
5. expose bounded context through the SDK
