# SDK Context Packet Contract

## Purpose

The SDK contract is the canonical integration surface for the first proof.
External clients such as the native app, Claude Desktop, OpenClaw, and MCP
adapters should wrap this contract instead of defining their own runtime truth.

This document defines the intent-level contract. Exact TypeScript package names
and file paths belong in P3.

## Contract Families

### Context Reads

The SDK must let a client request an evidence-bounded context packet for a
specific organization, workspace, thread, artifact, or work item.

The v1 packet includes:

- organization and workspace references
- principal and agent references
- vertical context references
- source artifact references
- cited source excerpts
- candidate claims
- candidate tasks
- candidate draft references
- approval gate references
- activity and usage summary references

The packet does not include the whole workspace. It includes only context that
is relevant to the requested scenario and supported by evidence.

### Candidate Writes

The SDK must let an agents client propose candidate runtime changes:

- candidate claims
- candidate tasks
- candidate draft artifacts
- approval gates

Candidate writes must include:

- organization and workspace scope
- producing principal
- source artifact or thread references
- evidence span references
- lifecycle state
- activity provenance

The SDK must not let an agent write accepted professional truth directly in v1.

## V1 Context Packet Shape

A context packet is storage-neutral. It is a contract for bounded retrieval, not
a database row.

Minimum fields:

- `contextPacketId`
- `scenarioId` or request correlation ID
- `generatedAt`
- `scope`
- `request`
- `principals`
- `verticalContext`
- `sourceArtifacts`
- `evidence`
- `candidateClaims`
- `candidateTasks`
- `candidateDrafts`
- `approvalGates`
- `activities`
- `usage`
- `exclusions`

`exclusions` records important context that was intentionally not included,
such as unrelated workspace threads or external system records not imported into
the runtime.

## Adapter Implications

Claude Desktop, OpenClaw, and MCP integrations should be adapter layers:

- they request context packets from the SDK
- they submit candidate writes through the SDK
- they do not own authoritative runtime data models
- they do not bypass approval policy

The native app consumes the same contract, but can provide richer review,
approval, and fixture-demo workflows.

## Failure Semantics

The eventual TypeScript contract should use typed failures for:

- missing organization or workspace scope
- unauthorized principal
- missing source artifact
- invalid evidence span reference
- candidate write rejected by policy
- context packet request exceeding policy bounds

Exact tagged error names are deferred to P3. The policy categories are not.
