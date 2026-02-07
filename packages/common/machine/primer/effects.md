# State Effects

State-scoped effects with `.spawn()` and machine-lifetime effects with `.background()`.

## spawn: State-Scoped Effects

`.spawn()` runs effects when entering a state. **Auto-cancelled on state exit.**

```ts
const MyEffects = Slot.Effects({
  pollStatus: { interval: Schema.Number },
  fetchData: { url: Schema.String },
});

machine
  .spawn(State.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }))
  .build({
    fetchData: ({ url }, { self }) =>
      Effect.gen(function* () {
        // This runs when entering Loading
        const data = yield* Http.get(url);
        yield* self.send(Event.Resolve({ data }));
      }),
  });
```

**Key behaviors**:

- Forked into state scope - runs concurrently with event processing
- Automatically interrupted when state exits
- Use `Effect.addFinalizer()` for cleanup

## task: Invoke-Style Work

`.task()` runs an effect on state entry and sends success/failure events:

```ts
machine
  .on(State.Idle, Event.Fetch, ({ event }) => State.Loading({ url: event.url }))
  .task(State.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }), {
    onSuccess: (data) => Event.Resolve({ data }),
    onFailure: () => Event.Reject({ message: "fetch failed" }),
  });
```

**Notes**:

- Runs concurrently (state-scoped, like `spawn`)
- Interrupts do **not** emit failure events
- If `onFailure` is omitted, defects are rethrown

## Cleanup with Finalizers

Add cleanup logic that runs on state exit:

```ts
.build({
  fetchData: ({ url }, { self }) =>
    Effect.gen(function* () {
      yield* Effect.addFinalizer(() =>
        Effect.log("Cleaning up fetch...")
      );

      const data = yield* Http.get(url);
      yield* self.send(Event.Resolve({ data }));
    }),
})
```

Finalizer runs whether effect completes, fails, or is interrupted.

## Timeouts via spawn

Common pattern - auto-timeout a state:

```ts
const MyEffects = Slot.Effects({
  scheduleTimeout: { duration: Schema.String },
});

machine
  .on(State.Waiting, Event.Timeout, () => State.TimedOut)
  .spawn(State.Waiting, ({ effects }) => effects.scheduleTimeout({ duration: "30 seconds" }))
  .final(State.TimedOut)
  .build({
    scheduleTimeout: ({ duration }, { self }) =>
      Effect.sleep(duration).pipe(Effect.andThen(self.send(Event.Timeout))),
  });
```

Timer auto-cancelled if state exits before timeout.

## Polling via spawn

Continuous polling while in a state:

```ts
.spawn(State.Monitoring, ({ effects }) =>
  effects.poll()
)
.build({
  poll: (_, { self }) =>
    Effect.forever(
      Effect.gen(function* () {
        const status = yield* checkStatus();
        if (status === "done") {
          yield* self.send(Event.Complete);
        }
        yield* Effect.sleep("5 seconds");
      })
    ),
})
```

Polling stops automatically when leaving Monitoring state.

## background: Machine-Lifetime Effects

`.background()` runs effects for the entire machine lifetime:

```ts
.background(({ effects }) => effects.heartbeat())
.build({
  heartbeat: (_, { self }) =>
    Effect.forever(
      Effect.sleep("30 seconds").pipe(
        Effect.andThen(self.send(Event.Ping))
      )
    ),
})
```

**Key difference from spawn**:

- Starts when machine spawns
- Runs until machine stops (final state or explicit stop)
- Not tied to any specific state

## Multiple Spawn Effects

Multiple effects can run in the same state:

```ts
machine
  .spawn(State.Active, ({ effects }) => effects.pollStatus())
  .spawn(State.Active, ({ effects }) => effects.syncData())
  .spawn(State.Active, ({ effects }) => effects.scheduleTimeout({ duration: "5 minutes" }));
```

All run concurrently, all cancelled on state exit.

## Sending Events from Effects

Use `self.send()` to send events back to the machine:

```ts
.build({
  fetchData: ({ url }, { self }) =>
    Effect.gen(function* () {
      const result = yield* Effect.either(Http.get(url));

      if (result._tag === "Left") {
        yield* self.send(Event.Reject({ error: result.left.message }));
      } else {
        yield* self.send(Event.Resolve({ data: result.right }));
      }
    }),
})
```

**Important**: `self.send()` is non-blocking. Event queued for processing.

## Testing Spawn Effects

`simulate()` and `createTestHarness()` don't run spawn effects - they test pure transitions.

For spawn effects, use real actors with `TestClock`:

```ts
import { TestClock } from "effect";

it.scoped("timeout fires after duration", () =>
  Effect.gen(function* () {
    const system = yield* ActorSystemService;
    const actor = yield* system.spawn("test", machine);

    yield* actor.send(Event.Start);
    yield* yieldFibers; // Let spawn effect start

    expect(actor.matchesSync("Waiting")).toBe(true);

    yield* TestClock.adjust("30 seconds");
    yield* yieldFibers;

    expect(actor.matchesSync("TimedOut")).toBe(true);
  }).pipe(Effect.provide(ActorSystemDefault)),
);
```

## Reenter for Timer Reset

Use `.reenter()` to restart spawn effects on same state:

```ts
machine
  .spawn(State.Active, ({ effects }) => effects.scheduleInactivityTimeout())
  // Normal transition - won't restart timeout
  .on(State.Active, Event.Update, ({ event }) => State.Active({ data: event.data }))
  // Reenter - WILL restart timeout
  .reenter(State.Active, Event.Activity, ({ state }) =>
    State.Active({ ...state, lastActivity: Date.now() }),
  );
```

## See Also

- `handlers.md` - Transition handlers
- `testing.md` - Testing with spawn effects
- `actors.md` - Actor lifecycle
