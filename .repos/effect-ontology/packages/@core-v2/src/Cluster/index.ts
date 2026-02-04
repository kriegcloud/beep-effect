/**
 * Cluster Module
 *
 * Effect Cluster integration for distributed knowledge graph extraction:
 * - Entity-based sharding by idempotency key
 * - Streaming progress events with backpressure
 * - Automatic result caching
 *
 * @since 2.0.0
 * @module Cluster
 */

export * from "./BackpressureHandler.js"
export * from "./ExtractionEntity.js"
export * from "./ExtractionEntityHandler.js"
