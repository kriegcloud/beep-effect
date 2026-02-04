/**
 * Domain Model: OntologyAgent Types
 *
 * Pure Schema.Class definitions for the OntologyAgent abstraction layer.
 * Provides unified types for extraction, validation, querying, and reasoning.
 *
 * @since 2.0.0
 * @module Domain/Model/OntologyAgent
 */

import { Schema } from "effect"
import { ShaclValidationReport, ValidationPolicy } from "../Schema/Shacl.js"
import type { Entity, Relation } from "./Entity.js"
import { KnowledgeGraph } from "./Entity.js"
import { OntologyRef } from "./Ontology.js"

/**
 * OntologyAgentConfig - Configuration for OntologyAgent operations
 *
 * Combines ontology reference with validation and reasoning settings.
 *
 * @example
 * ```typescript
 * const config = new OntologyAgentConfig({
 *   ontology: new OntologyRef({ namespace: "football", name: "ontology", contentHash: "abc123" }),
 *   validationPolicy: { failOnViolation: true, failOnWarning: false }
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class OntologyAgentConfig extends Schema.Class<OntologyAgentConfig>("OntologyAgentConfig")({
  /**
   * Reference to the ontology to use for extraction/validation
   */
  ontology: Schema.optional(OntologyRef).annotations({
    title: "Ontology Reference",
    description: "Reference to specific ontology version (optional - uses configured default)"
  }),

  /**
   * Validation policy controlling severity-based failure behavior
   */
  validationPolicy: Schema.optional(ValidationPolicy).annotations({
    title: "Validation Policy",
    description: "Policy for SHACL validation severity handling"
  }),

  /**
   * Maximum concurrent LLM calls for extraction
   */
  concurrency: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())).annotations({
    title: "Concurrency",
    description: "Maximum parallel extraction tasks (default: from config)"
  }),

  /**
   * Chunking configuration for large documents
   */
  chunking: Schema.optional(Schema.Struct({
    maxChunkSize: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),
    preserveSentences: Schema.optional(Schema.Boolean)
  })).annotations({
    title: "Chunking Config",
    description: "Settings for document chunking"
  })
}) {
  /**
   * Create default config (uses environment-configured defaults)
   */
  static default(): OntologyAgentConfig {
    return new OntologyAgentConfig({})
  }
}

/**
 * ExtractionMetrics - Metrics from an extraction run
 *
 * @since 2.0.0
 * @category Domain
 */
export class ExtractionMetrics extends Schema.Class<ExtractionMetrics>("ExtractionMetrics")({
  /**
   * Number of entities extracted
   */
  entityCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Number of relations extracted
   */
  relationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Number of text chunks processed
   */
  chunkCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Total input tokens consumed
   */
  inputTokens: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Total output tokens consumed
   */
  outputTokens: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Extraction duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.nonNegative()),

  /**
   * Extraction run ID for provenance
   */
  runId: Schema.optional(Schema.String)
}) {
  /**
   * Total tokens consumed
   */
  get totalTokens(): number {
    return this.inputTokens + this.outputTokens
  }
}

/**
 * ExtractionResult - Complete result of an extraction operation
 *
 * Combines extracted entities/relations with RDF graph and metrics.
 *
 * @example
 * ```typescript
 * const result = await OntologyAgent.extract(text, config)
 * console.log(`Extracted ${result.metrics.entityCount} entities`)
 * const turtle = await RdfBuilder.toTurtle(result.graph)
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ExtractionResult extends Schema.Class<ExtractionResult>("ExtractionResult")({
  /**
   * Extracted knowledge graph (entities + relations)
   */
  graph: KnowledgeGraph,

  /**
   * Extraction metrics
   */
  metrics: ExtractionMetrics,

  /**
   * Serialized RDF graph as Turtle string
   *
   * Contains the extracted entities and relations serialized to RDF Turtle format.
   * Useful for downstream processing, storage, or SPARQL querying.
   */
  turtle: Schema.optional(Schema.String).annotations({
    title: "Turtle",
    description: "Serialized RDF graph in Turtle format"
  }),

  /**
   * Validation report if validation was performed
   */
  validationReport: Schema.optional(ShaclValidationReport)
}) {
  /**
   * Convenience accessor for entities
   */
  get entities(): ReadonlyArray<Entity> {
    return this.graph.entities
  }

  /**
   * Convenience accessor for relations
   */
  get relations(): ReadonlyArray<Relation> {
    return this.graph.relations
  }

  /**
   * Whether extraction produced any entities
   */
  get isEmpty(): boolean {
    return this.graph.entities.length === 0
  }

  /**
   * Whether validation passed (if performed)
   */
  get isValid(): boolean {
    return this.validationReport?.conforms ?? true
  }

  /**
   * Whether RDF turtle serialization is available
   */
  get hasTurtle(): boolean {
    return this.turtle !== undefined && this.turtle.length > 0
  }
}

