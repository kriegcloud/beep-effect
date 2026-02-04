# Unified Identity & Idempotency Scheme for Extraction System

**Date**: December 2025
**Status**: Design Proposal
**Author**: Architecture Team

## Executive Summary

This document proposes a unified idempotency key formula that eliminates cache bypass vulnerabilities in the extraction system. The current architecture has inconsistent identity across layers:

- **RPC primaryKey**: `hash(text + ontologyId)`
- **Workflow idempotencyKey**: `hash(text + ontologyId)`
- **Cluster entity key**: `requestId` (UUID)

**Problem**: A client resubmission with a new `requestId` bypasses the cache and double-runs extraction, defeating idempotency guarantees.

**Solution**: Design a single idempotency key formula that propagates through ALL layers, includes ontology VERSION for proper invalidation, and enforces cache consistency across client, RPC, orchestrator, and cache layers.

---

## Part 1: Key Formula Design

### 1.1 Proposed Formula

```
IDEMPOTENCY_KEY = hash(
  text_content: string,
  ontology_id: IRI,
  ontology_version: string,
  extraction_params: ExtractionParams
)
```

**Inputs**:
- **text_content** (string): The actual text to extract from (normalized: trimmed, LF line endings)
- **ontology_id** (IRI): The ontology URI identifier (e.g., `http://example.org/ontologies/myont`)
- **ontology_version** (string): Semantic version or hash of ontology content (e.g., `1.2.3` or `sha256:abc123`)
- **extraction_params** (object): Hash of extraction parameters (concurrency, model, temperature, etc.)

### 1.2 Why Include Each Component

| Component | Purpose | Invalidation Trigger |
|-----------|---------|----------------------|
| **text_content** | Ensures same text always gets same result | Client submits different text |
| **ontology_id** | Different ontologies should have different keys | Switch to different ontology URI |
| **ontology_version** | Captures ontology schema changes | Ontology is updated (classes/properties modified) |
| **extraction_params** | Different params may produce different results | Change LLM model, temperature, concurrency |

### 1.3 Detailed Component Definitions

#### Text Content Normalization

```typescript
const normalizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\s+\n/g, '\n') // Trim trailing whitespace on lines
}
```

**Rationale**: Eliminate whitespace-only differences from creating spurious cache misses.

#### Ontology Version

Two approaches (choose one based on your use case):

**Option A: Semantic Versioning** (for manually-versioned ontologies)
```typescript
interface OntologyMetadata {
  id: IRI
  version: string  // e.g., "1.2.3"
  label: string
}
```

**Option B: Content Hash** (for auto-versioned ontologies)
```typescript
const getOntologyVersion = (ontology: OntologyContext): string => {
  const canonical = JSON.stringify({
    classes: ontology.classes.map(c => ({ id: c.id, properties: c.properties.sort() })).sort((a,b) => a.id.localeCompare(b.id)),
    properties: ontology.properties.map(p => ({ id: p.id, domain: p.domain.sort(), range: p.range.sort() })).sort((a,b) => a.id.localeCompare(b.id))
  })
  return `sha256:${crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))}`
}
```

**Recommendation**: Use Option B (content hash) for production. It automatically invalidates cache when ontology changes, requires no manual versioning, and is deterministic.

#### Extraction Parameters Hash

```typescript
interface ExtractionParams {
  concurrency: number
  llmModel: string
  temperature: number
  maxTokens: number
  chunkSize?: number
  // Add other params that affect extraction output
}

const hashExtractionParams = (params: ExtractionParams): string => {
  const canonical = JSON.stringify(params, Object.keys(params).sort())
  return hash(canonical)
}
```

**Rationale**: Different extraction parameters should not share the same cached result. If you change the LLM model or temperature, you want fresh extraction.

### 1.4 Hash Function

Use a cryptographic hash for determinism and collision resistance:

```typescript
import { createHash } from 'crypto'

export const computeIdempotencyKey = (input: {
  text: string
  ontologyId: string
  ontologyVersion: string
  extractionParams: ExtractionParams
}): string => {
  const normalized = {
    text: normalizeText(input.text),
    ontologyId: input.ontologyId,
    ontologyVersion: input.ontologyVersion,
    extractionParams: input.extractionParams
  }

  const canonical = JSON.stringify(normalized, (key, value) => {
    // Ensure consistent ordering
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = value[key]
          return sorted
        }, {} as Record<string, any>)
    }
    return value
  })

  return createHash('sha256')
    .update(canonical)
    .digest('hex')
    .substring(0, 16)  // 64-bit hex = 16 chars, sufficient for cache keys
}
```

