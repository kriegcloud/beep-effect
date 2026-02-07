// @effect-diagnostics strictEffectProvide:off - tests are entry points

import { Event, Machine, Slot, State, simulate } from "@beep/machine";
import { describe, expect, test } from "@beep/testkit";
import { Effect } from "effect";
import * as S from "effect/Schema";

const CounterState = State({
  Idle: { count: S.Number },
  Counting: { count: S.Number },
  Done: { count: S.Number },
});
type CounterState = typeof CounterState.Type;

const CounterEvent = Event({
  Start: {},
  Increment: {},
  Stop: {},
});

describe("Machine", () => {
  test("creates machine with initial state using .pipe() syntax", () => {
    const machine = Machine.make({
      state: CounterState,
      event: CounterEvent,
      initial: CounterState.Idle({ count: 0 }),
    }).on(CounterState.Idle, CounterEvent.Start, ({ state }) => CounterState.Counting({ count: state.count }));
    expect(machine.initial._tag).toBe("Idle");
    expect(machine.initial.count).toBe(0);
  });

  test("defines transitions between states", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: CounterState,
          event: CounterEvent,
          initial: CounterState.Idle({ count: 0 }),
        })
          .on(CounterState.Idle, CounterEvent.Start, ({ state }) => CounterState.Counting({ count: state.count }))
          .on(CounterState.Counting, CounterEvent.Increment, ({ state }) =>
            CounterState.Counting({ count: state.count + 1 })
          )
          .on(CounterState.Counting, CounterEvent.Stop, ({ state }) => CounterState.Done({ count: state.count }))
          .final(CounterState.Done);

        const result = yield* simulate(machine, [
          CounterEvent.Start,
          CounterEvent.Increment,
          CounterEvent.Increment,
          CounterEvent.Stop,
        ]);

        expect(result.finalState._tag).toBe("Done");
        expect(result.finalState.count).toBe(2);
      })
    );
  });

  test("supports guards via Slot.Guards", async () => {
    const CounterGuards = Slot.Guards({
      belowLimit: { limit: S.Number },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: CounterState,
          event: CounterEvent,
          guards: CounterGuards,
          initial: CounterState.Counting({ count: 0 }),
        })
          .on(CounterState.Counting, CounterEvent.Increment, ({ state, guards }) =>
            Effect.gen(function* () {
              if (yield* guards.belowLimit({ limit: 3 })) {
                return CounterState.Counting({ count: state.count + 1 });
              }
              return state;
            })
          )
          .on(CounterState.Counting, CounterEvent.Stop, ({ state }) => CounterState.Done({ count: state.count }))
          .final(CounterState.Done)
          .build({
            // Handler receives (params, ctx) - context passed directly
            belowLimit: ({ limit }, { state }) => state.count < limit,
          });

        const result = yield* simulate(machine, [
          CounterEvent.Increment,
          CounterEvent.Increment,
          CounterEvent.Increment,
          CounterEvent.Increment, // blocked
          CounterEvent.Stop,
        ]);

        expect(result.finalState.count).toBe(3);
      })
    );
  });

  test("supports effects in handler via Effect<State>", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const logs: string[] = [];

        const machine = Machine.make({
          state: CounterState,
          event: CounterEvent,
          initial: CounterState.Idle({ count: 0 }),
        })
          .on(CounterState.Idle, CounterEvent.Start, ({ state }) =>
            Effect.gen(function* () {
              yield* Effect.sync(() => logs.push(`Starting from count ${state.count}`));
              return CounterState.Counting({ count: state.count });
            })
          )
          .on(CounterState.Counting, CounterEvent.Stop, ({ state }) => CounterState.Done({ count: state.count }))
          .final(CounterState.Done);

        yield* simulate(machine, [CounterEvent.Start, CounterEvent.Stop]);
        expect(logs).toEqual(["Starting from count 0"]);
      })
    );
  });

  test("marks states as final", () => {
    const machine = Machine.make({
      state: CounterState,
      event: CounterEvent,
      initial: CounterState.Idle({ count: 0 }),
    })
      .on(CounterState.Idle, CounterEvent.Start, () => CounterState.Done({ count: 0 }))
      .final(CounterState.Done);
    expect(machine.finalStates.has("Done")).toBe(true);
    expect(machine.finalStates.has("Idle")).toBe(false);
  });
});

// ============================================================================
// Multi-state .on() / .reenter() (F1)
// ============================================================================

