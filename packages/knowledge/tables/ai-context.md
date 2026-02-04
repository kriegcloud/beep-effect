---
path: packages/knowledge/tables
summary: Drizzle ORM tables for knowledge graphs - pgvector embeddings, entities, relations, ontologies
tags: [knowledge, tables, drizzle, postgresql, pgvector, database]
---

# @beep/knowledge-tables

Drizzle ORM table definitions for the knowledge graph vertical slice. Provides pgvector-compatible embedding storage with dimension constraints and bridges domain models from `@beep/knowledge-domain` to PostgreSQL persistence.

## Architecture

```
|-------------------|     |-------------------|
|   Domain Models   | --> |   Table Schemas   |
| (@beep/knowledge- |     | (Drizzle pgTable) |
|     domain)       |     |-------------------|
|-------------------|            |
                                 v
                    |-------------------|
                    |    Relations      |
                    | (Drizzle relations)|
                    |-------------------|
                                 |
                                 v
                    |-------------------|
                    |  _check.ts        |
                    | (Type alignment)  |
                    |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `tables/entity.table` | Knowledge graph entity storage with type IRI and confidence |
| `tables/relation.table` | Subject-predicate-object relations with provenance |
| `tables/ontology.table` | OWL ontology metadata and version tracking |
| `tables/class-definition.table` | OWL class definitions parsed from ontologies |
| `tables/property-definition.table` | OWL property definitions parsed from ontologies |
| `tables/embedding.table` | pgvector embeddings with configurable dimensions |
| `tables/mention.table` | Extracted text mentions with character offsets |
| `tables/extraction.table` | Extraction job tracking and status |
| `tables/entity-cluster.table` | Entity resolution cluster assignments |
| `tables/same-as-link.table` | owl:sameAs equivalence links |
| `relations.ts` | Drizzle relation definitions for graph traversal queries |
| `_check.ts` | Compile-time type verification for domain-table alignment |

## Usage Patterns

### Table Definition with pgvector

```typescript
import { pgTable, text, index } from "drizzle-orm/pg-core";
import { columns } from "@beep/shared-tables";
import { vector } from "@beep/shared-tables/columns";

export const embeddingTable = pgTable(
  "knowledge_embedding",
  {
    ...columns.withRowAndVersion(),
    ...columns.withAuditFields(),
    id: columns.primaryId("emb"),
    organizationId: columns.organizationId(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    index("embedding_org_idx").on(table.organizationId),
  ]
);
```

### Using Branded EntityIds in Tables

```typescript
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

export const entityTable = pgTable("knowledge_entity", {
  id: text("id").primaryKey().$type<KnowledgeEntityIds.EntityId.Type>(),
  ontologyId: text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| pgvector for embeddings | Native PostgreSQL vector similarity search |
| Column helpers from shared-tables | Consistent audit fields and ID generation |
| `_check.ts` type verification | Compile-time enforcement of domain-table alignment |
| Snake_case table names | PostgreSQL naming convention via Drizzle config |

## Dependencies

**Internal**: `@beep/schema`, `@beep/shared-domain`, `@beep/knowledge-domain`, `@beep/shared-tables`

**External**: `drizzle-orm`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **@beep/knowledge-domain** - Domain models these tables persist
- **@beep/knowledge-server** - Repositories that query these tables
