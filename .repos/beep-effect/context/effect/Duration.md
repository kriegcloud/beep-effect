# Module: effect/Duration

> Quick reference for AI agents working with effect/Duration

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Duration.seconds(n)` | Create duration from seconds | `Duration.seconds(30)` |
| `Duration.minutes(n)` | Create duration from minutes | `Duration.minutes(5)` |
| `Duration.hours(n)` | Create duration from hours | `Duration.hours(2)` |
| `Duration.days(n)` | Create duration from days | `Duration.days(1)` |
| `Duration.millis(n)` | Create duration from milliseconds | `Duration.millis(500)` |
| `Duration.toMillis(dur)` | Convert to milliseconds | `Duration.toMillis(Duration.seconds(30))` → `30000` |
| `Duration.toSeconds(dur)` | Convert to seconds | `Duration.toSeconds(Duration.minutes(2))` → `120` |
| `Duration.sum(dur1, dur2)` | Add two durations | `Duration.sum(Duration.seconds(30), Duration.minutes(1))` |
| `Duration.times(dur, n)` | Multiply duration | `Duration.times(Duration.seconds(5), 3)` → `15 seconds` |
| `Duration.greaterThan(a, b)` | Compare durations | `Duration.greaterThan(Duration.minutes(1), Duration.seconds(30))` → `true` |
| `Duration.between(dur, opts)` | Check if duration in range | `Duration.between(dur, { minimum: Duration.seconds(1), maximum: Duration.seconds(10) })` |
| `Duration.min(a, b)` | Return smaller duration | `Duration.min(Duration.seconds(30), Duration.minutes(1))` |
| `Duration.max(a, b)` | Return larger duration | `Duration.max(Duration.seconds(30), Duration.minutes(1))` |
| `Duration.decode(input)` | Parse duration from string | `Duration.decode("30 seconds")` |
| `Duration.zero` | Zero duration constant | `Duration.zero` |
| `Duration.infinity` | Infinite duration constant | `Duration.infinity` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as Duration from "effect/Duration";

// FORBIDDEN - Named imports
import { seconds, minutes } from "effect/Duration";  // WRONG!
```

### Duration Constructors (Most Common)

```typescript
import * as Duration from "effect/Duration";

// Time units
const timeout = Duration.seconds(30);
const delay = Duration.millis(500);
const interval = Duration.minutes(5);
const ttl = Duration.hours(24);

// Convert to milliseconds for native APIs
const timeoutMs = Duration.toMillis(timeout);
setTimeout(() => {}, timeoutMs);

// String parsing (useful for config)
const configDelay = Duration.decode("30 seconds");
const apiTimeout = Duration.decode("5 minutes");
```

### Effect Timeouts

```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// REQUIRED - Use Duration with Effect.timeout
const apiCall = Effect.gen(function* () {
  const response = yield* fetchData();
  return response;
}).pipe(
  Effect.timeout(Duration.seconds(30))
);

// FORBIDDEN - Raw number timeouts
const badTimeout = effect.pipe(Effect.timeout(30000));  // WRONG!
```

### Effect Sleep and Delays

```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// REQUIRED - Use Duration.sleep
const delayedEffect = Effect.gen(function* () {
  yield* Effect.sleep(Duration.seconds(2));
  yield* Effect.log("Executed after delay");
});

// String literal syntax (convenience)
yield* Effect.sleep("3 seconds");
yield* Effect.sleep("100 millis");

// FORBIDDEN - setTimeout or raw numbers
yield* Effect.sleep(3000);  // WRONG! Use Duration
await new Promise(resolve => setTimeout(resolve, 3000));  // WRONG!
```

### Retry Schedules

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

// Retry with exponential backoff
const retryPolicy = Schedule.exponential(
  Duration.millis(100),  // Initial delay
  2.0  // Growth factor
);

// Fixed interval retry
const fixedRetry = Schedule.spaced(Duration.seconds(5));

