# Progress Streaming Contract for Extractions

## Overview

This document defines the complete contract for streaming extraction progress from the orchestrator through RPC to WebSocket clients. It addresses the key challenge: **there is currently no clear mapping between the Effect-based workflow, RPC layer, and WebSocket client**.

### Problem Statement

The current architecture has several disconnected pieces:

1. **Orchestrator** - `streamingExtraction()` returns `Effect<KnowledgeGraph>` (no streaming)
2. **Workflow** - Uses internal `Stream` for chunk processing, not exposed
3. **Cluster Entity** - Returns `Stream` (contradiction with orchestrator)
4. **API Layer** - WebSocket expects streaming but has no contract
5. **Client** - No defined progress event schema

**This contract unifies all three layers with concrete event schemas, backpressure semantics, and error handling.**

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator Layer                                              │
│                                                                 │
│ streamingExtraction(text, config)                              │
│ → Effect<Stream<ProgressEvent>>                                │
│   • Emits fine-grained progress events                         │
│   • Handles chunk processing internally                        │
│   • Isolates errors (content vs systemic)                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                 Convert to JSON-safe format
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ RPC/Transport Layer                                             │
│                                                                 │
│ Stream<ProgressEvent> → Stream<ProgressMessage>                │
│ • Serialization errors caught                                  │
│ • Backpressure signals injected                                │
│ • WebSocket message framing                                    │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                    WebSocket Protocol
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Client Layer                                                    │
│                                                                 │
│ addEventListener("message", (event) => {                       │
│   const msg = JSON.parse(event.data)                           │
│   if (msg.data._tag === "entity_found") { ... }               │
│ })                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Progress Event Schema

All events share these common fields:

```typescript
interface BaseProgressEvent {
  eventId: string                 // UUID v4 (for deduplication)
  runId: ExtractionRunId          // doc-{12hexchars}
  timestamp: string               // ISO 8601
  overallProgress: number         // 0-100
  _tag: ProgressEventTag          // Discriminated union tag
}
```

### Event Types

#### 1. Extraction Lifecycle

**ExtractionStartedEvent**
- Emitted once at extraction start
- Contains text metadata (character count, estimated chunk size)
- Client uses to initialize UI progress bar
- ```typescript
  {
    _tag: "extraction_started",
    runId: "doc-abc123def456",
    totalChunks: 42,
    textMetadata: {
      characterCount: 15000,
      estimatedAvgChunkSize: 500,
      contentType?: "news" | "research" | ...
    }
  }
  ```

**ExtractionCompleteEvent**
- Emitted when all chunks processed successfully
- Final statistics available
- Knowledge graph ready for consumption
- ```typescript
  {
    _tag: "extraction_complete",
    totalEntities: 156,
    totalRelations: 284,
    uniqueEntityTypes: 12,
    totalDurationMs: 45000,
    successfulChunks: 42,
    failedChunks: 0
  }
  ```

**ExtractionFailedEvent**
- Emitted on fatal error (LLM timeout, rate limit, DB connection)
- Partial results available
- Indicates resumability
- ```typescript
  {
    _tag: "extraction_failed",
    errorType: "LlmRateLimit",
    errorMessage: "Rate limited after 120 seconds. Retry after 60s.",
    isRecoverable: true,
    isTemporary: true,
    retryAfterMs: 60000,
    retryStrategy: {
      type: "exponential_backoff",
      maxAttempts: 3
    },
    partialResults: {
      entityCount: 45,
      relationCount: 23,
      processedChunks: 12
    },
    lastSuccessfulChunkIndex: 11
  }
  ```

**ExtractionCancelledEvent**
- Emitted when client requests cancellation
- Graceful cleanup on server
- Partial results preserved
- ```typescript
  {
    _tag: "extraction_cancelled",
    reason: "User clicked cancel",
    partialResults: {
      entityCount: 78,
      relationCount: 156,
      processedChunks: 23
    }
  }
  ```

#### 2. Chunking Phase

**ChunkingStartedEvent**
- Emitted when NLP service begins text chunking
- Configuration details included

**ChunkingProgressEvent**
- Periodic updates during chunking
- Useful for very large texts
- Shows current chunks completed, being processed, average size

**ChunkingCompleteEvent**
- Final chunk count (may differ from estimate)
- Actual average chunk size
- Time taken in milliseconds

#### 3. Chunk Processing Phase