/**
 * ExtractWithClaimsOptions - Options for extractWithClaims operation
 *
 * @since 2.0.0
 * @category Domain
 */
export interface ExtractWithClaimsOptions {
  /**
   * Ontology registry ID (e.g., "seattle")
   */
  readonly ontologyId: string

  /**
   * Document/article ID for claim provenance
   */
  readonly articleId: string

  /**
   * Whether to automatically create assertions from claims
   * @default false
   */
  readonly autoCreateAssertions?: boolean

  /**
   * Default confidence score when not available from extraction
   * @default 0.8
   */
  readonly defaultConfidence?: number

  /**
   * Target namespace for minting entity IRIs
   *
   * Entities will be minted in this namespace instead of borrowing from
   * class namespaces (e.g., foaf:, org:). This ensures all extracted
   * instances belong to the local ontology namespace.
   *
   * @example "http://effect-ontology.dev/seattle/"
   * @default Uses config.rdf.baseNamespace
   */
  readonly targetNamespace?: string

  /**
   * Agent configuration overrides
   */
  readonly agentConfig?: OntologyAgentConfig
}

/**
 * ExtractWithClaimsResult - Extraction result with claims
 *
 * Extends ExtractionResult with claims created from extracted relations.
 * Each relation becomes a reified claim with provenance metadata.
 *
 * @example
 * ```typescript
 * const result = await OntologyAgent.extractWithClaims(text, {
 *   articleId: "article-001"
 * })
 * console.log(`Created ${result.claims.length} claims`)
 * for (const claim of result.claims) {
 *   console.log(`${claim.subjectIri} ${claim.predicateIri} ${claim.objectValue}`)
 * }
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class ExtractWithClaimsResult extends Schema.Class<ExtractWithClaimsResult>("ExtractWithClaimsResult")({
  /**
   * Extracted knowledge graph (entities + relations)
   */
  graph: KnowledgeGraph,

  /**
   * Extraction metrics
   */
  metrics: ExtractionMetrics,

  /**
   * Serialized RDF graph as Turtle string
   */
  turtle: Schema.optional(Schema.String),

  /**
   * Validation report if validation was performed
   */
  validationReport: Schema.optional(ShaclValidationReport),

  /**
   * Number of claims created from extraction
   */
  claimCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()).annotations({
    title: "Claim Count",
    description: "Number of claims created from extracted relations"
  }),

  /**
   * Article ID used for claim provenance
   */
  articleId: Schema.String.annotations({
    title: "Article ID",
    description: "Source document identifier for provenance"
  })
}) {
  /**
   * Convenience accessor for entities
   */
  get entities(): ReadonlyArray<Entity> {
    return this.graph.entities
  }

  /**
   * Convenience accessor for relations
   */
  get relations(): ReadonlyArray<Relation> {
    return this.graph.relations
  }

  /**
   * Whether extraction produced any entities
   */
  get isEmpty(): boolean {
    return this.graph.entities.length === 0
  }

  /**
   * Whether claims were created
   */
  get hasClaims(): boolean {
    return this.claimCount > 0
  }
}

/**
 * QueryBinding - Single binding from SPARQL query result
 *
 * @since 2.0.0
 * @category Domain
 */
export class QueryBinding extends Schema.Class<QueryBinding>("QueryBinding")({
  /**
   * Variable bindings from the query (variable name -> value)
   */
  bindings: Schema.Record({ key: Schema.String, value: Schema.String })
}) {}

/**
 * QueryResult - Result of a natural language query over knowledge graph
 *
 * Combines generated answer with SPARQL query and bindings.
 *
 * @example
 * ```typescript
 * const result = await OntologyAgent.query("Who scored the most goals?", graph)
 * console.log(result.answer) // "Cristiano Ronaldo scored the most goals with 5 goals."
 * console.log(result.sparql) // "SELECT ?player ?goals WHERE { ... }"
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class QueryResult extends Schema.Class<QueryResult>("QueryResult")({
  /**
   * Natural language answer generated from query results
   */
  answer: Schema.String.annotations({
    title: "Answer",
    description: "Natural language answer to the question"
  }),

  /**
   * Generated SPARQL query (for transparency/debugging)
   */
  sparql: Schema.String.annotations({
    title: "SPARQL",
    description: "Generated SPARQL query"
  }),

  /**
   * Raw query bindings from SPARQL execution
   */
  bindings: Schema.Array(QueryBinding),

  /**
   * Confidence score for the answer (0-1)
   */
  confidence: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  ).annotations({
    title: "Confidence",
    description: "Answer confidence score between 0 and 1"
  })
}) {
  /**
   * Whether the query found any results
   */
  get hasResults(): boolean {
    return this.bindings.length > 0
  }
}

