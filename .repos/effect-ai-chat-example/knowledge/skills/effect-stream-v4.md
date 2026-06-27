---
name: effect-stream-v4
description: "Effect v4 Stream patterns for constructing, transforming, combining, and consuming streams. Also covers Server Sent Events with effect/unstable/encoding/Sse and text/event-stream endpoints. Use when working with Stream, Stream.callback, Stream.fromQueue, Stream.unfold, Stream.debounce, Stream.throttle, Stream.share, Stream.switchMap, chunking, backpressure, stream error handling, or SSE framing and parsing. Triggers on Stream.make, Stream.callback, Stream.fromQueue, Stream.unfold, Stream.flatMap, Stream.merge, Stream.switchMap, Stream.debounce, Stream.throttle, Stream.share, Stream.runCollect, Stream.grouped, Stream.groupedWithin, Stream.pipeThroughChannel, Sse.encode, Sse.decode, Sse.decodeSchema, Sse.decodeDataSchema, text/event-stream, Server Sent Events."
---

# Effect Stream (v4)

Streams are lazy, pull-based sequences of values with effects, errors, and
resource management. A Stream wraps a Channel that emits chunks as plain
arrays (`NonEmptyReadonlyArray<A>`).

```ts
import { Stream } from "effect";
```

## Constructors

### `Stream.make`

Fixed set of values:

```ts
const s = Stream.make(1, 2, 3);
```

### `Stream.fromIterable`

```ts
const s = Stream.fromIterable([1, 2, 3]);
```

### `Stream.fromEffect`

Single value from an Effect:

```ts
const s = Stream.fromEffect(Effect.succeed(42));
```

### `Stream.fromEffectRepeat`

Repeat an effect indefinitely:

```ts
const s = Stream.fromEffectRepeat(Effect.succeed(Math.random()));
```

### `Stream.fromEffectSchedule`

Repeat an effect on a schedule:

```ts
const s = Stream.fromEffectSchedule(
  Effect.succeed(Date.now()),
  Schedule.fixed("1 second"),
);
```

### `Stream.range`

Inclusive on both ends:

```ts
Stream.range(1, 5); // emits 1, 2, 3, 4, 5
```

Returns `Stream.empty` if `min > max`. Emits in chunks (default chunk
size).

### `Stream.tick`

Emits `void` at a fixed interval. First tick is immediate (no initial
delay):

```ts
Stream.tick("1 second"); // void immediately, then every second
```

### `Stream.iterate`

Unfold from a seed with a pure function:

```ts
Stream.iterate(1, (n) => n * 2); // 1, 2, 4, 8, 16, ...
```

### `Stream.unfold`

Effectful unfold. Return `undefined` to signal end:

```ts
const values = Stream.unfold("cursor-0", (cursor) =>
  Effect.gen(function*() {
    const next = yield* fetchNext(cursor);
    if (next === undefined) return undefined;
    return [next.value, next.cursor] as const;
  }));
```

### `Stream.paginate`

For page based APIs, prefer `paginate`. It returns `Option<S>` for continuation and emits the page items directly:

```ts
const items = Stream.paginate(0, (page) =>
  Effect.gen(function*() {
    const data = yield* fetchPage(page);
    const next = data.hasMore ? Option.some(page + 1) : Option.none();
    return [data.items, next] as const;
  }));
```

### `Stream.callback`

Create a stream from a callback that pushes values into a Queue.
Replaces v3's `Stream.async`, `Stream.asyncEffect`, `Stream.asyncPush`,
and `Stream.asyncScoped`:

```ts
const s = Stream.callback<number>((queue) =>
  Effect.gen(function*() {
    const ws = yield* connectWebSocket();
    ws.onMessage((msg) => Queue.offerUnsafe(queue, msg.value));
    ws.onClose(() => Queue.endUnsafe(queue));
    ws.onError((err) => Queue.failCauseUnsafe(queue, Cause.fail(err)));
    yield* Effect.addFinalizer(() => Effect.sync(() => ws.close()));
  })
);
```