**ChunkProcessingStartedEvent**
- Emitted when a chunk begins the 6-phase pipeline
- Preview of chunk text (first 200 chars)

**MentionExtractionProgressEvent**
- Phase progress within chunk (0-100)
- Mention count so far

**EntityExtractionProgressEvent**
- Phase progress within chunk
- Entity count
- Candidate class count

**EntityFoundEvent** (Optional, Sampled)
- Emitted when significant entity extracted
- Sampling rate controlled by `BackpressureConfig.detailedEventSampleRate`
- Useful for real-time UI updates showing found entities
- ```typescript
  {
    _tag: "entity_found",
    chunkIndex: 5,
    entityId: "cristiano_ronaldo",
    mention: "Cristiano Ronaldo",
    types: [
      "http://schema.org/Person",
      "http://schema.org/Athlete"
    ],
    confidence?: 0.96
  }
  ```

**RelationExtractionProgressEvent**
- Phase progress within chunk
- Relation count
- Entity count available for relations

**RelationFoundEvent** (Optional, Sampled)
- Emitted when significant relation extracted
- Sampling controlled by backpressure config
- ```typescript
  {
    _tag: "relation_found",
    chunkIndex: 5,
    subjectId: "cristiano_ronaldo",
    predicate: "http://schema.org/memberOf",
    object: "al_nassr_fc",
    isEntityReference: true,
    confidence?: 0.92
  }
  ```

**GroundingProgressEvent**
- Relation verification phase
- Shows verified vs grounded relations
- Confidence threshold applied

**ChunkProcessingCompleteEvent**
- Chunk finished all 6 phases
- Summary: entities, relations, time taken
- Any non-fatal errors that occurred

#### 4. Error Events

**RecoverableErrorEvent** (Content-Level)
- Non-fatal error for a single chunk
- Extraction continues with next chunk
- Examples:
  - One chunk's entity extraction times out → skip that chunk
  - Grounding verification fails for one chunk → empty relations for that chunk
- ```typescript
  {
    _tag: "error_recoverable",
    chunkIndex: 7,
    errorType: "EntityExtractionTimeout",
    errorMessage: "LLM didn't respond within 30 seconds",
    phase: "entity-extraction",
    recoveryAction: "Skipped chunk, continuing with next"
  }
  ```

**FatalErrorEvent** (Systemic)
- Halts extraction
- Examples:
  - LLM service unreachable
  - Database connection lost
  - Rate limit exceeded (temporary)
- Temporary errors (rate limit) suggest retry
- ```typescript
  {
    _tag: "error_fatal",
    errorType: "LlmRateLimit",
    errorMessage: "429 Too Many Requests",
    isTemporary: true,
    retryAfterMs: 60000
  }
  ```

#### 5. Backpressure

**BackpressureWarningEvent**
- Emitted when server event queue builds up
- Indicates client consuming too slowly
- Client should increase parallelism or event consumption rate
- Server strategy defined in `BackpressureConfig`
- ```typescript
  {
    _tag: "backpressure_warning",
    queuedEvents: 850,  // Out of maxQueueSize: 1000
    maxQueueSize: 1000,
    severity: "warning" | "critical",
    recommendedAction: "Increase parallelism or slow down progress UI updates"
  }
  ```

## Backpressure Strategy

### Configuration

```typescript
interface BackpressureConfig {
  maxQueueSize: number              // Default: 1000
  warningThreshold: number          // Default: 0.8 (80%)
  strategy: "drop_oldest" | "drop_newest" | "block_producer" | "close_stream"
  blockTimeoutMs?: number           // For "block_producer"
  detailedEventSampleRate: number   // Default: 0.1 (10%)
}
```

### Behavior

1. **Queue Monitoring**
   - Server maintains event queue for each client connection
   - Tracks pending events before transmission

2. **Warning Threshold (80%)**
   - When queue reaches 80% of maxQueueSize
   - Emit `BackpressureWarningEvent` to client
   - Client should speed up consumption or increase parallelism

3. **Overflow Handling**
   - When queue exceeds maxQueueSize, apply configured strategy:

   **drop_oldest** (Recommended)
   - Discard oldest events
   - Preserves latest progress updates
   - Client sees jump in progress (slight loss of history but completes faster)
   - Good for monitoring dashboards

   **drop_newest**
   - Discard new events
   - Client sees accurate history but may lag behind actual progress
   - Good for detailed logging

   **block_producer**
   - Pause the extraction Stream on server
   - Wait for client to consume events
   - If client doesn't consume within `blockTimeoutMs`, apply fallback strategy
   - Risk: extraction timeout if blocked too long

   **close_stream**
   - Kill the WebSocket connection
   - Client must reconnect and resume
   - Drastic but ensures no data loss

