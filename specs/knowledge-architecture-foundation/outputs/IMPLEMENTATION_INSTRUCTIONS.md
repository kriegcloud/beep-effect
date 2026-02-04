# Phase -1: Knowledge Architecture Foundation - Implementation Instructions

> **Status**: Ready for Implementation
> **Estimated Duration**: 5 days
> **Scope**: Domain contracts, RPC layer, and server handler infrastructure

## Executive Summary

This phase establishes the RPC contract layer for the knowledge slice, following the canonical patterns from `@beep/documents-domain` and `@beep/shared-server`. The implementation bridges existing domain models and server services with a well-typed RPC surface that can be consumed by clients.

---

## Prerequisites

### Required Knowledge

1. **Effect RPC Patterns** - Review `@effect/rpc/Rpc` and `@effect/rpc/RpcGroup`
2. **Documents Slice Reference** - Study `packages/documents/domain/src/entities/document/document.rpc.ts`
3. **Server Handler Patterns** - Study `packages/shared/server/src/rpc/v1/files/`

### Environment Setup

```bash
# Ensure all dependencies are installed
bun install

# Verify existing knowledge slice compiles
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
```

---

## Step 1: Value Object Schemas (Day 1 - Morning)

The knowledge domain already has foundational value objects. We need to add RDF-specific schemas.

### 1.1 Create RDF Value Objects Directory

```bash
mkdir -p packages/knowledge/domain/src/value-objects/rdf
```

### 1.2 Create Quad Schema

**File**: `packages/knowledge/domain/src/value-objects/rdf/Quad.ts`

```typescript
/**
 * RDF Quad value object
 *
 * Represents an RDF quad (subject, predicate, object, graph).
 *
 * @module knowledge-domain/value-objects/rdf/Quad
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/Quad");

/**
 * IRI (Internationalized Resource Identifier)
 *
 * A string representing an IRI, typically a URI.
 */
export const IRI = S.String.pipe(S.brand("IRI")).annotations(
  $I.annotations("IRI", {
    description: "Internationalized Resource Identifier (IRI)",
  })
);
export type IRI = typeof IRI.Type;

/**
 * RDF Literal value
 *
 * A literal value with optional datatype and language tag.
 */
export class Literal extends S.Class<Literal>($I`Literal`)({
  value: S.String.annotations({ description: "Lexical form of the literal" }),
  datatype: S.optional(IRI).annotations({
    description: "XSD datatype IRI (e.g., xsd:string, xsd:integer)",
  }),
  language: S.optional(S.String).annotations({
    description: "Language tag (e.g., en, en-US)",
  }),
}) {}

/**
 * RDF Term - either an IRI or a Literal
 */
export const Term = S.Union(IRI, Literal).annotations(
  $I.annotations("Term", { description: "RDF term (IRI or Literal)" })
);
export type Term = typeof Term.Type;

/**
 * RDF Quad - subject, predicate, object, graph
 *
 * Represents a complete RDF statement with optional graph context.
 */
export class Quad extends S.Class<Quad>($I`Quad`)({
  subject: IRI.annotations({ description: "Subject IRI" }),
  predicate: IRI.annotations({ description: "Predicate IRI" }),
  object: Term.annotations({ description: "Object (IRI or Literal)" }),
  graph: BS.FieldOptionOmittable(
    IRI.annotations({ description: "Named graph IRI (omit for default graph)" })
  ),
}) {}

export declare namespace Quad {
  export type Type = typeof Quad.Type;
  export type Encoded = typeof Quad.Encoded;
}
```

### 1.3 Create QuadPattern Schema

**File**: `packages/knowledge/domain/src/value-objects/rdf/QuadPattern.ts`

```typescript
/**
 * RDF QuadPattern value object
 *
 * Represents a pattern for matching RDF quads (with optional wildcards).
 *
 * @module knowledge-domain/value-objects/rdf/QuadPattern
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { IRI, Term } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/QuadPattern");

/**
 * RDF QuadPattern for query matching
 *
 * Each field is optional - omitted fields act as wildcards.
 */
export class QuadPattern extends S.Class<QuadPattern>($I`QuadPattern`)({
  subject: S.optional(IRI).annotations({
    description: "Subject IRI (omit for wildcard)",
  }),
  predicate: S.optional(IRI).annotations({
    description: "Predicate IRI (omit for wildcard)",
  }),
  object: S.optional(Term).annotations({
    description: "Object term (omit for wildcard)",
  }),
  graph: S.optional(IRI).annotations({
    description: "Graph IRI (omit for default/wildcard)",
  }),
}) {}

export declare namespace QuadPattern {
  export type Type = typeof QuadPattern.Type;
  export type Encoded = typeof QuadPattern.Encoded;
}
```

### 1.4 Create SparqlBindings Schema

**File**: `packages/knowledge/domain/src/value-objects/rdf/SparqlBindings.ts`