**Output Format**: `sha256-{16hexchars}`
**Example**: `sha256-a1b2c3d4e5f6g7h8`

---

## Part 2: Data Flow Architecture

### 2.1 Complete Key Propagation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ CLIENT / RPC REQUEST                                             │
│                                                                  │
│  POST /api/v1/extract {                                         │
│    text: "Cristiano Ronaldo plays for Al-Nassr",              │
│    ontologyId: "http://example.org/sports-ontology",           │
│    extractionParams: { model: "claude-3-5-sonnet", temp: 0.0 } │
│  }                                                              │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ RPC SERVER / REQUEST HANDLER                                     │
│                                                                  │
│ 1. Fetch ontology metadata:                                     │
│    ontologyVersion = getOntologyVersion(ontologyId)             │
│                                                                  │
│ 2. Compute idempotency key:                                     │
│    idempotencyKey = computeIdempotencyKey({                    │
│      text,                                                       │
│      ontologyId,                                                │
│      ontologyVersion,                                           │
│      extractionParams                                           │
│    })                                                            │
│                                                                  │
│ 3. Query cache:                                                 │
│    cached = await cache.get(idempotencyKey)                    │
│    if cached: return cached  [CACHE HIT!]                      │
│                                                                  │
│ 4. NOT in cache → trigger orchestration with idempotencyKey    │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR / WORKFLOW MANAGER                                  │
│                                                                  │
│ 1. Check execution cache (per-idempotencyKey):                 │
│    execution = await executionCache.get(idempotencyKey)        │
│    if execution.status === 'running': await execution.wait()   │
│    if execution.status === 'completed': return execution.result│
│                                                                  │
│ 2. Mark execution as in-progress:                               │
│    executionCache.set(idempotencyKey, {                        │
│      status: 'running',                                         │
│      deferredResult: Deferred<Result>()                         │
│    })                                                            │
│                                                                  │
│ 3. Run extraction with idempotencyKey in context:              │
│    result = await streamingExtraction(                          │
│      text,                                                       │
│      { idempotencyKey, ontologyId, ... }                       │
│    )                                                            │
│                                                                  │
│ 4. Store result in execution cache:                             │
│    executionCache.get(idempotencyKey).deferredResult.resolve() │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ EXTRACTION WORKFLOW (streamingExtraction)                        │
│                                                                  │
│ Phases:                                                          │
│ 1. Chunking: Split text using NlpService.streamChunks()        │
│    Each chunk carries idempotencyKey for provenance            │
│                                                                  │
│ 2. Entity Extraction:                                           │
│    - Use EntityExtractor for each chunk                         │
│    - Cache hits on entity extraction queries use same key      │
│                                                                  │
│ 3. Entity Resolution:                                           │
│    - Merge entity candidates using EntityResolutionService     │
│    - Cache resolution results keyed by idempotencyKey          │
│                                                                  │
│ 4. Relation Extraction:                                         │
│    - Use RelationExtractor for merged entities                 │
│    - Cache relation results by idempotencyKey                  │
│                                                                  │
│ 5. Final KnowledgeGraph:                                        │
│    Store in database keyed by idempotencyKey                    │
│    {                                                             │
│      idempotencyKey,                                            │
│      ontologyId,                                                │
│      ontologyVersion,                                           │
│      text_hash: hash(text),                                     │
│      entities,                                                   │
│      relations,                                                  │
│      timestamp                                                   │
│    }                                                             │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ RESULT CACHE (Long-lived)                                        │
│                                                                  │
│ Key: idempotencyKey                                             │
│ Value: {                                                         │
│   entities: [...],                                              │
│   relations: [...],                                             │
│   metadata: { computedAt, version }                             │
│ }                                                                │
│                                                                  │
│ TTL: 7 days (configurable, or indefinite with invalidation)   │
└──────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ RPC RESPONSE                                                     │
│                                                                  │
│ {                                                                │
│   idempotencyKey: "sha256-a1b2c3d4e5f6g7h8",                   │
│   entities: [...],                                              │
│   relations: [...],                                             │
│   cacheHit: true|false,                                         │
│   computedAt: "2025-12-09T10:00:00Z"                           │
│ }                                                                │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Key Propagation Details