Signaling:

- `Queue.offerUnsafe(queue, value)`: emit a value
- `Queue.endUnsafe(queue)`: signal stream end
- `Queue.failCauseUnsafe(queue, cause)`: signal error

Options:

- `bufferSize`: backpressure buffer (default 16). `Queue.offer` blocks
  when full
- `strategy`: `"suspend"` (default, backpressure), `"dropping"` (excess
  dropped), `"sliding"` (oldest evicted)

### `Stream.fromQueue`

Stream from a `Queue.Dequeue`. Ends when the queue is shut down via
`Queue.end()`:

```ts
const queue = yield * Queue.bounded<number, Cause.Done>(16);
const stream = Stream.fromQueue(queue);

yield * Effect.forkChild(Queue.offerAll(queue, [1, 2, 3]));
yield * Effect.forkChild(Queue.end(queue));
const items = yield * Stream.runCollect(stream); // [1, 2, 3]
```

### `Stream.fromPubSub`

Broadcast stream from a PubSub. Each subscriber gets all values:

```ts
const pubsub = yield * PubSub.bounded<number>(16);
const stream = Stream.fromPubSub(pubsub);
```

### `Stream.fromSchedule`

Emit schedule outputs:

```ts
Stream.fromSchedule(Schedule.spaced("1 second"));
```

## Server Sent Events (SSE)

Use `effect/unstable/encoding/Sse` for SSE framing and parsing. Do not hand-roll
`event:` and `data:` strings.

### Server side encoding

Keep the stream structured until the HTTP boundary, then frame it with
`Sse.encode()` and convert the strings to bytes:

```ts
import { Stream } from "effect";
import * as Sse from "effect/unstable/encoding/Sse";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

const events = Stream.make(
  {
    _tag: "Event",
    event: "ready",
    id: undefined,
    data: JSON.stringify({ ok: true }),
  },
  {
    _tag: "Event",
    event: "delta",
    id: "1",
    data: JSON.stringify({ chunk: "hello" }),
  },
);

const body = events.pipe(
  Stream.pipeThroughChannel(Sse.encode()),
  Stream.encodeText,
);

const response = HttpServerResponse.stream(body, {
  headers: {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache",
  },
});
```

If you already have a schema encoder to `{ event, id, data }`, use
`Sse.encodeSchema(schema)` instead of building `Sse.Event` values yourself.

### Client side decoding

Parse the byte stream as text, then pipe it through an SSE decoder channel:

```ts
import { Stream } from "effect";
import * as Schema from "effect/Schema";
import * as Sse from "effect/unstable/encoding/Sse";

const Message = Schema.Struct({ type: Schema.String });

const events = response.stream.pipe(
  Stream.decodeText(),
  Stream.pipeThroughChannel(Sse.decodeDataSchema(Message)),
  Stream.map((event) => event.data),
);
```

Use `Sse.decode()` when `data` should stay as a raw string. Use
`Sse.decodeSchema(schema)` when the whole `{ event, id, data }` shape should be
schema-decoded.

### How it works internally

- `Sse.encode()` and the decode helpers are `Channel`s. The normal pattern is
  `stream.pipe(Stream.pipeThroughChannel(...))`.
- `Sse.encode()` writes `id:` only when `id` is defined. It omits `event:` when
  the event name is `"message"`, because that is the SSE default.
- Multiline `data` payloads are expanded into repeated `data:` lines. Each event
  ends with a blank line.
- `Sse.makeParser()` is incremental. It keeps partial chunk state, strips a
  UTF-8 BOM from the first chunk, handles both `\n` and `\r\n`, accumulates
  multiple `data:` lines with embedded newlines, and emits an event only when it
  sees the blank separator line.
- `retry:` is modeled as `Sse.Retry` in the error channel, not as a normal
  emitted element. `Sse.decode*` fail with `Retry` when a retry directive
  arrives, after any already buffered events are emitted.
