# Testing

Testing state machines with simulate, harness, and actors.

## Testing Approaches

| Approach              | Runs Guards/Effects | Runs Spawn | Best For                            |
|-----------------------|---------------------|------------|-------------------------------------|
| `simulate()`          | Yes                 | No         | Path assertions, quick validation   |
| `createTestHarness()` | Yes                 | No         | Step-by-step, transition inspection |
| Real Actor            | Yes                 | Yes        | Integration, timing-dependent tests |

## simulate()

Run events and get all visited states:

```ts
import { simulate, assertPath, assertReaches, assertNeverReaches } from "@beep/machine";

it.live("happy path", () =>
  Effect.gen(function* () {
    const result = yield* simulate(machine, [Event.Start, Event.Process, Event.Complete]);

    expect(result.finalState._tag).toBe("Done");
    expect(result.states.map((s) => s._tag)).toEqual(["Idle", "Processing", "Done"]);
  }),
);
```

## Path Assertions

**assertPath** - exact path match:

```ts
it.live("follows expected path", () =>
  assertPath(machine, [Event.Start, Event.Complete], ["Idle", "Processing", "Done"]),
);
```

**assertReaches** - ends at specific state:

```ts
it.live("reaches success", () =>
  Effect.gen(function* () {
    const state = yield* assertReaches(machine, [Event.Start, Event.Succeed], "Success");
    expect(state.data).toBe("expected");
  }),
);
```

**assertNeverReaches** - never visits state:

```ts
it.live("never crashes", () =>
  assertNeverReaches(machine, [Event.Start, Event.Error, Event.Retry], "Crashed"),
);
```

## createTestHarness()

Step-by-step testing with transition observation:

```ts
it.live("step by step", () =>
  Effect.gen(function* () {
    const transitions: string[] = [];

    const harness = yield* createTestHarness(machine, {
      onTransition: (from, event, to) => {
        transitions.push(`${from._tag} -[${event._tag}]-> ${to._tag}`);
      },
    });

    expect((yield* harness.getState)._tag).toBe("Idle");

    yield* harness.send(Event.Start);
    expect((yield* harness.getState)._tag).toBe("Processing");

    yield* harness.send(Event.Complete);
    expect((yield* harness.getState)._tag).toBe("Done");

    expect(transitions).toEqual(["Idle -[Start]-> Processing", "Processing -[Complete]-> Done"]);
  }),
);
```

## Testing with Guards

Guards run in simulate/harness - provide implementations first:

```ts
const machineWithGuards = Machine.make({...})
  .on(State.Error, Event.Retry, ({ guards }) =>
    Effect.gen(function* () {
      if (yield* guards.canRetry({ max: 3 })) {
        return State.Retrying;
      }
      return State.Failed;
    })
  )
  .build({
    canRetry: ({ max }, { state }) => state.attempts < max,
  });

it.live("retry blocked after max", () =>
  assertPath(
    machineWithGuards,
    [
      Event.Start,
      Event.Fail({ attempts: 3 }),  // Set attempts = 3
      Event.Retry,                   // Guard blocks: 3 < 3 = false
    ],
    ["Idle", "Processing", "Error", "Failed"]  // Goes to Failed, not Retrying
  )
);
```

## Testing Spawn Effects

Spawn effects require real actors. Use `TestClock` for time control:

```ts
import { TestClock } from "effect";
import { ActorSystemService, ActorSystemDefault } from "@beep/machine";

// Helper to let fibers run
const yieldFibers = Effect.yieldNow();

it.scoped("timeout fires", () =>
  Effect.gen(function* () {
    const system = yield* ActorSystemService;
    const actor = yield* system.spawn("test", machine);

    yield* actor.send(Event.Start);
    yield* yieldFibers;

    // State should be Waiting (timeout not fired yet)
    expect(actor.matchesSync("Waiting")).toBe(true);

    // Advance time past timeout
    yield* TestClock.adjust("30 seconds");
    yield* yieldFibers;

    // Now should be TimedOut
    expect(actor.matchesSync("TimedOut")).toBe(true);
  }).pipe(Effect.provide(ActorSystemDefault)),
);
```

**Key pattern**: Always `yield* yieldFibers` after `send()` to let effects run.

## Test Helpers

Create a test utilities file:

```ts
// test/utils/effect-test.ts
import { Effect, TestContext, Layer } from "effect";
import { describe as bunDescribe, it as bunIt, expect as bunExpect } from "bun:test";
import { ActorSystemDefault } from "@beep/machine";

export const expect = bunExpect;
export const describe = bunDescribe;

// Yield to let forked fibers run
export const yieldFibers = Effect.yieldNow();

export const it = {
  // Live clock (no TestClock)
  live: (name: string, test: () => Effect.Effect<void>) =>
    bunIt(name, () => Effect.runPromise(test())),

  // Scoped + live
  scopedLive: (name: string, test: () => Effect.Effect<void>) =>
    bunIt(name, () => Effect.runPromise(Effect.scoped(test()))),

  // With TestClock
  scoped: (name: string, test: () => Effect.Effect<void>) =>
    bunIt(name, () =>
      Effect.runPromise(Effect.scoped(test()).pipe(Effect.provide(TestContext.TestContext))),
    ),
};
```

## Testing Persistent Actors

Use `InMemoryPersistenceAdapter`:

```ts
import { InMemoryPersistenceAdapter } from "@beep/machine";

it.scoped("persists and restores", () =>
  Effect.gen(function* () {
    const system = yield* ActorSystemService;

    // Spawn and transition
    const actor1 = yield* system.spawn("order-1", persistentMachine);
    yield* actor1.send(Event.Process);
    yield* yieldFibers;

    // Force persist
    yield* actor1.persist;

    // Stop actor
    yield* actor1.stop;

    // Restore from persistence
    const actor2 = yield* system.restore("order-1", persistentMachine);
    expect(Option.isSome(actor2)).toBe(true);

    const state = yield* actor2.value.snapshot;
    expect(state._tag).toBe("Processing");
  }).pipe(Effect.provide(ActorSystemDefault), Effect.provide(InMemoryPersistenceAdapter)),
);
```

## See Also

- `handlers.md` - Guard implementation
- `effects.md` - Spawn effects
- `actors.md` - Actor lifecycle
