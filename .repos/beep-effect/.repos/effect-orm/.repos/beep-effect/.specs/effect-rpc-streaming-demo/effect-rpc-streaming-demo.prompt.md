---
name: effect-rpc-streaming-demo
version: 3
created: 2025-12-10T12:00:00Z
iterations: 2
---

# Effect RPC Streaming Demo - Refined Prompt

## Context

This is the `beep-effect` monorepo — a Bun-managed, Effect-first full-stack application with:
- `apps/web` — Next.js 15 App Router frontend (React 19)
- `apps/server` — Effect Platform backend

**Existing Patterns Discovered:**

1. **API Route Pattern** (`apps/web/src/app/api/v1/auth/[...all]/route.ts`):
```typescript
import { runServerPromise } from "@beep/runtime-server";
const program = Effect.map(AuthService, ({ auth }) => auth.handler);
const route = async (req: Request) => {
  const handler = await runServerPromise(program, "auth.route");
  return handler(req);
};
export const POST = route;
export const GET = route;
```

2. **Existing RpcGroup** (`apps/web/src/app/upload/_lib/atoms/internal/image-compression-rpc.ts`):
```typescript
export class ImageCompressionRpc extends RpcGroup.make(
  Rpc.make("compress", {
    success: S.Struct({ data: S.Uint8Array, mimeType: S.String }),
    payload: S.Struct({ data: S.Uint8Array, mimeType: S.String, fileName: S.String, maxSizeMB: S.Number }),
  })
) {}
```

3. **Client Runtime** uses `FetchHttpClient.layer` and `ManagedRuntime` pattern.

4. **Server Runtime** uses `runServerPromise(effect, "span.name")` for all operations.

**Note:** The existing `ImageCompressionRpc` is a non-streaming worker-based RPC. This demo creates a separate HTTP-based streaming RPC to demonstrate the `@effect/rpc` streaming pattern over HTTP with NDJSON transport.

## Objective

Create a minimal end-to-end demonstration of `@effect/rpc` with streaming support in `apps/web`:

1. **Define an RpcGroup** with exactly one streaming method called `countdown` that emits tick events over time
2. **Create a Next.js App Router API route** (`/api/v1/rpc-demo/[...rpc]/route.ts`) that serves the RPC handler
3. **Create a test page** (`/rpc-demo/page.tsx`) that:
   - Uses `@effect/platform` HttpClient to connect to the RPC endpoint
   - Displays streaming events as they arrive in real-time
   - Shows connection state and any errors

**Success Criteria:**
- Page loads and connects to RPC endpoint
- Streaming events appear incrementally (not all at once) with ~delayMs spacing
- Clean disconnection/cleanup on unmount via Fiber interruption
- Type-safe end-to-end (schemas shared between client and server)
- Stream handles edge case when `from <= 0` (completes immediately with just "complete" event)

## Role

You are an Effect-TS expert implementing streaming RPC patterns. You understand:
- Effect's streaming primitives (`Stream`, `Sink`, `Channel`)
- `@effect/rpc` module architecture (RpcGroup, RpcRouter, RpcServer, RpcClient)
- Next.js App Router conventions (route handlers, server/client components)
- The beep-effect monorepo's Effect-first architecture

## Constraints

### Effect-First Requirements (from AGENTS.md)

1. **No `async/await`** in application code — use `Effect.gen()` and `Effect.tryPromise()`
2. **No native Array methods** — use `A.map`, `A.filter`, `A.fromIterable` etc.
3. **No native String methods** — use `Str.split`, `Str.trim` etc.
4. **No native Date** — use `effect/DateTime` (e.g., `DateTime.unsafeNow()`, `DateTime.formatIso()`)
5. **Namespace imports required**:
```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Option from "effect/Option";
import * as Fiber from "effect/Fiber";
import * as DateTime from "effect/DateTime";
```

### RPC Streaming Requirements

1. **NDJSON serialization is mandatory** for streaming — use `RpcSerialization.layerNdjson`
2. **Streaming RPCs** must specify `stream: true` in `Rpc.make` options
3. **Handlers for streaming RPCs** return `Stream<Success, Error, Context>`, not `Effect`
4. **Use `RpcServer.toWebHandler`** to create Next.js-compatible handlers
5. **Use `RpcClient.layerProtocolHttp`** for HTTP-based client protocol

### Error Handling

