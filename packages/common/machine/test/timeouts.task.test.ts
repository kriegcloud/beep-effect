// @effect-diagnostics strictEffectProvide:off - tests are entry points

import { ActorSystemDefault, ActorSystemService, Event, Machine, Slot, State } from "@beep/machine";
import { describe, expect, it, yieldFibers } from "@beep/testkit";
import { Duration, Effect, TestClock } from "effect";
import * as S from "effect/Schema";

describe("Timeout Transitions via Task", () => {
  const NotifState = State({
    Showing: { message: S.String },
    Dismissed: {},
  });
  type NotifState = typeof NotifState.Type;

  const NotifEvent = Event({
    Dismiss: {},
  });
  type NotifEvent = typeof NotifEvent.Type;

  const NotifEffects = Slot.Effects({
    scheduleAutoDismiss: {},
  });

  it.scoped("schedules event after duration with TestClock", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: NotifState,
        event: NotifEvent,
        effects: NotifEffects,
        initial: NotifState.Showing({ message: "Hello" }),
      })
        .on(NotifState.Showing, NotifEvent.Dismiss, () => NotifState.Dismissed)
        .task(NotifState.Showing, ({ effects }) => effects.scheduleAutoDismiss(), {
          onSuccess: () => NotifEvent.Dismiss,
        })
        .final(NotifState.Dismissed)
        .build({
          scheduleAutoDismiss: () => Effect.sleep("3 seconds"),
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("notification", machine);

      // Initial state
      let current = yield* actor.state.get;
      expect(current._tag).toBe("Showing");

      // Advance time by 3 seconds
      yield* TestClock.adjust("3 seconds");

      // Allow fibers to run
      yield* yieldFibers;

      // Should have transitioned
      current = yield* actor.state.get;
      expect(current._tag).toBe("Dismissed");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scoped("cancels timer on state exit before timeout", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: NotifState,
        event: NotifEvent,
        effects: NotifEffects,
        initial: NotifState.Showing({ message: "Hello" }),
      })
        .on(NotifState.Showing, NotifEvent.Dismiss, () => NotifState.Dismissed)
        .task(NotifState.Showing, ({ effects }) => effects.scheduleAutoDismiss(), {
          onSuccess: () => NotifEvent.Dismiss,
        })
        .final(NotifState.Dismissed)
        .build({
          scheduleAutoDismiss: () => Effect.sleep("3 seconds"),
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("notification", machine);

      // Manual dismiss before timer
      yield* actor.send(NotifEvent.Dismiss);
      yield* yieldFibers;

      let current = yield* actor.state.get;
      expect(current._tag).toBe("Dismissed");

      // Advance time - should not cause issues since timer was cancelled
      yield* TestClock.adjust("5 seconds");
      yield* yieldFibers;

      current = yield* actor.state.get;
      expect(current._tag).toBe("Dismissed");
    }).pipe(Effect.provide(ActorSystemDefault))
  );
});