```typescript
/**
 * SPARQL Bindings value object
 *
 * Represents SPARQL query result bindings (variable -> value mappings).
 *
 * @module knowledge-domain/value-objects/rdf/SparqlBindings
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Term } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/SparqlBindings");

/**
 * Single SPARQL binding row
 *
 * Maps variable names to RDF terms.
 */
export const BindingRow = S.Record({ key: S.String, value: Term }).annotations(
  $I.annotations("BindingRow", {
    description: "Single SPARQL result binding (variable -> term)",
  })
);
export type BindingRow = typeof BindingRow.Type;

/**
 * SPARQL SELECT query results
 */
export class SparqlSelectResults extends S.Class<SparqlSelectResults>($I`SparqlSelectResults`)({
  variables: S.Array(S.String).annotations({
    description: "Variable names in the result set",
  }),
  bindings: S.Array(BindingRow).annotations({
    description: "Array of binding rows",
  }),
}) {}

/**
 * SPARQL ASK query result
 */
export class SparqlAskResult extends S.Class<SparqlAskResult>($I`SparqlAskResult`)({
  value: S.Boolean.annotations({
    description: "Boolean result of ASK query",
  }),
}) {}

export declare namespace SparqlSelectResults {
  export type Type = typeof SparqlSelectResults.Type;
}

export declare namespace SparqlAskResult {
  export type Type = typeof SparqlAskResult.Type;
}
```

### 1.5 Create RDF Value Objects Index

**File**: `packages/knowledge/domain/src/value-objects/rdf/index.ts`

```typescript
/**
 * RDF value objects for the knowledge domain.
 *
 * @module knowledge-domain/value-objects/rdf
 * @since 0.1.0
 */
export * from "./Quad";
export * from "./QuadPattern";
export * from "./SparqlBindings";
```

### 1.6 Update Value Objects Index

**File**: `packages/knowledge/domain/src/value-objects/index.ts` (append)

```typescript
export * from "./rdf";
```

---

## Step 2: Error Schemas (Day 1 - Afternoon)

### 2.1 Create SPARQL Errors

**File**: `packages/knowledge/domain/src/errors/sparql.errors.ts`

```typescript
/**
 * SPARQL errors for Knowledge slice
 *
 * Typed errors for SPARQL query operations.
 *
 * @module knowledge-domain/errors/sparql
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/sparql");

/**
 * SPARQL syntax error
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlSyntaxError extends S.TaggedError<SparqlSyntaxError>($I`SparqlSyntaxError`)(
  "SparqlSyntaxError",
  {
    query: S.String,
    line: S.optional(S.Number),
    column: S.optional(S.Number),
    message: S.String,
  },
  $I.annotations("SparqlSyntaxError", {
    description: "SPARQL query has invalid syntax",
  })
) {}

/**
 * SPARQL query timeout
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlTimeoutError extends S.TaggedError<SparqlTimeoutError>($I`SparqlTimeoutError`)(
  "SparqlTimeoutError",
  {
    query: S.String,
    timeoutMs: S.Number,
    message: S.String,
  },
  $I.annotations("SparqlTimeoutError", {
    description: "SPARQL query execution timed out",
  })
) {}

/**
 * SPARQL execution error
 *
 * @since 0.1.0
 * @category errors
 */
export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>($I`SparqlExecutionError`)(
  "SparqlExecutionError",
  {
    query: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("SparqlExecutionError", {
    description: "SPARQL query execution failed",
  })
) {}

/**
 * Union of all SPARQL error types
 *
 * @since 0.1.0
 * @category errors
 */
export const SparqlError = S.Union(
  SparqlSyntaxError,
  SparqlTimeoutError,
  SparqlExecutionError
).annotations(
  $I.annotations("SparqlError", {
    description: "Union of all SPARQL error types",
  })
);

export type SparqlError =
  | SparqlSyntaxError
  | SparqlTimeoutError
  | SparqlExecutionError;
```

### 2.2 Create GraphRAG Errors

**File**: `packages/knowledge/domain/src/errors/graphrag.errors.ts`

```typescript
/**
 * GraphRAG errors for Knowledge slice
 *
 * Typed errors for GraphRAG retrieval operations.
 *
 * @module knowledge-domain/errors/graphrag
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/graphrag");

/**
 * Embedding generation error
 *
 * @since 0.1.0
 * @category errors
 */
export class EmbeddingGenerationError extends S.TaggedError<EmbeddingGenerationError>($I`EmbeddingGenerationError`)(
  "EmbeddingGenerationError",
  {
    text: S.String,
    model: S.optional(S.String),
    message: S.String,
    retryable: S.Boolean,
  },
  $I.annotations("EmbeddingGenerationError", {
    description: "Failed to generate embedding vector",
  })
) {}

/**
 * Vector search error
 *
 * @since 0.1.0
 * @category errors
 */
export class VectorSearchError extends S.TaggedError<VectorSearchError>($I`VectorSearchError`)(
  "VectorSearchError",
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("VectorSearchError", {
    description: "Vector similarity search failed",
  })
) {}

/**
 * Graph traversal error
 *
 * @since 0.1.0
 * @category errors
 */
export class GraphTraversalError extends S.TaggedError<GraphTraversalError>($I`GraphTraversalError`)(
  "GraphTraversalError",
  {
    seedEntityCount: S.Number,
    hops: S.Number,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("GraphTraversalError", {
    description: "Graph traversal operation failed",
  })
) {}

/**
 * Union of all GraphRAG error types
 *
 * @since 0.1.0
 * @category errors
 */
export const GraphRAGError = S.Union(
  EmbeddingGenerationError,
  VectorSearchError,
  GraphTraversalError
).annotations(
  $I.annotations("GraphRAGError", {
    description: "Union of all GraphRAG error types",
  })
);

export type GraphRAGError =
  | EmbeddingGenerationError
  | VectorSearchError
  | GraphTraversalError;
```

