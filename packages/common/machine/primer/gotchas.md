# Gotchas

Common mistakes and how to avoid them.

## Effect.gen Errors

**Wrong**: Throwing in Effect.gen

```ts
.on(State.X, Event.Y, () =>
  Effect.gen(function* () {
    if (bad) {
      throw new Error("fail");  // ✗ Breaks Effect semantics
    }
  })
)
```

**Right**: Use Effect.fail or yield error

```ts
.on(State.X, Event.Y, () =>
  Effect.gen(function* () {
    if (bad) {
      return yield* Effect.fail(new MyError());  // ✓
      // or: return yield* new MyTaggedError();
    }
  })
)
```

## Forgetting yieldFibers

**Wrong**: Expecting immediate state change

```ts
yield * actor.send(Event.Start);
const state = yield * actor.snapshot; // May still be Idle!
```

**Right**: Yield to let fibers run

```ts
yield * actor.send(Event.Start);
yield * Effect.yieldNow(); // Let event process
const state = yield * actor.snapshot; // Now reflects Start
```

**Alternative**: use `sendAndWait` / `waitFor`:

```ts
const state = yield * actor.sendAndWait(Event.Start);
```

## simulate() Doesn't Run Spawn

`simulate()` and `createTestHarness()` run guards/effects in handlers but NOT spawn effects:

```ts
// This spawn effect won't run in simulate()
.spawn(State.Loading, ({ effects }) => effects.fetchData())

// Test with real actor for spawn effects
it.scoped("spawn effect fires", () =>
  Effect.gen(function* () {
    const system = yield* ActorSystemService;
    const actor = yield* system.spawn("test", machine);
    // ...
  }).pipe(Effect.provide(ActorSystemDefault))
);
```

## Same-State Skips Lifecycle

By default, transitioning to same state tag skips spawn/finalizers:

```ts
// This WON'T restart the timeout
.spawn(State.Active, ({ effects }) => effects.scheduleTimeout())
.on(State.Active, Event.Update, ({ event }) =>
  State.Active({ count: event.count })  // Same tag - spawn doesn't re-run
)
```

**Solution**: Use `.reenter()` to force lifecycle:

```ts
.reenter(State.Active, Event.Reset, ({ state }) =>
  State.Active({ count: 0 })  // Forces spawn to restart
)
```

## Long-Running Work in .on

`.on()` handlers run inline and block the event loop.

**Use** `.task()` or `.spawn()` for long-running effects:

```ts
.on(State.Idle, Event.Start, () => State.Working)
.task(State.Working, () => Effect.sleep("1 minute"), {
  onSuccess: () => Event.Done,
})
```

## Unprovided Slots

Forgetting to provide slot implementations:

```ts
const machine = Machine.make({...})
  .on(State.X, Event.Y, ({ guards }) =>
    Effect.gen(function* () {
      if (yield* guards.canRetry({ max: 3 })) {  // Will fail!
        // ...
      }
    })
  );
// Missing .build({ canRetry: ... })
```

Always build the machine with all slots before spawning:

```ts
const machine = Machine.make({...})
  .on(...)
  .build({
    canRetry: ({ max }, { state }) => state.attempts < max,
  });
```

## TestClock Not Provided

Tests with time-dependent spawn effects need TestClock:

```ts
// Wrong - uses real clock, test hangs or flakes
it("timeout test", () =>
  Effect.gen(function* () {
    // TestClock.adjust won't work!
  }).pipe(Effect.provide(ActorSystemDefault)));

// Right - provide TestContext
it.scoped("timeout test", () =>
  Effect.gen(function* () {
    yield* TestClock.adjust("30 seconds");
  }).pipe(
    Effect.provide(ActorSystemDefault),
    Effect.provide(TestContext.TestContext), // ✓
  ),
);
```

## Duplicate Actor IDs

```ts
yield * system.spawn("order-1", machine);
yield * system.spawn("order-1", machine); // DuplicateActorError!
```

Check first or use unique IDs:

```ts
const existing = yield * system.get(id);
if (Option.isNone(existing)) {
  yield * system.spawn(id, machine);
}
```

## Missing Scope

Actors require a scope:

```ts
// Wrong - no scope
Effect.runPromise(
  Effect.gen(function* () {
    const system = yield* ActorSystemService;
    const actor = yield* system.spawn("test", machine); // Needs Scope!
  }).pipe(Effect.provide(ActorSystemDefault)),
);

// Right - provide scope
Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("test", machine); // ✓
    }),
  ).pipe(Effect.provide(ActorSystemDefault)),
);
```

## Boolean Expressions

Effect's strict mode requires explicit comparisons:

```ts
// Wrong
if (value) { ... }
if (!value) { ... }

// Right
if (value !== undefined) { ... }
if (value === undefined) { ... }
if (value === true) { ... }
```

## Handler Service Requirements

Handlers cannot require arbitrary services - use slots:

```ts
// Wrong - won't compile
.on(State.X, Event.Y, () =>
  Effect.gen(function* () {
    yield* MyService;  // ✗ R=never, can't require services
  })
)

// Right - use effect slots
.on(State.X, Event.Y, ({ effects }) => effects.doWork())
.build({
  doWork: () => MyService.pipe(Effect.flatMap(...))  // ✓ build() can use services
})
```

**Exception**: `.spawn()` and `.background()` allow `Scope` for finalizers:

```ts
.spawn(State.Loading, () =>
  Effect.addFinalizer(() => Effect.log("cleanup"))  // ✓ Scope allowed
)
```

## Handler Must Return State

Handlers must return state or Effect<State>:

```ts
// Wrong - returns undefined
.on(State.X, Event.Y, ({ state }) => {
  console.log("handling");
  // No return!
})

// Right
.on(State.X, Event.Y, ({ state }) => {
  console.log("handling");
  return state;  // Stay in same state
})
```

## Empty Struct Syntax

Empty state/event variants are values, not constructors:

```ts
// Wrong
State.Idle(); // ✗ Not callable
Event.Cancel(); // ✗ Not callable

// Right
State.Idle; // ✓ Plain value
Event.Cancel; // ✓ Plain value
```

Non-empty variants are constructors:

```ts
State.Loading({ url: "/api" }); // ✓ Constructor with args
Event.Fetch({ url: "/api" }); // ✓ Constructor with args
```

## .onAny() Priority

`.onAny()` only fires when no specific `.on()` matches:

```ts
.on(State.Active, Event.Cancel, () => State.Paused)    // Specific
.onAny(Event.Cancel, () => State.Cancelled)             // Fallback

// Active + Cancel → Paused (specific wins)
// Any other state + Cancel → Cancelled
```

If you expect `.onAny()` to fire for a state that has a specific `.on()` for the same event, it won't.

## See Also

- `basics.md` - Core concepts
- `handlers.md` - Handler patterns
- `testing.md` - Testing approaches
