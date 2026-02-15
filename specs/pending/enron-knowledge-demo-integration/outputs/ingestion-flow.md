# Ingestion Flow Design

## UX Choice

Use explicit ingest action per scenario (`Ingest Scenario`) rather than auto-ingestion.

Why:

- extraction is async and may take noticeable time
- explicit action is clearer for internal demo operators
- easier to retry and reason about errors

## Flow

1. User selects scenario card
2. User clicks `Ingest Scenario`
3. Client sends `batch_start` mutation with:
   - org ID
   - ontology ID/content
   - documents (full thread, capped to 25)
4. Receive `batchId`
5. Client polls or subscribes via batch status RPC
6. On completion, enable:
   - entity/relation views
   - GraphRAG query panel
   - meeting prep generation for scenario query seed

## Contracts Used

- Start: `Batch.StartBatch`
- Status: `Batch.GetBatchStatus` (optional: stream progress)
- Graph query: `GraphRag.Query`
- Meeting prep: `MeetingPrep.Generate`
- Evidence resolution: `Evidence.List`
- Entity reads: `Entity.List`
- Relation reads: `Relation.ListByEntity` / `Relation.ListByPredicate`

## Idempotency/Retry Rules

1. If scenario already has active batch in running/pending, disable duplicate start and show current state.
2. If previous batch failed, allow `Retry Ingest`.
3. If completed, default action is `Re-ingest` only if explicitly triggered.

## Failure Handling

- Batch start failure: inline error + retry button
- Batch runtime failure: show failed state with message and retry option
- RPC transport failure: show connectivity error and preserve current state

## Persistence Expectations

- All extraction outputs persisted under active org context.
- Data is shared across users in same org per RLS defaults.

## Feature Flag Gate

- Demo route/components hidden unless `ENABLE_ENRON_KNOWLEDGE_DEMO` is true.
- When disabled, route should return a clear internal-only message or 404 equivalent per app routing convention.
