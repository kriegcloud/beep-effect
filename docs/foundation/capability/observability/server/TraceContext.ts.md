---
title: TraceContext.ts
nav_order: 20
parent: "@beep/observability"
---

## TraceContext.ts overview

HTTP trace context extraction and injection helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [observability](#observability)
  - [extractTraceContextHeaders](#extracttracecontextheaders)
  - [injectTraceContextHeaders](#injecttracecontextheaders)
  - [withIncomingTraceContext](#withincomingtracecontext)
---

# observability

## extractTraceContextHeaders

Extract an incoming parent span from trace headers.

**Example**

```ts
```typescript
import { extractTraceContextHeaders } from "@beep/observability/server"

const parentSpan = extractTraceContextHeaders({ traceparent: "00-abc-def-01" })
console.log(parentSpan)
```
```

**Signature**

```ts
declare const extractTraceContextHeaders: (headers?: Headers.Input) => O.Option<Tracer.ExternalSpan>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/TraceContext.ts#L31)

Since v0.0.0

## injectTraceContextHeaders

Inject the current Effect span into outbound trace headers.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { injectTraceContextHeaders } from "@beep/observability/server"

const program = injectTraceContextHeaders().pipe(
  Effect.map((headers) => headers)
)
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const injectTraceContextHeaders: (headers?: Headers.Input | undefined) => Effect.Effect<Headers.Headers, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/TraceContext.ts#L53)

Since v0.0.0

## withIncomingTraceContext

Runs an Effect with trace context extracted from incoming headers.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { withIncomingTraceContext } from "@beep/observability/server"

const program = withIncomingTraceContext(
  Effect.succeed("ok"),
  { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ca902c7-00" }
)
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const withIncomingTraceContext: { <A, E, R>(effect: Effect.Effect<A, E, R>, headers: Headers.Input | undefined): Effect.Effect<A, E, R>; <A, E, R>(headers: Headers.Input | undefined, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; (headers: Headers.Input | undefined): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/TraceContext.ts#L114)

Since v0.0.0