// Combined schedule with max attempts
const limitedRetry = Schedule.intersect(
  Schedule.exponential(Duration.seconds(1)),
  Schedule.recurs(3)
);
```

### Database Connection Timeouts

From `@beep/shared-server/factories/db-client`:

```typescript
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

// Connection pool config
const pool = new Pg.Pool({
  connectionTimeoutMillis: Duration.toMillis(config.connectTimeout),
  idleTimeoutMillis: Duration.toMillis(config.idleTimeout),
});

// Timeout with custom error
yield* Effect.acquireRelease(
  Effect.tryPromise({
    try: () => pool.query("SELECT 1"),
    catch: (cause) => new DatabaseConnectionLostError({ cause }),
  }),
  (conn) => Effect.promise(() => conn.release())
).pipe(
  Effect.timeoutFail({
    duration: Duration.seconds(5),
    onTimeout: () => new DatabaseConnectionLostError({
      message: "Connection timed out"
    }),
  })
);
```

### Test Timeouts

From `@beep/testkit`:

```typescript
import { layer } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Layer from "effect/Layer";

// Layer-based test with timeout
layer(TestLayer, { timeout: Duration.seconds(60) })("integration suite", (it) => {
  it.effect("fetches data", () =>
    Effect.gen(function* () {
      const result = yield* fetchData();
      strictEqual(result.status, "success");
    })
  );
});

// Extended timeout for slow tests
layer(DbLayer, { timeout: Duration.minutes(5) })("RLS Performance", (it) => {
  // ... performance tests
});
```

### Cache TTL and Eviction

From `@beep/shared-domain/_internal/manual-cache`:

```typescript
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

// Set cache entry expiration
const expireAtMillis = now + Duration.toMillis(timeToLive);

// Periodic cache eviction
const evictionInterval = Duration.millis(
  Math.max(1000, Duration.toMillis(timeToLive))
);

const periodicEviction = Effect.repeat(
  cache.evictExpired(),
  Schedule.fixed(evictionInterval)
);
```

### Duration Arithmetic

```typescript
import * as Duration from "effect/Duration";

// Addition
const total = Duration.sum(
  Duration.minutes(5),
  Duration.seconds(30)
);

// Multiplication
const tripled = Duration.times(Duration.seconds(10), 3);

// Division (returns Option)
const half = Duration.divide(Duration.minutes(1), 2);
// OR unsafe version
const halfUnsafe = Duration.unsafeDivide(Duration.minutes(1), 2);

// Comparison
const isLonger = Duration.greaterThan(
  Duration.minutes(1),
  Duration.seconds(30)
);

// Min/max
const shorter = Duration.min(Duration.seconds(30), Duration.minutes(1));
const longer = Duration.max(Duration.seconds(30), Duration.minutes(1));
```

### Duration in Debounce

From `packages/ui/editor`:

```typescript
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as O from "effect/Option";

const useDebounce = (
  value: T,
  delay: Duration.Duration,
  options?: { maxWait?: Duration.Duration }
) => {
  const delayMs = Duration.toMillis(delay);
  const maxWaitMs = F.pipe(
    O.fromNullable(options?.maxWait),
    O.map(Duration.toMillis),
    O.getOrNull
  );

  // ... debounce implementation
};

// Usage
useDebounce(
  searchValue,
  Duration.millis(300),
  { maxWait: Duration.seconds(1) }
);
```

## Anti-Patterns

### NEVER Use Raw Numbers for Timeouts

```typescript
// FORBIDDEN - Raw numbers
yield* Effect.timeout(effect, 30000);
yield* Effect.sleep(5000);
const pool = new Pg.Pool({ connectionTimeoutMillis: 10000 });

// REQUIRED - Duration constructors
yield* Effect.timeout(effect, Duration.seconds(30));
yield* Effect.sleep(Duration.seconds(5));
const pool = new Pg.Pool({
  connectionTimeoutMillis: Duration.toMillis(Duration.seconds(10))
});
```

### NEVER Use setTimeout/setInterval

```typescript
// FORBIDDEN - Native timers
setTimeout(() => doWork(), 5000);
setInterval(() => poll(), 10000);
await new Promise(resolve => setTimeout(resolve, 1000));

