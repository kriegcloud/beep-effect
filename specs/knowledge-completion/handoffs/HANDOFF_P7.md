# Handoff: Phase 7 - Todox Integration

> Context document for Phase 7 of the knowledge completion spec.

---

## Prerequisites

Phase 6 (GraphRAG Implementation) must be complete with:
- [ ] `GraphRAGService` implemented and tested
- [ ] k-NN search and N-hop traversal working
- [ ] Context formatting functional

---

## Phase 7 Objective

**Integrate knowledge extraction with Todox email pipeline**:
1. Email extraction trigger
2. Client knowledge graph assembly
3. Real-time extraction events

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P7.md | ~1,000 |
| Integration points | ~2,000 |
| Event system | ~1,500 |
| **Total** | ~4,500 |

---

## Integration Architecture

### Email Extraction Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Email       │────▶│ Extraction       │────▶│ Knowledge       │
│ Received    │     │ Pipeline         │     │ Graph           │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                    │                        │
       │                    ▼                        │
       │           ┌──────────────────┐              │
       │           │ Event Emission   │              │
       │           │ (extraction      │              │
       │           │  complete)       │              │
       │           └──────────────────┘              │
       │                    │                        │
       │                    ▼                        │
       │           ┌──────────────────┐              │
       └──────────▶│ Client Graph     │◀─────────────┘
                   │ Assembly         │
                   └──────────────────┘
```

---

## Implementation Components

### 1. Email Extraction Trigger

Integration point with comms package:

```typescript
// packages/comms/server/src/Email/EmailProcessor.ts (or similar)

export const onEmailReceived = (email: Email) =>
  Effect.gen(function* () {
    // 1. Extract knowledge from email body
    const pipeline = yield* ExtractionPipeline
    const graph = yield* pipeline.extract(email.body, {
      sourceId: email.id,
      sourceType: "email"
    })

    // 2. Persist to knowledge graph
    yield* persistGraph(graph)

    // 3. Emit extraction complete event
    yield* emitEvent({
      type: "knowledge.extraction.complete",
      payload: {
        sourceId: email.id,
        entityCount: graph.entities.length,
        relationCount: graph.relations.length
      }
    })
  })
```

### 2. Client Knowledge Graph Assembly

Per-client graph aggregation:

```typescript
// packages/knowledge/server/src/Client/ClientGraphService.ts

export const assembleClientGraph = (clientId: ClientId) =>
  Effect.gen(function* () {
    // 1. Get all emails for client
    const emails = yield* EmailRepo.findByClientId(clientId)

    // 2. Get extracted entities for those emails
    const entities = yield* EntityRepo.findBySourceIds(emails.map(e => e.id))

    // 3. Get relations between entities
    const relations = yield* RelationRepo.findByEntityIds(entities.map(e => e.id))

    // 4. Return assembled graph
    return { clientId, entities, relations }
  })
```

### 3. Real-time Events

Event system for extraction notifications:

```typescript
// Event types
export interface ExtractionCompleteEvent {
  readonly type: "knowledge.extraction.complete"
  readonly payload: {
    readonly sourceId: string
    readonly entityCount: number
    readonly relationCount: number
    readonly timestamp: DateTime.Utc
  }
}

// Subscription pattern (for UI)
export const subscribeToExtractions = (clientId: ClientId) =>
  Stream.fromQueue(extractionEventQueue).pipe(
    Stream.filter(event => event.clientId === clientId)
  )
```

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `src/Client/ClientGraphService.ts` | Client graph assembly |
| CREATE | `src/Events/ExtractionEvents.ts` | Event types and emitters |
| MODIFY | Integration point in comms | Trigger extraction |
| CREATE | `test/Client/ClientGraphService.test.ts` | Tests |

---

## Integration Points

### With Comms Package

- **Trigger**: Email receive handler
- **Data Flow**: Email body → Extraction → Graph

### With UI Package

- **Events**: Real-time updates via SSE or WebSocket
- **Query**: GraphRAG for client context

---

## Exit Criteria

Phase 7 is complete when:

- [ ] Email extraction trigger implemented
- [ ] Client graph assembly working
- [ ] Real-time events emitting
- [ ] Integration tests passing
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P8.md` created

---

## Agent Assignment

| Agent | Task |
|-------|------|
| `effect-code-writer` | Service implementation |
| `test-writer` | Integration tests |

---

## Notes

- Coordinate with comms package maintainer for integration point
- Events can use existing Effect event patterns
- Consider batch extraction for historical emails
- Rate limiting may be needed for LLM calls