| Layer | Component | Key Usage | Responsibility |
|-------|-----------|-----------|-----------------|
| **Client/API** | HTTP Request | Send `text`, `ontologyId`, `extractionParams` | Caller provides extraction inputs |
| **RPC Handler** | Request Handler | Compute `idempotencyKey`, query RPC cache | Return cached result if available |
| **Orchestrator** | WorkflowManager | Track execution by `idempotencyKey`, deduplicate concurrent requests | Prevent duplicate workflow executions |
| **Workflow** | streamingExtraction | Receive `idempotencyKey`, pass to sub-services | Carry key through 6-phase pipeline |
| **Entity Extractor** | Cache Layer | Cache entity results by `idempotencyKey` | Reuse entity extraction across runs |
| **Relation Extractor** | Cache Layer | Cache relation results by `idempotencyKey` | Reuse relation extraction |
| **Entity Resolution** | Cluster Cache | Cluster entities by `idempotencyKey`, NOT by `requestId` | Ensure duplicates resolve to same cluster |
| **Result Cache** | Long-lived Store | Store final KnowledgeGraph by `idempotencyKey` | Enable multi-day cache hits |

---

## Part 3: Cache Invalidation Strategy

### 3.1 Invalidation Triggers

| Trigger | Action | Scope |
|---------|--------|-------|
| **Ontology updated** | Compute new `ontologyVersion` | All cached results for that `ontologyId` |
| **Ontology deleted** | Delete all entries where `ontologyId` = X | All extraction results using ontology X |
| **TTL expiration** | Auto-delete aged entries | Individual cache entry (configurable) |
| **Manual cache clear** | Delete all entries | Entire cache (force re-extraction for all) |
| **Parameter change** | `extractionParams` changes → new `idempotencyKey` | Only new parameter combinations |

### 3.2 Ontology Change Detection

```typescript
/**
 * Implement as a database trigger + notification system
 */

// In OntologyService:
export interface OntologyService {
  // Load ontology with version
  loadOntology(id: string): Promise<{
    context: OntologyContext
    version: string
  }>

  // Update ontology → triggers cache invalidation
  updateOntology(id: string, newContext: OntologyContext): Promise<void> {
    // 1. Compute new version hash
    const newVersion = computeOntologyVersion(newContext)

    // 2. Update database
    await db.update('ontologies', {
      id,
      content: newContext,
      version: newVersion,
      updatedAt: now()
    })

    // 3. Invalidate all cache entries for this ontology
    await cache.invalidateByOntologyId(id)

    // 4. Publish event for subscribers
    await eventBus.publish({
      type: 'ontology-updated',
      ontologyId: id,
      oldVersion: oldVersion,
      newVersion: newVersion,
      timestamp: now()
    })
  }
}

// Cache invalidation handler:
eventBus.subscribe('ontology-updated', (event) => {
  // Delete all cache entries for this ontology
  cache.deletePattern(`*:${event.ontologyId}:*`)

  // Optional: Log audit trail
  logger.info('Invalidated cache for ontology', {
    ontologyId: event.ontologyId,
    reason: 'ontology-updated',
    oldVersion: event.oldVersion,
    newVersion: event.newVersion
  })
})
```

### 3.3 Concurrent Request Deduplication

**Scenario**: Two concurrent requests with identical `idempotencyKey`

**Solution**: Execution deduplication cache

