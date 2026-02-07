// @effect-diagnostics strictEffectProvide:off - tests are entry points

import { Event, Machine, Slot, State, simulate } from "@beep/machine";
import { describe, expect, test } from "@beep/testkit";
import { Effect } from "effect";
import * as S from "effect/Schema";

describe("Conditional Transitions (replaces choose combinator)", () => {
  test("first matching guard wins", async () => {
    const TestState = State({
      Idle: { value: S.Number },
      High: {},
      Medium: {},
      Low: {},
    });

    const TestEvent = Event({
      Check: {},
    });

    const TestGuards = Slot.Guards({
      isHigh: {},
      isMedium: {},
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          guards: TestGuards,
          initial: TestState.Idle({ value: 75 }),
        })
          .on(TestState.Idle, TestEvent.Check, ({ guards }) =>
            Effect.gen(function* () {
              if (yield* guards.isHigh()) {
                return TestState.High;
              }
              if (yield* guards.isMedium()) {
                return TestState.Medium;
              }
              return TestState.Low;
            })
          )
          .final(TestState.High)
          .final(TestState.Medium)
          .final(TestState.Low)
          .build({
            isHigh: (_params, { state }) => state._tag === "Idle" && state.value >= 70,
            isMedium: (_params, { state }) => state._tag === "Idle" && state.value >= 40,
          });

        const result = yield* simulate(machine, [TestEvent.Check]);
        expect(result.finalState._tag).toBe("High");
      })
    );
  });

  test("fallback branch catches all", async () => {
    const TestState = State({
      Idle: { value: S.Number },
      High: {},
      Low: {},
    });

    const TestEvent = Event({
      Check: {},
    });

    const TestGuards = Slot.Guards({
      isHigh: {},
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          guards: TestGuards,
          initial: TestState.Idle({ value: 10 }),
        })
          .on(TestState.Idle, TestEvent.Check, ({ guards }) =>
            Effect.gen(function* () {
              if (yield* guards.isHigh()) {
                return TestState.High;
              }
              // Fallback
              return TestState.Low;
            })
          )
          .final(TestState.High)
          .final(TestState.Low)
          .build({
            isHigh: (_params, { state }) => state._tag === "Idle" && state.value >= 70,
          });

        const result = yield* simulate(machine, [TestEvent.Check]);
        expect(result.finalState._tag).toBe("Low");
      })
    );
  });

  test("runs effect in matching branch", async () => {
    const TestState = State({
      Idle: {},
      Done: {},
    });

    const TestEvent = Event({
      Go: {},
    });

    const TestEffects = Slot.Effects({
      logAction: { message: S.String },
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const logs: string[] = [];

        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          effects: TestEffects,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Go, ({ effects }) =>
            Effect.gen(function* () {
              yield* effects.logAction({ message: "effect ran" });
              return TestState.Done;
            })
          )
          .final(TestState.Done)
          .build({
            logAction: ({ message }) =>
              Effect.sync(() => {
                logs.push(message);
              }),
          });

        yield* simulate(machine, [TestEvent.Go]);
        expect(logs).toEqual(["effect ran"]);
      })
    );
  });
});