### Sampling (Detailed Events)

Sampled at `detailedEventSampleRate` (default 10%):
- `entity_found` events (1 in 10 entities)
- `relation_found` events (1 in 10 relations)

Always emitted (never sampled):
- Status events: `extraction_started`, `extraction_complete`, `extraction_failed`, `extraction_cancelled`
- Phase events: `chunking_started`, `chunk_processing_complete`, etc.
- Error events: `error_recoverable`, `error_fatal`, `backpressure_warning`

**Rationale**: Clients see progress without overwhelming the network.

## Error Semantics and Recovery

### Error Classification

#### Systemic Errors (Fatal)

Errors that prevent extraction from continuing:

- **LlmRateLimit**: Rate limited by LLM provider
  - `isTemporary: true`
  - `retryAfterMs: 60000` (wait before retry)
  - Client can retry with exponential backoff

- **LlmTimeout**: LLM call exceeded timeout
  - `isTemporary: true` (usually)
  - Might indicate overload
  - Client should retry with backoff

- **ExtractionError** (systemic)
  - Generic extraction failure
  - Could be connectivity, database, configuration
  - Check message for details

**Recovery Options**:
1. **Retry from Beginning** - Most conservative, always safe
   - Client sends new `StartExtractionRequest` with same text
   - Server creates new run ID
   - Full extraction from scratch

2. **Resume from Checkpoint** - More efficient
   - Only if `lastSuccessfulChunkIndex` is provided
   - Server skips already-processed chunks
   - Continue from next chunk
   - **Requires**: Results saved/cached for already-processed chunks

3. **Accept Partial Results** - Quick feedback
   - Client uses `partialResults` from error event
   - Useful for exploratory UI
   - Incomplete knowledge graph

#### Content Errors (Non-Fatal)

Errors in a single chunk that don't stop extraction:

- **EntityExtractionFailed**: LLM returned unparseable response for one chunk
- **RelationExtractionFailed**: Relation extraction failed for one chunk
- **GrounderVerificationFailed**: Relation verification timed out for one chunk

**Behavior**:
- Emit `RecoverableErrorEvent`
- Skip this chunk (contributes empty results)
- Continue processing next chunk
- Final extraction includes other chunks' results

**Client Impact**:
- See error notification
- Progress continues
- May result in slightly fewer entities/relations than if chunk succeeded

#### Backpressure Errors (Transient)

Client consuming too slowly:

- **BackpressureWarningEvent** - Advisory, server still processing
- **Event Loss** - If client ignores warning and queue overflows
  - Based on server strategy (drop_oldest by default)
  - Historical events lost
  - Latest progress still visible

**Client Recovery**:
1. Increase event consumption rate (disable throttling)
2. Enable parallelism in event handlers
3. Disable detailed event sampling on client side
4. Upgrade server backpressure config (larger queue)

#### Client Cancellation

Client explicitly cancels extraction:

- Send `CancellationRequest` with `runId`
- Server responds with `CancellationResponse { accepted: true }`
- Server emits `ExtractionCancelledEvent`
- Stream ends gracefully
- Partial results available for consumption

**Idempotence**: Sending duplicate cancellation requests is safe (idempotent).

### Error Recovery Decision Tree

```
Error Occurs
    ↓
Is it Systemic? (ExtractionFailedEvent)
├─ YES (isRecoverable: true)
│  ├─ Is Temporary? (e.g., LlmRateLimit)
│  │  ├─ YES: Wait retryAfterMs, then retry
│  │  └─ NO: User decides (retry/accept partial/investigate)
│  ├─ lastSuccessfulChunkIndex available?
│  │  ├─ YES: Resume from chunk index (if supported)
│  │  └─ NO: Retry from beginning
│  └─ User accepted partial results? (Use them)
│
├─ NO (Content Error - RecoverableErrorEvent)
│  ├─ Skip this chunk
│  └─ Continue extracting
│
└─ Backpressure? (BackpressureWarningEvent)
   ├─ Increase consumption rate
   └─ Continue extraction
```

## Cancellation Semantics

### Client-Initiated Cancellation