- `Sse.encode()` treats `Retry` as a terminal signal. It writes the `retry:`
  frame and then ends the stream.

### SSE gotchas

- Keep `data` as a string at the framing layer. For JSON payloads,
  `JSON.stringify` before encoding and use `Sse.decodeDataSchema(...)` when
  decoding.
- If you need to handle retry directives on the client side, catch `Retry`
  explicitly with `Stream.catchTags({ Retry: ... })`.
- There is no special SSE stream type. It is still just a `Stream` plus
  `Sse.encode*` or `Sse.decode*` at the edge.

## Transformations

### `Stream.map`

Receives element and its global index:

```ts
Stream.make("a", "b", "c").pipe(
  Stream.map((value, index) => `${index}: ${value}`),
);
```

### `Stream.mapEffect`

```ts
stream.pipe(Stream.mapEffect((a) => processItem(a)));
```

Supports `{ concurrency, unordered }` options for parallel processing:

```ts
stream.pipe(
  Stream.mapEffect((a) => processItem(a), { concurrency: 10 }),
);
```

### `Stream.flatMap`

Each element produces a sub-stream. Supports concurrency:

```ts
stream.pipe(
  Stream.flatMap((userId) => fetchUserEvents(userId), {
    concurrency: "unbounded",
  }),
);
```

### `Stream.switchMap`

Like `flatMap` but interrupts the previous inner stream when a new
element arrives. Use for "latest wins" semantics:

```ts
searchInput$.pipe(
  Stream.switchMap((query) => searchApi(query)),
);
```

Supports `{ concurrency, bufferSize }` options.

### `Stream.filter` / `Stream.filterEffect`

```ts
stream.pipe(Stream.filter((n) => n > 0));
stream.pipe(Stream.filterEffect((n) => checkValid(n)));
```

### `Stream.scan`

Stateful accumulation. Emits initial state first:

```ts
Stream.make(1, 2, 3).pipe(Stream.scan(0, (acc, n) => acc + n));
// emits: 0, 1, 3, 6
```

### `Stream.take` / `Stream.takeWhile` / `Stream.takeUntil`

```ts
stream.pipe(Stream.take(5));
stream.pipe(Stream.takeWhile((n) => n < 10));
stream.pipe(Stream.takeUntil((n) => n === 42));
stream.pipe(Stream.takeUntil((n) => n === 42, { excludeLast: true }));
```

`takeUntil` includes the matching element by default. Pass
`{ excludeLast: true }` to exclude it.

### `Stream.drop` / `Stream.dropWhile` / `Stream.dropUntil`

```ts
stream.pipe(Stream.drop(3));
stream.pipe(Stream.dropWhile((n) => n < 5));
```

### `Stream.changes` / `Stream.changesWith`

Deduplicate consecutive equal values:

```ts
Stream.make(1, 1, 2, 2, 3, 1).pipe(Stream.changes); // 1, 2, 3, 1
```

### `Stream.tap`

Side effects without altering the stream:

```ts
stream.pipe(Stream.tap((a) => Effect.log(`processing ${a}`)));
```

### `Stream.flattenIterable`

Flatten streams of iterables into individual elements:

```ts
Stream.make([1, 2], [3, 4]).pipe(Stream.flattenIterable); // 1, 2, 3, 4
```

### `Stream.flattenArray`

Flatten streams of arrays (same as `flattenIterable` but typed for
arrays):

```ts
Stream.make([1, 2], [3, 4]).pipe(Stream.flattenArray);
```

## Combining Streams

### `Stream.merge`

Interleave two streams concurrently. Ends when both complete:

```ts
stream1.pipe(Stream.merge(stream2));
```

### `Stream.mergeAll`

Merge multiple streams. Takes an iterable and concurrency options:

```ts
Stream.mergeAll([stream1, stream2, stream3], { concurrency: "unbounded" });
```

### `Stream.concat`

Sequential: first stream completes, then second starts:

```ts
stream1.pipe(Stream.concat(stream2));
```

### `Stream.zip` / `Stream.zipWith`

