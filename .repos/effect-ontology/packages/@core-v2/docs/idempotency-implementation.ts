/**
 * UNIFIED IDEMPOTENCY KEY IMPLEMENTATION
 *
 * Reference implementation for the idempotency scheme.
 * This file provides production-ready code for:
 * - Computing idempotency keys
 * - Deduplicating concurrent requests
 * - Invalidating cache on ontology changes
 * - Storing and retrieving cached results
 *
 * NOT intended to be imported directly - use for reference/copy-paste.
 */

import { createHash } from 'crypto'
import { Context, Deferred, Effect, Logger, Ref } from 'effect'
import type { OntologyContext } from '../Domain/Model/Ontology.js'
import type { KnowledgeGraph } from '../Domain/Model/Entity.js'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Extraction parameters that should be included in idempotency key
 */
export interface ExtractionParams {
  readonly llmModel: string
  readonly temperature: number
  readonly maxTokens: number
  readonly concurrency: number
  readonly chunkSize?: number
  readonly [key: string]: any
}

/**
 * Request for computing idempotency key
 */
export interface IdempotencyKeyRequest {
  readonly text: string
  readonly ontologyId: string
  readonly ontologyVersion: string
  readonly extractionParams: ExtractionParams
}

/**
 * Response with computed key and debug info
 */
export interface IdempotencyKeyResponse {
  readonly key: string
  readonly components: {
    readonly text: string
    readonly textHash: string
    readonly ontologyId: string
    readonly ontologyVersion: string
    readonly extractionParamsHash: string
  }
}

/**
 * Cached extraction result
 */
export interface CachedExtractionResult {
  readonly entities: ReadonlyArray<any>
  readonly relations: ReadonlyArray<any>
  readonly metadata: {
    readonly computedAt: string
    readonly model: string
    readonly temperature: number
    readonly computedIn: number // milliseconds
  }
}

/**
 * In-flight execution handle (for deduplication)
 */
export interface ExecutionHandle {
  readonly status: 'running' | 'completed' | 'failed'
  readonly deferred: Deferred.Deferred<KnowledgeGraph, Error>
  readonly startedAt: number
}

/**
 * Cache service interface
 */
export interface ExtractionCache {
  readonly get: (
    key: string
  ) => Effect.Effect<CachedExtractionResult | null, Error>

  readonly set: (
    key: string,
    value: CachedExtractionResult,
    ttlSeconds?: number
  ) => Effect.Effect<void, Error>

  readonly delete: (key: string) => Effect.Effect<void, Error>

  readonly deletePattern: (pattern: string) => Effect.Effect<void, Error>

  readonly getStats: () => Effect.Effect<
    {
      readonly size: number
      readonly hits: number
      readonly misses: number
    },
    Error
  >
}

// =============================================================================
// CORE IMPLEMENTATION
// =============================================================================

/**
 * Normalize text for consistent hashing
 *
 * - Trim leading/trailing whitespace
 * - Normalize line endings (CRLF → LF)
 * - Trim trailing whitespace on lines
 */
export const normalizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\r\n/g, '\n') // CRLF → LF
    .replace(/\s+\n/g, '\n') // Trim trailing whitespace on lines
}

/**
 * Hash extraction parameters for use in idempotency key
 *
 * Only includes JSON-serializable params.
 * Produces consistent hash regardless of key ordering.
 */
export const hashExtractionParams = (
  params: ExtractionParams
): string => {
  // Sort keys for consistency
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as ExtractionParams)

  const canonical = JSON.stringify(sortedParams)
  return createHash('sha256').update(canonical).digest('hex').substring(0, 16)
}

/**
 * Compute ontology version from content
 *
 * Creates a deterministic hash of ontology structure.
 * Changes to classes or properties produce different version.
 *
 * @param ontology - OntologyContext to version
 * @returns Semantic version string or content hash
 */