1. **Client sends**:
   ```json
   {
     "type": "cancellation",
     "runId": "doc-abc123def456",
     "reason": "User clicked cancel",
     "savePartialResults": true
   }
   ```

2. **Server responds**:
   ```json
   {
     "type": "cancellation_response",
     "runId": "doc-abc123def456",
     "accepted": true,
     "timestamp": "2025-12-09T10:30:45.123Z"
   }
   ```

3. **Server emits**:
   ```json
   {
     "type": "progress",
     "data": {
       "_tag": "extraction_cancelled",
       "reason": "User clicked cancel",
       "partialResults": {
         "entityCount": 78,
         "relationCount": 156,
         "processedChunks": 23
       }
     }
   }
   ```

4. **Stream ends** - No more events

### Characteristics

- **Graceful**: Server cleans up in-flight work
- **Idempotent**: Duplicate cancellations safe
- **Partial Results**: Available for partial cancellation
- **No Auto-Resume**: New request required

## WebSocket Protocol Flow

### Message Types

**Client → Server**:
- `StartExtractionRequest` - Initiate extraction
- `CancellationRequest` - Cancel ongoing extraction
- `AckMessage` - Acknowledge event (for backpressure tracking)

**Server → Client**:
- `StartExtractionResponse` - Confirm run ID
- `ProgressMessage` - Streaming progress event
- `CancellationResponse` - Confirm cancellation
- `BackpressureWarningEvent` - Queue building up (special case)

### Complete Flow

```
CLIENT                                    SERVER

StartExtractionRequest
  ├─ text: "..."
  ├─ config: {...}
  └─ runId?: undefined (server generates)
                ↓
                                    Creates run, starts extraction
                                    Launches Stream<ProgressEvent>
                ↓
                                    StartExtractionResponse
                                    ├─ runId: "doc-abc123"
                                    ├─ accepted: true
                                    └─ timestamp: "..."
    Receives runId, initializes UI
                ↓
                                    Stream starts emitting:

                                    1. ExtractionStartedEvent
                                    2. ChunkingStartedEvent
                                    3. ChunkingProgressEvent*
                                    4. ChunkingCompleteEvent
                                    5. [ChunkProcessingStartedEvent
                                       MentionExtractionProgressEvent
                                       EntityExtractionProgressEvent
                                       EntityFoundEvent* (sampled)
                                       RelationExtractionProgressEvent
                                       RelationFoundEvent* (sampled)
                                       GroundingProgressEvent
                                       ChunkProcessingCompleteEvent]*
                                    6. ExtractionCompleteEvent

                                    Each ProgressMessage wraps event:
                                    {
                                      "type": "progress",
                                      "data": { ... event ... },
                                      "createdAt": "..."
                                    }
Receives events continuously
Updates UI progress bar/entities
                ↓
                                    [Server reaches 80% queue threshold]

                                    BackpressureWarningEvent
                                    ├─ severity: "warning"
                                    └─ recommendedAction: "Increase consumption"
Sees warning, increases rate
Sends AckMessage to confirm
                ↓
                                    Continues streaming
                                    (or waits if blockTimeoutMs exceeded)
                ↓
[User decides: accept or cancel]
                ├─ ACCEPT: Wait for completion
                │
                └─ CANCEL: CancellationRequest
                          ├─ runId: "doc-abc123"
                          └─ reason: "User cancelled"
                                ↓
                                            CancellationResponse
                                            ├─ accepted: true
                                            └─ timestamp: "..."
                    Confirmed cancellation
                                ↓
                                            ExtractionCancelledEvent
                                            ├─ partialResults: {...}
                                            └─ lastProcessedChunkIndex: 23
                    Receives partial results
                    Shows cancellation UI state
                    Stream ends (no more events)
                ↓
            COMPLETED PATH:
                                    ExtractionCompleteEvent
                                    ├─ totalEntities: 156
                                    ├─ totalRelations: 284
                                    └─ totalDurationMs: 45000
            Receives final results
            Shows completion state
            Stream ends

[Connection closes or waits for new request]
```

## Implementation Guidelines

### For Orchestrator

