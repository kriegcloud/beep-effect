# Progress Streaming Contract - Documentation Index

## Overview

This is a complete, end-to-end progress streaming contract for extraction operations. It solves the architectural gap between the Effect-based orchestrator, RPC/transport layer, and WebSocket clients.

**Problem**: No clear mapping between workflow (Effect<KnowledgeGraph>), streaming expectations (WebSocket), and client progress events.

**Solution**: Unified three-layer architecture with 17 concrete event types, backpressure strategy, error recovery semantics, and cancellation protocol.

## Documents

### 1. Quick Start: Executive Summary
**File**: `PROGRESS_STREAMING_SUMMARY.md` (14 KB)

Start here if you want:
- Problem statement
- High-level solution
- Event type table
- Key design decisions
- Error recovery decision tree
- Quick architecture diagram

**Read time**: 10-15 minutes

### 2. Complete Specification
**File**: `progress-streaming-contract.md` (28 KB)

Read this for:
- Full architecture (3 layers with diagrams)
- Complete event catalog (17 types with examples)
- Backpressure behavior (strategy, sampling, thresholds)
- Error classification (systemic vs content vs backpressure)
- Error recovery semantics
- Cancellation semantics
- WebSocket protocol flow (complete message sequence)
- Implementation guidelines per layer
- Testing strategies
- Future enhancements

**Read time**: 30-45 minutes

### 3. Implementation Checklist
**File**: `IMPLEMENTATION_CHECKLIST.md` (12 KB)

Use this for:
- File deliverables summary
- Event type catalog reference
- Key features overview
- Implementation roadmap (5 phases)
- Code quality checklist
- Design decision rationale
- Testing checklist

**Read time**: 5-10 minutes (reference)

### 4. Contract Schema Definition
**File**: `src/Contract/ProgressStreaming.ts` (29 KB, 1,234 lines)

Contains:
- 17 strongly-typed event classes (ExtractionStartedEvent, EntityFoundEvent, etc.)
- Discriminated union (ProgressEvent)
- Backpressure configuration interface
- Error recovery semantics specification
- WebSocket protocol messages (StartExtractionRequest, CancellationRequest, etc.)
- Default backpressure config

**Usage**:
```typescript
import { ProgressEvent, ExtractionStartedEvent, BackpressureConfig } from "@core-v2/Contract/ProgressStreaming"
```

### 5. Implementation Utilities
**File**: `src/Service/ProgressStreaming.ts` (15 KB, 450 lines)

Contains:
- ProgressEventBuilder - Create consistent progress events
- BackpressureHandler - Monitor queue, sample events, apply strategy
- combineProgressStreams - Merge multiple event sources
- ResumableExtractionState - Checkpoint data structure
- extractResumableState - Parse resumption info from error

**Usage**:
```typescript
import { ProgressEventBuilder, BackpressureHandler } from "@core-v2/Service/ProgressStreaming"
```

## Quick Reference

### Event Types (17 total)

| Phase | Events | When |
|-------|--------|------|
| **Lifecycle** | extraction_started, extraction_complete, extraction_failed, extraction_cancelled | Once per extraction |
| **Chunking** | chunking_started, chunking_progress, chunking_complete | Text splitting phase |
| **Processing** | chunk_processing_started, chunk_processing_complete | Per chunk (6-phase pipeline) |
| **Entity Phase** | mention_extraction_progress, entity_extraction_progress | During entity extraction |
| **Relation Phase** | relation_extraction_progress, grounding_progress | During relation extraction |
| **Found Items** | entity_found (sampled 10%), relation_found (sampled 10%) | Per item discovered |
| **Errors** | error_recoverable, error_fatal, backpressure_warning | When errors occur |

### Backpressure Strategy

```
Default Config:
  maxQueueSize: 1000
  warningThreshold: 80%
  strategy: drop_oldest
  sampleRate: 10%

Behavior:
  0-80%    → Normal operation
  80-100%  → Emit warning, client should speed up
  >100%    → Drop oldest events (strategy: drop_oldest)
```

### Error Recovery Decision Tree

```
Error Occurs
  │
  ├─ ExtractionFailedEvent? (Systemic, fatal)
  │  ├─ isTemporary: true?  → Wait retryAfterMs, retry
  │  ├─ lastSuccessfulChunkIndex set?  → Resume from checkpoint
  │  └─ Else → Accept partial results or investigate
  │
  ├─ RecoverableErrorEvent? (Content, non-fatal)
  │  └─ Skip chunk, extraction continues
  │
  └─ BackpressureWarningEvent? (Transient)
     └─ Increase consumption rate
```

### Three-Layer Architecture

```
ORCHESTRATOR (Layer 1)
  ├─ streamingExtractionWithProgress(text, config)
  ├─ Returns: Effect<Stream<ProgressEvent>>
  └─ Emits: 17 event types at extraction phases

        ↓ RPC transformation

RPC/TRANSPORT (Layer 2)
  ├─ Subscribe to Stream<ProgressEvent>
  ├─ Validate serialization
  ├─ Apply backpressure (queue monitoring, sampling)
  ├─ Inject warnings when queue 80%+ full
  └─ Return: Stream<ProgressMessage> (JSON-safe)

        ↓ WebSocket framing

CLIENT (Layer 3)
  ├─ Receive ProgressMessage (JSON)
  ├─ Parse and dispatch to handlers
  ├─ Update UI (progress bar, entities, relations)
  ├─ Send CancellationRequest if user cancels
  └─ Handle errors (retry/resume/partial)
```

