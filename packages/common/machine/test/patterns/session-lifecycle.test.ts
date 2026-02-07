// @effect-diagnostics strictEffectProvide:off - tests are entry points

import { ActorSystemDefault, ActorSystemService, assertPath, Event, Machine, Slot, State } from "@beep/machine";
import { describe, expect, it, yieldFibers } from "@beep/testkit";
import { Effect, TestClock } from "effect";
import * as S from "effect/Schema";

/**
 * Session lifecycle pattern tests based on bite session.machine.ts
 * Tests: initial state calculation, maintenance interrupt, session timeout
 */
describe("Session Lifecycle Pattern", () => {
  const UserRole = S.Literal("guest", "user", "admin");
  type UserRole = typeof UserRole.Type;

  const SessionState = State({
    Guest: {},
    Active: { userId: S.String, role: UserRole, lastActivity: S.Number },
    Maintenance: { message: S.String, previousState: S.Literal("Guest", "Active") },
    SessionExpired: {},
    LoggedOut: {},
  });
  type SessionState = typeof SessionState.Type;

  const SessionEvent = Event({
    Login: { userId: S.String, role: UserRole },
    Activity: {},
    MaintenanceStarted: { message: S.String },
    MaintenanceEnded: {},
    SessionTimeout: {},
    Logout: {},
  });

  const SessionEffects = Slot.Effects({
    scheduleTimeout: {},
  });

  // Helper to compute initial state based on token
  const makeSessionMachine = (token: string | null) => {
    // Initial state computed inline - no need for .always()
    const initial =
      token === null
        ? SessionState.Guest
        : SessionState.Active({ userId: "from-token", role: "user", lastActivity: Date.now() });

    return Machine.make({
      state: SessionState,
      event: SessionEvent,
      effects: SessionEffects,
      initial,
    })
      .on(SessionState.Guest, SessionEvent.Login, ({ event }) =>
        SessionState.Active({ userId: event.userId, role: event.role, lastActivity: Date.now() })
      )
      .on([SessionState.Active, SessionState.Guest], SessionEvent.MaintenanceStarted, ({ state, event }) =>
        SessionState.Maintenance({
          message: event.message,
          previousState: state._tag as "Active" | "Guest",
        })
      )
      .on(SessionState.Active, SessionEvent.SessionTimeout, () => SessionState.SessionExpired)
      .task(SessionState.Active, ({ effects }) => effects.scheduleTimeout(), {
        onSuccess: () => SessionEvent.SessionTimeout,
      })
      .on(SessionState.Maintenance, SessionEvent.MaintenanceEnded, ({ state }) =>
        state.previousState === "Active"
          ? SessionState.Active({ userId: "restored", role: "user", lastActivity: Date.now() })
          : SessionState.Guest
      )
      .on(SessionState.Active, SessionEvent.Logout, () => SessionState.LoggedOut)
      .final(SessionState.SessionExpired)
      .final(SessionState.LoggedOut)
      .build({
        scheduleTimeout: () => Effect.sleep("30 minutes"),
      });
  };

  it.live("null token starts as Guest", () =>
    Effect.gen(function* () {
      const machine = makeSessionMachine(null);
      const result = yield* assertPath(machine, [], ["Guest"]);
      expect(result.finalState._tag).toBe("Guest");
    })
  );

  it.live("valid token starts as Active", () =>
    Effect.gen(function* () {
      const machine = makeSessionMachine("valid-token");
      const result = yield* assertPath(machine, [], ["Active"]);
      expect(result.finalState._tag).toBe("Active");
    })
  );

  it.live("guest can login to active session", () =>
    Effect.gen(function* () {
      const machine = makeSessionMachine(null);
      const result = yield* assertPath(
        machine,
        [SessionEvent.Login({ userId: "user-123", role: "user" })],
        ["Guest", "Active"]
      );
      expect(result.finalState._tag).toBe("Active");
    })
  );

  it.live("maintenance mode interrupts active session", () => {
    const machine = Machine.make({
      state: SessionState,
      event: SessionEvent,
      initial: SessionState.Active({ userId: "user-1", role: "user", lastActivity: Date.now() }),
    })
      .on(SessionState.Active, SessionEvent.MaintenanceStarted, ({ event }) =>
        SessionState.Maintenance({ message: event.message, previousState: "Active" })
      )
      .on(SessionState.Maintenance, SessionEvent.MaintenanceEnded, ({ state }) =>
        state.previousState === "Active"
          ? SessionState.Active({ userId: "restored", role: "user", lastActivity: Date.now() })
          : SessionState.Guest
      );

    return assertPath(
      machine,
      [SessionEvent.MaintenanceStarted({ message: "System upgrade" }), SessionEvent.MaintenanceEnded],
      ["Active", "Maintenance", "Active"]
    );
  });

  it.scoped("session timeout after inactivity", () =>
    Effect.gen(function* () {
      const activeMachine = Machine.make({
        state: SessionState,
        event: SessionEvent,
        effects: SessionEffects,
        initial: SessionState.Active({
          userId: "user-1",
          role: "user",
          lastActivity: Date.now(),
        }),
      })
        .on(SessionState.Active, SessionEvent.SessionTimeout, () => SessionState.SessionExpired)
        .task(SessionState.Active, ({ effects }) => effects.scheduleTimeout(), {
          onSuccess: () => SessionEvent.SessionTimeout,
        })
        .final(SessionState.SessionExpired)
        .build({
          scheduleTimeout: () => Effect.sleep("30 minutes"),
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("session", activeMachine);

      let state = yield* actor.state.get;
      expect(state._tag).toBe("Active");

      // Activity within timeout window
      yield* TestClock.adjust("15 minutes");
      yield* actor.send(SessionEvent.Activity);
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("Active");

      // Activity does NOT reset timer (internal transition)
      // So after 15 more minutes (30 total from start), should timeout
      yield* TestClock.adjust("15 minutes");
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("SessionExpired");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scoped("activity with reenter resets timeout", () =>
    Effect.gen(function* () {
      const activeMachine = Machine.make({
        state: SessionState,
        event: SessionEvent,
        effects: SessionEffects,
        initial: SessionState.Active({
          userId: "user-1",
          role: "user",
          lastActivity: Date.now(),
        }),
      })
        .task(SessionState.Active, ({ effects }) => effects.scheduleTimeout(), {
          onSuccess: () => SessionEvent.SessionTimeout,
        })
        .on(SessionState.Active, SessionEvent.SessionTimeout, () => SessionState.SessionExpired)
        // Use reenter to reenter the state, resetting the task timer
        .reenter(SessionState.Active, SessionEvent.Activity, ({ state }) =>
          SessionState.Active.derive(state, { lastActivity: Date.now() })
        )
        .final(SessionState.SessionExpired)
        .build({
          scheduleTimeout: () => Effect.sleep("30 minutes"),
        });

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("session", activeMachine);

      // Activity after 20 minutes
      yield* TestClock.adjust("20 minutes");
      yield* actor.send(SessionEvent.Activity);
      yield* yieldFibers;

      let state = yield* actor.state.get;
      expect(state._tag).toBe("Active");

      // 20 more minutes (40 total, but only 20 from activity)
      yield* TestClock.adjust("20 minutes");
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("Active"); // Timer was reset

      // 10 more minutes (30 from activity)
      yield* TestClock.adjust("10 minutes");
      yield* yieldFibers;

      state = yield* actor.state.get;
      expect(state._tag).toBe("SessionExpired");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.live("logout from active session", () => {
    const activeMachine = Machine.make({
      state: SessionState,
      event: SessionEvent,
      initial: SessionState.Active({ userId: "user-1", role: "user", lastActivity: Date.now() }),
    })
      .on(SessionState.Active, SessionEvent.Logout, () => SessionState.LoggedOut)
      .final(SessionState.LoggedOut);

    return assertPath(activeMachine, [SessionEvent.Logout], ["Active", "LoggedOut"]);
  });
});