1. **Wrap Extraction in Stream**:
   ```typescript
   // Before (Effect<KnowledgeGraph>)
   const streamingExtraction = (text, config): Effect<KnowledgeGraph> => { ... }

   // After (Effect<Stream<ProgressEvent>>)
   const streamingExtractionWithProgress = (
     text: string,
     config: RunConfig
   ): Effect<Stream<ProgressEvent>> => {
     return Effect.gen(function*() {
       const events: ProgressEvent[] = []

       // Emit extraction_started
       events.push(new ExtractionStartedEvent({
         runId, eventId, timestamp, overallProgress: 0,
         totalChunks: estimatedChunks,
         textMetadata: { ... }
       }))

       // Emit chunking_started
       // Emit chunking_progress*
       // ...
       // Create stream from events
       return Stream.fromIterable(events)
     })
   }
   ```

2. **Emit Events at Key Points**:
   - Phase starts (chunking_started, chunk_processing_started)
   - Phase progress (chunking_progress, entity_extraction_progress)
   - Phase complete (chunking_complete, chunk_processing_complete)
   - Item found (entity_found, relation_found) - sampled
   - Errors (error_recoverable, error_fatal)
   - Overall complete/failed/cancelled

3. **Attach Chunk Index**:
   - All chunk-level events include `chunkIndex`
   - Enables client to correlate events

4. **Calculate Overall Progress**:
   - Track processed chunks / total chunks
   - `overallProgress = (processedChunks + phaseProgress / 100) / totalChunks * 100`

### For RPC/Transport Layer

1. **Subscribe to Stream**:
   ```typescript
   const runProgram = streamingExtractionWithProgress(text, config).pipe(
     Stream.mapEffect((event: ProgressEvent) => {
       // Validate event is serializable
       const data = JSON.parse(JSON.stringify(event))
       return Effect.succeed(new ProgressMessage({
         type: "progress",
         data,
         createdAt: new Date().toISOString()
       }))
     }),
     // Catch serialization errors
     Stream.catchAll((error) =>
       Stream.succeed(new ProgressMessage({
         type: "progress",
         data: {
           _tag: "serialization_error",
           eventTag: (error as any).eventTag,
           originalError: error.message
         }
       }))
     )
   )
   ```

2. **Handle Backpressure**:
   - Implement backpressure config
   - Monitor queue size
   - Emit warnings when threshold exceeded
   - Drop/block based on strategy

3. **WebSocket Framing**:
   - Serialize `ProgressMessage` to JSON
   - Send as single JSON object per event (one per line)
   - Use `socket.send(JSON.stringify(message))`

### For Client

1. **Subscribe to Messages**:
   ```typescript
   websocket.addEventListener("message", (event) => {
     const msg = JSON.parse(event.data) as ProgressMessage
     const progressEvent = msg.data

     switch (progressEvent._tag) {
       case "extraction_started":
         setTotalChunks(progressEvent.totalChunks)
         break
       case "entity_found":
         addEntity(progressEvent.entityId, progressEvent.mention)
         break
       case "extraction_complete":
         showFinalResults(progressEvent.totalEntities, progressEvent.totalRelations)
         break
       case "error_fatal":
         if (progressEvent.isTemporary) {
           scheduleRetry(progressEvent.retryAfterMs)
         } else {
           showErrorUI(progressEvent.errorMessage)
         }
         break
     }
   })
   ```

2. **Handle Backpressure Warning**:
   ```typescript
   case "backpressure_warning":
     // Increase event consumption rate (disable throttling)
     // Enable parallelism in handlers
     // Or request server to increase sample rate
     console.warn(`Server backpressure: ${warning.recommendedAction}`)
     break
   ```

3. **Implement Cancellation**:
   ```typescript
   cancelButton.addEventListener("click", () => {
     websocket.send(JSON.stringify(new CancellationRequest({
       runId,
       reason: "User cancelled"
     })))
   })
   ```

4. **Track Partial Results**:
   ```typescript
   let partialResults = null

   case "error_fatal":
     partialResults = progressEvent.partialResults
     break

   case "extraction_cancelled":
     partialResults = progressEvent.partialResults
     break

   // After error, offer user to:
   // - Accept partial results
   // - Retry extraction
   // - Resume from lastSuccessfulChunkIndex (if available)
   ```

## Example: Complete Extraction Flow

