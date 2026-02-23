# @beep/knowledge-client

Client-side contracts and handlers for knowledge graph operations.

## Overview

This package provides the client API surface for knowledge operations:
- RPC type definitions for extraction and query
- Effect-based handlers for client-side operations
- Type-safe client-server communication contracts

## Installation

```bash
bun add @beep/knowledge-client
```

## Key Exports

| Export | Description |
|--------|-------------|
| `KnowledgeContract` | RPC contract definitions |
| Handlers | Effect-based operation handlers |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain entities and types |
| `effect` | Core Effect runtime |
| `@effect/rpc` | RPC contract definitions |

## Usage

```typescript
import * as Effect from "effect/Effect";
import { KnowledgeContract } from "@beep/knowledge-client";

const searchKnowledge = (query: string) =>
  Effect.gen(function* () {
    const client = yield* KnowledgeContract.Client;
    const results = yield* client.search({ query, limit: 10 });
    return results;
  });
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models |
| `@beep/knowledge-server` | Server implementation |
| `@beep/knowledge-ui` | UI components |