### 2.3 Update Errors Index

**File**: `packages/knowledge/domain/src/errors/index.ts` (replace)

```typescript
/**
 * Knowledge domain error exports
 *
 * @module knowledge-domain/errors
 * @since 0.1.0
 */
export * from "./entity-resolution.errors";
export * from "./extraction.errors";
export * from "./graphrag.errors";
export * from "./grounding.errors";
export * from "./ontology.errors";
export * from "./sparql.errors";
```

---

## Step 3: RPC Contracts (Day 2-3)

### 3.1 Create Entity RPC Contract

**File**: `packages/knowledge/domain/src/entities/entity/entity.rpc.ts`

```typescript
/**
 * RPC contract for Entity operations.
 *
 * @module knowledge-domain/entities/entity/entity.rpc
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Model } from "./entity.model";

const $I = $KnowledgeDomainId.create("entities/entity/entity.rpc");

/**
 * Entity not found error
 */
export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>($I`EntityNotFoundError`)(
  "EntityNotFoundError",
  {
    id: KnowledgeEntityIds.KnowledgeEntityId,
    message: S.String,
  },
  $I.annotations("EntityNotFoundError", {
    description: "Entity not found",
  })
) {}

/**
 * Search result for entity search operations
 */
export const EntitySearchResult = S.Struct({
  entity: Model.json,
  score: S.Number.annotations({ description: "Relevance score" }),
}).annotations(
  $I.annotations("EntitySearchResult", {
    description: "Entity search result with relevance score",
  })
);

/**
 * RPC contract for Entity operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Entity by ID
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: EntityNotFoundError,
  }),

  /**
   * List Entities with pagination
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
      typeIri: S.optional(S.String),
      cursor: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
      limit: S.optional(S.Int.pipe(S.positive(), S.lessThanOrEqualTo(100))),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Search Entities by text (embedding similarity)
   */
  Rpc.make("search", {
    payload: {
      query: S.String.pipe(S.minLength(1)),
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(S.String),
      topK: S.optional(S.Int.pipe(S.positive(), S.lessThanOrEqualTo(50))),
      minSimilarity: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))),
    },
    success: EntitySearchResult,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Entity
   */
  Rpc.make("create", {
    payload: Model.insert,
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Update Entity
   */
  Rpc.make("update", {
    payload: Model.update,
    success: Model.json,
    error: EntityNotFoundError,
  }),

  /**
   * Delete Entity
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: EntityNotFoundError,
  }),

  /**
   * Count Entities
   */
  Rpc.make("count", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(S.String),
    },
    success: S.Struct({ count: S.Number }),
    error: S.Never,
  })
).prefix("entity_") {}

export * as Errors from "./entity.rpc";
```

### 3.2 Create Relation RPC Contract

**File**: `packages/knowledge/domain/src/entities/relation/relation.rpc.ts`

```typescript
/**
 * RPC contract for Relation operations.
 *
 * @module knowledge-domain/entities/relation/relation.rpc
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Model } from "./relation.model";

const $I = $KnowledgeDomainId.create("entities/relation/relation.rpc");

/**
 * Relation not found error
 */
export class RelationNotFoundError extends S.TaggedError<RelationNotFoundError>($I`RelationNotFoundError`)(
  "RelationNotFoundError",
  {
    id: KnowledgeEntityIds.RelationId,
    message: S.String,
  },
  $I.annotations("RelationNotFoundError", {
    description: "Relation not found",
  })
) {}

/**
 * RPC contract for Relation operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Relation by ID
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.RelationId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: RelationNotFoundError,
  }),

  /**
   * List Relations by Entity (as subject or object)
   */
  Rpc.make("listByEntity", {
    payload: {
      entityId: KnowledgeEntityIds.KnowledgeEntityId,
      organizationId: SharedEntityIds.OrganizationId,
      direction: S.optional(S.Literal("outgoing", "incoming", "both")),
      predicateIri: S.optional(S.String),
      limit: S.optional(S.Int.pipe(S.positive(), S.lessThanOrEqualTo(100))),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Relations by predicate
   */
  Rpc.make("listByPredicate", {
    payload: {
      predicateIri: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      limit: S.optional(S.Int.pipe(S.positive(), S.lessThanOrEqualTo(100))),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Relation
   */
  Rpc.make("create", {
    payload: Model.insert,
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Delete Relation
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.RelationId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: RelationNotFoundError,
  }),

  /**
   * Count Relations
   */
  Rpc.make("count", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      ontologyId: S.optional(S.String),
    },
    success: S.Struct({ count: S.Number }),
    error: S.Never,
  })
).prefix("relation_") {}

export * as Errors from "./relation.rpc";
```

