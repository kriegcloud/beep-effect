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
 *
 * @module knowledge-server
 * @since 0.1.0
 */
export * from "./db";

/**
 * AI service exports
 * @since 0.1.0
 */
export * as Ai from "./Ai";

/**
 * Extraction pipeline exports
 * @since 0.1.0
 */
export * as Extraction from "./Extraction";

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
