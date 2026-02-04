---
path: packages/knowledge/domain
summary: Pure domain models for knowledge graphs - entities, relations, ontologies, embeddings with monoid algebra
tags: [knowledge, domain, effect, schema, ontology, graph, embedding]
---

# @beep/knowledge-domain

Domain layer providing pure, effect-free foundation schemas for ontology-guided knowledge extraction. Defines core types for extracting structured knowledge graphs from unstructured text using LLM prompting with monoid algebra for parallel graph merging.

## Architecture

```
|-------------------|     |----------------------|
|    Entities       | --> |   Value Objects      |
| (Model schemas)   |     | (Immutable primitives)|
|-------------------|     |----------------------|
         |
         v
|-------------------|
|      Errors       |
| (Tagged errors)   |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `entities/Entity` | Knowledge graph entity with type IRI, confidence, and evidence spans |
| `entities/Relation` | Typed relation between entities (subject-predicate-object) |
| `entities/Ontology` | OWL ontology metadata container |
| `entities/ClassDefinition` | OWL class definition from ontology |
| `entities/PropertyDefinition` | OWL property definition from ontology |
| `entities/Embedding` | Vector embedding entity for pgvector semantic search |
| `entities/Mention` | Text mention extracted from source document |
| `entities/Extraction` | Extraction job tracking and metadata |
| `entities/EntityCluster` | Cluster of resolved/deduplicated entities |
| `entities/SameAsLink` | owl:sameAs links between entities |
| `value-objects/EvidenceSpan` | Source text span with character offsets |
| `value-objects/ClassIri` | Branded IRI string for OWL classes |
| `value-objects/Attributes` | Type-safe attribute map for entities |
| `errors/` | Tagged errors for extraction, grounding, ontology, entity-resolution |

## Usage Patterns

### Decoding External Data

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Entities } from "@beep/knowledge-domain";

const decodeEntity = (data: unknown) =>
  Effect.gen(function* () {
    const entity = yield* S.decodeUnknown(Entities.Entity.Model)(data);
    yield* Effect.logInfo("entity.decoded", { id: entity.id });
    return entity;
  });
```

### Using Branded EntityIds

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

// Create new IDs
const entityId = KnowledgeEntityIds.EntityId.create();
const ontologyId = KnowledgeEntityIds.OntologyId.create();

// Validate existing strings
const validated = KnowledgeEntityIds.RelationId.make(someString);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Pure schemas only | Domain layer must remain infrastructure-agnostic for testability |
| Monoid algebra for graphs | Enables parallel extraction with associative merging |
| Branded IDs via Schema | Type-safe entity references prevent ID mixups |
| OWL-compatible IRIs | Aligns with semantic web standards for ontology interop |

## Dependencies

**Internal**: `@beep/schema`, `@beep/shared-domain`

**External**: `effect`, `@effect/sql`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **@beep/knowledge-tables** - Drizzle table definitions mirroring these models
- **@beep/knowledge-server** - Repository implementations using these entities
