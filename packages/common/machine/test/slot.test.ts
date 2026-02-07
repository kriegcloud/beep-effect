// @effect-diagnostics strictEffectProvide:off - tests are entry points

import { Event, Machine, Slot, State, simulate } from "@beep/machine";
import { describe, expect, test } from "@beep/testkit";
import { Effect } from "effect";
import * as S from "effect/Schema";

describe("Parameterized Guards (via Slot.Guards)", () => {
  const TestState = State({
    Ready: { canPrint: S.Boolean },
    Printing: {},
    Done: {},
  });

  const TestEvent = Event({
    Print: {},
    Finish: {},
  });

  const TestGuards = Slot.Guards({
    canPrint: {},
  });

  test("guard slot blocks transition when handler returns false", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          guards: TestGuards,
          initial: TestState.Ready({ canPrint: false }),
        })
          .on(TestState.Ready, TestEvent.Print, ({ state, guards }) =>
            Effect.gen(function* () {
              if (yield* guards.canPrint()) {
                return TestState.Printing;
              }
              return state;
            })
          )
          .build({
            // Handlers receive (params, ctx) - no circular reference
            canPrint: (_params, { state }) => (state._tag === "Ready" ? state.canPrint : false),
          });

        const result = yield* simulate(machine, [TestEvent.Print]);
        expect(result.finalState._tag).toBe("Ready");
      })
    );
  });

  test("guard slot allows transition when handler returns true", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          guards: TestGuards,
          initial: TestState.Ready({ canPrint: true }),
        })
          .on(TestState.Ready, TestEvent.Print, ({ state, guards }) =>
            Effect.gen(function* () {
              if (yield* guards.canPrint()) {
                return TestState.Printing;
              }
              return state;
            })
          )
          .build({
            canPrint: (_params, { state }) => (state._tag === "Ready" ? state.canPrint : false),
          });

        const result = yield* simulate(machine, [TestEvent.Print]);
        expect(result.finalState._tag).toBe("Printing");
      })
    );
  });
});

describe("Parameterized Guards with Parameters", () => {
  const AuthState = State({
    Idle: { role: S.String, age: S.Number },
    Allowed: {},
    Denied: {},
  });

  const AuthEvent = Event({
    Access: {},
  });

  const AuthGuards = Slot.Guards({
    isAdmin: {},
    isAdult: { minAge: S.Number },
    isModerator: {},
  });

  test("guard with parameters: isAdult({ minAge: 18 })", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: AuthState,
          event: AuthEvent,
          guards: AuthGuards,
          initial: AuthState.Idle({ role: "admin", age: 25 }),
        })
          .on(AuthState.Idle, AuthEvent.Access, ({ guards }) =>
            Effect.gen(function* () {
              const isAdmin = yield* guards.isAdmin();
              const isAdult = yield* guards.isAdult({ minAge: 18 });
              if (isAdmin && isAdult) {
                return AuthState.Allowed;
              }
              return AuthState.Denied;
            })
          )
          .final(AuthState.Allowed)
          .final(AuthState.Denied)
          .build({
            isAdmin: (_params, { state }) => state._tag === "Idle" && state.role === "admin",
            isAdult: ({ minAge }, { state }) => state._tag === "Idle" && state.age >= minAge,
            isModerator: (_params, { state }) => state._tag === "Idle" && state.role === "moderator",
          });

        const result = yield* simulate(machine, [AuthEvent.Access]);
        expect(result.finalState._tag).toBe("Allowed");
      })
    );
  });

  test("combined guard logic with && / ||", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: AuthState,
          event: AuthEvent,
          guards: AuthGuards,
          initial: AuthState.Idle({ role: "moderator", age: 25 }),
        })
          .on(AuthState.Idle, AuthEvent.Access, ({ guards }) =>
            Effect.gen(function* () {
              // (admin OR moderator) AND adult
              const isAdmin = yield* guards.isAdmin();
              const isMod = yield* guards.isModerator();
              const isAdult = yield* guards.isAdult({ minAge: 18 });
              if ((isAdmin || isMod) && isAdult) {
                return AuthState.Allowed;
              }
              return AuthState.Denied;
            })
          )
          .final(AuthState.Allowed)
          .final(AuthState.Denied)
          .build({
            isAdmin: (_params, { state }) => state._tag === "Idle" && state.role === "admin",
            isAdult: ({ minAge }, { state }) => state._tag === "Idle" && state.age >= minAge,
            isModerator: (_params, { state }) => state._tag === "Idle" && state.role === "moderator",
          });

        const result = yield* simulate(machine, [AuthEvent.Access]);
        expect(result.finalState._tag).toBe("Allowed");
      })
    );
  });

  test("NOT logic with !", async () => {
    const LockedGuards = Slot.Guards({
      isGuest: {},
    });

    await Effect.runPromise(
      Effect.gen(function* () {
        const machine = Machine.make({
          state: AuthState,
          event: AuthEvent,
          guards: LockedGuards,
          initial: AuthState.Idle({ role: "user", age: 20 }),
        })
          .on(AuthState.Idle, AuthEvent.Access, ({ guards }) =>
            Effect.gen(function* () {
              const isGuest = yield* guards.isGuest();
              // NOT guest = allowed
              if (!isGuest) {
                return AuthState.Allowed;
              }
              return AuthState.Denied;
            })
          )
          .final(AuthState.Allowed)
          .final(AuthState.Denied)
          .build({
            isGuest: (_params, { state }) => state._tag === "Idle" && state.role === "guest",
          });

        const result = yield* simulate(machine, [AuthEvent.Access]);
        expect(result.finalState._tag).toBe("Allowed");
      })
    );
  });
});
