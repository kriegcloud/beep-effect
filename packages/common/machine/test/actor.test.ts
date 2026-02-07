// @effect-diagnostics strictEffectProvide:off - tests are entry points

import type { ActorRef } from "@beep/machine";
import { ActorSystemDefault, ActorSystemService, Event, Machine, Slot, State } from "@beep/machine";
import { describe, expect, it, yieldFibers } from "@beep/testkit";
import { Context, Deferred, Effect, Fiber, Layer, Ref, Stream } from "effect";
import * as S from "effect/Schema";

// ============================================================================
// Shared Test Fixtures
// ============================================================================

const TestState = State({
  Idle: {},
  Loading: { value: S.Number },
  Active: { value: S.Number },
  Done: {},
});
type TestState = typeof TestState.Type;

const TestEvent = Event({
  Start: { value: S.Number },
  Complete: {},
  Update: { value: S.Number },
  Stop: {},
});
type TestEvent = typeof TestEvent.Type;

const TestGuards = Slot.Guards({
  isHighValue: {},
});

const createTestMachine = () =>
  Machine.make({
    state: TestState,
    event: TestEvent,
    guards: TestGuards,
    initial: TestState.Idle,
  })
    .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Loading({ value: event.value }))
    .on(TestState.Loading, TestEvent.Complete, ({ state }) => TestState.Active({ value: state.value }))
    .on(TestState.Active, TestEvent.Update, ({ event, guards }) =>
      Effect.gen(function* () {
        // If high value (> 100), double it
        if (yield* guards.isHighValue()) {
          return TestState.Active({ value: event.value * 2 });
        }
        return TestState.Active({ value: event.value });
      })
    )
    .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
    .final(TestState.Done)
    .build({
      isHighValue: (_params, { event }) => event._tag === "Update" && event.value > 100,
    });

// ============================================================================
// ActorSystem Tests
// ============================================================================