### 3.3 Create GraphRAG RPC Contract

**File**: `packages/knowledge/domain/src/rpc/graphrag.rpc.ts`

```typescript
/**
 * RPC contract for GraphRAG operations.
 *
 * @module knowledge-domain/rpc/graphrag
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Entities } from "../entities";

const $I = $KnowledgeDomainId.create("rpc/graphrag");

/**
 * GraphRAG query payload
 */
export class QueryPayload extends S.Class<QueryPayload>($I`QueryPayload`)({
  query: S.String.pipe(S.minLength(1)).annotations({
    description: "Natural language query",
  }),
  organizationId: SharedEntityIds.OrganizationId,
  ontologyId: S.optional(S.String),
  topK: S.optional(S.Int.pipe(S.positive(), S.lessThanOrEqualTo(50))).annotations({
    description: "Number of seed entities from k-NN search (default 10)",
  }),
  hops: S.optional(S.Int.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(3))).annotations({
    description: "Graph traversal depth (default 1, max 3)",
  }),
  maxTokens: S.optional(S.Int.pipe(S.positive())).annotations({
    description: "Maximum token budget for context (default 4000)",
  }),
  minSimilarity: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))).annotations({
    description: "Minimum embedding similarity threshold (default 0.5)",
  }),
  includeScores: S.optional(S.Boolean).annotations({
    description: "Include relevance scores in output",
  }),
}) {}

/**
 * GraphRAG retrieval statistics
 */
export class RetrievalStats extends S.Class<RetrievalStats>($I`RetrievalStats`)({
  seedEntityCount: S.Number,
  totalEntityCount: S.Number,
  totalRelationCount: S.Number,
  hopsTraversed: S.Number,
  estimatedTokens: S.Number,
  truncated: S.Boolean,
}) {}

/**
 * GraphRAG query result
 */
export class QueryResult extends S.Class<QueryResult>($I`QueryResult`)({
  entities: S.Array(Entities.Entity.Model.json),
  relations: S.Array(Entities.Relation.Model.json),
  scores: S.Record({ key: S.String, value: S.Number }),
  context: S.String.annotations({
    description: "Formatted context string for LLM consumption",
  }),
  stats: RetrievalStats,
}) {}

/**
 * GraphRAG error
 */
export class GraphRAGQueryError extends S.TaggedError<GraphRAGQueryError>($I`GraphRAGQueryError`)(
  "GraphRAGQueryError",
  {
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("GraphRAGQueryError", {
    description: "GraphRAG query failed",
  })
) {}

/**
 * RPC contract for GraphRAG operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Execute GraphRAG query
   */
  Rpc.make("query", {
    payload: QueryPayload,
    success: QueryResult,
    error: GraphRAGQueryError,
  }),

  /**
   * Query from pre-computed seed entities
   */
  Rpc.make("queryFromSeeds", {
    payload: {
      seedEntityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
      organizationId: SharedEntityIds.OrganizationId,
      hops: S.optional(S.Int.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(3))),
      maxTokens: S.optional(S.Int.pipe(S.positive())),
      includeScores: S.optional(S.Boolean),
    },
    success: QueryResult,
    error: GraphRAGQueryError,
  })
).prefix("graphrag_") {}
```

### 3.4 Create Extraction RPC Contract

**File**: `packages/knowledge/domain/src/rpc/extraction.rpc.ts`