## Implementation Path

### Phase 1: Schema (DONE)
- Event definitions ✅
- Backpressure config ✅
- Protocol messages ✅
- Error semantics ✅

### Phase 2: Orchestrator (Next)
- Wrap streamingExtraction to emit Stream<ProgressEvent>
- Use ProgressEventBuilder for event creation
- Emit events at each phase
- Calculate overall progress

### Phase 3: RPC Layer (Next)
- Transform to Stream<ProgressMessage>
- Implement BackpressureHandler
- Catch serialization errors
- Monitor queue, apply strategy

### Phase 4: WebSocket (Next)
- Accept StartExtractionRequest
- Stream ProgressMessage to client
- Handle CancellationRequest
- Clean shutdown

### Phase 5: Client UI (Next)
- Subscribe to message stream
- Handle each event type
- Update progress bar, entity list, relations
- Implement error recovery UI

## Key Design Decisions

1. **17 Event Types** - Specific event per phase (not 5-6 generic)
   - Trade-off: More detail vs. more to handle

2. **Sampling at 10%** - entity_found/relation_found sampled
   - Trade-off: ~10KB/extraction vs. ~100KB/extraction

3. **drop_oldest backpressure** - Default strategy
   - Trade-off: Simple, reliable vs. data loss possible

4. **Optional resumption** - lastSuccessfulChunkIndex hint
   - Trade-off: Efficient retry vs. server complexity

5. **Discriminated union** - Type-safe event handling
   - Trade-off: More TypeScript vs. single generic type

## File Sizes Summary

```
Contract Schema:     29 KB (1,234 lines)
Implementation:      15 KB (450 lines)
Specification:       28 KB (900 lines)
Executive Summary:   14 KB (400 lines)
Checklist:          12 KB (300 lines)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:              98 KB (~3,284 lines)
```

## Navigation

**I want to...**

**...understand the problem and solution**
→ Read `PROGRESS_STREAMING_SUMMARY.md` (Executive Summary)

**...implement the contract**
→ Read `progress-streaming-contract.md` (Specification) → Implement using `src/Contract/ProgressStreaming.ts` and `src/Service/ProgressStreaming.ts`

**...handle specific event types**
→ See Event Type Catalog in `progress-streaming-contract.md`

**...understand backpressure**
→ See Backpressure Strategy section in spec

**...understand error recovery**
→ See Error Recovery Decision Tree in summary or detailed section in spec

**...implement the orchestrator layer**
→ See "For Orchestrator" in Implementation Guidelines (spec)

**...implement the RPC layer**
→ See "For RPC/Transport Layer" in Implementation Guidelines (spec)

**...implement the client layer**
→ See "For Client" in Implementation Guidelines (spec)

**...test the contract**
→ See Testing Strategies section in spec

**...track implementation progress**
→ Use `IMPLEMENTATION_CHECKLIST.md`

## Code Examples

### Creating Events

```typescript
import { ProgressEventBuilder } from "@core-v2/Service/ProgressStreaming"

const builder = new ProgressEventBuilder(runId, totalChunks)

// Emit events
const started = builder.extractionStarted({
  characterCount: text.length,
  estimatedAvgChunkSize: 500
})

const entityFound = builder.entityFound(
  chunkIndex,
  "entity_id",
  "Entity Mention",
  ["http://schema.org/Person"],
  0.96
)

builder.markChunkProcessed()
```

### Handling Events

```typescript
const event: ProgressEvent = receiveEvent()

switch (event._tag) {
  case "extraction_started":
    setTotalChunks(event.totalChunks)
    break
  case "entity_found":
    addEntity(event.entityId, event.mention, event.types)
    break
  case "error_fatal":
    if (event.isTemporary) {
      scheduleRetry(event.retryAfterMs)
    } else {
      showError(event.errorMessage)
    }
    break
  case "extraction_complete":
    showResults(event.totalEntities, event.totalRelations)
    break
}
```

### Backpressure Handling

```typescript
import { BackpressureHandler, DefaultBackpressureConfig } from "@core-v2/Service/ProgressStreaming"

const handler = new BackpressureHandler({
  maxQueueSize: 1000,
  warningThreshold: 0.8,
  strategy: "drop_oldest",
  detailedEventSampleRate: 0.1
})

// Enqueue events with automatic backpressure
const result = handler.enqueueEvent(event)
if (result instanceof BackpressureWarningEvent) {
  // Send warning to client
}
```

## Related Files

- Extraction workflow: `src/Workflow/StreamingExtraction.ts`
- Entity model: `src/Domain/Model/Entity.ts`
- Error types: `src/Domain/Error/Extraction.ts`, `src/Domain/Error/Llm.ts`
- Extraction run: `src/Domain/Model/ExtractionRun.ts`

## Feedback & Discussion

- **Event semantics**: Discuss in Issue #XXX
- **Backpressure strategy**: Consider trade-offs in spec
- **Performance**: Test with real-world extractions
- **Client implementation**: Share feedback on event types

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Dec 9, 2025 | 1.0 | Initial design complete |

---

**Last Updated**: December 10, 2025
**Status**: Design Complete, Ready for Implementation
**Next**: Phase 2 - Implement in Orchestrator
