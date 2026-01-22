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

### Core Entities

```typescript
import { Entities } from "@beep/knowledge-domain";

// Access entity models
const entity: Entities.Entity.Model = ...;
const relation: Entities.Relation.Model = ...;
```

| Entity | Purpose |
|--------|---------|
| `Entity` | Extracted entity with types, mention, attributes |
| `Relation` | Subject-predicate-object triple |
| `Mention` | Raw entity mention before typing |
| `Embedding` | Vector embedding for similarity search |
| `Ontology` | Ontology metadata and configuration |
| `ClassDefinition` | OWL class with properties and hierarchy |
| `PropertyDefinition` | OWL property with domain/range |
| `EntityCluster` | Cluster of equivalent entities |
| `SameAsLink` | Equivalence link between entities |
| `Extraction` | Extraction job metadata |

### Value Objects

```typescript
import { ValueObjects } from "@beep/knowledge-domain";

// Evidence span linking to source text
const span: ValueObjects.EvidenceSpan = ...;
```

### Branded IDs

IDs are defined in `@beep/shared-domain` and used throughout:

```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain";

// Type-safe IDs prevent mixing entity IDs with relation IDs
const entityId: KnowledgeEntityIds.KnowledgeEntityId.Type = ...;
const relationId: KnowledgeEntityIds.KnowledgeRelationId.Type = ...;
```

### Error Types

```typescript
import { Errors } from "@beep/knowledge-domain";

// Tagged errors for typed error handling
// Error types defined in @beep/knowledge-domain/errors
```

## Domain Models

### Entity

```typescript
import { Entities } from "@beep/knowledge-domain";

// Entity model with OWL class types and attributes
type Entity = Entities.Entity.Model;

// Fields:
// - id: KnowledgeEntityId
// - organizationId: OrganizationId
// - ontologyId: string
// - types: string[]              // OWL class IRIs
// - mention: string              // Canonical surface form
// - attributes: Record<string, string>
// - groundingConfidence?: number
// - createdAt: Date
// - updatedAt: Date
```

### Relation

```typescript
import { Entities } from "@beep/knowledge-domain";

// Relation model with subject-predicate-object structure
type Relation = Entities.Relation.Model;

// Fields:
// - id: KnowledgeRelationId
// - organizationId: OrganizationId
// - ontologyId: string
// - subjectId: KnowledgeEntityId
// - predicate: string            // Property IRI
// - objectId?: KnowledgeEntityId // Entity reference (if not literal)
// - literalValue?: string        // Literal value (if not entity)
// - literalType?: string         // XSD type for literals
// - createdAt: Date
// - updatedAt: Date
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