```typescript
/**
 * RPC contract for Extraction operations.
 *
 * @module knowledge-domain/rpc/extraction
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { ExtractionError } from "../errors/extraction.errors";

const $I = $KnowledgeDomainId.create("rpc/extraction");

/**
 * Extraction configuration payload
 */
export class ExtractPayload extends S.Class<ExtractPayload>($I`ExtractPayload`)({
  text: S.String.pipe(S.minLength(1)).annotations({
    description: "Source text to extract from",
  }),
  ontologyId: KnowledgeEntityIds.OntologyId.annotations({
    description: "Ontology to use for extraction",
  }),
  organizationId: SharedEntityIds.OrganizationId,
  documentId: S.optional(S.String).annotations({
    description: "Source document ID for provenance",
  }),
  sourceUri: S.optional(S.String).annotations({
    description: "Source URI for provenance",
  }),
  chunkSize: S.optional(S.Int.pipe(S.positive())).annotations({
    description: "Text chunk size in tokens",
  }),
  minConfidence: S.optional(S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))).annotations({
    description: "Minimum confidence threshold",
  }),
}) {}

/**
 * Extraction statistics
 */
export class ExtractionStats extends S.Class<ExtractionStats>($I`ExtractionStats`)({
  chunkCount: S.Number,
  mentionCount: S.Number,
  entityCount: S.Number,
  relationCount: S.Number,
  tokensUsed: S.Number,
  durationMs: S.Number,
}) {}

/**
 * Extraction result summary
 */
export class ExtractResult extends S.Class<ExtractResult>($I`ExtractResult`)({
  extractionId: KnowledgeEntityIds.ExtractionId,
  entityCount: S.Number,
  relationCount: S.Number,
  stats: ExtractionStats,
}) {}

/**
 * RPC contract for Extraction operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Extract knowledge from text
   */
  Rpc.make("extract", {
    payload: ExtractPayload,
    success: ExtractResult,
    error: ExtractionError,
  }),

  /**
   * Get extraction status
   */
  Rpc.make("getStatus", {
    payload: {
      extractionId: KnowledgeEntityIds.ExtractionId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Struct({
      extractionId: KnowledgeEntityIds.ExtractionId,
      status: S.Literal("pending", "running", "completed", "failed"),
      progress: S.optional(S.Number),
      stats: S.optional(ExtractionStats),
      error: S.optional(S.String),
    }),
    error: S.Never,
  })
).prefix("extraction_") {}
```

### 3.5 Create Ontology RPC Contract

**File**: `packages/knowledge/domain/src/rpc/ontology.rpc.ts`

```typescript
/**
 * RPC contract for Ontology operations.
 *
 * @module knowledge-domain/rpc/ontology
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { Entities } from "../entities";
import { OntologyNotFoundError, OntologyParseError } from "../errors/ontology.errors";

const $I = $KnowledgeDomainId.create("rpc/ontology");

/**
 * RPC contract for Ontology operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Ontology by ID
   */
  Rpc.make("get", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Entities.Ontology.Model.json,
    error: OntologyNotFoundError,
  }),

  /**
   * List Ontologies
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      status: S.optional(S.Literal("draft", "active", "deprecated")),
    },
    success: Entities.Ontology.Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Ontology from Turtle content
   */
  Rpc.make("create", {
    payload: {
      name: S.String,
      namespace: S.String,
      content: S.String.annotations({
        description: "Turtle format ontology content",
      }),
      organizationId: SharedEntityIds.OrganizationId,
      description: S.optional(S.String),
    },
    success: Entities.Ontology.Model.json,
    error: OntologyParseError,
  }),

  /**
   * Update Ontology
   */
  Rpc.make("update", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
      name: S.optional(S.String),
      description: S.optional(S.String),
      content: S.optional(S.String),
      status: S.optional(S.Literal("draft", "active", "deprecated")),
    },
    success: Entities.Ontology.Model.json,
    error: S.Union(OntologyNotFoundError, OntologyParseError),
  }),

  /**
   * Delete Ontology
   */
  Rpc.make("delete", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: S.Void,
    error: OntologyNotFoundError,
  }),

  /**
   * Get Ontology classes
   */
  Rpc.make("getClasses", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Entities.ClassDefinition.Model.json,
    error: OntologyNotFoundError,
    stream: true,
  }),

  /**
   * Get Ontology properties
   */
  Rpc.make("getProperties", {
    payload: {
      id: KnowledgeEntityIds.OntologyId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Entities.PropertyDefinition.Model.json,
    error: OntologyNotFoundError,
    stream: true,
  })
).prefix("ontology_") {}
```

### 3.6 Create RPC Directory and Index

**File**: `packages/knowledge/domain/src/rpc/index.ts`

```typescript
/**
 * Knowledge domain RPC contracts
 *
 * @module knowledge-domain/rpc
 * @since 0.1.0
 */
export * as Extraction from "./extraction.rpc";
export * as GraphRAG from "./graphrag.rpc";
export * as Ontology from "./ontology.rpc";
```

### 3.7 Update Entity Index Files

**File**: `packages/knowledge/domain/src/entities/entity/index.ts` (replace)

```typescript
/**
 * Entity model exports
 *
 * @module knowledge-domain/entities/entity
 * @since 0.1.0
 */
export * from "./entity.model";
export * as Rpc from "./entity.rpc";
```

**File**: `packages/knowledge/domain/src/entities/relation/index.ts` (replace)

```typescript
/**
 * Relation model exports
 *
 * @module knowledge-domain/entities/relation
 * @since 0.1.0
 */
export * from "./relation.model";
export * as Rpc from "./relation.rpc";
```

### 3.8 Update Domain Index

**File**: `packages/knowledge/domain/src/index.ts` (replace)

```typescript
/**
 * @beep/knowledge-domain
 * Ontology-guided knowledge extraction, entity resolution, and GraphRAG context assembly for intelligent agents - Domain entities and value objects
 *
 * This module contains:
 * - Entity models
 * - Value objects
 * - Error types
 * - RPC contracts
 * - Business rules (NO side effects)
 *
 * @module knowledge-domain
 * @since 0.1.0
 */
export * as Entities from "./entities";
export * as Errors from "./errors";
export * as Rpc from "./rpc";
export * as ValueObjects from "./value-objects";
```

