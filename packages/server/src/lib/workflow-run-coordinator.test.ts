import { describe, expect, it } from "@effect/vitest";
import * as Cause from "effect/Cause";
import * as Deferred from "effect/Deferred";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Hash from "effect/Hash";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Schema from "effect/Schema";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as Workflow from "effect/unstable/workflow/Workflow";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import { WorkflowRunCoordinator } from "./workflow-run-coordinator.js";

class BusyError extends Schema.TaggedErrorClass<BusyError>()("BusyError", {
  ownerId: Schema.String,
}) {}

class MissingRunError extends Schema.TaggedErrorClass<MissingRunError>()("MissingRunError", {
  runId: Schema.String,
}) {}

class RunFailed extends Schema.TaggedErrorClass<RunFailed>()("RunFailed", {
  message: Schema.String,
}) {}

class RunKey implements Equal.Equal {
  constructor(readonly value: string) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return that instanceof RunKey && that.value === this.value;
  }

  [Hash.symbol](): number {
    return Hash.string(this.value);
  }
}

const TestWorkflow = Workflow.make("test/WorkflowRunCoordinator", {
  payload: {
    ownerId: Schema.String,
    runId: Schema.String,
    mode: Schema.Literals(["success", "wait", "prepare-fail", "prepare-wait", "fail"]),
  },
  success: Schema.Void,
  error: RunFailed,
  idempotencyKey: ({ runId }) => runId,
});

const makeCoordinator = (options: {
  readonly gate: Deferred.Deferred<void>;
  readonly prepareGate?: Deferred.Deferred<void>;
  readonly prepareStarted?: Deferred.Deferred<void>;
  readonly finalizeGate?: Deferred.Deferred<void>;
  readonly finalizeStarted?: Deferred.Deferred<void>;
  readonly runStarted?: Deferred.Deferred<void>;
  readonly completedRunTtl?: Duration.Input;
}) =>
  WorkflowRunCoordinator.make<
    string,
    string,
    { readonly _tag: "Value"; readonly value: string; },
    "test/WorkflowRunCoordinator",
    typeof TestWorkflow.payloadSchema,
    typeof TestWorkflow.successSchema,
    typeof TestWorkflow.errorSchema,
    { readonly ownerId: string; },
    MissingRunError,
    BusyError
  >({
    workflow: TestWorkflow,
    ownerId: (payload) => payload.ownerId,
    runId: (payload) => payload.runId,
    missingRun: (runId) => new MissingRunError({ runId }),
    busy: (ownerId) => new BusyError({ ownerId }),
    prepare: (payload) =>
      payload.mode === "prepare-fail"
        ? Effect.fail(new BusyError({ ownerId: payload.ownerId }))
        : payload.mode === "prepare-wait"
        ? Effect.gen(function*() {
          if (options.prepareStarted) {
            yield* Deferred.succeed(options.prepareStarted, undefined);
          }
          if (options.prepareGate) {
            yield* Deferred.await(options.prepareGate);
          }
          return { ownerId: payload.ownerId } as const;
        })
        : Effect.succeed({ ownerId: payload.ownerId }),
    run: Effect.fnUntraced(function*({ payload, mailbox }) {
      if (options.runStarted) {
        yield* Deferred.succeed(options.runStarted, undefined);
      }

      if (payload.mode === "prepare-wait") {
        yield* Deferred.await(options.gate);
        return;
      }

      if (payload.mode === "fail") {
        return yield* Effect.fail(new RunFailed({ message: payload.runId }));
      }

      yield* PubSub.publish(mailbox, [{ _tag: "Value", value: payload.runId }]);
      if (payload.mode === "wait") {
        yield* Deferred.await(options.gate);
      }
    }),
    finalize: () =>
      Effect.gen(function*() {
        if (options.finalizeStarted) {
          yield* Deferred.succeed(options.finalizeStarted, undefined);
        }
        if (options.finalizeGate) {
          yield* Deferred.await(options.finalizeGate);
        }
      }),
    completedRunTtl: options.completedRunTtl ?? "10 millis",
  });