describe("ActorSystem", () => {
  it.scopedLive("spawns actors and processes events", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Update, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
        .final(TestState.Done)
        .build();

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("test-actor", machine);

      yield* actor.send(TestEvent.Start({ value: 10 }));
      yield* yieldFibers;

      const state1 = yield* actor.state.get;
      expect(state1._tag).toBe("Active");

      yield* actor.send(TestEvent.Update({ value: 20 }));
      yield* yieldFibers;

      const state2 = yield* actor.state.get;
      expect(state2._tag).toBe("Active");
      if (state2._tag === "Active") {
        expect(state2.value).toBe(20);
      }

      yield* actor.send(TestEvent.Stop);
      yield* yieldFibers;

      const state3 = yield* actor.state.get;
      expect(state3._tag).toBe("Done");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scopedLive("stops actors properly", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .build();

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("test-actor", machine);

      yield* actor.send(TestEvent.Start({ value: 5 }));
      yield* yieldFibers;

      // Verify actor is in expected state before stopping
      const stateBeforeStop = yield* actor.snapshot;
      expect(stateBeforeStop._tag).toBe("Active");

      yield* system.stop("test-actor");

      // Verify actor is no longer in system
      const actorAfterStop = yield* system.get("test-actor");
      expect(actorAfterStop._tag).toBe("None");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scopedLive("duplicate spawn does not run effects", () =>
    Effect.gen(function* () {
      const SimpleState = State({ Idle: {} });
      const SimpleEvent = Event({ Ping: {} });
      const TestEffects = Slot.Effects({ mark: {} });

      const counter = yield* Ref.make(0);

      const machine = Machine.make({
        state: SimpleState,
        event: SimpleEvent,
        effects: TestEffects,
        initial: SimpleState.Idle,
      })
        .background(({ effects }) => effects.mark())
        .build({
          mark: () => Ref.update(counter, (n) => n + 1),
        });

      const system = yield* ActorSystemService;
      yield* system.spawn("dup-actor", machine);
      yield* yieldFibers;

      const result = yield* Effect.either(system.spawn("dup-actor", machine));
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left._tag).toBe("DuplicateActorError");
      }

      yield* yieldFibers;
      const count = yield* Ref.get(counter);
      expect(count).toBe(1);
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scopedLive("concurrent spawn only runs effects once", () =>
    Effect.gen(function* () {
      const SimpleState = State({ Idle: {} });
      const SimpleEvent = Event({ Ping: {} });
      const TestEffects = Slot.Effects({ mark: {} });

      const counter = yield* Ref.make(0);

      const machine = Machine.make({
        state: SimpleState,
        event: SimpleEvent,
        effects: TestEffects,
        initial: SimpleState.Idle,
      })
        .background(({ effects }) => effects.mark())
        .build({
          mark: () => Ref.update(counter, (n) => n + 1),
        });

      const system = yield* ActorSystemService;
      const [resultA, resultB] = yield* Effect.all(
        [
          Effect.either(system.spawn("concurrent-actor", machine)),
          Effect.either(system.spawn("concurrent-actor", machine)),
        ],
        { concurrency: "unbounded" }
      );

      const failures = [resultA, resultB].filter((result) => result._tag === "Left");
      expect(failures.length).toBe(1);
      if (failures[0]?._tag === "Left") {
        expect(failures[0].left._tag).toBe("DuplicateActorError");
      }

      yield* yieldFibers;
      const count = yield* Ref.get(counter);
      expect(count).toBe(1);
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.live("build validates missing slot handlers", () =>
    Effect.sync(() => {
      const SimpleState = State({ Idle: {} });
      const SimpleEvent = Event({ Ping: {} });
      const TestEffects = Slot.Effects({ mark: {} });

      const machine = Machine.make({
        state: SimpleState,
        event: SimpleEvent,
        effects: TestEffects,
        initial: SimpleState.Idle,
      });

      // .build() without required handlers throws ProvisionValidationError
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => (machine as any).build({})).toThrow();
    })
  );

  it.scopedLive("listener errors do not break event loop", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
        .build();

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("listener-actor", machine);

      actor.subscribe(() => {
        throw new Error("boom");
      });

      yield* actor.send(TestEvent.Start({ value: 1 }));
      yield* yieldFibers;

      yield* actor.send(TestEvent.Stop);
      yield* yieldFibers;

      const state = yield* actor.snapshot;
      expect(state._tag).toBe("Done");
    }).pipe(Effect.provide(ActorSystemDefault))
  );

  it.scopedLive("send after stop is a no-op", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
        .build();

      const system = yield* ActorSystemService;
      const actor = yield* system.spawn("stopped-actor", machine);

      yield* actor.send(TestEvent.Start({ value: 10 }));
      yield* yieldFibers;

      const beforeStop = yield* actor.snapshot;
      expect(beforeStop._tag).toBe("Active");

      yield* actor.stop;
      yield* actor.send(TestEvent.Stop);
      yield* yieldFibers;

      const afterStop = yield* actor.snapshot;
      expect(afterStop._tag).toBe("Active");
    }).pipe(Effect.provide(ActorSystemDefault))
  );
});

// ============================================================================
// Machine.spawn Tests (simple API without ActorSystem)
// ============================================================================

describe("Machine.spawn", () => {
  it.scopedLive("spawns actor without ActorSystem", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
        .final(TestState.Done)
        .build();

      // No ActorSystemService needed!
      const actor = yield* Machine.spawn(machine);

      yield* actor.send(TestEvent.Start({ value: 42 }));
      yield* yieldFibers;

      const state = yield* actor.snapshot;
      expect(state._tag).toBe("Active");
      if (state._tag === "Active") {
        expect(state.value).toBe(42);
      }
    })
  );

  it.scopedLive("spawns actor with custom ID", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .build();

      const actor = yield* Machine.spawn(machine, "my-custom-id");

      expect(actor.id).toBe("my-custom-id");
    })
  );

  it.scopedLive("auto-generates ID when not provided", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      }).build();

      const actor = yield* Machine.spawn(machine);

      expect(actor.id).toMatch(/^actor-/);
    })
  );

  it.live("spawns without scope — caller manages lifetime via actor.stop", () =>
    Effect.gen(function* () {
      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
        .final(TestState.Done)
        .build();

      // No scope needed — Machine.spawn works without Effect.scoped
      const actor = yield* Machine.spawn(machine);

      yield* actor.send(TestEvent.Start({ value: 99 }));
      yield* yieldFibers;

      const state = yield* actor.snapshot;
      expect(state._tag).toBe("Active");
      if (state._tag === "Active") {
        expect(state.value).toBe(99);
      }

      // Caller manages lifetime
      yield* actor.stop;
    })
  );

  it.scopedLive("cleans up on scope close", () =>
    Effect.gen(function* () {
      const cleanedUp: string[] = [];

      const TestEffects = Slot.Effects({ track: {} });

      const machine = Machine.make({
        state: TestState,
        event: TestEvent,
        effects: TestEffects,
        initial: TestState.Idle,
      })
        .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
        .spawn(TestState.Active, ({ effects }) => effects.track())
        .build({
          track: () => Effect.addFinalizer(() => Effect.sync(() => cleanedUp.push("cleaned"))),
        });

      // Run in inner scope
      yield* Effect.scoped(
        Effect.gen(function* () {
          const actor = yield* Machine.spawn(machine);
          yield* actor.send(TestEvent.Start({ value: 1 }));
          yield* yieldFibers;
          expect(cleanedUp).toEqual([]);
        })
      );

      // After scope closes, finalizer should have run
      expect(cleanedUp).toEqual(["cleaned"]);
    })
  );
});