Point-wise pairing. Stops at the shorter stream:

```ts
Stream.zip(names, ages); // [name, age] tuples
Stream.zipWith(names, ages, (name, age) => ({ name, age }));
```

### `Stream.zipLatest`

Pairs latest values from both streams. Waits for both to emit before
producing output, then re-emits whenever either side produces a new
value. Latest tracking is per emitted chunk, not per individual element.

```ts
Stream.zipLatest(mouseX, mouseY); // latest [x, y] pair
```

### `Stream.raceAll`

First stream to produce wins, others are interrupted:

```ts
Stream.raceAll(primarySource, fallbackSource);
```

### `Stream.interleave`

Alternate elements from two streams. Drains remaining when one ends:

```ts
Stream.interleave(evens, odds); // 0, 1, 2, 3, 4, 5, ...
```

## Chunking and Batching

### `Stream.grouped`

Collect elements into fixed-size groups:

```ts
stream.pipe(Stream.grouped(100)); // Stream<NonEmptyReadonlyArray<A>>
```

### `Stream.groupedWithin`

Collect elements by count OR time window (whichever triggers first):

```ts
stream.pipe(Stream.groupedWithin(100, "5 seconds"));
```

Does not emit empty arrays when upstream is idle.

### `Stream.rechunk`

Re-chunk the stream into chunks of a specific size:

```ts
stream.pipe(Stream.rechunk(64));
```

### `Stream.groupAdjacentBy`

Group consecutive elements sharing the same key:

```ts
Stream.make(1, 1, 2, 2, 1).pipe(
  Stream.groupAdjacentBy((n) => n),
); // [1, [1,1]], [2, [2,2]], [1, [1]]
```

### `Stream.groupByKey`

Fan-out by key into sub-streams. Process groups concurrently:

```ts
events.pipe(
  Stream.groupByKey((e) => e.userId),
  Stream.flatMap(([userId, group]) => group.pipe(Stream.map((e) => processForUser(userId, e))), {
    concurrency: "unbounded",
  }),
);
```

### `Stream.sliding`

Sliding windows:

```ts
stream.pipe(Stream.sliding(3)); // windows of 3, step 1
stream.pipe(Stream.slidingSize(3, 2)); // windows of 3, step 2
```

### `Stream.split`

Split on predicate. Delimiter elements are excluded:

```ts
Stream.make(1, 2, 0, 3, 4, 0, 5).pipe(
  Stream.split((n) => n === 0),
); // [1,2], [3,4], [5]
```

## Error Handling

### `Stream.catchCause`

Recover from all errors by matching on the full Cause:

```ts
stream.pipe(
  Stream.catchCause((cause) => Stream.make(fallbackValue)),
);
```

### `Stream.catchTag`

Recover from specific tagged errors. Supports `orElse` for non-matching
tags:

```ts
stream.pipe(
  Stream.catchTag("NotFound", () => Stream.empty),
);

stream.pipe(
  Stream.catchTag("NotFound", () => Stream.empty, (otherError) => Stream.fail(otherError)),
);
```

Also accepts arrays of tags:

```ts
stream.pipe(
  Stream.catchTag(["NotFound", "Timeout"], (e) => Stream.empty),
);
```

### `Stream.catchIf`

Recover from errors matching a predicate or refinement:

```ts
stream.pipe(
  Stream.catchIf(
    (e): e is NetworkError => e._tag === "NetworkError",
    (e) => retryStream(e),
  ),
);
```

### `Stream.catchReason`

Match on a nested `reason` field within a tagged error:

```ts
stream.pipe(
  Stream.catchReason(
    "AiError",
    "RateLimitError",
    (reason) => Stream.succeed(`retry after ${reason.retryAfter}`),
  ),
);
```

### `Stream.retry`

Retry the entire stream on failure. Accepts a schedule or schedule
builder:

```ts
stream.pipe(Stream.retry(Schedule.exponential("1 second")));
stream.pipe(Stream.retry(($) => $.recurs(3)));
```

