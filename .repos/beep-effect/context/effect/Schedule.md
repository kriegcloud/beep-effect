# Schedule — Agent Context

> Quick reference for AI agents working with `effect/Schedule`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Schedule.exponential` | Exponential backoff | `Schedule.exponential("100 millis", 2.0)` |
| `Schedule.spaced` | Fixed-interval retries | `Schedule.spaced(Duration.seconds(5))` |
| `Schedule.recurs` | Limit retry attempts | `Schedule.recurs(3)` |
| `Schedule.intersect` | Combine schedules (AND) | `Schedule.intersect(expSchedule, recurs)` |
| `Schedule.union` | Combine schedules (OR) | `Schedule.union(schedule1, schedule2)` |
| `Schedule.jittered` | Add randomness to delays | `Schedule.jittered(expSchedule)` |
| `Schedule.once` | Retry once only | `Schedule.once` |
| `Schedule.forever` | Retry indefinitely | `Schedule.forever` |
| `Schedule.stop` | No retry | `Schedule.stop` |
| `Effect.retry` | Retry effect with schedule | `Effect.retry(effect, schedule)` |
| `Effect.retry` (options) | Retry with options object | `Effect.retry(effect, { times: 3 })` |

## Import Convention

```typescript
import * as Schedule from "effect/Schedule";
import * as Effect from "effect/Effect";
```

## Codebase Patterns

### Pattern: Exponential Backoff with Max Retries

Combine exponential delay with retry limit for resilient HTTP calls:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

// From packages/shared/domain/src/Retry.ts
const makeExponentialBackoffPolicy = (options?: {
  delay?: Duration.DurationInput;
  growthFactor?: number;
  jitter?: boolean;
  maxRetries?: number;
}) => {
  const opts = {
    delay: 100,
    growthFactor: 2.0,
    jitter: true,
    maxRetries: 3,
    ...options,
  };

  return Schedule.intersect(
    Schedule.exponential(opts.delay, opts.growthFactor),
    Schedule.recurs(opts.maxRetries)
  ).pipe((policy) => (opts.jitter ? Schedule.jittered(policy) : policy));
};

// Usage: retry API call with backoff
const fetchData = Effect.tryPromise({
  try: () => fetch("https://api.example.com/data"),
  catch: (error) => new NetworkError({ cause: error }),
});

const withRetry = Effect.retry(
  fetchData,
  makeExponentialBackoffPolicy({
    delay: Duration.millis(100),
    maxRetries: 5,
  })
);
```

### Pattern: RPC Client Transient Error Retry

Retry WebSocket reconnections with fixed spacing:

```typescript
import * as Schedule from "effect/Schedule";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as Layer from "effect/Layer";

// From packages/shared/client/src/constructors/RpcClient.ts
export const RpcConfigLive = RpcClient.layerProtocolSocket({
  retryTransientErrors: true,
  retrySchedule: Schedule.spaced("2 seconds"),  // Fixed 2s between reconnects
}).pipe(
  Layer.provide([
    BrowserSocket.layerWebSocket("wss://api.example.com/rpc"),
    RpcSerialization.layerNdjson,
  ])
);
```

### Pattern: HTTP Client Automatic Retries

Retry HTTP requests with exponential backoff until success or max attempts:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { HttpClient } from "@effect/platform";

// From context/platform/HttpClient.md
const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
  Schedule.compose(Schedule.recurs(3))  // Max 3 retries
);

const fetchUser = HttpClient.get("https://api.example.com/user").pipe(
  Effect.retry(retryPolicy)
);
```

### Pattern: Database Connection Pool Acquisition

Retry pool acquisition with fixed spacing:

```typescript
import * as Schedule from "effect/Schedule";
import * as Effect from "effect/Effect";
import * as Pool from "effect/Pool";

// From .repos/effect/packages/effect/test/Pool.test.ts
const getConnection = Effect.scoped(Pool.get(connectionPool));

const withRetry = Effect.retry(
  getConnection,
  { times: 5 }  // Simplified retry syntax
);
```

### Pattern: Flaky Test Stabilization

Use `Effect.retry` with schedules to handle intermittent test failures:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

// From tooling/testkit/src/internal/internal.ts
const retrySchedule = Schedule.intersect(
  Schedule.recurs(10),                    // Max 10 attempts
  Schedule.spaced(Duration.millis(100))   // 100ms between attempts
);

const flakyTest = Effect.gen(function* () {
  // Test logic that may fail intermittently
  const element = yield* findElement("#submit-button");
  return element;
}).pipe(Effect.retry(retrySchedule));
```

### Pattern: Rate Limit Handling with Exponential Backoff

Retry after rate limit errors with increasing delays:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

// From packages/shared/integrations/src/google/gmail/rateLimit.ts
const rateLimitSchedule = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.intersect(Schedule.recurs(5)),
  Schedule.jittered  // Add randomness to prevent thundering herd
);

const callApiWithRateLimit = (operation: Effect.Effect<A, E, R>) =>
  operation.pipe(
    Effect.catchTag("RateLimitError", (error) =>
      Effect.retry(operation, rateLimitSchedule)
    )
  );