export const computeOntologyVersion = (
  ontology: OntologyContext
): string => {
  const canonical = JSON.stringify({
    classes: ontology.classes
      .map((c) => ({
        id: c.id,
        label: c.label,
        properties: c.properties.sort()
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    properties: ontology.properties
      .map((p) => ({
        id: p.id,
        domain: p.domain.sort(),
        range: p.range.sort(),
        rangeType: p.rangeType
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  })

  const hash = createHash('sha256')
    .update(canonical)
    .digest('hex')
    .substring(0, 16)

  return `sha256:${hash}`
}

/**
 * Compute idempotency key for an extraction request
 *
 * Formula:
 *   hash(
 *     normalized_text,
 *     ontology_id,
 *     ontology_version,
 *     extraction_params_hash
 *   )
 *
 * @param req - Request with text, ontologyId, version, params
 * @returns IdempotencyKey response with key and debug components
 */
export const computeIdempotencyKey = (
  req: IdempotencyKeyRequest
): IdempotencyKeyResponse => {
  // Normalize text
  const normalizedText = normalizeText(req.text)

  // Hash text for debug output
  const textHash = createHash('sha256')
    .update(normalizedText)
    .digest('hex')
    .substring(0, 16)

  // Hash extraction params
  const paramsHash = hashExtractionParams(req.extractionParams)

  // Build canonical input for key
  const input = {
    text: normalizedText,
    ontologyId: req.ontologyId,
    ontologyVersion: req.ontologyVersion,
    extractionParamsHash: paramsHash
  }

  // Serialize with sorted keys for determinism
  const canonical = JSON.stringify(
    input,
    (_, v) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        return Object.keys(v)
          .sort()
          .reduce((sorted, k) => {
            sorted[k] = v[k]
            return sorted
          }, {} as Record<string, any>)
      }
      return v
    }
  )

  // Compute final key
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

// =============================================================================
// EXECUTION DEDUPLICATION (In-Flight)
// =============================================================================

/**
 * Service for deduplicating concurrent extraction requests
 */
export interface ExecutionDeduplicator {
  /**
   * Get or create execution handle for idempotency key
   *
   * If key already running, returns existing deferred.
   * Otherwise creates new execution.
   */
  readonly getOrCreate: (
    key: string
  ) => Effect.Effect<
    { handle: ExecutionHandle; isNew: boolean },
    never
  >

  /**
   * Mark execution as completed
   */
  readonly complete: (
    key: string,
    result: KnowledgeGraph
  ) => Effect.Effect<void, never>

  /**
   * Mark execution as failed
   */
  readonly fail: (key: string, error: Error) => Effect.Effect<void, never>

  /**
   * Clean up after timeout (allow retry)
   */
  readonly cleanup: (key: string) => Effect.Effect<void, never>
}

/**
 * Create execution deduplicator service
 */
export const makeExecutionDeduplicator = Effect.gen(function*() {
  const logger = yield* Logger.Logger
  const map = yield* Ref.make<Map<string, ExecutionHandle>>(new Map())

  return {
    getOrCreate: (key: string) =>
      Effect.gen(function*() {
        const current = yield* Ref.get(map)
        const existing = current.get(key)

        if (existing) {
          yield* logger.info('Reusing in-flight execution', { key })
          return { handle: existing, isNew: false }
        }

        const deferred = yield* Deferred.make<KnowledgeGraph, Error>()
        const handle: ExecutionHandle = {
          status: 'running',
          deferred,
          startedAt: Date.now()
        }

        yield* Ref.update(map, (m) => {
          m.set(key, handle)
          return m
        })

        yield* logger.info('Created new execution', { key })
        return { handle, isNew: true }
      }),

    complete: (key: string, result: KnowledgeGraph) =>
      Effect.gen(function*() {
        const current = yield* Ref.get(map)
        const handle = current.get(key)

        if (handle) {
          handle.status = 'completed'
          yield* Deferred.succeed(handle.deferred, result)
          yield* logger.info('Execution completed', { key })
        }
      }),

    fail: (key: string, error: Error) =>
      Effect.gen(function*() {
        const current = yield* Ref.get(map)
        const handle = current.get(key)

        if (handle) {
          handle.status = 'failed'
          yield* Deferred.fail(handle.deferred, error)
          yield* logger.info('Execution failed', { key, error: error.message })
        }
      }),

    cleanup: (key: string) =>
      Effect.gen(function*() {
        yield* Ref.update(map, (m) => {
          m.delete(key)
          return m
        })
        yield* logger.debug('Cleaned up execution', { key })
      })
  } as ExecutionDeduplicator
})

// =============================================================================
// CACHE INVALIDATION
// =============================================================================

/**
 * Invalidation strategy for ontology changes
 */
export interface OntologyInvalidationStrategy {
  /**
   * Invalidate all entries for a specific ontology
   */
  readonly invalidateOntology: (ontologyId: string) => Effect.Effect<void, Error>

  /**
   * Invalidate all cache entries (full clear)
   */
  readonly invalidateAll: () => Effect.Effect<void, Error>

  /**
   * Get invalidation stats
   */
  readonly getStats: () => Effect.Effect<
    {
      readonly entriesInvalidated: number
      readonly lastInvalidation: Date | null
    },
    Error
  >
}

/**
 * Create invalidation strategy
 */
export const makeOntologyInvalidationStrategy = (
  cache: ExtractionCache
): Effect.Effect<OntologyInvalidationStrategy, never> =>
  Effect.gen(function*() {
    const logger = yield* Logger.Logger
    const stats = yield* Ref.make({
      entriesInvalidated: 0,
      lastInvalidation: null as Date | null
    })

    return {
      invalidateOntology: (ontologyId: string) =>
        Effect.gen(function*() {
          // Delete pattern: any key containing this ontologyId
          yield* cache.deletePattern(`*:${ontologyId}:*`)

          yield* Ref.update(stats, (s) => ({
            ...s,
            lastInvalidation: new Date(),
            entriesInvalidated: s.entriesInvalidated + 1
          }))

          yield* logger.warning('Ontology cache invalidated', {
            ontologyId,
            timestamp: new Date().toISOString()
          })
        }),

      invalidateAll: () =>
        Effect.gen(function*() {
          yield* cache.deletePattern('*')

          yield* Ref.update(stats, (s) => ({
            ...s,
            lastInvalidation: new Date()
          }))

          yield* logger.warning('Full cache invalidation', {
            timestamp: new Date().toISOString()
          })
        }),

      getStats: () => Ref.get(stats)
    } as OntologyInvalidationStrategy
  })

// =============================================================================
// ORCHESTRATION
// =============================================================================

/**
 * Extraction orchestrator with idempotency support
 */
export interface ExtractionOrchestrator {
  /**
   * Orchestrate extraction with automatic deduplication and caching
   */
  readonly extract: (params: {
    readonly text: string
    readonly ontologyId: string
    readonly ontologyVersion: string
    readonly extractionParams: ExtractionParams
  }) => Effect.Effect<
    {
      readonly result: KnowledgeGraph
      readonly idempotencyKey: string
      readonly cacheHit: boolean
      readonly computedAt: Date
    },
    Error
  >
}

/**
 * Create extraction orchestrator
 */
export const makeExtractionOrchestrator = (
  cache: ExtractionCache,
  deduplicator: ExecutionDeduplicator,
  extractionFn: (text: string, ontologyId: string, ontologyVersion: string, extractionParams: ExtractionParams) => Effect.Effect<KnowledgeGraph, Error>
): ExtractionOrchestrator => ({
  extract: (params) =>
    Effect.gen(function*() {
      const logger = yield* Logger.Logger

      // Step 1: Compute idempotency key
      const startTime = Date.now()
      const keyResp = computeIdempotencyKey({
        text: params.text,
        ontologyId: params.ontologyId,
        ontologyVersion: params.ontologyVersion,
        extractionParams: params.extractionParams
      })
      const idempotencyKey = keyResp.key

      yield* logger.info('Computing idempotency key', {
        idempotencyKey,
        ontologyId: params.ontologyId,
        textLength: params.text.length
      })

      // Step 2: Check result cache
      const cached = yield* Effect.option(cache.get(idempotencyKey))

      if (cached._tag === 'Some') {
        yield* logger.info('Cache hit', {
          idempotencyKey,
          cacheAge: Date.now() - new Date(cached.value.metadata.computedAt).getTime()
        })

        return {
          result: {
            entities: cached.value.entities,
            relations: cached.value.relations
          } as KnowledgeGraph,
          idempotencyKey,
          cacheHit: true,
          computedAt: new Date(cached.value.metadata.computedAt)
        }
      }

      yield* logger.info('Cache miss', { idempotencyKey })

      // Step 3: Check execution cache (deduplicate concurrent requests)
      const { handle, isNew } = yield* deduplicator.getOrCreate(idempotencyKey)

      if (!isNew) {
        // Another request already running - wait for it
        yield* logger.info('Deduplicating concurrent request', {
          idempotencyKey,
          waitingTime: Date.now() - handle.startedAt
        })

        const result = yield* Deferred.await(handle.deferred)

        return {
          result,
          idempotencyKey,
          cacheHit: false,
          computedAt: new Date()
        }
      }

      // Step 4: Run extraction
      try {
        const extractionStartTime = Date.now()

        const result = yield* extractionFn(
          params.text,
          params.ontologyId,
          params.ontologyVersion,
          params.extractionParams
        )

        const computedIn = Date.now() - extractionStartTime

        // Step 5: Store in cache
        yield* cache.set(
          idempotencyKey,
          {
            entities: result.entities,
            relations: result.relations,
            metadata: {
              computedAt: new Date().toISOString(),
              model: params.extractionParams.llmModel,
              temperature: params.extractionParams.temperature,
              computedIn
            }
          },
          7 * 24 * 60 * 60 // 7 day TTL
        )

        yield* deduplicator.complete(idempotencyKey, result)

        yield* logger.info('Extraction completed', {
          idempotencyKey,
          entityCount: result.entities.length,
          relationCount: result.relations.length,
          computedIn
        })

        return {
          result,
          idempotencyKey,
          cacheHit: false,
          computedAt: new Date()
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))

        yield* deduplicator.fail(idempotencyKey, err)

        // Allow retry after 5 minutes
        yield* Effect.schedule(
          deduplicator.cleanup(idempotencyKey),
          'fixed-interval 5 minutes'
        ).pipe(Effect.fork)

        yield* logger.error('Extraction failed', {
          idempotencyKey,
          error: err.message
        })

        throw err
      }
    })
})

// =============================================================================
// CONTEXT & SERVICE TAGS
// =============================================================================

/**
 * Context tag for extraction cache
 */
export const ExtractionCache = Context.GenericTag<ExtractionCache>(
  '@effect-ontology/core-v2/ExtractionCache'
)

/**
 * Context tag for execution deduplicator
 */
export const ExecutionDeduplicator = Context.GenericTag<ExecutionDeduplicator>(
  '@effect-ontology/core-v2/ExecutionDeduplicator'
)

/**
 * Context tag for invalidation strategy
 */
export const OntologyInvalidationStrategy = Context.GenericTag<OntologyInvalidationStrategy>(
  '@effect-ontology/core-v2/OntologyInvalidationStrategy'
)

/**
 * Context tag for orchestrator
 */
export const ExtractionOrchestrator = Context.GenericTag<ExtractionOrchestrator>(
  '@effect-ontology/core-v2/ExtractionOrchestrator'
)

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Debug utility: Print idempotency key computation breakdown
 */
export const debugIdempotencyKey = (
  req: IdempotencyKeyRequest
): void => {
  const resp = computeIdempotencyKey(req)

  console.log('=== IDEMPOTENCY KEY BREAKDOWN ===')
  console.log(`Final Key: ${resp.key}`)
  console.log(`Text Hash: ${resp.components.textHash}`)
  console.log(`Ontology ID: ${resp.components.ontologyId}`)
  console.log(`Ontology Version: ${resp.components.ontologyVersion}`)
  console.log(`Params Hash: ${resp.components.extractionParamsHash}`)
  console.log('=== COMPONENTS ===')
  console.log(`Normalized Text: "${resp.components.text.substring(0, 100)}..."`)
  console.log(`Extraction Params:`, req.extractionParams)
  console.log('=================================')
}

/**
 * Test utility: Assert idempotency key is deterministic
 */
export const assertIdempotencyKeyDeterministic = (
  req: IdempotencyKeyRequest,
  iterations: number = 100
): boolean => {
  const keys = Array.from({ length: iterations }, () =>
    computeIdempotencyKey(req).key
  )

  const unique = new Set(keys)
  return unique.size === 1 // All should be identical
}

/**
 * Test utility: Assert text normalization is idempotent
 */
export const assertTextNormalizationIdempotent = (text: string): boolean => {
  const norm1 = normalizeText(text)
  const norm2 = normalizeText(norm1)
  return norm1 === norm2
}