For this minimal demo, use `error: S.Never` since the countdown operation cannot fail. In production RPCs with fallible operations, define tagged errors using `S.TaggedError`:
```typescript
class StreamTimeout extends S.TaggedError<StreamTimeout>()("StreamTimeout", {
  message: S.String,
}) {}

class StreamCancelled extends S.TaggedError<StreamCancelled>()("StreamCancelled", {}) {}

// Then use in RPC definition:
const StreamError = S.Union(StreamTimeout, StreamCancelled);
```

### Monorepo Conventions

1. **Span naming**: Use `"rpc-demo.operation"` pattern for all `runServerPromise` calls
2. **Environment**: Use `@beep/shared-server` for any env access (though not needed for this demo)
3. **No-ops**: Use `noOp`, `nullOp`, `nullOpE` from `@beep/utils` instead of inline arrow functions
4. **PascalCase constructors**: `S.Struct`, `S.String`, `S.Number` (never lowercase)
5. **File size limit**: Each file should be < 100 LOC. This is a minimal demonstration, not a production feature.

### File Placement

- RPC definition: `apps/web/src/app/api/v1/rpc-demo/_lib/rpc.ts`
- RPC handlers: `apps/web/src/app/api/v1/rpc-demo/_lib/handlers.ts`
- RPC client service: `apps/web/src/app/api/v1/rpc-demo/_lib/client.ts`
- Route handler: `apps/web/src/app/api/v1/rpc-demo/[...rpc]/route.ts`
- Test page: `apps/web/src/app/rpc-demo/page.tsx`

## Resources

### Files to Read/Reference

| File                                                                   | Purpose                             |
|------------------------------------------------------------------------|-------------------------------------|
| `apps/web/src/app/api/v1/auth/[...all]/route.ts`                       | Route handler pattern               |
| `apps/web/src/app/upload/_lib/atoms/internal/image-compression-rpc.ts` | RpcGroup definition pattern         |
| `packages/runtime/server/src/Runtime.ts`                               | `runServerPromise` usage            |
| `packages/runtime/client/src/services/runtime/live-layer.ts`           | Client HttpClient setup             |
| `docs/research/rpc-streaming-nextjs-research.md`                       | Full @effect/rpc streaming research |

### Documentation to Consult

- Effect RPC docs via `mcp__effect_docs__effect_docs_search` for: "RpcGroup", "Rpc.stream", "RpcServer", "RpcClient"
- Effect Stream docs for streaming patterns

## Output Specification

### File 1: RPC Definition (`apps/web/src/app/api/v1/rpc-demo/_lib/rpc.ts`)

```typescript
// Shared RPC group definition with streaming method
// - Define event schema (discriminated union with _tag)
// - Define payload schema
// - Create RpcGroup class with stream: true
// - Export for use by both server and client
```

**Required exports:**
- `DemoEvent` — Schema for stream events (union type)
- `DemoRpcs` — RpcGroup class

### File 2: RPC Handlers (`apps/web/src/app/api/v1/rpc-demo/_lib/handlers.ts`)

```typescript
// Server-side implementation returning Stream
// - Import RpcGroup from ./rpc
// - Create Layer with handlers
// - Each streaming handler returns Stream<Event, Error>
```

**Required exports:**
- `DemoRpcsLive` — Layer providing handler implementations

### File 3: RPC Client Service (`apps/web/src/app/api/v1/rpc-demo/_lib/client.ts`)

```typescript
// Client service definition
// - Use BrowserHttpClient (not FetchHttpClient) for browser environment
// - Create Effect.Service with scoped RpcClient.make
// - Provide NDJSON serialization layer
```

**Required exports:**
- `DemoRpcClient` — Effect.Service class with `.Default` layer

### File 4: Route Handler (`apps/web/src/app/api/v1/rpc-demo/[...rpc]/route.ts`)

```typescript
// Next.js App Router handler
// - Use RpcServer.toWebHandler
// - Provide NDJSON serialization layer
// - Export POST handler (and optionally GET for health check)
```

**Required exports:**
- `POST` — Route handler function

### File 5: Test Page (`apps/web/src/app/rpc-demo/page.tsx`)

```typescript
// Client component ("use client")
// - Use DemoRpcClient service with Effect.scoped
// - Display streaming events in real-time
// - Show loading/error states
// - Handle cleanup on unmount via Fiber.interrupt
```

**UI Requirements:**
- "Start Stream" button to initiate connection
- "Stop Stream" button to cancel
- Event list showing each event as it arrives (use `<ul>`, `<li>` for semantic HTML)
- Status indicator (idle/streaming/complete/error)
- Minimal styling (can use existing Tailwind classes)

