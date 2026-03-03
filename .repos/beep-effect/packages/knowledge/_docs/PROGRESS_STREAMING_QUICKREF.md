# Progress Streaming Contract - Quick Reference Card

## One-Page Overview

### Problem
No clear contract between orchestrator (Effect<KnowledgeGraph>) and WebSocket client for progress streaming.

### Solution
3-layer architecture with 17 event types, backpressure strategy, error recovery semantics.

---

## Event Types (17)

```
LIFECYCLE (4)
├─ extraction_started     Once at start
├─ extraction_complete    All chunks done
├─ extraction_failed      Fatal error
└─ extraction_cancelled   User cancellation

CHUNKING (3)
├─ chunking_started       Text split begins
├─ chunking_progress      During splitting
└─ chunking_complete      Splitting done

CHUNK PROCESSING (2)
├─ chunk_processing_started   Chunk starts pipeline
└─ chunk_processing_complete  Chunk finishes pipeline

PHASES (4)
├─ mention_extraction_progress       Finding mentions
├─ entity_extraction_progress        Finding entities
├─ relation_extraction_progress      Finding relations
└─ grounding_progress                Verifying relations

FOUND ITEMS (2, sampled 10%)
├─ entity_found      New entity discovered
└─ relation_found    New relation discovered

ERRORS (3)
├─ error_recoverable     Chunk-level error, continue
├─ error_fatal           Systemic error, stop
└─ backpressure_warning  Client consuming too slowly
```

---

## Event Structure

Every event has:
```typescript
{
  _tag: "event_type",           // Discriminated union tag
  eventId: "uuid",              // For deduplication
  runId: "doc-abc123def456",    // Document hash
  timestamp: "2025-12-09T...",  // ISO 8601
  overallProgress: 42            // 0-100
  // + event-specific fields
}
```

---

## Backpressure Strategy

```
QUEUE LEVEL               ACTION
├─ 0-80%                  Normal operation
├─ 80-100%                Emit warning, client speed up
└─ >100%                  Apply strategy:
                          ├─ drop_oldest (default)
                          ├─ drop_newest
                          ├─ block_producer
                          └─ close_stream

SAMPLING
├─ Always emit: extraction_started, chunk_processing_complete, errors
└─ Sample (10%): entity_found, relation_found
```

---

## Error Recovery Tree

```
ERROR OCCURS
├─ SYSTEMIC (Fatal)
│  ├─ isTemporary=true?  → Wait & retry
│  ├─ lastSuccessfulChunkIndex set?  → Resume from checkpoint
│  └─ Else → Accept partial or investigate
│
├─ CONTENT (Non-fatal)
│  └─ Skip chunk, extraction continues
│
└─ BACKPRESSURE
   └─ Increase consumption rate
```

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│ LAYER 1: ORCHESTRATOR                   │
│ streamingExtractionWithProgress()       │
│ Returns: Effect<Stream<ProgressEvent>>  │
├─────────────────────────────────────────┤
│ Emits: 17 event types                   │
│        at extraction phases             │
└─────────────────────────────────────────┘
              ↓ RPC Transform
┌─────────────────────────────────────────┐
│ LAYER 2: RPC/TRANSPORT                  │
│ Stream<ProgressEvent> → JSON-safe       │
├─────────────────────────────────────────┤
│ • Backpressure handling                 │
│ • Serialization validation              │
│ • Queue monitoring & sampling           │
└─────────────────────────────────────────┘
        ↓ WebSocket Framing
┌─────────────────────────────────────────┐
│ LAYER 3: CLIENT                         │
│ WebSocket message handler               │
├─────────────────────────────────────────┤
│ • Parse JSON, dispatch events           │
│ • Update UI (progress, entities)        │
│ • Send CancellationRequest              │
│ • Handle errors                         │
└─────────────────────────────────────────┘
```

---

## WebSocket Protocol

```
CLIENT → SERVER
├─ StartExtractionRequest     Start extraction
├─ CancellationRequest        Cancel in progress
└─ AckMessage                 Acknowledge event