```typescript
/**
 * In Orchestrator/WorkflowManager
 */

interface ExecutionHandle {
  status: 'running' | 'completed' | 'failed'
  deferredResult: Deferred<KnowledgeGraph>
  startedAt: number
}

const executionCache = new Map<string, ExecutionHandle>()

export const orchestrateExtraction = async (
  text: string,
  ontologyId: string,
  extractionParams: ExtractionParams
): Promise<KnowledgeGraph> => {
  // Step 1: Compute idempotency key
  const ontologyVersion = await ontologyService.getVersion(ontologyId)
  const idempotencyKey = computeIdempotencyKey({
    text,
    ontologyId,
    ontologyVersion,
    extractionParams
  })

  // Step 2: Check execution cache (in-flight deduplication)
  let execution = executionCache.get(idempotencyKey)
  if (execution) {
    if (execution.status === 'running') {
      // Another request already running → wait for it
      console.log(`Deduplicating concurrent request: ${idempotencyKey}`)
      return execution.deferredResult.promise
    } else if (execution.status === 'completed') {
      // Execution completed → return cached result
      return execution.deferredResult.promise
    }
  }

  // Step 3: Not in execution cache → create new execution handle
  const deferredResult = new Deferred<KnowledgeGraph>()
  executionCache.set(idempotencyKey, {
    status: 'running',
    deferredResult,
    startedAt: Date.now()
  })

  try {
    // Step 4: Run extraction
    const result = await streamingExtraction(text, {
      idempotencyKey,
      ontologyId,
      extractionParams,
      // ...
    })

    // Step 5: Update execution cache
    const handle = executionCache.get(idempotencyKey)!
    handle.status = 'completed'
    deferredResult.resolve(result)

    // Step 6: Store in long-lived result cache
    await resultCache.set(idempotencyKey, result, {
      ttl: 7 * 24 * 60 * 60 // 7 days
    })

    return result
  } catch (error) {
    // Failed execution
    const handle = executionCache.get(idempotencyKey)!
    handle.status = 'failed'
    deferredResult.reject(error)

    // Remove from execution cache after failure
    // (allow retry)
    executionCache.delete(idempotencyKey)

    throw error
  }
}
```

---

## Part 4: Implementation Guide

### 4.1 Type Definitions (TypeScript)

```typescript
// idempotency.ts

import { createHash } from 'crypto'

/**
 * Extraction parameters that affect result
 */
export interface ExtractionParams {
  llmModel: string
  temperature: number
  maxTokens: number
  concurrency: number
  chunkSize?: number
  [key: string]: any
}

/**
 * Idempotency key request
 */
export interface IdempotencyKeyRequest {
  text: string
  ontologyId: string
  ontologyVersion: string
  extractionParams: ExtractionParams
}

/**
 * Idempotency key response
 */
export interface IdempotencyKeyResponse {
  key: string // sha256-{16hexchars}
  components: {
    text: string
    textHash: string
    ontologyId: string
    ontologyVersion: string
    extractionParamsHash: string
  }
}

/**
 * Normalize text for idempotency
 */
export const normalizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+\n/g, '\n')
}

/**
 * Hash extraction parameters
 */
export const hashExtractionParams = (params: ExtractionParams): string => {
  const canonical = JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {} as ExtractionParams)
  )
  return createHash('sha256')
    .update(canonical)
    .digest('hex')
    .substring(0, 16)
}

/**
 * Compute idempotency key
 */
export const computeIdempotencyKey = (
  req: IdempotencyKeyRequest
): IdempotencyKeyResponse => {
  const normalizedText = normalizeText(req.text)
  const textHash = createHash('sha256')
    .update(normalizedText)
    .digest('hex')
    .substring(0, 16)

  const paramsHash = hashExtractionParams(req.extractionParams)

  const input = {
    text: normalizedText,
    ontologyId: req.ontologyId,
    ontologyVersion: req.ontologyVersion,
    extractionParamsHash: paramsHash
  }

  const canonical = JSON.stringify(input, (_, v) => {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce((sorted, k) => {
          sorted[k] = v[k]
          return sorted
        }, {} as Record<string, any>)
    }
    return v
  })

  const key = createHash('sha256')
    .update(canonical)
    .digest('hex')
    .substring(0, 16)

  return {
    key: `sha256-${key}`,
    components: {
      text: normalizedText,
      textHash,
      ontologyId: req.ontologyId,
      ontologyVersion: req.ontologyVersion,
      extractionParamsHash: paramsHash
    }
  }
}

/**
 * Compute ontology version from content
 */
export const computeOntologyVersion = (ontology: OntologyContext): string => {
  const canonical = JSON.stringify({
    classes: ontology.classes
      .map(c => ({
        id: c.id,
        properties: c.properties.sort()
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    properties: ontology.properties
      .map(p => ({
        id: p.id,
        domain: p.domain.sort(),
        range: p.range.sort()
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  })

  return `sha256:${createHash('sha256')
    .update(canonical)
    .digest('hex')
    .substring(0, 16)}`
}
```

