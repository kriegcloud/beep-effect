# Ingest Status Contract (Phase 2)

## Purpose

Define the explicit, visible ingest lifecycle contract for curated scenario ingestion in `knowledge-demo`.

## Scope

Applies to:
- `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
- `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx`
- `apps/todox/src/app/knowledge-demo/types.ts`

## Core Types

### Scenario identity

```ts
type ScenarioId = "scenario-1" | "scenario-2" | "scenario-3" | "scenario-4"
```

### Lifecycle status

```ts
type IngestLifecycleStatus =
  | "not-started"
  | "pending"
  | "extracting"
  | "resolving"
  | "completed"
  | "failed"
  | "cancelled"
```

### Per-scenario state

```ts
interface ScenarioIngestState {
  status: IngestLifecycleStatus
  batchId?: BatchExecutionId
  progress?: number
  completedDocuments?: number
  totalDocuments?: number
  error?: string
  lastIngestAt?: number
}
```

## Contract Rules

1. Ingest starts only from explicit user action (`Ingest Scenario` button).
2. No silent ingest on load, scenario switch, or query.
3. Duplicate starts for in-flight scenario states are blocked.
4. Query is disabled until status is `completed`.
5. Per-scenario state is retained in-memory and keyed by `ScenarioId`.
6. Batch polling only runs while at least one scenario is in-flight.

## Backend -> UI Status Mapping

| RPC `batch_getStatus` state | UI `status` | Required fields copied |
|---|---|---|
| `BatchState.Pending` | `pending` | none |
| `BatchState.Extracting` | `extracting` | `progress`, `completedDocuments`, `totalDocuments` |
| `BatchState.Resolving` | `resolving` | `progress` |
| `BatchState.Completed` | `completed` | `completedDocuments = totalDocuments`, `totalDocuments`, `progress = 1` |
| `BatchState.Failed` | `failed` | `error` |
| `BatchState.Cancelled` | `cancelled` | `completedDocuments`, `totalDocuments` |

## UI Presentation Contract

`EmailInputPanel` must always show:
- current scenario status badge
- progress bar when progress is known
- error message when status is `failed`
- last-ingest timestamp when available
- action label by state:
  - `not-started` -> `Ingest Scenario`
  - `pending|extracting|resolving` -> `Ingesting...`
  - `failed|cancelled` -> `Retry Ingest`
  - `completed` -> `Re-ingest Scenario`

## Start Contract (`batch_start`)

Input source:
- `prepareScenarioIngestPayload({ scenarioId })`

Required payload fields:
- `organizationId` (active session org; required)
- `ontologyId`
- `ontologyContent`
- `documents[]` (deterministic curated subset, capped at 25)

Post-start state update:
- set `status = pending`
- set `batchId`
- set `totalDocuments`
- set `progress = 0`
- clear previous extracted entities/relations for that scenario

## Completion Contract

When scenario reaches `completed` and `loadedBatchId !== batchId`:
1. execute scenario seed query via `graphrag_query`
2. map result into UI entity/relation projection
3. set `loadedBatchId = batchId`

This ensures one deterministic post-ingest load per completed batch.

## Failure Contract

Recoverable failures are surfaced as typed UI errors:
- ingest path failures -> `source = ingest`
- query path failures -> `source = query`
- missing active org/session -> `source = session`

No fallback to mock extraction/query data is allowed on failure.

## Non-goals (Phase Boundary)

- Meeting prep synthesis rewrite is not part of this contract.
- Evidence quality scoring changes are not part of this contract.