// ============================================================================
// ActorRef Tests
// ============================================================================

describe("ActorRef", () => {
  describe("snapshot / snapshotSync", () => {
    it.scopedLive("snapshot returns current state (Effect)", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const state = yield* actor.snapshot;
        expect(state._tag).toBe("Idle");
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("snapshotSync returns current state synchronously", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const state = actor.snapshotSync();
        expect(state._tag).toBe("Idle");
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("snapshot updates after transitions", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        yield* actor.send(TestEvent.Start({ value: 42 }));
        yield* yieldFibers;

        const state = yield* actor.snapshot;
        expect(state._tag).toBe("Loading");
        expect((state as { value: number }).value).toBe(42);
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("matches / matchesSync", () => {
    it.scopedLive("matches returns true for current state", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const isIdle = yield* actor.matches("Idle");
        expect(isIdle).toBe(true);

        const isLoading = yield* actor.matches("Loading");
        expect(isLoading).toBe(false);
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("matchesSync returns synchronously", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        expect(actor.matchesSync("Idle")).toBe(true);
        expect(actor.matchesSync("Loading")).toBe(false);
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("matches updates after transitions", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        yield* actor.send(TestEvent.Start({ value: 10 }));
        yield* yieldFibers;

        expect(yield* actor.matches("Loading")).toBe(true);
        expect(yield* actor.matches("Idle")).toBe(false);
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("can / canSync", () => {
    it.scopedLive("can returns true when transition is possible", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        // In Idle state, can Start
        const canStart = yield* actor.can(TestEvent.Start({ value: 1 }));
        expect(canStart).toBe(true);

        // In Idle state, cannot Complete
        const canComplete = yield* actor.can(TestEvent.Complete);
        expect(canComplete).toBe(false);
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("canSync returns synchronously", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        expect(actor.canSync(TestEvent.Start({ value: 1 }))).toBe(true);
        expect(actor.canSync(TestEvent.Complete)).toBe(false);
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("can accounts for guards", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        // Transition to Active state
        yield* actor.send(TestEvent.Start({ value: 10 }));
        yield* yieldFibers;
        yield* actor.send(TestEvent.Complete);
        yield* yieldFibers;

        // Update with value <= 100 uses regular path
        const canUpdateLow = yield* actor.can(TestEvent.Update({ value: 50 }));
        expect(canUpdateLow).toBe(true);

        // Update with value > 100 also works (uses high value path)
        const canUpdateHigh = yield* actor.can(TestEvent.Update({ value: 200 }));
        expect(canUpdateHigh).toBe(true);
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("state (SubscriptionRef)", () => {
    it.scopedLive("state provides access to SubscriptionRef", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        // Access state directly
        const state = yield* actor.state;
        expect(state._tag).toBe("Idle");
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("state changes stream emits on transitions", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const tags: string[] = [];

        // Start collecting changes in background
        yield* Effect.fork(
          actor.state.changes.pipe(
            Stream.take(3),
            Stream.tap((s) =>
              Effect.sync(() => {
                tags.push(s._tag);
              })
            ),
            Stream.runDrain
          )
        );

        // Make transitions
        yield* actor.send(TestEvent.Start({ value: 1 }));
        yield* yieldFibers;
        yield* actor.send(TestEvent.Complete);
        yield* yieldFibers;
        yield* actor.send(TestEvent.Stop);
        yield* yieldFibers;

        // Should have captured the transitions
        expect(tags).toContain("Loading");
        expect(tags).toContain("Active");
        expect(tags).toContain("Done");
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("subscribe (sync)", () => {
    it.scopedLive("subscribe notifies on state changes", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const states: string[] = [];
        const unsubscribe = actor.subscribe((s) => states.push(s._tag));

        yield* actor.send(TestEvent.Start({ value: 1 }));
        yield* yieldFibers;
        yield* actor.send(TestEvent.Complete);
        yield* yieldFibers;

        expect(states).toContain("Loading");
        expect(states).toContain("Active");

        unsubscribe();
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("unsubscribe stops notifications", () =>
      Effect.gen(function* () {
        const machine = createTestMachine();
        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("test", machine);

        const states: string[] = [];
        const unsubscribe = actor.subscribe((s) => states.push(s._tag));

        yield* actor.send(TestEvent.Start({ value: 1 }));
        yield* yieldFibers;

        unsubscribe();

        yield* actor.send(TestEvent.Complete);
        yield* yieldFibers;

        // Should only have Loading, not Active
        expect(states).toEqual(["Loading"]);
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("waitFor / awaitFinal / sendAndWait", () => {
    it.scopedLive("waitFor accepts state constructor", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("wait-for", machine);

        yield* actor.send(TestEvent.Start({ value: 1 }));
        yield* yieldFibers;

        const state = yield* actor.waitFor(TestState.Done);
        expect(state._tag).toBe("Done");
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("sendAndWait accepts state constructor", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .build();

        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("send-and-wait", machine);

        const state = yield* actor.sendAndWait(TestEvent.Start({ value: 5 }), TestState.Active);
        expect(state._tag).toBe("Active");
        if (state._tag === "Active") {
          expect(state.value).toBe(5);
        }
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("awaitFinal resolves after final state", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("await-final", machine);

        yield* actor.send(TestEvent.Start({ value: 1 }));
        yield* yieldFibers;

        const state = yield* actor.awaitFinal;
        expect(state._tag).toBe("Done");
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("task", () => {
    const TaskState = State({
      Idle: {},
      Running: {},
      Done: {},
      Failed: { message: S.String },
    });
    type TaskState = typeof TaskState.Type;

    const TaskEvent = Event({
      Start: {},
      Success: {},
      Fail: { message: S.String },
    });
    type TaskEvent = typeof TaskEvent.Type;

    it.scopedLive("task sends success event", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TaskState,
          event: TaskEvent,
          initial: TaskState.Idle,
        })
          .on(TaskState.Idle, TaskEvent.Start, () => TaskState.Running)
          .on(TaskState.Running, TaskEvent.Success, () => TaskState.Done)
          .task(TaskState.Running, () => Effect.succeed("ok"), {
            onSuccess: () => TaskEvent.Success,
          })
          .final(TaskState.Done)
          .build();

        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("task-success", machine);

        yield* actor.send(TaskEvent.Start);
        const finalState = yield* actor.awaitFinal;

        expect(finalState._tag).toBe("Done");
      }).pipe(Effect.provide(ActorSystemDefault))
    );

    it.scopedLive("task sends failure event", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TaskState,
          event: TaskEvent,
          initial: TaskState.Idle,
        })
          .on(TaskState.Idle, TaskEvent.Start, () => TaskState.Running)
          .on(TaskState.Running, TaskEvent.Fail, ({ event }) => TaskState.Failed({ message: event.message }))
          .task(TaskState.Running, () => Effect.fail("boom"), {
            onSuccess: () => TaskEvent.Success,
            onFailure: () => TaskEvent.Fail({ message: "boom" }),
          })
          .final(TaskState.Failed)
          .build();

        const system = yield* ActorSystemService;
        const actor = yield* system.spawn("task-failure", machine);

        yield* actor.send(TaskEvent.Start);
        const finalState = yield* actor.awaitFinal;

        expect(finalState._tag).toBe("Failed");
        if (finalState._tag === "Failed") {
          expect(finalState.message).toBe("boom");
        }
      }).pipe(Effect.provide(ActorSystemDefault))
    );
  });

  describe("waitFor race (fast-failing task)", () => {
    it.live("waitFor does not hang when task fails immediately", () =>
      Effect.gen(function* () {
        const TS = State({
          Idle: {},
          Running: {},
          Done: {},
        });
        const TE = Event({
          Start: {},
          Completed: {},
          Failed: {},
        });

        const machine = Machine.make({ state: TS, event: TE, initial: TS.Idle })
          .on(TS.Idle, TE.Start, () => TS.Running)
          .on(TS.Running, TE.Completed, () => TS.Done)
          .on(TS.Running, TE.Failed, () => TS.Idle)
          .task(TS.Running, () => Effect.fail("instant-failure"), {
            onSuccess: () => TE.Completed,
            onFailure: () => TE.Failed,
          })
          .final(TS.Done)
          .build();

        // Mirrors the gent AgentLoop pattern: send → yieldNow → waitFor(Running)
        // The task fails immediately so Running→Idle can happen before
        // waitFor subscribes. With the old get-then-subscribe waitFor, this hangs.
        interface LoopService {
          readonly run: () => Effect.Effect<string>;
        }
        const LoopTag = Context.GenericTag<LoopService>("test/FastFailLoop");

        const LoopLive = Layer.scoped(
          LoopTag,
          Effect.gen(function* () {
            const actorRef = yield* Ref.make<ActorRef<typeof TS.Type, typeof TE.Type> | undefined>(undefined);

            // Machine.spawn no longer requires Scope.Scope — scope detection
            // auto-attaches cleanup when a scope exists in context (Layer.scoped provides one)
            const getActor = Effect.gen(function* () {
              const existing = yield* Ref.get(actorRef);
              if (existing !== undefined) return existing;
              const actor = yield* Machine.spawn(machine);
              yield* Ref.set(actorRef, actor);
              return actor;
            });

            return LoopTag.of({
              run: () =>
                Effect.gen(function* () {
                  const actor = yield* getActor;
                  yield* actor.send(TE.Start);
                  yield* Effect.yieldNow();
                  yield* actor.waitFor(TS.Running);
                  yield* actor.waitFor((s) => s._tag !== "Running");
                  const final = yield* actor.snapshot;
                  return final._tag;
                }),
            });
          })
        );

        const done = yield* Deferred.make<string>();

        const program = Effect.gen(function* () {
          const svc = yield* LoopTag;

          const fiber = yield* Effect.forkDaemon(
            svc.run().pipe(
              Effect.tap((result) => Deferred.succeed(done, result)),
              Effect.catchAllCause(() => Deferred.succeed(done, "error"))
            )
          );

          const result = yield* Deferred.await(done).pipe(
            Effect.timeout("2 seconds"),
            Effect.catchAll(() => Effect.succeed("timeout" as const))
          );

          if (result === "timeout") {
            yield* Fiber.interrupt(fiber);
          }

          // Must not hang — should resolve to Idle (task failed → Running→Idle)
          expect(result).not.toBe("timeout");
          expect(result).toBe("Idle");
        });

        yield* program.pipe(Effect.provide(LoopLive));
      })
    );
  });

  describe("spawn with external scope", () => {
    // Pattern: Layer.scoped service spawns machine — scope detection auto-attaches
    // cleanup, no manual scope management needed.
    it.live("Layer.scoped + task + forkDaemon send/waitFor", () =>
      Effect.gen(function* () {
        const TS = State({
          Idle: {},
          Running: { value: S.Number },
          Done: { result: S.String },
        });
        const TE = Event({
          Start: { value: S.Number },
          Completed: { result: S.String },
        });

        const machine = Machine.make({ state: TS, event: TE, initial: TS.Idle })
          .on(TS.Idle, TE.Start, ({ event }) => TS.Running({ value: event.value }))
          .on(TS.Running, TE.Completed, ({ event }) => TS.Done({ result: event.result }))
          .task(
            TS.Running,
            ({ state }) =>
              Effect.gen(function* () {
                yield* Effect.sleep("10 millis");
                return `processed-${state.value}`;
              }),
            {
              onSuccess: (result) => TE.Completed({ result }),
              onFailure: () => TE.Completed({ result: "failed" }),
            }
          )
          .final(TS.Done)
          .build();

        type Actor = ActorRef<typeof TS.Type, typeof TE.Type>;

        interface LoopService {
          readonly run: (value: number) => Effect.Effect<void>;
        }
        const LoopTag = Context.GenericTag<LoopService>("test/LoopService");

        const LoopLive = Layer.scoped(
          LoopTag,
          Effect.gen(function* () {
            const actorRef = yield* Ref.make<Actor | undefined>(undefined);

            // Machine.spawn no longer requires Scope.Scope — scope detection
            // auto-attaches cleanup when a scope exists in context
            const getActor = Effect.gen(function* () {
              const existing = yield* Ref.get(actorRef);
              if (existing !== undefined) return existing;
              const actor = yield* Machine.spawn(machine);
              yield* Ref.set(actorRef, actor);
              return actor;
            });

            return LoopTag.of({
              run: (value) =>
                Effect.gen(function* () {
                  const actor = yield* getActor;
                  yield* actor.send(TE.Start({ value }));
                  yield* Effect.yieldNow();
                  yield* actor.waitFor(TS.Running);
                  yield* actor.waitFor(TS.Done);
                }),
            });
          })
        );

        const done = yield* Deferred.make<void>();

        const program = Effect.gen(function* () {
          const svc = yield* LoopTag;

          const fiber = yield* Effect.forkDaemon(
            svc.run(42).pipe(
              Effect.tap(() => Deferred.succeed(done, void 0)),
              Effect.catchAllCause(() => Effect.void)
            )
          );

          const result = yield* Deferred.await(done).pipe(
            Effect.timeout("2 seconds"),
            Effect.catchAll(() => Effect.succeed("timeout" as const))
          );

          if (result === "timeout") {
            yield* Fiber.interrupt(fiber);
          }

          expect(result).not.toBe("timeout");
        });

        yield* program.pipe(Effect.provide(LoopLive));
      })
    );
  });

  // ============================================================================
  // waitFor deadlock regression (F3)
  // ============================================================================

  describe("waitFor deadlock regression", () => {
    it.scopedLive("sendAndWait does not deadlock on synchronous transition", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Loading({ value: event.value }))
          .on(TestState.Loading, TestEvent.Complete, ({ state }) => TestState.Active({ value: state.value }))
          .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const actor = yield* Machine.spawn(machine);

        // Send Start and wait for Loading — must not deadlock
        const result = yield* Effect.race(
          actor.sendAndWait(TestEvent.Start({ value: 1 }), TestState.Loading),
          Effect.sleep("2 seconds").pipe(Effect.as("DEADLOCK" as const))
        );

        expect(result).not.toBe("DEADLOCK");
        expect((result as TestState)._tag).toBe("Loading");
      })
    );

    it.scopedLive("concurrent sendAndWait + state change does not deadlock", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const actor = yield* Machine.spawn(machine);

        // Fire-and-forget start, then waitFor Active
        yield* actor.send(TestEvent.Start({ value: 42 }));
        const result = yield* Effect.race(
          actor.waitFor(TestState.Active),
          Effect.sleep("2 seconds").pipe(Effect.as("DEADLOCK" as const))
        );

        expect(result).not.toBe("DEADLOCK");
        expect((result as TestState)._tag).toBe("Active");
      })
    );
  });

  // ============================================================================
  // sendSync (F4)
  // ============================================================================

  describe("sendSync", () => {
    it.scopedLive("sendSync sends event synchronously", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const actor = yield* Machine.spawn(machine);
        actor.sendSync(TestEvent.Start({ value: 7 }));
        yield* yieldFibers;

        const state = yield* actor.snapshot;
        expect(state._tag).toBe("Active");
        if (state._tag === "Active") {
          expect(state.value).toBe(7);
        }
      })
    );

    it.scopedLive("sendSync is no-op on stopped actor", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .build();

        const actor = yield* Machine.spawn(machine);
        yield* actor.stop;

        // Should not throw
        actor.sendSync(TestEvent.Start({ value: 1 }));

        const state = yield* actor.snapshot;
        expect(state._tag).toBe("Idle");
      })
    );
  });

  // ============================================================================
  // waitFor / sendAndWait state constructor overload (F6)
  // ============================================================================

  describe("waitFor state constructor overload", () => {
    it.scopedLive("waitFor accepts state constructor", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .on(TestState.Active, TestEvent.Stop, () => TestState.Done)
          .final(TestState.Done)
          .build();

        const actor = yield* Machine.spawn(machine);
        yield* actor.send(TestEvent.Start({ value: 10 }));

        const state = yield* actor.waitFor(TestState.Active);
        expect(state._tag).toBe("Active");
      })
    );

    it.scopedLive("sendAndWait accepts state constructor", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        })
          .on(TestState.Idle, TestEvent.Start, ({ event }) => TestState.Active({ value: event.value }))
          .build();

        const actor = yield* Machine.spawn(machine);

        const state = yield* actor.sendAndWait(TestEvent.Start({ value: 5 }), TestState.Active);
        expect(state._tag).toBe("Active");
      })
    );

    it.scopedLive("waitFor resolves immediately if already in state", () =>
      Effect.gen(function* () {
        const machine = Machine.make({
          state: TestState,
          event: TestEvent,
          initial: TestState.Idle,
        }).build();

        const actor = yield* Machine.spawn(machine);

        const state = yield* actor.waitFor(TestState.Idle);
        expect(state._tag).toBe("Idle");
      })
    );
  });
});
