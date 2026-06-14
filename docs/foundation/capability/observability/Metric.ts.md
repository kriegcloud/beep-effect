---
title: Metric.ts
nav_order: 9
parent: "@beep/observability"
---

## Metric.ts overview

Effect metric observation helpers for duration tracking, workflow profiling,
and HTTP request instrumentation.

All helpers wrap an inner `Effect` and transparently record metrics and span
annotations without altering the original success/failure semantics.

**Example**

```ts
```typescript
import { Effect, Metric, Duration } from "effect"
import { measureElapsedMillis, trackDuration } from "@beep/observability"

const timer = Metric.timer("my_op_duration")

const program = trackDuration(Effect.succeed("ok"), timer)

console.log(Effect.runPromise(program))
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [observeHttpRequest](#observehttprequest)
  - [observeWorkflow](#observeworkflow)
  - [trackDuration](#trackduration)
- [utilities](#utilities)
  - [statusClass](#statusclass)
---

# observability

## measureElapsedMillis

Measure wall-clock elapsed milliseconds for an effect.

Returns a tuple of `[result, elapsedMs]` without altering the inner
effect's success or failure semantics.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { measureElapsedMillis } from "@beep/observability"

const program = measureElapsedMillis(
  Effect.succeed("ok")
).pipe(
  Effect.map(([value, elapsedMs]) => ({ value, elapsedMs }))
)

console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const measureElapsedMillis: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<readonly [A, number], E, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Metric.ts#L126)

Since v0.0.0

## observeHttpRequest

Observes HTTP request duration and status metrics for an Effect.

**Example**

```ts
```typescript
import { Effect, Metric } from "effect"
import { observeHttpRequest } from "@beep/observability"

const program = observeHttpRequest(Effect.succeed("ok"), {
  method: "GET",
  requestDuration: Metric.timer("http_request_duration"),
  requestsTotal: Metric.counter("http_requests_total"),
  route: "/health",
  successStatus: 200
})
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const observeHttpRequest: { <A, E extends { readonly status: number; }, R>(effect: Effect.Effect<A, E, R>, options: ObserveHttpRequestOptions): Effect.Effect<A, E, R>; <A, E extends { readonly status: number; }, R>(options: ObserveHttpRequestOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; (options: ObserveHttpRequestOptions): <A, E extends { readonly status: number; }, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Metric.ts#L487)

Since v0.0.0

## observeWorkflow

Observes workflow duration and outcome metrics for an Effect.

**Example**

```ts
```typescript
import { Effect, Metric } from "effect"
import { observeWorkflow } from "@beep/observability"

const program = observeWorkflow(Effect.succeed("ok"), {
  completed: Metric.counter("workflow_completed_total"),
  name: "demo"
})
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const observeWorkflow: { <A, E, R>(effect: Effect.Effect<A, E, R>, options: ObserveWorkflowOptions): Effect.Effect<A, E, R>; <A, E, R>(options: ObserveWorkflowOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; (options: ObserveWorkflowOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Metric.ts#L339)

Since v0.0.0

## trackDuration

Tracks the elapsed duration of an Effect with a metric.

**Example**

```ts
```typescript
import { Effect, Metric } from "effect"
import { trackDuration } from "@beep/observability"

const timer = Metric.timer("task_duration")
const program = trackDuration(Effect.succeed("ok"), timer)
console.log(Effect.runPromise(program))
```
```

**Signature**

```ts
declare const trackDuration: { <A, E, R>(effect: Effect.Effect<A, E, R>, metric: Metric.Metric<Duration.Duration, unknown>, options: TrackDurationOptions): Effect.Effect<A, E, R>; <A, E, R>(effect: Effect.Effect<A, E, R>, metric: Metric.Metric<Duration.Duration, unknown>): Effect.Effect<A, E, R>; (metric: Metric.Metric<Duration.Duration, unknown>, options: TrackDurationOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; (metric: Metric.Metric<Duration.Duration, unknown>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; <A, E, R>(metric: Metric.Metric<Duration.Duration, unknown>, effect: Effect.Effect<A, E, R>, attributes?: Record<string, string>): Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Metric.ts#L203)

Since v0.0.0

# utilities

## statusClass

Normalize an HTTP status code to its class label (e.g. `"2xx"`, `"4xx"`).

Returns `"unknown"` for status codes outside the 100-599 range.

**Example**

```ts
```typescript
import { statusClass } from "@beep/observability"

console.log(statusClass(200)) // "2xx"
console.log(statusClass(404)) // "4xx"
console.log(statusClass(503)) // "5xx"
console.log(statusClass(999)) // "unknown"
```
```

**Signature**

```ts
declare const statusClass: (status: number) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/Metric.ts#L93)

Since v0.0.0