const makeValueKeyCoordinator = (options: {
  readonly gate: Deferred.Deferred<void>;
  readonly completedRunTtl?: Duration.Input;
}) =>
  WorkflowRunCoordinator.make<
    string,
    RunKey,
    { readonly _tag: "Value"; readonly value: string; },
    "test/WorkflowRunCoordinator",
    typeof TestWorkflow.payloadSchema,
    typeof TestWorkflow.successSchema,
    typeof TestWorkflow.errorSchema,
    { readonly ownerId: string; },
    MissingRunError,
    BusyError
  >({
    workflow: TestWorkflow,
    ownerId: (payload) => payload.ownerId,
    runId: (payload) => new RunKey(payload.runId),
    missingRun: (runId) => new MissingRunError({ runId: runId.value }),
    busy: (ownerId) => new BusyError({ ownerId }),
    prepare: (payload) => Effect.succeed({ ownerId: payload.ownerId }),
    run: Effect.fnUntraced(function*({ payload, mailbox }) {
      yield* PubSub.publish(mailbox, [{ _tag: "Value", value: payload.runId }]);
      if (payload.mode === "wait") {
        yield* Deferred.await(options.gate);
      }
    }),
    finalize: () => Effect.void,
    completedRunTtl: options.completedRunTtl ?? "10 millis",
  });

const finalizerCount = (scope: Scope.Scope) =>
  scope.state._tag === "Open" ? scope.state.finalizers.size : 0;