describe("multi-state .on()", () => {
  const WState = State({
    Draft: {},
    Review: {},
    Approved: {},
    Cancelled: {},
  });
  const WEvent = Event({
    Submit: {},
    Approve: {},
    Cancel: {},
  });

  test("array of states registers transition for each", async () => {
    const machine = Machine.make({
      state: WState,
      event: WEvent,
      initial: WState.Draft,
    })
      .on([WState.Draft, WState.Review], WEvent.Cancel, () => WState.Cancelled)
      .on(WState.Draft, WEvent.Submit, () => WState.Review)
      .on(WState.Review, WEvent.Approve, () => WState.Approved)
      .final(WState.Cancelled)
      .final(WState.Approved);

    // Cancel from Draft
    const r1 = await Effect.runPromise(simulate(machine, [WEvent.Cancel]));
    expect(r1.finalState._tag).toBe("Cancelled");

    // Cancel from Review
    const r2 = await Effect.runPromise(simulate(machine, [WEvent.Submit, WEvent.Cancel]));
    expect(r2.finalState._tag).toBe("Cancelled");
  });

  test("single state still works (backward compat)", async () => {
    const machine = Machine.make({
      state: WState,
      event: WEvent,
      initial: WState.Draft,
    })
      .on(WState.Draft, WEvent.Submit, () => WState.Review)
      .on(WState.Review, WEvent.Approve, () => WState.Approved)
      .final(WState.Approved);

    const r = await Effect.runPromise(simulate(machine, [WEvent.Submit, WEvent.Approve]));
    expect(r.finalState._tag).toBe("Approved");
  });

  test("empty array is a no-op", () => {
    const machine = Machine.make({
      state: WState,
      event: WEvent,
      initial: WState.Draft,
    }).on([] as (typeof WState.Draft)[], WEvent.Cancel, () => WState.Cancelled);

    expect(machine.transitions.length).toBe(0);
  });
});

describe("multi-state .reenter()", () => {
  test("reenter with array registers for each state", () => {
    const RState = State({
      A: { value: S.Number },
      B: { value: S.Number },
    });
    const REvent = Event({ Reset: {} });

    const machine = Machine.make({
      state: RState,
      event: REvent,
      initial: RState.A({ value: 0 }),
    }).reenter([RState.A, RState.B], REvent.Reset, ({ state }) => RState.A({ value: state.value + 1 }));

    expect(machine.transitions.length).toBe(2);
    expect(machine.transitions[0]!.reenter).toBe(true);
    expect(machine.transitions[1]!.reenter).toBe(true);
  });
});

// ============================================================================
// .onAny() wildcard transitions (F5)
// ============================================================================

describe(".onAny()", () => {
  const AState = State({
    Idle: {},
    Loading: {},
    Active: {},
    Cancelled: {},
  });
  const AEvent = Event({
    Start: {},
    Load: {},
    Cancel: {},
  });

  test("wildcard catches event from any state", async () => {
    const machine = Machine.make({
      state: AState,
      event: AEvent,
      initial: AState.Idle,
    })
      .on(AState.Idle, AEvent.Start, () => AState.Loading)
      .on(AState.Loading, AEvent.Load, () => AState.Active)
      .onAny(AEvent.Cancel, () => AState.Cancelled)
      .final(AState.Cancelled);

    // Cancel from Idle
    const r1 = await Effect.runPromise(simulate(machine, [AEvent.Cancel]));
    expect(r1.finalState._tag).toBe("Cancelled");

    // Cancel from Loading
    const r2 = await Effect.runPromise(simulate(machine, [AEvent.Start, AEvent.Cancel]));
    expect(r2.finalState._tag).toBe("Cancelled");

    // Cancel from Active
    const r3 = await Effect.runPromise(simulate(machine, [AEvent.Start, AEvent.Load, AEvent.Cancel]));
    expect(r3.finalState._tag).toBe("Cancelled");
  });

  test("specific .on() takes priority over .onAny()", async () => {
    const machine = Machine.make({
      state: AState,
      event: AEvent,
      initial: AState.Idle,
    })
      .on(AState.Idle, AEvent.Cancel, () => AState.Active) // specific
      .onAny(AEvent.Cancel, () => AState.Cancelled)
      .final(AState.Active)
      .final(AState.Cancelled);

    // Idle + Cancel -> uses specific (Active), not wildcard (Cancelled)
    const r = await Effect.runPromise(simulate(machine, [AEvent.Cancel]));
    expect(r.finalState._tag).toBe("Active");
  });

  test("multiple .onAny() for different events", async () => {
    const machine = Machine.make({
      state: AState,
      event: AEvent,
      initial: AState.Idle,
    })
      .onAny(AEvent.Cancel, () => AState.Cancelled)
      .onAny(AEvent.Start, () => AState.Loading)
      .final(AState.Cancelled);

    const r1 = await Effect.runPromise(simulate(machine, [AEvent.Cancel]));
    expect(r1.finalState._tag).toBe("Cancelled");

    const r2 = await Effect.runPromise(simulate(machine, [AEvent.Start]));
    expect(r2.finalState._tag).toBe("Loading");
  });
});

// ============================================================================
// .build() (F7)
// ============================================================================

describe(".build()", () => {
  test("throws ProvisionValidationError when slots missing", () => {
    const Guards = Slot.Guards({ check: {} });
    const Effects = Slot.Effects({ notify: {} });

    const machine = Machine.make({
      state: CounterState,
      event: CounterEvent,
      guards: Guards,
      effects: Effects,
      initial: CounterState.Idle({ count: 0 }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => (machine as any).build({})).toThrow();
  });

  test("succeeds when all handlers provided", () => {
    const Guards = Slot.Guards({ check: {} });

    const built = Machine.make({
      state: CounterState,
      event: CounterEvent,
      guards: Guards,
      initial: CounterState.Idle({ count: 0 }),
    }).build({
      check: () => true,
    });

    expect(built.initial._tag).toBe("Idle");
  });

  test("no-arg build works on slotless machine", () => {
    const built = Machine.make({
      state: CounterState,
      event: CounterEvent,
      initial: CounterState.Idle({ count: 0 }),
    }).build();

    expect(built.initial._tag).toBe("Idle");
  });
});