Finalizers run between retries, ensuring clean resource state. The
schedule resets after a successful pull.

### `Stream.ignore` / `Stream.ignoreCause`

Suppress errors and end the stream. Optional logging:

```ts
stream.pipe(Stream.ignore); // silent
stream.pipe(Stream.ignore({ log: true })); // log at default level
stream.pipe(Stream.ignore({ log: "Warn" })); // log at Warn level
```

`ignoreCause` also suppresses defects.

## Time-Based Operations

### `Stream.debounce`

Emit only after a quiet period. Only the last element of the latest
chunk is kept:

```ts
searchInput.pipe(Stream.debounce("300 millis"));
```

### `Stream.throttle`

Rate-limit with a token bucket. `cost` receives the chunk (array):

**Enforce strategy** (drop excess):

```ts
stream.pipe(
  Stream.throttle({
    cost: (chunk) => chunk.length,
    units: 10,
    duration: "1 second",
    strategy: "enforce",
  }),
);
```

**Shape strategy** (delay instead of drop):

```ts
stream.pipe(
  Stream.throttle({
    cost: (chunk) => chunk.length,
    units: 10,
    duration: "1 second",
    strategy: "shape",
  }),
);
```

Both support `burst` for additional accumulated capacity. It is not extra initial tokens.

### `Stream.timeout`

Silently end the stream after duration with no elements. Does NOT fail:

```ts
stream.pipe(Stream.timeout("10 seconds"));
```

### `Stream.schedule`

Space each emission by a schedule:

```ts
stream.pipe(Stream.schedule(Schedule.fixed("100 millis")));
```

## Resource Management

### `Stream.ensuring`

Run an effect after the stream ends (success, failure, or interruption):

```ts
stream.pipe(Stream.ensuring(cleanup));
```

### `Stream.onStart` / `Stream.onEnd` / `Stream.onExit`

Lifecycle hooks:

```ts
stream.pipe(
  Stream.onStart(Effect.log("stream started")),
  Stream.onEnd(Effect.log("stream ended")),
  Stream.onExit((exit) => recordMetrics(exit)),
);
```

### `Stream.onFirst`

Run an effect when the first element is emitted:

```ts
stream.pipe(Stream.onFirst((element) => Effect.log(`first: ${element}`)));
```

### Scoped Resources in Streams

Use `Effect.acquireRelease` inside `Stream.callback` or compose with
`Stream.unwrap`:

```ts
const s = Stream.unwrap(
  Effect.gen(function*() {
    const conn = yield* Effect.acquireRelease(
      openConnection(),
      (conn) => closeConnection(conn),
    );
    return Stream.fromEffect(conn.read()).pipe(Stream.repeat);
  }),
);
```

## Multicasting

### `Stream.share`

Lazy multicast. Returns `Effect<Stream<A, E>, never, Scope | R>` (scoped).
Upstream starts when first consumer subscribes:

```ts
const program = Effect.gen(function*() {
  const shared = yield* stream.pipe(Stream.share({ capacity: 16 }));
  yield* Effect.forkChild(Stream.runForEach(shared, handleA));
  yield* Stream.runForEach(shared, handleB);
});
```

With `idleTimeToLive`, the upstream stays alive between subscribers:

```ts
const shared = yield * stream.pipe(
  Stream.share({ capacity: 16, idleTimeToLive: "5 seconds" }),
);
```

Without `idleTimeToLive`, each new subscriber restarts the stream.
Parallel subscribers receive the same broadcast.

### `Stream.partitionQueue`

Split a stream into two queues by predicate. Scoped:

```ts
const [evens, odds] = yield * stream.pipe(
  Stream.partitionQueue((n) => n % 2 === 0),
);
```

Backpressure is enforced: consuming only one side blocks the producer
until the other side is consumed too.

## Consuming Streams

### `Stream.runCollect`

Collect all elements into a mutable `Array<A>`:

```ts
const items = yield * Stream.runCollect(stream);
```

