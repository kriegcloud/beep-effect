---
path: packages/knowledge/client
summary: Client SDK for knowledge graphs - RPC contracts, type-safe handlers for GraphRAG and extraction
tags: [knowledge, client, effect, rpc, sdk, browser]
---

# @beep/knowledge-client

Client-side SDK for the knowledge graph vertical providing RPC type definitions and Effect-based handlers for knowledge extraction and query operations. Browser-safe package consumed by web applications for type-safe client-server communication.

## Architecture

```
|-------------------|     |-------------------|
|    Contracts      | --> |     Handlers      |
| (RPC schemas)     |     | (Effect-based)    |
|-------------------|     |-------------------|
         |
         v
|-------------------|
|   Type Exports    |
| (Domain types)    |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `contracts/` | RPC schema definitions for knowledge operations |
| `handlers/` | Effect-based client handlers for API calls |
| `index.ts` | Barrel export for client consumption |

## Usage Patterns

### Querying Knowledge Graph

```typescript
import * as Effect from "effect/Effect";
import { KnowledgeContract } from "@beep/knowledge-client";

const queryKnowledgeGraph = (query: string) =>
  Effect.gen(function* () {
    const client = yield* KnowledgeContract.Client;
    const results = yield* client.search({ query, limit: 10 });
    return results;
  });
```

### Using with React

```typescript
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { runPromise } from "@beep/common-client";
import { KnowledgeContract } from "@beep/knowledge-client";

export const useKnowledgeSearch = (query: string) => {
  return useQuery({
    queryKey: ["knowledge", "search", query],
    queryFn: () => runPromise(
      Effect.gen(function* () {
        const client = yield* KnowledgeContract.Client;
        return yield* client.search({ query, limit: 20 });
      })
    ),
  });
};
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect-based handlers | Consistent error handling and composability |
| No server imports | Package must remain browser-safe |
| Contract-first | Server implements contracts defined here for type safety |
| RPC patterns | Structured request/response with schema validation |

## Dependencies

**Internal**: None (browser-safe isolation)

**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **@beep/knowledge-server** - Server implementing these contracts
- **@beep/knowledge-ui** - UI components consuming this client