### 4.2 RPC Handler Implementation

```typescript
// rpc-handler.ts

import { HttpRouter, HttpServerResponse } from '@effect/platform'
import { Effect } from 'effect'
import { computeIdempotencyKey } from './idempotency.js'

/**
 * RPC Handler for extraction requests
 *
 * Flow:
 * 1. Receive request with text, ontologyId, extractionParams
 * 2. Fetch ontology to get current version
 * 3. Compute idempotency key
 * 4. Check cache → return if hit
 * 5. Otherwise, orchestrate extraction
 */
export const createExtractionHandler = () =>
  HttpRouter.post('/api/v1/extract',
    Effect.gen(function*() {
      // 1. Parse request
      const request = yield* HttpRouter.request // or body parsing
      const { text, ontologyId, extractionParams } = request.body

      // 2. Fetch ontology and get version
      const ontologyService = yield* OntologyService
      const { version: ontologyVersion } = yield* ontologyService.loadOntology(ontologyId)

      // 3. Compute idempotency key
      const idempotencyKeyResp = computeIdempotencyKey({
        text,
        ontologyId,
        ontologyVersion,
        extractionParams
      })
      const idempotencyKey = idempotencyKeyResp.key

      // 4. Query result cache
      const cache = yield* ResultCache
      const cached = yield* Effect.option(
        cache.get(idempotencyKey)
      )

      if (cached._tag === 'Some') {
        yield* Effect.logInfo('Cache hit', { idempotencyKey })
        return yield* HttpServerResponse.json({
          idempotencyKey,
          entities: cached.value.entities,
          relations: cached.value.relations,
          cacheHit: true,
          computedAt: cached.value.metadata.computedAt
        })
      }

      // 5. Not cached → orchestrate extraction
      yield* Effect.logInfo('Cache miss, orchestrating extraction', { idempotencyKey })

      const orchestrator = yield* ExtractionOrchestrator
      const result = yield* orchestrator.extract({
        text,
        ontologyId,
        ontologyVersion,
        extractionParams,
        idempotencyKey
      })

      return yield* HttpServerResponse.json({
        idempotencyKey,
        entities: result.entities,
        relations: result.relations,
        cacheHit: false,
        computedAt: new Date().toISOString()
      })
    })
  )
```

### 4.3 Orchestrator Implementation

```typescript
// orchestrator.ts

export interface ExtractionOrchestrator {
  extract(params: {
    text: string
    ontologyId: string
    ontologyVersion: string
    extractionParams: ExtractionParams
    idempotencyKey: string
  }): Effect<KnowledgeGraph>
}

export const makeExtractionOrchestrator = Effect.gen(function*() {
  const executionCache = yield* Ref.make<Map<string, ExecutionHandle>>(new Map())
  const resultCache = yield* ResultCache
  const logger = yield* Logger

  return {
    extract: (params) => Effect.gen(function*() {
      const { idempotencyKey, text, ontologyId, ontologyVersion, extractionParams } = params

      // Step 1: Check execution cache
      const execMap = yield* Ref.get(executionCache)
      let handle = execMap.get(idempotencyKey)

      if (handle && handle.status === 'running') {
        yield* logger.info('Deduplicating concurrent request', { idempotencyKey })
        return yield* handle.deferred.await
      }

      // Step 2: Create execution handle
      const deferred = yield* Deferred.make<KnowledgeGraph>()
      const newHandle: ExecutionHandle = {
        status: 'running',
        deferred,
        startedAt: Date.now()
      }

      yield* Ref.update(executionCache, m => {
        m.set(idempotencyKey, newHandle)
        return m
      })

      try {
        // Step 3: Run extraction
        const result = yield* streamingExtraction(text, {
          idempotencyKey,
          ontologyId,
          ontologyVersion,
          extractionParams
        })

        // Step 4: Store in result cache
        yield* resultCache.set(idempotencyKey, result, {
          ttl: 7 * 24 * 60 * 60 // 7 days
        })

        // Step 5: Update execution handle
        yield* Ref.update(executionCache, m => {
          const h = m.get(idempotencyKey)
          if (h) {
            h.status = 'completed'
            Deferred.succeed(h.deferred, result)
          }
          return m
        })

        return result
      } catch (error) {
        // On failure: update handle but keep in cache for retry window
        yield* Ref.update(executionCache, m => {
          const h = m.get(idempotencyKey)
          if (h) {
            h.status = 'failed'
            Deferred.failCause(h.deferred, Cause.fail(error))
          }
          return m
        })

        // Remove after 5 minutes to allow retry
        yield* Effect.delay('5 minutes')(
          Ref.update(executionCache, m => {
            m.delete(idempotencyKey)
            return m
          })
        )

        throw error
      }
    })
  }
})
```