## Examples

### Streaming RpcGroup Definition

```typescript
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";

// Event union for stream
export const DemoEvent = S.Union(
  S.Struct({ _tag: S.Literal("tick"), value: S.Number, timestamp: S.String }),
  S.Struct({ _tag: S.Literal("message"), text: S.String }),
  S.Struct({ _tag: S.Literal("complete") })
);
export type DemoEvent = S.Schema.Type<typeof DemoEvent>;

// RpcGroup with streaming method
export class DemoRpcs extends RpcGroup.make(
  Rpc.make("countdown", {
    payload: S.Struct({ from: S.Number, delayMs: S.Number }),
    success: DemoEvent,
    error: S.Never,
    stream: true,
  })
) {}
```

### Streaming Handler Implementation

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Option from "effect/Option";
import * as F from "effect/Function";
import * as DateTime from "effect/DateTime";
import { DemoRpcs, type DemoEvent } from "./rpc";

export const DemoRpcsLive = DemoRpcs.toLayer(
  Effect.succeed({
    countdown: ({ from, delayMs }) =>
      F.pipe(
        Stream.unfold(from, (n) =>
          n > 0
            ? Option.some([
                {
                  _tag: "tick" as const,
                  value: n,
                  timestamp: F.pipe(DateTime.unsafeNow(), DateTime.formatIso),
                },
                n - 1,
              ])
            : Option.none()
        ),
        Stream.tap(() => Effect.sleep(`${delayMs} millis`)),
        Stream.concat(Stream.succeed({ _tag: "complete" as const }))
      ),
  })
);
```

### Next.js Route Handler

```typescript
import * as RpcServer from "@effect/rpc/RpcServer";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as Layer from "effect/Layer";
import { DemoRpcs } from "../_lib/rpc";
import { DemoRpcsLive } from "../_lib/handlers";

const { handler } = RpcServer.toWebHandler(DemoRpcs, {
  layer: Layer.mergeAll(DemoRpcsLive, RpcSerialization.layerNdjson),
});

export const POST = handler;
```

### RPC Client Service Definition

Define the client as an `Effect.Service` with `BrowserHttpClient`:

```typescript
// In apps/web/src/app/api/v1/rpc-demo/_lib/client.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import { BrowserHttpClient } from "@effect/platform-browser";
import { DemoRpcs } from "./rpc";

const RpcConfigLive = RpcClient.layerProtocolHttp({
  url: "/api/v1/rpc-demo",
}).pipe(
  Layer.provide(
    Layer.mergeAll(BrowserHttpClient.layerXMLHttpRequest, RpcSerialization.layerNdjson)
  )
);

export class DemoRpcClient extends Effect.Service<DemoRpcClient>()(
  "@beep/DemoRpcClient",
  {
    dependencies: [RpcConfigLive],
    scoped: RpcClient.make(DemoRpcs),
  }
) {}
```

### Client Component Pattern (Complete)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Fiber from "effect/Fiber";
import { DemoRpcClient } from "../api/v1/rpc-demo/_lib/client";
import { type DemoEvent } from "../api/v1/rpc-demo/_lib/rpc";

type Status = "idle" | "streaming" | "complete" | "error";

export default function RpcDemoPage() {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const fiberRef = useRef<Fiber.RuntimeFiber<void, never> | null>(null);

  const startStream = (from: number, delayMs: number) => {
    setEvents([]);
    setStatus("streaming");
    setError(null);

    const program = Effect.gen(function* () {
      const client = yield* DemoRpcClient;
      yield* client.countdown({ from, delayMs }).pipe(
        Stream.tap((event) =>
          Effect.sync(() => {
            setEvents((prev) => [...prev, event]);
            if (event._tag === "complete") {
              setStatus("complete");
            }
          })
        ),
        Stream.runDrain
      );
    }).pipe(
      Effect.scoped,
      Effect.provide(DemoRpcClient.Default),
      Effect.catchAll((e) =>
        Effect.sync(() => {
          setError(String(e));
          setStatus("error");
        })
      )
    );

    fiberRef.current = Effect.runFork(program);
  };

  const stopStream = () => {
    if (fiberRef.current) {
      Effect.runFork(Fiber.interrupt(fiberRef.current));
      fiberRef.current = null;
      setStatus("idle");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fiberRef.current) {
        Effect.runFork(Fiber.interrupt(fiberRef.current));
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">RPC Streaming Demo</h1>
      {/* ... rest of UI */}
    </div>
  );
}
```