describe("WorkflowRunCoordinator.make", () => {
  it.live("changes emit start and finish transitions", () =>
    Effect.gen(function*() {
      const gate = yield* Deferred.make<void>();
      const runs = yield* makeCoordinator({ gate });

      const changesFiber = yield* runs.changes("owner-1").pipe(
        Stream.take(2),
        Stream.runCollect,
        Effect.forkChild,
      );
      yield* Effect.yieldNow;

      yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
      yield* Deferred.succeed(gate, undefined);

      const changes = yield* Fiber.join(changesFiber);
      expect(changes).toEqual(["run-1", null]);
    }).pipe(Effect.provide(WorkflowEngine.layerMemory)), { timeout: 5000 });

  it.live(
    "resolve replays events while active and becomes missing after completion",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        const { runId } = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
        const run = yield* runs.resolve(runId);
        const events = yield* run.events.pipe(Stream.take(1), Stream.runCollect);

        expect(events).toEqual([{ _tag: "Value", value: "run-1" }]);

        yield* Deferred.succeed(gate, undefined);
        yield* Effect.sleep("200 millis");

        const error = yield* runs.resolve(runId).pipe(Effect.flip);
        expect(error._tag).toBe("MissingRunError");
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "start fails with BusyError while the owner already has an active run",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
        const error = yield* runs.start({ ownerId: "owner-1", runId: "run-2", mode: "success" })
          .pipe(
            Effect.flip,
          );

        expect(error._tag).toBe("BusyError");

        yield* Deferred.succeed(gate, undefined);
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "interrupt fails the active event stream with interrupts only",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        const { runId } = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
        const run = yield* runs.resolve(runId);
        const exitFiber = yield* run.events.pipe(Stream.runDrain, Effect.exit, Effect.forkChild);
        yield* Effect.yieldNow;

        yield* runs.interrupt("owner-1");

        const exit = yield* Fiber.join(exitFiber);
        expect(exit._tag).toBe("Failure");
        if (exit._tag === "Failure") {
          expect(Cause.hasInterruptsOnly(exit.cause)).toBe(true);
        }
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "prepare failure releases the owner lock",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        const error = yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "prepare-fail",
        }).pipe(Effect.flip);
        expect(error._tag).toBe("BusyError");

        const second = yield* runs.start({ ownerId: "owner-1", runId: "run-2", mode: "success" });
        expect(second).toEqual({ runId: "run-2" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "prepare failure releases the run id reservation",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "prepare-fail",
        }).pipe(Effect.exit);

        const retry = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
        expect(retry).toEqual({ runId: "run-1" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "interrupt during prepare cancels the run and releases the owner lock",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const prepareGate = yield* Deferred.make<void>();
        const prepareStarted = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate, prepareGate, prepareStarted });

        const startFiber = yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "prepare-wait",
        }).pipe(
          Effect.forkChild,
        );

        yield* Deferred.await(prepareStarted);
        yield* runs.interrupt("owner-1");
        yield* Deferred.succeed(prepareGate, undefined);

        const started = yield* Fiber.join(startFiber);
        expect(started).toEqual({ runId: "run-1" });

        yield* Effect.sleep("50 millis");

        const missing = yield* runs.resolve("run-1").pipe(Effect.flip);
        expect(missing._tag).toBe("MissingRunError");

        const second = yield* runs.start({ ownerId: "owner-1", runId: "run-2", mode: "success" });
        expect(second).toEqual({ runId: "run-2" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "interrupt during prepare releases the run id reservation",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const prepareGate = yield* Deferred.make<void>();
        const prepareStarted = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate, prepareGate, prepareStarted });

        const startFiber = yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "prepare-wait",
        }).pipe(Effect.forkChild);

        yield* Deferred.await(prepareStarted);
        yield* runs.interrupt("owner-1");
        yield* Deferred.succeed(prepareGate, undefined);
        yield* Fiber.await(startFiber);
        yield* Effect.sleep("50 millis");

        const retry = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
        expect(retry).toEqual({ runId: "run-1" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live("launch failure releases the run id reservation", () =>
    Effect.gen(function*() {
      const gate = yield* Deferred.make<void>();
      let attempts = 0;
      let executeWorkflow:
        | ((
          payload: typeof TestWorkflow.payloadSchema.Type,
          executionId: string,
        ) => Effect.Effect<void, RunFailed>)
        | undefined;
      const engine = Layer.succeed(
        WorkflowEngine.WorkflowEngine,
        WorkflowEngine.WorkflowEngine.of({
          register: (_workflow, execute) =>
            Effect.sync(() => {
              executeWorkflow = execute as typeof executeWorkflow;
            }),
          execute: (workflow, options) =>
            Effect.gen(function*() {
              attempts++;
              if (attempts === 1) {
                return yield* Effect.fail(new RunFailed({ message: "launch failed" }));
              }
              if (executeWorkflow === undefined) {
                return yield* Effect.die("workflow was not registered");
              }
              yield* executeWorkflow(
                options.payload as typeof TestWorkflow.payloadSchema.Type,
                options.executionId,
              ).pipe(
                Effect.provideService(
                  WorkflowEngine.WorkflowInstance,
                  WorkflowEngine.WorkflowInstance.initial(workflow, options.executionId),
                ),
                Effect.forkScoped,
              );
              return options.executionId;
            }) as never,
          poll: () => Effect.die("poll should not be called") as never,
          interrupt: () => Effect.void,
          interruptUnsafe: () => Effect.void,
          resume: () => Effect.void,
          activityExecute: () => Effect.die("activityExecute should not be called") as never,
          deferredResult: () => Effect.die("deferredResult should not be called") as never,
          deferredDone: () => Effect.void,
          scheduleClock: () => Effect.void,
        }),
      );
      const runs = yield* makeCoordinator({ gate }).pipe(Effect.provide(engine));

      const first = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" }).pipe(
        Effect.exit,
      );
      expect(first._tag).toBe("Failure");

      const retry = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
      expect(retry).toEqual({ runId: "run-1" });
    }), { timeout: 5000 });

  it.live(
    "run failure releases the owner lock and removes the run entry",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        const { runId } = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "fail" });
        const exit = yield* runs.resolve(runId).pipe(
          Effect.flatMap((run) => run.events.pipe(Stream.runDrain, Effect.exit)),
        );
        expect(exit._tag).toBe("Failure");

        yield* Effect.sleep("50 millis");

        const missing = yield* runs.resolve(runId).pipe(Effect.flip);
        expect(missing._tag).toBe("MissingRunError");

        const second = yield* runs.start({ ownerId: "owner-1", runId: "run-2", mode: "success" });
        expect(second).toEqual({ runId: "run-2" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "resolved event stream remains usable after the run completes",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        const { runId } = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
        const run = yield* runs.resolve(runId);

        yield* Deferred.succeed(gate, undefined);
        yield* Effect.sleep("50 millis");

        const events = yield* run.events.pipe(
          Stream.runCollect,
          Effect.timeoutOption("200 millis"),
        );
        expect(events._tag).toBe("Some");
        if (events._tag === "Some") {
          expect(events.value).toEqual([{ _tag: "Value", value: "run-1" }]);
        }
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "caller cancellation during prepare releases the owner lock",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const prepareGate = yield* Deferred.make<void>();
        const prepareStarted = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate, prepareGate, prepareStarted });

        yield* Effect.gen(function*() {
          const startFiber = yield* runs.start({
            ownerId: "owner-1",
            runId: "run-1",
            mode: "prepare-wait",
          }).pipe(Effect.forkChild);

          yield* Deferred.await(prepareStarted);
          yield* Fiber.interrupt(startFiber).pipe(Effect.forkChild);
          yield* Effect.yieldNow;

          const second = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
          expect(second).toEqual({ runId: "run-1" });
        }).pipe(
          Effect.ensuring(Deferred.succeed(gate, undefined)),
          Effect.ensuring(Deferred.succeed(prepareGate, undefined)),
        );
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "interrupt before workflow handler starts does not run user code",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const prepareGate = yield* Deferred.make<void>();
        const prepareStarted = yield* Deferred.make<void>();
        const runStarted = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate, prepareGate, prepareStarted, runStarted });

        yield* Effect.gen(function*() {
          const startFiber = yield* runs.start({
            ownerId: "owner-1",
            runId: "run-1",
            mode: "prepare-wait",
          }).pipe(Effect.forkChild);

          yield* Deferred.await(prepareStarted);
          yield* runs.interrupt("owner-1");
          yield* Deferred.succeed(prepareGate, undefined);
          yield* Fiber.join(startFiber);

          const started = yield* Deferred.await(runStarted).pipe(
            Effect.timeoutOption("100 millis"),
          );
          expect(started._tag).toBe("None");
        }).pipe(Effect.ensuring(Deferred.succeed(gate, undefined)));
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "duplicate run ids do not leave another owner locked",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        yield* Effect.gen(function*() {
          const { runId } = yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });
          const firstRun = yield* runs.resolve(runId);
          yield* firstRun.events.pipe(Stream.take(1), Stream.runCollect);

          const duplicate = yield* runs.start({ ownerId: "owner-2", runId, mode: "success" }).pipe(
            Effect.flip,
          );
          expect(duplicate._tag).toBe("BusyError");

          yield* Deferred.succeed(gate, undefined);
          yield* Effect.sleep("50 millis");

          const second = yield* runs.start({ ownerId: "owner-2", runId: "run-2", mode: "success" });
          expect(second).toEqual({ runId: "run-2" });
        }).pipe(Effect.ensuring(Deferred.succeed(gate, undefined)));
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "duplicate value-equal run ids are rejected",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeValueKeyCoordinator({ gate });

        yield* Effect.gen(function*() {
          yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "wait" });

          const duplicate = yield* runs.start({
            ownerId: "owner-2",
            runId: "run-1",
            mode: "success",
          }).pipe(
            Effect.exit,
          );
          expect(duplicate._tag).toBe("Failure");
        }).pipe(Effect.ensuring(Deferred.succeed(gate, undefined)));
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "duplicate completed run ids do not leave another owner locked",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeCoordinator({ gate });

        yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
        yield* Effect.sleep("50 millis");

        yield* runs.start({ ownerId: "owner-2", runId: "run-1", mode: "success" }).pipe(
          Effect.exit,
        );
        yield* Effect.sleep("50 millis");

        const stale = yield* runs.resolve("run-1").pipe(Effect.exit);
        expect(stale._tag).toBe("Failure");
        if (stale._tag === "Failure") {
          expect(stale.cause.reasons.some((reason) =>
            reason._tag === "Fail" && reason.error._tag === "MissingRunError"
          )).toBe(true);
        }

        const second = yield* runs.start({ ownerId: "owner-2", runId: "run-2", mode: "success" });
        expect(second).toEqual({ runId: "run-2" });
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "resolve finds completed handoff runs by value-equal run id",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const runs = yield* makeValueKeyCoordinator({ gate, completedRunTtl: "1 hour" });

        const { runId } = yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "success",
        });
        yield* Effect.sleep("50 millis");

        const resolved = yield* runs.resolve(new RunKey(runId.value));
        const events = yield* resolved.events.pipe(Stream.runCollect);
        expect(events).toEqual([{ _tag: "Value", value: "run-1" }]);
      }).pipe(Effect.provide(WorkflowEngine.layerMemory)),
    { timeout: 5000 },
  );

  it.live(
    "completed runs release coordinator scope resources",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const scope = yield* Scope.make();
        yield* Effect.gen(function*() {
          const runs = yield* makeCoordinator({ gate }).pipe(
            Effect.provide(WorkflowEngine.layerMemory),
            Scope.provide(scope),
          );
          const before = finalizerCount(scope);

          yield* runs.start({ ownerId: "owner-1", runId: "run-1", mode: "success" });
          yield* Effect.sleep("100 millis");

          expect(finalizerCount(scope)).toBe(before);
        }).pipe(Effect.ensuring(Scope.close(scope, Exit.void)));
      }),
    { timeout: 5000 },
  );

  it.live(
    "completed handoff entries clear when the coordinator scope closes",
    () =>
      Effect.gen(function*() {
        const gate = yield* Deferred.make<void>();
        const scope = yield* Scope.make();
        const runs = yield* makeCoordinator({ gate, completedRunTtl: "1 hour" }).pipe(
          Effect.provide(WorkflowEngine.layerMemory),
          Scope.provide(scope),
        );

        const { runId } = yield* runs.start({
          ownerId: "owner-1",
          runId: "run-1",
          mode: "success",
        });
        yield* Effect.sleep("50 millis");

        const beforeClose = yield* runs.resolve(runId).pipe(
          Effect.flatMap((run) => run.events.pipe(Stream.runCollect)),
          Effect.exit,
        );
        expect(beforeClose._tag).toBe("Success");

        yield* Scope.close(scope, Exit.void);

        const afterClose = yield* runs.resolve(runId).pipe(Effect.exit);
        expect(afterClose._tag).toBe("Failure");
      }),
    { timeout: 5000 },
  );
});
