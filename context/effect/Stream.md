# Stream — Agent Context

> Best practices for using `effect/Stream` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Stream.make(...)` | Create from values | `Stream.make(1, 2, 3)` |
| `Stream.fromIterable(iter)` | Create from iterable | `Stream.fromIterable(array)` |
| `Stream.fromEffect(eff)` | Create from Effect | `Stream.fromEffect(fetchUser)` |
| `Stream.fromPubSub(pubSub)` | Create from PubSub | `Stream.fromPubSub(eventPubSub)` |
| `Stream.map(stream, fn)` | Transform elements | `Stream.map(users, u => u.name)` |
| `Stream.filter(stream, pred)` | Filter elements | `Stream.filter(items, i => i.active)` |
| `Stream.flatMap(stream, fn)` | Chain streams | `Stream.flatMap(ids, fetchUser)` |
| `Stream.runCollect(stream)` | Collect all elements | `Stream.runCollect(stream)` → `Effect<Chunk<T>>` |
| `Stream.runForEach(stream, fn)` | Process each element | `Stream.runForEach(stream, console.log)` |
| `Stream.tap(stream, fn)` | Side effects | `Stream.tap(events, logEvent)` |
| `Stream.take(stream, n)` | Take first N | `Stream.take(stream, 10)` |
| `Stream.unwrap(eff)` | Flatten Effect<Stream> | `Stream.unwrap(makeStream)` |
| `Stream.scan(stream, init, fn)` | Stateful accumulation | `Stream.scan(events, state, reducer)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as Stream from "effect/Stream";

// FORBIDDEN - Named imports
import { make, map } from "effect/Stream";  // WRONG!
```

### When to Use Stream vs Array

**Use Stream when:**
- Processing large datasets that don't fit in memory
- Working with async/real-time data (SSE, WebSocket, file changes)
- Processing data in chunks/batches
- Infinite sequences (event streams, polling)

**Use Array when:**
- Small, finite datasets already in memory
- Need random access to elements
- Simple transformations without I/O

```typescript
// WRONG - Loading large dataset into memory
import * as A from "effect/Array";
const allRecords = yield* repo.findAll();  // Could be millions!
const processed = A.map(allRecords, process);

// REQUIRED - Stream for large datasets
import * as Stream from "effect/Stream";
const recordStream = repo.findAllStream();
yield* Stream.pipe(
  recordStream,
  Stream.map(process),
  Stream.runForEach(save)
);
```

### Create Streams

```typescript
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";

// From values
const numbers = Stream.make(1, 2, 3, 4, 5);

// From array
const items = Stream.fromIterable([1, 2, 3]);

// From Effect
const userStream = Stream.fromEffect(
  Effect.gen(function* () {
    const user = yield* fetchUser(id);
    return user;
  })
);

// From PubSub (for SSE/events)
const eventStream = Stream.fromPubSub(eventPubSub);

// Unwrap Effect<Stream>
const stream = Stream.unwrap(
  Effect.gen(function* () {
    const config = yield* Config;
    return Stream.fromIterable(config.items);
  })
);
```

### Transform Streams

```typescript
import * as Stream from "effect/Stream";
import * as F from "effect/Function";

const processedStream = F.pipe(
  inputStream,
  Stream.map(item => item.value),
  Stream.filter(value => value > 0),
  Stream.map(value => value * 2)
);
```

### Chain Effectful Operations

```typescript
import * as Stream from "effect/Stream";

// flatMap for operations that return Effects
const enrichedStream = Stream.flatMap(userIds, (id) =>
  Stream.fromEffect(fetchUserDetails(id))
);

// Parallel processing
const enrichedStream = Stream.flatMap(
  userIds,
  (id) => Stream.fromEffect(fetchUserDetails(id)),
  { concurrency: 10 }  // Process 10 at a time
);
```

### Process Stream Elements

```typescript
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";

// Collect all elements (use carefully with large streams!)
const allItems = yield* Stream.runCollect(stream);

// Process each element
yield* Stream.runForEach(stream, (item) =>
  Effect.gen(function* () {
    yield* saveToDb(item);
    yield* Effect.log(`Processed ${item.id}`);
  })
);

// Reduce to single value
const total = yield* Stream.runFold(
  numberStream,
  0,
  (acc, n) => acc + n
);
```

### Side Effects with tap

```typescript
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";