SERVER → CLIENT
├─ StartExtractionResponse    Run ID assigned
├─ ProgressMessage            Event streamed
├─ CancellationResponse       Cancellation accepted
└─ [BackpressureWarningEvent] Queue full warning
```

---

## Example: Extraction Flow

```json
← {"type":"start_extraction_response", "runId":"doc-abc123def456"}
← {"type":"progress", "data":{"_tag":"extraction_started","totalChunks":8}}
← {"type":"progress", "data":{"_tag":"chunking_started"}}
← {"type":"progress", "data":{"_tag":"chunking_progress","chunksCompleted":4}}
← {"type":"progress", "data":{"_tag":"chunking_complete"}}
← {"type":"progress", "data":{"_tag":"chunk_processing_started","chunkIndex":0}}
← {"type":"progress", "data":{"_tag":"entity_found","entityId":"entity_1","mention":"...",..}}
← {"type":"progress", "data":{"_tag":"relation_found","subjectId":"entity_1",..}}
← {"type":"progress", "data":{"_tag":"chunk_processing_complete","chunkIndex":0}}
← ... [chunks 1-7] ...
← {"type":"progress", "data":{"_tag":"extraction_complete","totalEntities":156}}
```

---

## Key Semantics

| Aspect | Behavior |
|--------|----------|
| **Systemic Errors** | Halt, stream ends, partial results available |
| **Content Errors** | Skip chunk, stream continues, next chunk processed |
| **Backpressure** | Emit warning, apply strategy if queue full |
| **Cancellation** | Graceful shutdown, partial results available |
| **Resumption** | lastSuccessfulChunkIndex hint (optional) |
| **Sampling** | 10% of entity_found/relation_found (network reduction) |

---

## Implementation Checklist

### Phase 1: Schema
- [x] Event definitions
- [x] Backpressure config
- [x] Error semantics
- [x] Protocol messages

### Phase 2: Orchestrator
- [ ] Emit Stream<ProgressEvent>
- [ ] Use ProgressEventBuilder
- [ ] Calculate overall progress

### Phase 3: RPC Layer
- [ ] BackpressureHandler
- [ ] Queue monitoring
- [ ] Serialization validation

### Phase 4: WebSocket
- [ ] StartExtractionRequest handler
- [ ] ProgressMessage streaming
- [ ] CancellationRequest handler

### Phase 5: Client UI
- [ ] Event subscriptions
- [ ] Progress bar update
- [ ] Entity/relation list
- [ ] Error recovery UI

---

## Files

```
src/Contract/ProgressStreaming.ts   (29 KB)
  └─ Schemas: 17 event types, config, protocol

src/Service/ProgressStreaming.ts    (15 KB)
  └─ Utilities: EventBuilder, BackpressureHandler

docs/progress-streaming-contract.md          (28 KB, COMPLETE SPEC)
docs/PROGRESS_STREAMING_SUMMARY.md          (14 KB, EXECUTIVE)
docs/IMPLEMENTATION_CHECKLIST.md            (12 KB, ROADMAP)
docs/PROGRESS_STREAMING_INDEX.md            (10 KB, NAVIGATION)
docs/PROGRESS_STREAMING_QUICKREF.md         (THIS FILE)
```

---

## Code Snippets

### Create Event

```typescript
const builder = new ProgressEventBuilder(runId, totalChunks)
const event = builder.entityFound(
  chunkIndex,
  "entity_id",
  "Mention Text",
  ["http://schema.org/Person"],
  0.96 // confidence
)
```

### Handle Event

```typescript
switch (event._tag) {
  case "entity_found":
    updateUI(event.entityId, event.mention)
    break
  case "error_fatal":
    retry(event.retryAfterMs) // if isTemporary
    break
}
```

### Apply Backpressure

```typescript
const handler = new BackpressureHandler()
const warning = handler.enqueueEvent(event)
if (warning) sendWarningToClient(warning)
```

---

## Design Rationale

| Choice | Why | Alternative |
|--------|-----|-------------|
| 17 events | Granular detail | 5 generic events |
| 10% sampling | Network efficiency | All or none |
| drop_oldest | Simple reliable | block, close |
| Optional resumption | Server choice | Always/never |
| Discriminated union | Type-safe | Single type |

---

## Performance Baseline

```
Per 1000-word extraction (~5 chunks, 8 chunks total):
├─ Status events: ~20 (lifecycle + chunking + per-chunk)
├─ Phase events: ~80 (4 phases * 5 chunks * 4 events)
├─ Sampled items: ~150 (10% of ~1500 items, rough)
└─ Errors: ~2 (typical: 0-2 recoverable errors)

TOTAL: ~250 events, ~50 KB JSON (if verbose logging)
WITH SAMPLING: ~200 events, ~40 KB JSON
```

---

## Quick Links

- **Full Spec**: `progress-streaming-contract.md`
- **Executive**: `PROGRESS_STREAMING_SUMMARY.md`
- **Roadmap**: `IMPLEMENTATION_CHECKLIST.md`
- **Navigation**: `PROGRESS_STREAMING_INDEX.md`
- **Schema**: `src/Contract/ProgressStreaming.ts`
- **Impl**: `src/Service/ProgressStreaming.ts`

---

## Status

✅ Design Complete
⏳ Ready for Phase 2 (Orchestrator Implementation)
📅 Created: December 9, 2025

---

## TL;DR

**What**: Event-driven progress streaming for extraction
**Why**: No clear contract between orchestrator and WebSocket client
**How**: 17 event types, 3 layers, backpressure strategy, error recovery
**Where**: `/packages/@core-v2/src/Contract/` and `/docs/`
**Next**: Implement in orchestrator, RPC, WebSocket, client