// REQUIRED - Effect.sleep and Effect.repeat
yield* Effect.sleep(Duration.seconds(5));
yield* doWork();

// Repeating effect
yield* Effect.repeat(
  pollEffect,
  Schedule.spaced(Duration.seconds(10))
);
```

### NEVER Mix Duration Types

```typescript
// FORBIDDEN - Mixing milliseconds and Duration
const delay = Duration.millis(500);
const timeout = 30000;  // Raw number!
const total = delay + timeout;  // Type error + semantic confusion

// REQUIRED - Consistent Duration usage
const delay = Duration.millis(500);
const timeout = Duration.seconds(30);
const total = Duration.sum(delay, timeout);
```

### NEVER Forget to Convert for Native APIs

```typescript
// FORBIDDEN - Passing Duration to native API
const timeout = Duration.seconds(30);
setTimeout(callback, timeout);  // Type error! setTimeout expects number

// REQUIRED - Convert to milliseconds
const timeout = Duration.seconds(30);
setTimeout(callback, Duration.toMillis(timeout));
```

### NEVER Use Number.MAX_SAFE_INTEGER

```typescript
// FORBIDDEN - Magic number for "infinite" timeout
const timeout = Number.MAX_SAFE_INTEGER;
const waitForever = 999999999;

// REQUIRED - Duration.infinity
const timeout = Duration.infinity;

// OR use very large but reasonable duration
const longTimeout = Duration.days(365);
```

### NEVER Perform Arithmetic Without Duration Functions

```typescript
// FORBIDDEN - Math operations on milliseconds
const delay1Ms = Duration.toMillis(Duration.seconds(5));
const delay2Ms = Duration.toMillis(Duration.seconds(10));
const totalMs = delay1Ms + delay2Ms;  // Loses type safety
const doubledMs = delay1Ms * 2;

// REQUIRED - Duration arithmetic
const delay1 = Duration.seconds(5);
const delay2 = Duration.seconds(10);
const total = Duration.sum(delay1, delay2);
const doubled = Duration.times(delay1, 2);
```

### NEVER Hardcode String Durations in Logic

```typescript
// FORBIDDEN - String literals everywhere
yield* Effect.sleep("5 seconds");
yield* Effect.sleep("5 seconds");
yield* Effect.sleep("5 seconds");

// REQUIRED - Define as constants
const RETRY_DELAY = Duration.seconds(5);
yield* Effect.sleep(RETRY_DELAY);
yield* Effect.sleep(RETRY_DELAY);
yield* Effect.sleep(RETRY_DELAY);
```

## Related Modules

- **[Effect.md](./Effect.md)** - `Effect.sleep`, `Effect.timeout`, `Effect.repeat` use Duration
- **[Stream.md](./Stream.md)** - Stream scheduling and delays use Duration
- **effect/Schedule** - Retry policies and repeating effects with Duration
- **effect/Clock** - Time-based effects that work with Duration

## Source Reference

[`.repos/effect/packages/effect/src/Duration.ts`](../../.repos/effect/packages/effect/src/Duration.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Duration from "effect/Duration"`
2. **Use constructors** - `Duration.seconds()`, `Duration.minutes()`, etc.
3. **Convert for native APIs** - Use `Duration.toMillis()` for setTimeout, connection pools
4. **String literals** - `Effect.sleep("3 seconds")` is allowed but constants are better
5. **Arithmetic** - Use `Duration.sum()`, `Duration.times()`, not raw math
6. **Timeouts** - Always use Duration with `Effect.timeout`, `Effect.timeoutFail`
7. **Schedules** - Duration powers `Schedule.spaced`, `Schedule.exponential`
8. **Tests** - Use Duration for test timeouts in `layer()` and `effect()`
9. **Infinity** - Use `Duration.infinity` not `Number.MAX_SAFE_INTEGER`
10. **Never** - No `setTimeout`, `setInterval`, or raw number timeouts
