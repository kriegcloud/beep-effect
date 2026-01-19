# @beep/knowledge-server

Server infrastructure for ontology-guided knowledge extraction, entity resolution, and GraphRAG context assembly.

## Overview

This package provides the server-side infrastructure for the knowledge graph vertical slice:
- Effect-based repositories for knowledge entities
- Vector embedding storage with pgvector similarity search
- Services for knowledge extraction and graph operations

## Installation

```bash
bun add @beep/knowledge-server
```

## Key Exports

| Export | Description |
|--------|-------------|
| `KnowledgeDb` | Database client factory for knowledge slice |
| `EmbeddingRepo` | Repository for vector embeddings with similarity search |
| `KnowledgeRepos` | Namespace containing all knowledge repositories |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain entities and schemas |
| `@beep/knowledge-tables` | Drizzle table definitions |
| `@beep/shared-server` | Base repository patterns and database utilities |
| `effect` | Core Effect runtime |

## Usage

### Basic Repository Usage

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EmbeddingRepo } from "@beep/knowledge-server";
import { KnowledgeDb } from "@beep/knowledge-server/db";

const program = Effect.gen(function* () {
  const repo = yield* EmbeddingRepo;
  const embeddings = yield* repo.findAll();
  return embeddings;
});

const layer = EmbeddingRepo.Default.pipe(
  Layer.provide(KnowledgeDb.Default)
);
```

### Similarity Search

```typescript
import * as Effect from "effect/Effect";
import { EmbeddingRepo } from "@beep/knowledge-server";

const findSimilarContent = (queryVector: number[], limit: number) =>
  Effect.gen(function* () {
    const repo = yield* EmbeddingRepo;
    const similar = yield* repo.findSimilar(queryVector, limit);
    return similar;
  });
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models and schemas |
| `@beep/knowledge-tables` | Database table definitions |
| `@beep/knowledge-client` | Client-side RPC contracts |
| `@beep/knowledge-ui` | React components |