## Common Pitfalls

| Symptom                       | Cause                            | Solution                                                        |
|-------------------------------|----------------------------------|-----------------------------------------------------------------|
| Events arrive all at once     | Missing delay in stream          | Ensure `Stream.tap(() => Effect.sleep(...))` is present         |
| Connection closes immediately | NDJSON layer missing on one side | Verify `RpcSerialization.layerNdjson` on both server AND client |
| Type errors at compile time   | Schema mismatch                  | Ensure client imports schemas from same file as server          |
| Stream never completes        | Missing terminal event           | Ensure `Stream.concat(Stream.succeed({ _tag: "complete" }))`    |
| Cleanup not working           | Fiber reference lost             | Store fiber in `useRef`, not state                              |

## Verification Checklist

### Functionality
- [ ] RpcGroup defines exactly one streaming method `countdown` with `stream: true`
- [ ] Handler returns `Stream`, not `Effect`
- [ ] NDJSON serialization layer provided on both server and client
- [ ] Route handler exports `POST` function
- [ ] Client page successfully connects and receives events
- [ ] Events display incrementally (not batched)
- [ ] Stream can be cancelled/stopped via Fiber.interrupt
- [ ] Edge case: `from <= 0` completes immediately with just "complete" event

### Effect Compliance
- [ ] No `async/await` in Effect code (only in Next.js route wrapper)
- [ ] No native Array/String/Date methods
- [ ] Namespace imports used throughout
- [ ] PascalCase Schema constructors
- [ ] Uses `DateTime.unsafeNow()` and `DateTime.formatIso()` for timestamps
- [ ] Client uses `Effect.Service` pattern with `scoped: RpcClient.make(...)`
- [ ] Client uses `BrowserHttpClient.layer` (not `FetchHttpClient`)

### Code Quality
- [ ] TypeScript compiles with `strict: true` and no `@ts-expect-error`
- [ ] Schemas shared between client and server (single source of truth)
- [ ] Proper cleanup/disposal on component unmount via Fiber.interrupt
- [ ] Error states handled gracefully
- [ ] Each file < 100 LOC (5 files total)

### Integration
- [ ] All 5 files placed in correct locations per monorepo conventions
- [ ] No circular dependencies introduced
- [ ] Compatible with existing `apps/web` build pipeline
- [ ] Browser DevTools shows NDJSON format (line-separated JSON, not single array)

### Manual Test Plan
1. Start stream with `from=5, delayMs=500` — verify first event within 550ms
2. Stop stream mid-countdown — verify cleanup (no more events, status changes)
3. Start stream with `from=0` — verify immediate completion
4. Refresh page during stream — verify no console errors

---

## Metadata

### Research Sources
- **Files explored:**
  - `apps/web/src/app/api/v1/auth/[...all]/route.ts`
  - `apps/web/src/app/api/v1/iam/[...iam]/route.ts`
  - `apps/web/src/app/upload/_lib/atoms/internal/image-compression-rpc.ts`
  - `packages/runtime/server/src/Runtime.ts`
  - `packages/runtime/client/src/services/runtime/live-layer.ts`

- **Documentation consulted:**
  - @effect/rpc streaming patterns
  - RpcServer.toWebHandler API
  - RpcClient.layerProtocolHttp API
  - RpcSerialization.layerNdjson requirement

- **AGENTS.md files:**
  - `apps/web/AGENTS.md`
  - `packages/runtime/client/AGENTS.md`
  - `packages/runtime/server/AGENTS.md`
  - `packages/common/contract/AGENTS.md`
  - `packages/shared/client/AGENTS.md`

### Refinement History
| Iteration | Issues Found                  | Fixes Applied                                                                                                                                                                                   |
|-----------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0         | Initial                       | N/A                                                                                                                                                                                             |
| 1         | 2 HIGH, 3 MEDIUM, 3 LOW       | Fixed: native Date → DateTime, added Option/Fiber imports, complete cancellation pattern, error schema guidance, explicit scope, NDJSON verification, common pitfalls section, manual test plan |
| 2         | User review: 2 pattern issues | Fixed: StreamError uses S.TaggedError instead of plain structs; RpcClient uses BrowserHttpClient + Effect.Service pattern with scoped; added client.ts file to output spec                      |