const loggingStream = Stream.pipe(
  dataStream,
  Stream.tap((item) => Effect.log(`Processing ${item.id}`)),
  Stream.map(process),
  Stream.tap((result) => Effect.log(`Result: ${result}`))
);
```

### Scan for Stateful Processing

```typescript
import * as Stream from "effect/Stream";

// Accumulate state while streaming
const cumulativeStream = Stream.scan(
  numberStream,
  0,  // Initial state
  (acc, n) => acc + n  // Accumulator function
);

// Example: File change stream → accumulated file state
const filesStream = Stream.scan(
  changeEvents,
  { files: A.empty<File>() },
  (state, event) => ({
    files: applyChange(state.files, event)
  })
);
```

### Server-Sent Events (SSE)

```typescript
import * as Stream from "effect/Stream";
import * as PubSub from "effect/PubSub";
import * as Effect from "effect/Effect";

// Service with event stream
export class EventService extends Context.Tag("EventService")<
  EventService,
  {
    readonly subscribe: Effect.Effect<Stream.Stream<Event>, never, never>;
  }
>() {}

// Implementation
export const EventServiceLive = Layer.succeed(EventService, {
  subscribe: Effect.gen(function* () {
    const pubSub = yield* PubSub.unbounded<Event>();
    return Stream.fromPubSub(pubSub);
  })
});

// Client consumption
const eventStream = yield* EventService.pipe(
  Effect.flatMap(svc => svc.subscribe)
);

yield* Stream.runForEach(eventStream, (event) =>
  Effect.log(`Received event: ${event.type}`)
);
```

### Practical Example from Codebase

```typescript
// From: packages/shared/client/src/atom/files/atoms/upload.atom.ts
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";

const uploadStream = Stream.unwrap(
  Effect.gen(function* () {
    const initialState = UploadState.Idle({ input });

    return Stream.unfoldEffect(
      initialState as UploadState,
      transition  // State machine transition function
    );
  })
);

// Scan maintains upload state across events
const stateStream = Stream.scan(
  uploadStream,
  UploadState.Idle({ input }),
  (state, event) => applyEvent(state, event)
);
```

## Anti-Patterns

### NEVER Load Large Datasets into Arrays

```typescript
// FORBIDDEN - Loading entire table into memory
const allUsers = yield* repo.findAll();
const processed = A.map(allUsers, transform);

// REQUIRED - Stream for large datasets
const userStream = repo.findAllStream();
yield* Stream.pipe(
  userStream,
  Stream.map(transform),
  Stream.runForEach(save)
);
```

### NEVER Use runCollect on Unbounded Streams

```typescript
// FORBIDDEN - Infinite stream will never complete
const allEvents = yield* Stream.runCollect(eventStream);

// REQUIRED - Process incrementally
yield* Stream.runForEach(eventStream, handleEvent);

// OR take limited number
const firstTen = yield* Stream.pipe(
  eventStream,
  Stream.take(10),
  Stream.runCollect
);
```

### NEVER Block Stream Processing

```typescript
// FORBIDDEN - Awaiting each item sequentially
for (const item of streamItems) {
  await processItem(item);
}

// REQUIRED - Use Stream operations
yield* Stream.pipe(
  stream,
  Stream.flatMap((item) => processItem(item), { concurrency: 10 }),
  Stream.runForEach(save)
);
```

### NEVER Forget to Run Streams

```typescript
// FORBIDDEN - Stream is lazy, this does nothing!
const processedStream = Stream.map(inputStream, process);

// REQUIRED - Must run the stream
yield* Stream.runForEach(processedStream, save);
// OR
yield* Stream.runCollect(processedStream);
```

## Related Modules

- **[Array.md](./Array.md)** - Use for in-memory finite collections
- **[Option.md](./Option.md)** - Stream operations can return Options
- **effect/PubSub** - Create streams from message queues
- **effect/Chunk** - Stream elements collected into Chunks

## Source Reference

[`.repos/effect/packages/effect/src/Stream.ts`](../../.repos/effect/packages/effect/src/Stream.ts)

## Key Takeaways

1. **ALWAYS** use `import * as Stream from "effect/Stream"`
2. **Use Stream** for large datasets, async data, and real-time events
3. **Use Array** for small in-memory collections
4. **Stream.fromPubSub** for SSE and event streams
5. **Stream.scan** for stateful processing (state machines, accumulation)
6. **Stream.flatMap** with `concurrency` for parallel processing
7. **Stream.unwrap** to flatten `Effect<Stream>`
8. **Must run streams** with `runForEach`, `runCollect`, or `runFold`