```

### Pattern: Schedule Composition for Complex Retry Logic

Combine multiple schedules for sophisticated retry behavior:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";

// From tooling/testkit/test/playwright/playwright.test.ts
const complexRetry = Schedule.intersect(
  Schedule.recurs(maxRetries),              // Stop after N attempts
  Schedule.spaced(Duration.millis(delayMs)) // Fixed spacing
);

// Alternative: Union for "whichever fires first"
const earlyStop = Schedule.union(
  Schedule.recurs(5),                       // Max 5 retries
  Schedule.spaced(Duration.seconds(30))     // OR timeout after 30s total
);
```

### Pattern: Effect.retry Options Object

Use options object for simpler retry configuration:

```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// From .repos/effect/packages/cluster/src/SqlMessageStorage.ts
const storeMessage = Effect.tryPromise({
  try: () => sql.insert(messages).values(message),
  catch: (error) => new StorageError({ cause: error }),
}).pipe(
  Effect.retry({ times: 3 })  // Simple retry count
);

// With conditional retry
const storeWithCondition = Effect.retry(operation, {
  times: 5,
  while: (error) => error._tag === "TransientError",  // Only retry transient errors
});

// With custom schedule
const storeWithSchedule = Effect.retry(operation, {
  schedule: Schedule.exponential("100 millis"),
});
```

## Anti-Patterns

### NEVER: Infinite Retries Without Circuit Breaker

`Schedule.forever` retries indefinitely—use bounded schedules for production:

```typescript
// FORBIDDEN - Retries forever, can exhaust resources
const riskyOperation = Effect.retry(
  fetchData,
  Schedule.forever
);

// CORRECT - Bounded retries with exponential backoff
const safeOperation = Effect.retry(
  fetchData,
  Schedule.intersect(
    Schedule.exponential("100 millis"),
    Schedule.recurs(10)  // Stop after 10 attempts
  )
);
```

### NEVER: Fixed Short Delays for External Services

Short fixed delays cause thundering herd on service recovery:

```typescript
// FORBIDDEN - All clients retry simultaneously
const badRetry = Effect.retry(
  apiCall,
  Schedule.spaced(Duration.millis(100))  // No backoff, no jitter
);

// CORRECT - Exponential backoff with jitter
const goodRetry = Effect.retry(
  apiCall,
  Schedule.exponential(Duration.millis(100)).pipe(
    Schedule.intersect(Schedule.recurs(5)),
    Schedule.jittered  // Randomize delays
  )
);
```

### NEVER: Retry Non-Idempotent Operations Unconditionally

Only retry if the operation is safe to repeat:

```typescript
// FORBIDDEN - May charge customer multiple times
const chargeCustomer = Effect.retry(
  processPayment,
  Schedule.recurs(3)  // Non-idempotent operation!
);

// CORRECT - Add idempotency key or conditional retry
const chargeCustomerSafely = Effect.retry(processPayment, {
  times: 3,
  while: (error) => error._tag === "NetworkError",  // Only retry network failures
});
```

### NEVER: Ignore Schedule Output Type

Schedules produce outputs (`Out`) that may be useful for logging/metrics:

```typescript
// FORBIDDEN - Losing schedule metadata
Effect.retry(operation, Schedule.exponential("100 millis"));

// CORRECT - Capture retry metadata
Effect.retry(operation, {
  schedule: Schedule.exponential("100 millis").pipe(
    Schedule.intersect(Schedule.elapsed)  // Tracks total elapsed time
  ),
}).pipe(
  Effect.tap(([result, elapsed]) =>
    Effect.log(`Operation completed after ${elapsed}ms`)
  )
);
```

### NEVER: Mix Schedule.recurs with Effect.retry({ times })

These are equivalent—using both causes confusion:

```typescript
// FORBIDDEN - Redundant retry limits (which one wins?)
Effect.retry(operation, {
  times: 5,
  schedule: Schedule.recurs(3),  // Confusing!
});

// CORRECT - Use one approach
Effect.retry(operation, { times: 5 });
// OR
Effect.retry(operation, Schedule.recurs(5));
```

### NEVER: Forget Jitter for High-Traffic Services

Without jitter, synchronized retries cause load spikes:

```typescript
// FORBIDDEN - All clients retry at same intervals
const noJitter = Schedule.exponential("1 second").pipe(
  Schedule.intersect(Schedule.recurs(3))
);

// CORRECT - Add jitter to spread retries
const withJitter = Schedule.exponential("1 second").pipe(
  Schedule.intersect(Schedule.recurs(3)),
  Schedule.jittered  // +/- random variance
);
```

## Related Modules

- [Duration](../effect/Duration.md) — `Schedule.spaced`, `Schedule.exponential` use `Duration` for time values
- [Effect](../effect/Effect.md) — `Effect.retry` is the primary consumer of schedules
- [HttpClient](../platform/HttpClient.md) — HTTP clients often configure retry schedules

## Source Reference

[.repos/effect/packages/effect/src/Schedule.ts](../../.repos/effect/packages/effect/src/Schedule.ts)