describe("Dynamic Timeout Duration via Task", () => {
  const WaitState = State({
    Waiting: { timeout: S.Number },
    TimedOut: {},
  });
  type WaitState = typeof WaitState.Type;

  const WaitEvent = Event({
    Timeout: {},
  });

  const WaitEffects = Slot.Effects({
    scheduleTimeout: {},
  });

  it.scoped("dynamic duration computed from state", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: WaitState,
        event: WaitEvent,
        effects: WaitEffects,
        initial: WaitState.Waiting({ timeout: 5 }),
      })
        .on(WaitState.Waiting, WaitEvent.Timeout, () => WaitState.TimedOut)
        .task(WaitState.Waiting, ({ effects }) => effects.scheduleTimeout(), {
          onSuccess: () => WaitEvent.Timeout,
        })
        .final(WaitState.TimedOut)
        .build({
          scheduleTimeout: (_, { state }) => {
            const s = state as WaitState & { _tag: "Waiting" };
            return Effect.sleep(Duration.seconds(s.timeout));
          },
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("waiter", machine);

      // Initial state
      let current = yield* actor.state.get;
      expect(current._tag).toBe("Waiting");

      // Advance 3 seconds - not enough
      yield* TestClock.adjust("3 seconds");
      yield* yieldFibers;

      current = yield* actor.state.get;
      expect(current._tag).toBe("Waiting");

      // Advance 2 more seconds (5 total) - should timeout
      yield* TestClock.adjust("2 seconds");
      yield* yieldFibers;

      current = yield* actor.state.get;
      expect(current._tag).toBe("TimedOut");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scoped("dynamic duration with different state values", () =>
    Effect.gen(function* () {
      const RetryState = State({
        Retrying: { attempt: S.Number, backoff: S.Number },
        Failed: {},
        Success: {},
      });
      type RetryState = typeof RetryState.Type;

      const RetryEvent = Event({
        Retry: {},
        GiveUp: {},
      });

      const RetryEffects = Slot.Effects({
        scheduleGiveUp: {},
      });

      const machine = Machine.make({
        state: RetryState,
        event: RetryEvent,
        effects: RetryEffects,
        initial: RetryState.Retrying({ attempt: 1, backoff: 1 }),
      })
        .reenter(RetryState.Retrying, RetryEvent.Retry, ({ state }) =>
          RetryState.Retrying({ attempt: state.attempt + 1, backoff: state.backoff * 2 })
        )
        .on(RetryState.Retrying, RetryEvent.GiveUp, () => RetryState.Failed)
        // Exponential backoff based on state
        .task(RetryState.Retrying, ({ effects }) => effects.scheduleGiveUp(), {
          onSuccess: () => RetryEvent.GiveUp,
        })
        .final(RetryState.Failed)
        .build({
          scheduleGiveUp: (_, { state }) => {
            const s = state as RetryState & { _tag: "Retrying" };
            return Effect.sleep(Duration.seconds(s.backoff));
          },
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("retry", machine);

      // First attempt - 1 second backoff timer starts
      let current = yield* actor.state.get;
      expect(current._tag).toBe("Retrying");
      expect((current as RetryState & { _tag: "Retrying" }).backoff).toBe(1);

      // Advance 0.5 seconds, then manual retry (cancels old timer, starts new with 2s)
      yield* TestClock.adjust("500 millis");
      yield* actor.send(RetryEvent.Retry);
      yield* yieldFibers;

      // Now backoff is 2 seconds, new timer started
      current = yield* actor.state.get;
      expect((current as RetryState & { _tag: "Retrying" }).backoff).toBe(2);

      // Wait 1.5 seconds - should still be retrying (need 2s for new timer)
      yield* TestClock.adjust("1500 millis");
      yield* yieldFibers;
      current = yield* actor.state.get;
      expect(current._tag).toBe("Retrying");

      // Wait 0.5 more seconds (2 total from retry) - should give up
      yield* TestClock.adjust("500 millis");
      yield* yieldFibers;
      current = yield* actor.state.get;
      expect(current._tag).toBe("Failed");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scoped("static duration still works", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: WaitState,
        event: WaitEvent,
        effects: WaitEffects,
        initial: WaitState.Waiting({ timeout: 999 }),
      })
        .on(WaitState.Waiting, WaitEvent.Timeout, () => WaitState.TimedOut)
        // Static "3 seconds" ignores state.timeout
        .task(WaitState.Waiting, ({ effects }) => effects.scheduleTimeout(), {
          onSuccess: () => WaitEvent.Timeout,
        })
        .final(WaitState.TimedOut)
        .build({
          scheduleTimeout: () => Effect.sleep("3 seconds"),
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("waiter", machine);

      yield* TestClock.adjust("3 seconds");
      yield* yieldFibers;

      const current = yield* actor.state.get;
      expect(current._tag).toBe("TimedOut");
    }).pipe(Effect.provide(ActorSystemDefault))
  );
});