---

## Step 4: RPC Handlers (Day 4-5)

### 4.1 Create Handler Directory Structure

```bash
mkdir -p packages/knowledge/server/src/rpc/v1/{entity,relation,graphrag,extraction,ontology}
```

### 4.2 Create Entity Handlers

**File**: `packages/knowledge/server/src/rpc/v1/entity/get.ts`

```typescript
/**
 * Entity get handler
 *
 * @module knowledge-server/rpc/v1/entity/get
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { EntityRepo } from "@beep/knowledge-server/db";
import { Policy } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

type Payload = {
  readonly id: Entities.Entity.Rpc.Rpcs["entity_get"]["payload"]["id"];
  readonly organizationId: Entities.Entity.Rpc.Rpcs["entity_get"]["payload"]["organizationId"];
};

export const Handler = Effect.fn("entity_get")(function* (payload: Payload) {
  const { session } = yield* Policy.AuthContext;
  const repo = yield* EntityRepo;

  // Verify organization access
  if (session.activeOrganizationId !== payload.organizationId) {
    return yield* Effect.fail(
      new Entities.Entity.Rpc.EntityNotFoundError({
        id: payload.id,
        message: "Entity not found or access denied",
      })
    );
  }

  const entities = yield* repo.findByIds([payload.id], payload.organizationId);
  const entity = O.fromNullable(entities[0]);

  return yield* O.match(entity, {
    onNone: () =>
      Effect.fail(
        new Entities.Entity.Rpc.EntityNotFoundError({
          id: payload.id,
          message: "Entity not found",
        })
      ),
    onSome: Effect.succeed,
  });
}).pipe(
  Effect.catchTag("DatabaseError", (e) =>
    Effect.fail(
      new Entities.Entity.Rpc.EntityNotFoundError({
        id: "" as any,
        message: `Database error: ${e.message}`,
      })
    )
  ),
  Effect.withSpan("entity_get")
);
```

**File**: `packages/knowledge/server/src/rpc/v1/entity/list.ts`

```typescript
/**
 * Entity list handler
 *
 * @module knowledge-server/rpc/v1/entity/list
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { EntityRepo } from "@beep/knowledge-server/db";
import { Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

type Payload = typeof Entities.Entity.Rpc.Rpcs.Type["entity_list"]["payload"];

export const Handler = (payload: Payload) =>
  Stream.unwrap(
    Effect.gen(function* () {
      const { session } = yield* Policy.AuthContext;
      const repo = yield* EntityRepo;

      // Verify organization access
      if (session.activeOrganizationId !== payload.organizationId) {
        return Stream.empty;
      }

      const limit = payload.limit ?? 50;

      // Use appropriate repository method based on filters
      const entities = payload.ontologyId
        ? yield* repo.findByOntology(payload.ontologyId, payload.organizationId, limit)
        : payload.typeIri
          ? yield* repo.findByType(payload.typeIri, payload.organizationId, limit)
          : yield* repo.findByOntology("default", payload.organizationId, limit);

      return Stream.fromIterable(entities);
    }).pipe(Effect.withSpan("entity_list"))
  );
```

**File**: `packages/knowledge/server/src/rpc/v1/entity/count.ts`

```typescript
/**
 * Entity count handler
 *
 * @module knowledge-server/rpc/v1/entity/count
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { EntityRepo } from "@beep/knowledge-server/db";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

type Payload = typeof Entities.Entity.Rpc.Rpcs.Type["entity_count"]["payload"];

export const Handler = Effect.fn("entity_count")(function* (payload: Payload) {
  const { session } = yield* Policy.AuthContext;
  const repo = yield* EntityRepo;

  // Verify organization access
  if (session.activeOrganizationId !== payload.organizationId) {
    return { count: 0 };
  }

  const count = yield* repo.countByOrganization(payload.organizationId);
  return { count };
}).pipe(
  Effect.catchTag("DatabaseError", () => Effect.succeed({ count: 0 })),
  Effect.withSpan("entity_count")
);
```

**File**: `packages/knowledge/server/src/rpc/v1/entity/_rpcs.ts`

```typescript
/**
 * Entity RPC handlers
 *
 * @module knowledge-server/rpc/v1/entity
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Count from "./count";
import * as Get from "./get";
import * as List from "./list";

// Attach auth middleware
const EntityRpcsWithMiddleware = Entities.Entity.Rpc.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = EntityRpcsWithMiddleware.of({
  entity_get: Get.Handler,
  entity_list: List.Handler,
  entity_count: Count.Handler,
  // TODO: Implement remaining handlers
  entity_search: () => { throw new Error("Not implemented"); },
  entity_create: () => { throw new Error("Not implemented"); },
  entity_update: () => { throw new Error("Not implemented"); },
  entity_delete: () => { throw new Error("Not implemented"); },
});

export const layer = EntityRpcsWithMiddleware.toLayer(implementation);
```

