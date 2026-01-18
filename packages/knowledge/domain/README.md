# @beep/knowledge-domain

Domain models, schemas, and algebra for ontology-guided knowledge extraction. This package provides the pure, effect-free foundation for the knowledge graph vertical slice.

## Overview

This domain package defines the core types for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. The design is based on **topological catamorphism** and **monoid folding** over OWL ontologies.

## Mathematical Foundation

The system transforms OWL ontologies into LLM prompts via a **topological catamorphism** over a directed acyclic graph (DAG). The ontology is modeled as a dependency graph G = (V, E) where:

- **Vertices (V)**: OWL classes, identified by IRIs
- **Edges (E)**: `rdfs:subClassOf` relationships, oriented as Child → Parent
- **Context (Γ)**: A mapping from nodes to their data (labels, properties, comments)

Prompt generation is defined as a fold over this graph using an algebra α:

```
α: D × List<R> → R
```

where D is the node data domain and R is the result monoid. The algorithm processes nodes in topological order, ensuring dependencies (subclasses) are computed before dependents (superclasses).

### KnowledgeIndex Monoid

The result of folding is a `KnowledgeIndex` — a HashMap-based monoid rather than string concatenation. This enables:

- **Queryable structure**: O(1) lookup by IRI instead of linear search
- **Context pruning**: Focus operations select relevant classes without dumping the entire ontology
- **Deferred rendering**: Structure is preserved until final prompt assembly
- **Parallel merging**: Graph fragments from concurrent extraction merge associatively

The monoid operation is HashMap union with custom merge semantics, satisfying associativity and identity laws required for correct folding:

```typescript
// Associativity: merge(merge(a, b), c) === merge(a, merge(b, c))
// Identity: merge(empty, a) === a && merge(a, empty) === a
```

## Package Contents

### Core Schemas

```typescript
import { Entity, Relation, KnowledgeGraph, EvidenceSpan } from "@beep/knowledge-domain";
```

| Schema | Purpose |
|--------|---------|
| `Entity` | Extracted entity with types, mention, attributes |
| `Relation` | Subject-predicate-object triple with evidence |
| `EvidenceSpan` | Source text span linking fact to original document |
| `KnowledgeGraph` | Collection of entities and relations |
| `Mention` | Raw entity mention before typing |
| `OntologyContext` | Parsed ontology with class hierarchy |

### Branded IDs

```typescript
import { EntityId, RelationId, ExtractionId } from "@beep/knowledge-domain";

// Type-safe IDs prevent mixing entity IDs with relation IDs
const entityId: EntityId = EntityId.make("ent_abc123");
const relationId: RelationId = RelationId.make("rel_xyz789");
```

### Algebra

```typescript
import { KnowledgeIndexMonoid, mergeGraphs, foldOntology } from "@beep/knowledge-domain";

// Monoid instance for parallel graph merging
const combined = KnowledgeIndexMonoid.combine(graphA, graphB);

// Merge extracted graphs (associative operation)
const merged = mergeGraphs(fragment1, fragment2);
```

### Error Types

```typescript
import { ExtractionError, OntologyError, GroundingError } from "@beep/knowledge-domain";

// Tagged errors for typed error handling
type KnowledgeErrors = ExtractionError | OntologyError | GroundingError;
```

## Domain Models

### Entity

```typescript
import * as S from "effect/Schema";

export const EntityId = S.String.pipe(S.brand("EntityId"));

export class EvidenceSpan extends S.Class<EvidenceSpan>("EvidenceSpan")({
  text: S.String,
  startOffset: S.Number,
  endOffset: S.Number,
  sourceUri: S.String,
  confidence: S.Number,
}) {}

export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: OrganizationId,
  types: S.Array(S.String),           // OWL class IRIs
  mention: S.String,                   // Canonical surface form
  attributes: S.Record({ key: S.String, value: S.Unknown }),
  mentions: S.optional(S.Array(EvidenceSpan)),
  groundingConfidence: S.optional(S.Number),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

### Relation

```typescript
export class ObjectReference extends S.Class<ObjectReference>("ObjectReference")({
  "@id": EntityId,
}) {}

export class Relation extends S.Class<Relation>("Relation")({
  id: RelationId,
  organizationId: OrganizationId,
  subjectId: EntityId,
  predicate: S.String,                 // Property IRI
  object: S.Union(S.String, ObjectReference),  // Literal or entity ref
  evidence: S.Array(EvidenceSpan),
  confidence: S.Number,
  createdAt: S.Date,
}) {}
```

### KnowledgeGraph

```typescript
export class KnowledgeGraph extends S.Class<KnowledgeGraph>("KnowledgeGraph")({
  entities: S.Array(Entity),
  relations: S.Array(Relation),
}) {}

// Empty graph (monoid identity)
export const emptyGraph: KnowledgeGraph = new KnowledgeGraph({
  entities: [],
  relations: [],
});

// Merge graphs (monoid combine)
export const mergeGraphs = (a: KnowledgeGraph, b: KnowledgeGraph): KnowledgeGraph => {
  // Entity merge by ID with type voting
  // Relation merge by signature (subjectId, predicate, object)
  // Associative and has identity (emptyGraph)
};
```

## Extraction Pipeline (Conceptual)

The full pipeline is implemented in `@beep/knowledge-server`, but the domain defines the data flow:

```
Turtle RDF
  ↓ [OntologyParser]
Graph<NodeId> + OntologyContext
  ↓ [Topological Fold + KnowledgeIndexAlgebra]
KnowledgeIndex (HashMap<IRI, KnowledgeUnit>)
  ↓ [Inheritance Enrichment]
Enriched KnowledgeIndex
  ↓ [Prompt Rendering]
StructuredPrompt → Prompt String
  ↓ [LLM Extraction]
KnowledgeGraph (JSON)
  ↓ [Grounding]
Validated KnowledgeGraph
```

**Phase 1: Pure Fold** — The graph solver applies the algebra in topological order, building a raw `KnowledgeIndex` with class definitions.

**Phase 2: Enrichment** — Inheritance computes effective properties (own + inherited) for each class. This is separate from the fold because inheritance flows downward (parent → child) while the fold processes upward.

**Phase 3: Extraction** — LLM generates entities and relations constrained to ontology types and properties.

**Phase 4: Grounding** — Embedding similarity filters hallucinated relations, keeping only those supported by source text.

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-tables` | Drizzle table schemas, pgvector embeddings |
| `@beep/knowledge-server` | Services: OntologyService, ExtractionPipeline, Grounder |
| `@beep/knowledge-client` | RPC client for extraction and query |
| `@beep/knowledge-ui` | React components: GraphViewer, EntityInspector |

## References

- [effect-ontology](https://github.com/pooks/effect-ontology) — Reference implementation
- `tmp/effect-ontology/packages/@core-v2/src/Domain/` — Original domain models
- `tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts` — Monoid merge implementation