### 4.4 Workflow Integration

```typescript
// streaming-extraction.ts - Updated signature

export const streamingExtraction = (
  text: string,
  config: RunConfig & {
    idempotencyKey: string
    ontologyId: string
    ontologyVersion: string
  }
): Effect<KnowledgeGraph> =>
  Effect.gen(function*() {
    // Carry idempotencyKey through entire pipeline
    const { idempotencyKey } = config

    yield* Effect.logInfo('Starting streaming extraction', {
      idempotencyKey,
      textLength: text.length,
      ontologyId: config.ontologyId
    })

    // Phase 1: Chunking
    const chunks = yield* nlpService.streamChunks(text, config.chunking)

    // Phase 2-4: Entity extraction, property scoping
    const entityResults = yield* Stream.fromIterable(chunks)
      .pipe(
        Stream.mapEffect(chunk =>
          // Pass idempotencyKey to entity extractor
          entityExtractor.extract(chunk, candidates, {
            idempotencyKey,
            cacheKey: `${idempotencyKey}:entities`
          })
        ),
        Stream.runCollect
      )

    // Phase 5: Relation extraction
    const relationResults = yield* Stream.fromIterable(entityResults)
      .pipe(
        Stream.mapEffect(entities =>
          relationExtractor.extract(text, entities, properties, {
            idempotencyKey,
            cacheKey: `${idempotencyKey}:relations`
          })
        ),
        Stream.runCollect
      )

    // Phase 6: Merge and finalize
    const knowledgeGraph = mergeGraphs(entityResults, relationResults)

    // Store metadata with idempotency key for audit trail
    yield* Effect.logInfo('Extraction complete', {
      idempotencyKey,
      entityCount: knowledgeGraph.entities.length,
      relationCount: knowledgeGraph.relations.length
    })

    return knowledgeGraph
  })
```

---

## Part 5: Database Schema

### 5.1 Cache Storage

```sql
-- Long-lived result cache
CREATE TABLE extraction_results (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  ontology_id VARCHAR(2048) NOT NULL,
  ontology_version VARCHAR(255) NOT NULL,
  text_hash VARCHAR(16) NOT NULL,
  extraction_params_hash VARCHAR(16) NOT NULL,
  entities JSONB NOT NULL,
  relations JSONB NOT NULL,
  metadata JSONB NOT NULL, -- { computedAt, model, temperature, ... }
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL, -- TTL for auto-cleanup
  accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- For LRU eviction
  INDEX idx_ontology (ontology_id),
  INDEX idx_expires (expires_at),
  UNIQUE(ontology_id, ontology_version, text_hash, extraction_params_hash)
)

-- Execution cache (in-memory, but can be backed by Redis)
-- Not persisted to DB, but can add for distributed systems:
CREATE TABLE execution_handles (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  status ENUM('running', 'completed', 'failed') NOT NULL,
  result JSONB, -- Populated when status = 'completed'
  error JSONB, -- Populated when status = 'failed'
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_started (started_at)
)

-- Audit trail
CREATE TABLE extraction_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  idempotency_key VARCHAR(255) NOT NULL,
  ontology_id VARCHAR(2048) NOT NULL,
  event_type ENUM(
    'extraction_started',
    'extraction_completed',
    'extraction_failed',
    'cache_hit',
    'cache_miss',
    'concurrent_deduplicated'
  ) NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_idempotency_key (idempotency_key),
  INDEX idx_ontology (ontology_id),
  INDEX idx_created (created_at)
)

-- Ontology versioning
CREATE TABLE ontologies (
  id VARCHAR(2048) PRIMARY KEY,
  version VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB, -- { label, description, ... }
  content_hash VARCHAR(16) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_version (version),
  UNIQUE(id, version)
)
```

