# @beep/knowledge-tables

Drizzle ORM table definitions for the knowledge graph vertical slice.

## Overview

This package provides database schema definitions for knowledge graph entities:
- pgvector-compatible embedding storage
- Drizzle table definitions with proper indexes
- Relations for graph traversal queries

## Installation

```bash
bun add @beep/knowledge-tables
```

## Key Exports

| Export | Description |
|--------|-------------|
| `embeddingTable` | Vector embedding storage with pgvector type |
| `schema` | Unified schema export for migrations |
| `relations` | Drizzle relation definitions |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-tables` | Shared column helpers and patterns |
| `drizzle-orm` | ORM for type-safe database access |

## Usage

### Schema Access

```typescript
import { schema, relations } from "@beep/knowledge-tables";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(pool, { schema: { ...schema }, relations });
```

### Migration Generation

```bash
# Generate migrations from schema changes
bun run db:generate

# Apply migrations
bun run db:migrate
```

## Table Structure

### embedding

| Column | Type | Description |
|--------|------|-------------|
| `id` | `text` | Primary key with `emb_` prefix |
| `organizationId` | `text` | Tenant isolation |
| `content` | `text` | Source content text |
| `embedding` | `vector(1536)` | OpenAI embedding vector |
| `createdAt` | `timestamp` | Creation timestamp |
| `updatedAt` | `timestamp` | Last update timestamp |

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models |
| `@beep/knowledge-server` | Repository implementations |
| `@beep/shared-tables` | Shared column patterns |