```typescript
// On client
websocket.send(JSON.stringify({
  type: "start_extraction",
  text: "The Dutch soccer teams...",
  config: {
    chunking: { maxChunkSize: 500, preserveSentences: true },
    concurrency: 4,
    ontologyPath: "../../ontologies/football.ttl"
  }
}))

// Server responds
{"type": "start_extraction_response", "runId": "doc-abc123def456", "accepted": true}

// Events stream in
{"type": "progress", "data": {"_tag": "extraction_started", "totalChunks": 8, ...}}
{"type": "progress", "data": {"_tag": "chunking_started", ...}}
{"type": "progress", "data": {"_tag": "chunking_progress", "chunksCompleted": 2, ...}}
{"type": "progress", "data": {"_tag": "chunking_progress", "chunksCompleted": 4, ...}}
{"type": "progress", "data": {"_tag": "chunking_progress", "chunksCompleted": 6, ...}}
{"type": "progress", "data": {"_tag": "chunking_complete", "finalChunkCount": 8, ...}}

// First chunk processing starts
{"type": "progress", "data": {"_tag": "chunk_processing_started", "chunkIndex": 0, ...}}
{"type": "progress", "data": {"_tag": "mention_extraction_progress", "chunkIndex": 0, "phaseProgress": 100, "mentionCount": 12}}
{"type": "progress", "data": {"_tag": "entity_extraction_progress", "chunkIndex": 0, "phaseProgress": 100, "entityCount": 8}}
{"type": "progress", "data": {"_tag": "entity_found", "entityId": "dutch_soccer", "mention": "Dutch soccer", "types": [...], "confidence": 0.95}}
{"type": "progress", "data": {"_tag": "relation_extraction_progress", "chunkIndex": 0, "phaseProgress": 50, "relationCount": 3}}
{"type": "progress", "data": {"_tag": "relation_found", "subjectId": "dutch_soccer", "predicate": "...", "object": "1960s", ...}}
{"type": "progress", "data": {"_tag": "grounding_progress", "chunkIndex": 0, "verifiedRelations": 3, "groundedRelations": 2}}
{"type": "progress", "data": {"_tag": "chunk_processing_complete", "chunkIndex": 0, "entityCount": 8, "relationCount": 2, "durationMs": 2345}}

// Remaining chunks...
... (chunks 1-7 follow same pattern) ...

// Final result
{"type": "progress", "data": {"_tag": "extraction_complete", "totalEntities": 156, "totalRelations": 284, "totalDurationMs": 45000}}
```

## Testing Contract Compliance

### Unit Tests

1. **Event Schema Validation**
   - All events serialize/deserialize correctly
   - All required fields present
   - Timestamps in ISO 8601 format
   - Progress values 0-100
   - IDs match patterns

2. **Error Semantics**
   - Systemic errors: `isRecoverable`, `retryAfterMs` set correctly
   - Content errors: `RecoverableErrorEvent` continues stream
   - Backpressure: Events queued/dropped correctly

3. **Cancellation**
   - `CancellationRequest` stops extraction
   - Partial results available
   - Stream ends gracefully

### Integration Tests

1. **WebSocket Flow**
   - Client sends StartExtractionRequest
   - Server responds with runId
   - Event stream flows correctly
   - Client can cancel
   - Stream ends appropriately

2. **Backpressure**
   - Queue builds when client slow
   - Warning emitted at threshold
   - Events dropped/queued based on strategy

3. **Error Recovery**
   - Systemic error emitted
   - Extraction ends
   - Client can retry
   - Partial results available

## Future Enhancements

1. **Resumption**
   - Add `resumeFromChunkIndex` to StartExtractionRequest
   - Server skips completed chunks
   - Requires chunk output caching

2. **Streaming KnowledgeGraph**
   - Emit partial KnowledgeGraph after each chunk
   - Clients can subscribe to KnowledgeGraphFragment stream
   - Progressive refinement visible

3. **Custom Event Filtering**
   - Client specifies desired events: `["chunk_processing_complete", "entity_found", "error_*"]`
   - Server only emits matching events
   - Reduces bandwidth

4. **Server-Side Statistics**
   - Track event emission rate
   - Monitor backpressure patterns
   - Optimize sampling rate per client

5. **Client Metrics**
   - Client sends performance metrics back
   - Server adjusts sampling based on client capability
   - Adaptive quality of service

## References

- `packages/@core-v2/src/Contract/ProgressStreaming.ts` - Schema definitions
- `packages/@core-v2/src/Workflow/StreamingExtraction.ts` - Current workflow
- `packages/@core-v2/src/Domain/Model/Entity.ts` - KnowledgeGraph model
- `packages/@core-v2/src/Domain/Error/Extraction.ts` - Error types