**File**: `packages/knowledge/server/src/rpc/v1/entity/index.ts`

```typescript
/**
 * Entity RPC exports
 *
 * @module knowledge-server/rpc/v1/entity
 * @since 0.1.0
 */
export { layer } from "./_rpcs";
```

### 4.3 Create GraphRAG Handlers

**File**: `packages/knowledge/server/src/rpc/v1/graphrag/query.ts`

```typescript
/**
 * GraphRAG query handler
 *
 * @module knowledge-server/rpc/v1/graphrag/query
 * @since 0.1.0
 */
import { Rpc } from "@beep/knowledge-domain";
import { GraphRAGService, GraphRAGQuery } from "@beep/knowledge-server/GraphRAG";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

type Payload = Rpc.GraphRAG.QueryPayload;

export const Handler = Effect.fn("graphrag_query")(function* (payload: Payload) {
  const { session } = yield* Policy.AuthContext;
  const graphrag = yield* GraphRAGService;

  // Verify organization access
  if (session.activeOrganizationId !== payload.organizationId) {
    return yield* Effect.fail(
      new Rpc.GraphRAG.GraphRAGQueryError({
        message: "Access denied to organization",
      })
    );
  }

  const query = new GraphRAGQuery({
    query: payload.query,
    topK: payload.topK ?? 10,
    hops: payload.hops ?? 1,
    maxTokens: payload.maxTokens ?? 4000,
    similarityThreshold: payload.minSimilarity ?? 0.5,
    includeScores: payload.includeScores ?? false,
  });

  const result = yield* graphrag.query(
    query,
    payload.organizationId,
    payload.ontologyId ?? "default"
  );

  return new Rpc.GraphRAG.QueryResult({
    entities: result.entities,
    relations: result.relations,
    scores: result.scores,
    context: result.context,
    stats: new Rpc.GraphRAG.RetrievalStats(result.stats),
  });
}).pipe(
  Effect.catchTags({
    GraphRAGError: (e) =>
      Effect.fail(
        new Rpc.GraphRAG.GraphRAGQueryError({
          message: e.message,
          cause: "cause" in e ? String(e.cause) : undefined,
        })
      ),
    EmbeddingError: (e) =>
      Effect.fail(
        new Rpc.GraphRAG.GraphRAGQueryError({
          message: `Embedding error: ${e.message}`,
        })
      ),
    DatabaseError: (e) =>
      Effect.fail(
        new Rpc.GraphRAG.GraphRAGQueryError({
          message: `Database error: ${e.message}`,
        })
      ),
  }),
  Effect.withSpan("graphrag_query")
);
```

**File**: `packages/knowledge/server/src/rpc/v1/graphrag/_rpcs.ts`

```typescript
/**
 * GraphRAG RPC handlers
 *
 * @module knowledge-server/rpc/v1/graphrag
 * @since 0.1.0
 */
import { Rpc } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Query from "./query";

// Attach auth middleware
const GraphRAGRpcsWithMiddleware = Rpc.GraphRAG.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = GraphRAGRpcsWithMiddleware.of({
  graphrag_query: Query.Handler,
  // TODO: Implement queryFromSeeds
  graphrag_queryFromSeeds: () => { throw new Error("Not implemented"); },
});

export const layer = GraphRAGRpcsWithMiddleware.toLayer(implementation);
```

**File**: `packages/knowledge/server/src/rpc/v1/graphrag/index.ts`

```typescript
/**
 * GraphRAG RPC exports
 *
 * @module knowledge-server/rpc/v1/graphrag
 * @since 0.1.0
 */
export { layer } from "./_rpcs";
```

### 4.4 Create Relation Handlers (stub)

**File**: `packages/knowledge/server/src/rpc/v1/relation/_rpcs.ts`

```typescript
/**
 * Relation RPC handlers
 *
 * @module knowledge-server/rpc/v1/relation
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

// Attach auth middleware
const RelationRpcsWithMiddleware = Entities.Relation.Rpc.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

const implementation = RelationRpcsWithMiddleware.of({
  relation_get: () => Effect.fail(new Entities.Relation.Rpc.RelationNotFoundError({
    id: "" as any,
    message: "Not implemented",
  })),
  relation_listByEntity: () => Stream.empty,
  relation_listByPredicate: () => Stream.empty,
  relation_create: () => { throw new Error("Not implemented"); },
  relation_delete: () => { throw new Error("Not implemented"); },
  relation_count: () => Effect.succeed({ count: 0 }),
});

export const layer = RelationRpcsWithMiddleware.toLayer(implementation);
```

**File**: `packages/knowledge/server/src/rpc/v1/relation/index.ts`

```typescript
export { layer } from "./_rpcs";
```

---

## Step 5: Layer Composition (Day 5)

### 5.1 Create Knowledge RPC Aggregation

**File**: `packages/knowledge/server/src/rpc/v1/_rpcs.ts`