### 5.2 Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| extraction_results | `idx_ontology` | Find all results for an ontology (for invalidation) |
| extraction_results | `idx_expires` | Auto-cleanup of expired entries |
| extraction_results | UNIQUE(ontology_id, ontology_version, text_hash, params_hash) | Detect cache hits before hashing |
| execution_handles | `idx_status` | Monitor in-flight executions |
| extraction_audit_log | `idx_idempotency_key` | Trace single extraction through system |
| extraction_audit_log | `idx_ontology` | Track cache invalidations per ontology |

---

## Part 6: Invalidation Examples

### 6.1 Scenario: Ontology Updated

**Before Update**:
```
Cache entries:
  sha256-a1b2c3d4e5f6g7h8 → {ontologyId: "sport-ont", version: "v1.0", ...}
  sha256-b2c3d4e5f6g7h8i9 → {ontologyId: "sport-ont", version: "v1.0", ...}
  sha256-c3d4e5f6g7h8i9j0 → {ontologyId: "other-ont", version: "v2.1", ...}
```

**Ontology Update**:
```typescript
ontologyService.updateOntology("sport-ont", newContext)
// Triggers:
// 1. Compute newVersion = "sha256:newHash"
// 2. Publish 'ontology-updated' event
// 3. Cache invalidation handler runs
```

**After Invalidation**:
```
Cache entries:
  // Entries for "sport-ont" DELETED
  sha256-c3d4e5f6g7h8i9j0 → {ontologyId: "other-ont", version: "v2.1", ...}
```

**Next Request with sport-ont**:
- Client submits text with sport-ont
- New ontologyVersion = "sha256:newHash"
- New idempotencyKey computed (different from old)
- Cache miss → fresh extraction

### 6.2 Scenario: Parameter Change

**Request 1**:
```
text: "Cristiano plays for Al-Nassr"
extractionParams: { model: "claude-3-5-sonnet", temperature: 0.0 }
idempotencyKey: sha256-a1b2c3d4e5f6g7h8
Result: {entities: [...], relations: [...]} → Cached
```

**Request 2** (same text, different temperature):
```
text: "Cristiano plays for Al-Nassr"
extractionParams: { model: "claude-3-5-sonnet", temperature: 0.5 }
// Temperature difference → different extractionParamsHash
// → different idempotencyKey = sha256-x9y0z1a2b3c4d5e6
// → Cache miss → fresh extraction with new temperature
```

**Both results coexist** in cache (different keys):
```
Cache:
  sha256-a1b2c3d4e5f6g7h8 → {...entities_from_temp_0.0...}
  sha256-x9y0z1a2b3c4d5e6 → {...entities_from_temp_0.5...}
```

---

## Part 7: Migration Path

### Phase 1: Design & Validation (Week 1)
- [ ] Finalize idempotency key formula
- [ ] Review with team
- [ ] Create test suite for hash determinism

### Phase 2: Implementation (Week 2-3)
- [ ] Implement `computeIdempotencyKey()` function
- [ ] Add ontology versioning to OntologyService
- [ ] Update RPC handler to compute and propagate keys
- [ ] Implement execution deduplication cache
- [ ] Update result cache to use idempotencyKey

### Phase 3: Workflow Integration (Week 4)
- [ ] Update streamingExtraction to receive idempotencyKey
- [ ] Thread key through entity/relation extractors
- [ ] Add cache hits to entity/relation extraction
- [ ] Update entity resolution to use idempotencyKey

### Phase 4: Testing (Week 5)
- [ ] Unit tests for key computation
- [ ] Integration tests for cache hits
- [ ] Test ontology invalidation scenarios
- [ ] Test concurrent request deduplication
- [ ] Load tests for cache performance

### Phase 5: Rollout (Week 6+)
- [ ] Feature flag for idempotency key usage
- [ ] Parallel run (old + new) for validation
- [ ] Gradual rollout to production
- [ ] Monitor cache hit rates

---

