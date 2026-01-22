/**
 * @beep/knowledge-server
 * Ontology-guided knowledge extraction, entity resolution, and GraphRAG context assembly for intelligent agents - Server-side infrastructure
 *
 * This module contains:
 * - Database client (KnowledgeDb)
 * - Repositories
 * - Ontology parsing and management
 * - NLP text processing
 * - AI-powered extraction pipeline
 * - Knowledge graph assembly
 * - Embedding generation and similarity search
 * - Relation grounding and verification
 * - Entity resolution and deduplication
 *
 * @module knowledge-server
 * @since 0.1.0
 */

/**
 * AI service exports
 * @since 0.1.0
 */
export * as Ai from "./Ai";
export * from "./db";

/**
 * Embedding service exports
 * @since 0.1.0
 */
export * as Embedding from "./Embedding";

/**
 * Entity resolution exports
 * @since 0.1.0
 */
export * as EntityResolution from "./EntityResolution";

/**
 * Extraction pipeline exports
 * @since 0.1.0
 */
export * as Extraction from "./Extraction";

/**
 * GraphRAG service exports
 * @since 0.1.0
 */
export * as GraphRAG from "./GraphRAG";

/**
 * Grounding service exports
 * @since 0.1.0
 */
export * as Grounding from "./Grounding";

/**
 * NLP text processing exports
 * @since 0.1.0
 */
export * as Nlp from "./Nlp";

/**
 * Ontology service exports
 * @since 0.1.0
 */
export * as Ontology from "./Ontology";
