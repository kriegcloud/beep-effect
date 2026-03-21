# Domain Package AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Purpose

Shared schemas, types, and RPC definitions used by both client and server.

## Schema Patterns

```typescript
// 1. Branded types for type-safe IDs
export const ClientId = Schema.String.pipe(Schema.brand("ClientId"));

// 2. Literal unions for enums
export const ClientStatus = Schema.Literal("online", "away", "busy");
export type ClientStatus = Schema.Schema.Type<typeof ClientStatus>;

// 3. Struct schemas with type export
export const ClientInfo = Schema.Struct({
  clientId: ClientId,
  status: ClientStatus,
  connectedAt: Schema.Number,
});
export type ClientInfo = Schema.Schema.Type<typeof ClientInfo>;

// 4. Tagged unions for events (discriminated by _tag)
export const MyEvent = Schema.Union(
  Schema.TaggedStruct("started", { timestamp: Schema.Number }),
  Schema.TaggedStruct("completed", { result: Schema.String }),
  Schema.TaggedStruct("failed", { error: Schema.String })
);
```

## Type Export Convention

```typescript
// Always export both schema and type for shared types
export const MySchema = Schema.Struct({
  /* ... */
});
export type MySchema = Schema.Schema.Type<typeof MySchema>;

// For inline usage (not exported): typeof Schema.Type
const data: typeof ApiResponse.Type = { message: "Hello", success: true };
```

## RPC Definition Pattern

```typescript
// HTTP API endpoints
export class HelloGroup extends HttpApiGroup.make("hello")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(ApiResponse))
  .prefix("/hello") {}

export const Api = HttpApi.make("Api").add(HelloGroup);

// RPC groups (streaming or request/response)
export class EventRpc extends RpcGroup.make(
  Rpc.make("tick", {
    payload: Schema.Struct({ ticks: Schema.Number }),
    success: TickEvent,
    stream: true, // Enable streaming
  })
) {}
```

## File Organization

```
src/
├── Api.ts       # HttpApi definitions (REST endpoints)
├── Rpc.ts       # RPC definitions (HTTP streaming)
└── WebSocket.ts # WebSocket RPC definitions (real-time)
```

## Import Pattern

```typescript
// From other workspaces, import with subpath
import { Api, type ApiResponse } from "@repo/domain/Api";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import { WebSocketRpc, type ClientInfo } from "@repo/domain/WebSocket";

// Use 'type' keyword for type-only imports
import type { ClientStatus } from "@repo/domain/WebSocket";
```

## Naming Conventions

| Element       | Convention                | Example           |
| ------------- | ------------------------- | ----------------- |
| Schemas       | PascalCase                | `ClientInfo`      |
| Types         | Same as schema            | `type ClientInfo` |
| Branded types | PascalCase noun           | `ClientId`        |
| Events        | PascalCase + Event suffix | `WebSocketEvent`  |
| RPC groups    | PascalCase + Rpc suffix   | `EventRpc`        |
| API groups    | PascalCase + Group suffix | `HelloGroup`      |

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