### `Stream.runForEach`

Process each element for side effects:

```ts
yield * stream.pipe(Stream.runForEach((item) => processItem(item)));
```

### `Stream.runFold`

Fold all elements. Initial value is a thunk:

```ts
const sum = yield * stream.pipe(
  Stream.runFold(() => 0, (acc, n) => acc + n),
);
```

### `Stream.runDrain`

Consume and discard all elements:

```ts
yield * Stream.runDrain(stream);
```

### `Stream.runHead` / `Stream.runLast`

```ts
const first = yield * Stream.runHead(stream); // Option<A>
const last = yield * Stream.runLast(stream); // Option<A>
```

### `Stream.runCount`

```ts
const count = yield * Stream.runCount(stream);
```

### `Stream.toPull`

Low-level: get a pull function for manual consumption:

```ts
const pull = yield * Stream.toPull(stream);
const chunk = yield * pull; // scoped pull yielding NonEmptyReadonlyArray<A>
```

## Behavioral Notes

1. **Chunks are plain arrays.** No v3 `Chunk` type. `flattenChunks` is
   now `flattenArray`
2. **`scan` emits initial state first.** `scan(0, f)` on `[1,2,3]`
   emits `[0,1,3,6]`
3. **`debounce` keeps only the last element** of the latest chunk
4. **`throttle` cost is per-chunk.** The cost function receives an
   array, not individual elements
5. **`timeout` silently ends.** It does not fail.
6. **`haltWhen` does NOT interrupt in-progress pulls.** A pending pull
   completes normally even after the halt signal fires
7. **`groupedWithin` emits non empty groups.** Final groups may be smaller than the requested size
8. **Backpressure is Queue-based.** `Stream.callback` with
   `bufferSize: N` blocks `Queue.offer` when the buffer is full
9. **`unfold` returns `undefined` to signal end.** Not `Option.none()`
10. **`Stream.fromQueue` ends on `Queue.end()`.** The `Cause.Done` type
    is excluded from the stream's error channel automatically

## Quick Reference

| Task                | Pattern                                                        |
| ------------------- | -------------------------------------------------------------- |
| Fixed values        | `Stream.make(1, 2, 3)`                                         |
| From effect         | `Stream.fromEffect(myEffect)`                                  |
| Repeat effect       | `Stream.fromEffectRepeat(myEffect)`                            |
| Callback/push-based | `Stream.callback((queue) => ...)`                              |
| Queue-based         | `Stream.fromQueue(queue)`                                      |
| SSE encode          | `Stream.pipeThroughChannel(Sse.encode())`                      |
| SSE schema encode   | `Stream.pipeThroughChannel(Sse.encodeSchema(schema))`          |
| SSE decode          | `Stream.decodeText(), Stream.pipeThroughChannel(Sse.decode())` |
| SSE JSON decode     | `Stream.pipeThroughChannel(Sse.decodeDataSchema(schema))`      |
| Pagination          | `Stream.unfold(seed, f)` or `Stream.paginate(seed, f)`         |
| Timer               | `Stream.tick("1 second")`                                      |
| Latest wins         | `Stream.switchMap(f)`                                          |
| Concurrent map      | `Stream.mapEffect(f, { concurrency: N })`                      |
| Rate limit (drop)   | `Stream.throttle({ strategy: "enforce", ... })`                |
| Rate limit (delay)  | `Stream.throttle({ strategy: "shape", ... })`                  |
| Quiet period        | `Stream.debounce("300 millis")`                                |
| Batch by count      | `Stream.grouped(100)`                                          |
| Batch by time       | `Stream.groupedWithin(100, "5 seconds")`                       |
| Multicast (scoped)  | `yield* Stream.share({ capacity: 16 })`                        |
| Recover errors      | `Stream.catchCause(handler)`                                   |
| Retry               | `Stream.retry(schedule)`                                       |
| Collect all         | `Stream.runCollect(stream)`                                    |
| Process each        | `Stream.runForEach(stream, f)`                                 |