/**
 * ReasoningResult - Result of RDFS/OWL reasoning over a graph
 *
 * Contains inferred triples and reasoning trace.
 *
 * @since 2.0.0
 * @category Domain
 */
export class ReasoningResult extends Schema.Class<ReasoningResult>("ReasoningResult")({
  /**
   * Number of triples inferred
   */
  inferredTripleCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Reasoning rules applied
   */
  rulesApplied: Schema.Array(Schema.String),

  /**
   * Duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.nonNegative())
}) {}

/**
 * ViolationsByLevel - Violations grouped by severity level
 *
 * @since 2.0.0
 * @category Domain
 */
export class ViolationsByLevel extends Schema.Class<ViolationsByLevel>("ViolationsByLevel")({
  /**
   * Critical violations that must be fixed
   */
  violations: Schema.Array(Schema.String).annotations({
    title: "Violations",
    description: "Critical violations (sh:Violation severity)"
  }),

  /**
   * Warnings that should be reviewed
   */
  warnings: Schema.Array(Schema.String).annotations({
    title: "Warnings",
    description: "Non-critical warnings (sh:Warning severity)"
  }),

  /**
   * Informational messages
   */
  info: Schema.Array(Schema.String).annotations({
    title: "Info",
    description: "Informational messages (sh:Info severity)"
  })
}) {
  /**
   * Total count of all issues
   */
  get totalCount(): number {
    return this.violations.length + this.warnings.length + this.info.length
  }

  /**
   * Whether there are any critical violations
   */
  get hasCritical(): boolean {
    return this.violations.length > 0
  }
}

/**
 * EnhancedValidationReport - Validation report with explanations
 *
 * Extends the base validation report with human-readable explanations
 * and severity-grouped violations for easier processing.
 *
 * @example
 * ```typescript
 * const report = await OntologyAgent.validateGraph(rdfStore)
 * if (!report.conforms) {
 *   console.log("Critical issues:", report.byLevel.violations)
 *   for (const exp of report.explanations) {
 *     console.log(`${exp.severity}: ${exp.explanation}`)
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class EnhancedValidationReport extends Schema.Class<EnhancedValidationReport>("EnhancedValidationReport")({
  /**
   * Whether the graph conforms to all shapes
   */
  conforms: Schema.Boolean,

  /**
   * Total number of violations
   */
  violationCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Human-readable explanations for each violation
   */
  explanations: Schema.Array(Schema.suspend(() => ViolationExplanation)),

  /**
   * Violations grouped by severity level
   */
  byLevel: ViolationsByLevel,

  /**
   * Validation duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.nonNegative()),

  /**
   * Number of triples in the data graph
   */
  dataGraphTripleCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Number of shapes used for validation
   */
  shapesCount: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
}) {
  /**
   * Whether validation passed without critical violations
   */
  get isValid(): boolean {
    return this.conforms
  }

  /**
   * Whether there are warnings but no critical violations
   */
  get hasWarningsOnly(): boolean {
    return this.conforms && this.byLevel.warnings.length > 0
  }
}

/**
 * ViolationExplanation - Explainable SHACL violation
 *
 * Provides context-aware explanation suitable for LLM feedback.
 *
 * @since 2.0.0
 * @category Domain
 */
export class ViolationExplanation extends Schema.Class<ViolationExplanation>("ViolationExplanation")({
  /**
   * Focus node (entity) that violated the constraint
   */
  focusNode: Schema.String,

  /**
   * SHACL path (property) involved in violation
   */
  path: Schema.optional(Schema.String),

  /**
   * Human-readable explanation of the violation
   */
  explanation: Schema.String.annotations({
    title: "Explanation",
    description: "Clear explanation of why the violation occurred"
  }),

  /**
   * Suggested correction (if determinable)
   */
  suggestion: Schema.optional(Schema.String).annotations({
    title: "Suggestion",
    description: "How to fix the violation"
  }),

  /**
   * Severity level
   */
  severity: Schema.Literal("Violation", "Warning", "Info")
}) {}