## Part 8: Monitoring & Observability

### 8.1 Metrics to Track

```typescript
interface IdempotencyMetrics {
  // Cache hit rates
  cacheHitRate: number // % of requests hitting result cache
  executionCacheHitRate: number // % of requests deduplicating

  // Performance
  cacheLookupLatency: Histogram // ms to check cache
  cacheStoreLatency: Histogram // ms to store result
  deduplicationWaitTime: Histogram // ms spent waiting for concurrent request

  // Cache health
  totalCachedResults: Gauge // number of entries in cache
  cacheEvictions: Counter // entries evicted due to TTL
  invalidations: Counter // entries invalidated due to ontology change

  // Errors
  idempotencyKeyComputationErrors: Counter
  cacheLookupErrors: Counter
}
```

### 8.2 Observability Checklist

```typescript
// Log on every extraction request
yield* Effect.logInfo('Extraction requested', {
  idempotencyKey,
  ontologyId,
  textLength,
  extractionParams,
  timestamp: new Date().toISOString()
})

// Log cache hits
yield* Effect.logInfo('Cache hit', {
  idempotencyKey,
  hitSource: 'result-cache' | 'execution-cache',
  cacheAge: Date.now() - cachedResult.metadata.computedAt
})

// Log invalidations
yield* Effect.logWarning('Ontology cache invalidation', {
  ontologyId,
  oldVersion,
  newVersion,
  entriesInvalidated: count
})

// Log deduplication
yield* Effect.logInfo('Concurrent request deduplicated', {
  idempotencyKey,
  waitTime: Date.now() - otherRequest.startedAt
})
```

---

## Part 9: FAQ & Gotchas

### Q: What if ontology has no explicit version?
**A**: Use `computeOntologyVersion()` to auto-generate content hash. This is deterministic and automatically detects changes.

### Q: What about text normalization? What if client sends with trailing whitespace?
**A**: We normalize text (trim, LF line endings) before hashing. Two semantically identical texts with different whitespace get the same key. This is intentional.

### Q: What if extraction params aren't serializable (e.g., functions)?
**A**: Only include JSON-serializable params in idempotency key. Non-serializable params should not affect extraction output anyway. If they do, they shouldn't be hidden from the cache key.

### Q: Can I cache partial results?
**A**: Yes, but entity and relation extraction can use sub-keys like `${idempotencyKey}:entities` and `${idempotencyKey}:relations`. These benefit from the parent idempotency key.

### Q: How long should cache TTL be?
**A**: Depends on use case:
- **7 days**: Standard for development/testing
- **30 days**: For large corpora (disk-intensive)
- **Indefinite** (with invalidation): For stable ontologies (require explicit invalidation on update)

### Q: What about distributed systems? Multiple servers?
**A**:
- **Execution cache**: Use Redis for distributed deduplication
- **Result cache**: Use Redis or database-backed cache
- **Event bus**: Kafka/RabbitMQ for ontology invalidation events across servers

### Q: How do I debug if idempotency key is wrong?
**A**: Include `idempotencyKey` in every log and response. Add debug endpoint:
```typescript
GET /api/v1/debug/idempotency-key?text=...&ontologyId=...
→ Returns: {key, components: {textHash, paramsHash, ...}}
```

---

## Part 10: Summary & Next Steps

### Unified Identity Formula
```
IDEMPOTENCY_KEY = hash(
  text_content (normalized),
  ontology_id,
  ontology_version (content-based),
  extraction_params (serialized)
)
```

### Key Flows Through
1. **Client/RPC**: Compute key, check cache
2. **Orchestrator**: Deduplicate concurrent requests by key
3. **Workflow**: Thread key through 6-phase pipeline
4. **Sub-services**: Cache entity/relation results by key
5. **Long-lived Cache**: Store final result indefinitely (with TTL)

### Invalidation Strategy
- **Ontology change**: Compute new version, delete all entries for that ontology
- **Parameter change**: New key, separate cache entry
- **TTL expiration**: Auto-cleanup old entries
- **Manual clear**: Delete all entries

### Next Steps
1. Review this proposal with team
2. Create reference implementation
3. Add comprehensive tests
4. Document for API consumers
5. Gradual production rollout with feature flag

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Authors**: Architecture Review Team