```typescript
/**
 * Knowledge RPC layer composition
 *
 * Aggregates all knowledge slice RPC handlers into a single layer.
 *
 * @module knowledge-server/rpc/v1
 * @since 0.1.0
 */
import * as Layer from "effect/Layer";
import { Entity } from "./entity";
import { GraphRAG } from "./graphrag";
import { Relation } from "./relation";

/**
 * Combined layer for all knowledge RPC handlers
 */
export const layer = Layer.mergeAll(
  Entity.layer,
  GraphRAG.layer,
  Relation.layer
);
```

**File**: `packages/knowledge/server/src/rpc/v1/index.ts`

```typescript
/**
 * Knowledge RPC v1 exports
 *
 * @module knowledge-server/rpc/v1
 * @since 0.1.0
 */
export { layer } from "./_rpcs";
export * as Entity from "./entity";
export * as GraphRAG from "./graphrag";
export * as Relation from "./relation";
```

**File**: `packages/knowledge/server/src/rpc/index.ts`

```typescript
/**
 * Knowledge RPC exports
 *
 * @module knowledge-server/rpc
 * @since 0.1.0
 */
export * as V1 from "./v1";
```

### 5.2 Update Server Index

Update `packages/knowledge/server/src/index.ts` to export RPC:

```typescript
// Add to existing exports
export * as Rpc from "./rpc";
```

---

## Verification Steps

### Domain Package

```bash
# Type check domain package
bun run check --filter @beep/knowledge-domain

# Verify exports compile
bun tsc --noEmit packages/knowledge/domain/src/index.ts
```

### Server Package

```bash
# Type check server package
bun run check --filter @beep/knowledge-server

# Run existing tests
bun run test --filter @beep/knowledge-server
```

### Integration Verification

```bash
# Full monorepo check
bun run check

# Lint check
bun run lint --filter @beep/knowledge-domain
bun run lint --filter @beep/knowledge-server
```

---

## Checklist

### Day 1: Value Objects and Errors

- [ ] Create `packages/knowledge/domain/src/value-objects/rdf/` directory
- [ ] Implement `Quad.ts` with IRI, Literal, Term, Quad schemas
- [ ] Implement `QuadPattern.ts` for query patterns
- [ ] Implement `SparqlBindings.ts` for SPARQL results
- [ ] Create `rdf/index.ts` and update `value-objects/index.ts`
- [ ] Implement `sparql.errors.ts`
- [ ] Implement `graphrag.errors.ts`
- [ ] Update `errors/index.ts`
- [ ] Verify: `bun run check --filter @beep/knowledge-domain`

### Day 2-3: RPC Contracts

- [ ] Implement `entity/entity.rpc.ts`
- [ ] Implement `relation/relation.rpc.ts`
- [ ] Create `rpc/` directory in domain
- [ ] Implement `rpc/graphrag.rpc.ts`
- [ ] Implement `rpc/extraction.rpc.ts`
- [ ] Implement `rpc/ontology.rpc.ts`
- [ ] Create `rpc/index.ts`
- [ ] Update entity index files to export Rpc
- [ ] Update domain `index.ts` to export Rpc namespace
- [ ] Verify: `bun run check --filter @beep/knowledge-domain`

### Day 4-5: Server Handlers

- [ ] Create `packages/knowledge/server/src/rpc/v1/` directory structure
- [ ] Implement Entity handlers (get, list, count)
- [ ] Implement Entity `_rpcs.ts` layer composition
- [ ] Implement GraphRAG query handler
- [ ] Implement GraphRAG `_rpcs.ts` layer composition
- [ ] Create Relation handler stubs
- [ ] Create `rpc/v1/_rpcs.ts` aggregate layer
- [ ] Create `rpc/v1/index.ts` and `rpc/index.ts`
- [ ] Update server `index.ts`
- [ ] Verify: `bun run check --filter @beep/knowledge-server`
- [ ] Verify: `bun run test --filter @beep/knowledge-server`

### Final Verification

- [ ] `bun run check` (full monorepo)
- [ ] `bun run lint` (full monorepo)
- [ ] `bun run test` (affected packages)

---

## Notes for Implementers

### Pattern Deviations

1. **Streaming RPCs**: Use `stream: true` for list operations that may return large result sets
2. **Error Unions**: Use `S.Union` for errors when multiple error types are possible
3. **Auth Middleware**: Always attach `Policy.AuthContextRpcMiddleware` to RPC groups

### Known Issues to Address

1. The existing `GraphRAGService` uses `BS.toOptionalWithDefault` which may need migration to newer patterns
2. Some model types may need `.json` accessor added if missing
3. EntityId validation in handlers should use `.is()` predicates

### Dependencies

These handlers depend on existing services:
- `EntityRepo` from `@beep/knowledge-server/db`
- `RelationRepo` from `@beep/knowledge-server/db`
- `GraphRAGService` from `@beep/knowledge-server/GraphRAG`
- `EmbeddingService` from `@beep/knowledge-server/Embedding`

Ensure these services are properly provided in the runtime layer composition.
