import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import type * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as SynchronizedRef from "effect/SynchronizedRef";
import { TransportError } from "../Errors.js";
import type { SDKMessage, SDKUserMessage } from "../Schema/Message.js";
import { SessionClosedError, type SessionError } from "../Session.js";

type DriverMode = "idle" | "raw" | "turn";

type DriverState = {
  readonly mode: DriverMode;
  readonly turnQueueDepth: number;
  readonly closed: boolean;
  readonly activeTurnId: string | undefined;
  readonly rawInFlight: number;
};

type TurnOutput =
  | {
      readonly _tag: "Message";
      readonly message: SDKMessage;
    }
  | {
      readonly _tag: "Failure";
      readonly error: SessionError;
    }
  | {
      readonly _tag: "Done";
    };

type TurnRequest = {
  readonly id: string;
  readonly message: string | SDKUserMessage;
  readonly output: Queue.Queue<TurnOutput>;
  readonly consumerDetached: Ref.Ref<boolean>;
};

type TimeoutOutcome<A> =
  | {
      readonly _tag: "Completed";
      readonly value: A;
    }
  | {
      readonly _tag: "TimedOut";
    };

const turnQueueCapacity = 64;

const turnSendTimeoutMessage = "Session turn send timed out";
const turnResultTimeoutMessage = "Session turn timed out waiting for result";
const turnTimeoutReason = {
  send: "turnSendTimeout",
  result: "turnResultTimeout",
} as const;

type TurnTimeoutReason = (typeof turnTimeoutReason)[keyof typeof turnTimeoutReason];

const timeoutCompleted = <A>(value: A): TimeoutOutcome<A> => ({
  _tag: "Completed",
  value,
});

const timeoutElapsed = <A>(): TimeoutOutcome<A> => ({
  _tag: "TimedOut",
});

const toConflictError = (message: string) => TransportError.make(message);

const closedError = () => SessionClosedError.make("Session turn driver is closed");

const takeTurn = (stream: Stream.Stream<SDKMessage, SessionError>) =>
  stream.pipe(
    Stream.transduce(Sink.takeUntil((message) => message.type === "result")),
    Stream.take(1),
    Stream.flatMap((messages) => Stream.fromIterable(messages))
  );

const makeTurnTimeoutError = (reason: TurnTimeoutReason) =>
  TransportError.make(reason === turnTimeoutReason.send ? turnSendTimeoutMessage : turnResultTimeoutMessage, {
    reason,
  });

const withOptionalTimeoutOutcome = <A, E extends SessionError, R>(
  effect: Effect.Effect<A, E, R>,
  duration: Duration.Input | undefined
): Effect.Effect<TimeoutOutcome<A>, E, R> =>
  duration === undefined
    ? Effect.map(effect, timeoutCompleted)
    : Effect.flatMap(Effect.timeoutOption(effect, duration), (result) =>
        Option.isSome(result) ? Effect.succeed(timeoutCompleted(result.value)) : Effect.succeed(timeoutElapsed())
      );

const makeOutputStream = (request: TurnRequest): Stream.Stream<SDKMessage, SessionError> =>
  Stream.fromQueue(request.output).pipe(
    Stream.takeWhile((event) => event._tag !== "Done"),
    Stream.mapEffect((event) => (event._tag === "Message" ? Effect.succeed(event.message) : Effect.fail(event.error))),
    Stream.ensuring(
      Ref.set(request.consumerDetached, true).pipe(Effect.andThen(Queue.shutdown(request.output).pipe(Effect.ignore)))
    )
  );

export type SessionTurnDriverTimeouts = {
  readonly turnSendTimeout?: Duration.Input;
  readonly turnResultTimeout?: Duration.Input;
};

export type SessionTurnDriverOptions = {
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>;
  readonly stream: Stream.Stream<SDKMessage, SessionError>;
  readonly close: Effect.Effect<void, SessionError>;
  readonly timeouts?: SessionTurnDriverTimeouts;
  readonly onOutputMessage?: (message: SDKMessage) => Effect.Effect<void, never>;
};

export type SessionTurnDriver = {
  readonly turn: (message: string | SDKUserMessage) => Stream.Stream<SDKMessage, SessionError>;
  readonly sendRaw: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>;
  readonly streamRaw: Stream.Stream<SDKMessage, SessionError>;
  readonly shutdown: Effect.Effect<void, never>;
};

export const makeSessionTurnDriver = ({
  send,
  stream,
  close,
  timeouts,
  onOutputMessage,
}: SessionTurnDriverOptions): Effect.Effect<SessionTurnDriver, never, Scope.Scope> =>
  Effect.gen(function* () {
    const stateRef = yield* SynchronizedRef.make<DriverState>({
      mode: "idle",
      turnQueueDepth: 0,
      closed: false,
      activeTurnId: undefined,
      rawInFlight: 0,
    });
    const turnQueue = yield* Queue.bounded<TurnRequest>(turnQueueCapacity);
    const turnIdRef = yield* Ref.make(0);
    const timeoutRecoveryStartedRef = yield* Ref.make(false);

    const logState = (label: string) =>
      SynchronizedRef.get(stateRef).pipe(
        Effect.flatMap((state) =>
          Effect.logDebug(
            `SessionTurnDriver ${label} mode=${state.mode} queueDepth=${state.turnQueueDepth} rawInFlight=${state.rawInFlight} closed=${state.closed} activeTurnId=${state.activeTurnId ?? "none"}`
          )
        )
      );

    const pushOutput = (request: TurnRequest, output: TurnOutput) =>
      Ref.get(request.consumerDetached).pipe(
        Effect.flatMap((detached) =>
          detached
            ? Effect.void
            : Queue.offer(request.output, output).pipe(
                Effect.asVoid,
                Effect.catchCause(() => Effect.void)
              )
        )
      );

    const failTurn = (request: TurnRequest, error: SessionError) => pushOutput(request, { _tag: "Failure", error });

    const completeTurn = (request: TurnRequest) => pushOutput(request, { _tag: "Done" });

    const publishOutput = (request: TurnRequest, message: SDKMessage) =>
      (onOutputMessage ? onOutputMessage(message) : Effect.void).pipe(
        Effect.andThen(pushOutput(request, { _tag: "Message", message }))
      );

    const beginRaw = SynchronizedRef.modifyEffect(
      stateRef,
      (state): Effect.Effect<readonly [void, DriverState], SessionError> =>
        state.closed
          ? Effect.fail(closedError())
          : state.turnQueueDepth > 0
            ? Effect.fail(toConflictError("Cannot use raw send/stream while turn queue has pending or active work"))
            : Effect.succeed([
                undefined,
                {
                  ...state,
                  mode: "raw",
                  rawInFlight: state.rawInFlight + 1,
                },
              ])
    );

    const endRaw = SynchronizedRef.update(stateRef, (state) => {
      const rawInFlight = Math.max(0, state.rawInFlight - 1);
      const mode: DriverMode = rawInFlight > 0 ? "raw" : state.turnQueueDepth > 0 ? "turn" : "idle";
      return { ...state, rawInFlight, mode };
    });

    const enqueueTurn = SynchronizedRef.modifyEffect(
      stateRef,
      (state): Effect.Effect<readonly [void, DriverState], SessionError> =>
        state.closed
          ? Effect.fail(closedError())
          : state.mode === "raw"
            ? Effect.fail(toConflictError("Cannot start turn while raw send/stream is active"))
            : Effect.succeed([
                undefined,
                {
                  ...state,
                  mode: "turn",
                  turnQueueDepth: state.turnQueueDepth + 1,
                },
              ])
    );

    const markActiveTurn = (turnId: string) =>
      SynchronizedRef.update(
        stateRef,
        (state): DriverState => ({
          ...state,
          mode: "turn",
          activeTurnId: turnId,
        })
      );

    const finishTurn = SynchronizedRef.update(stateRef, (state) => {
      const turnQueueDepth = Math.max(0, state.turnQueueDepth - 1);
      const mode: DriverMode = turnQueueDepth > 0 ? "turn" : state.rawInFlight > 0 ? "raw" : "idle";
      return {
        ...state,
        turnQueueDepth,
        activeTurnId: undefined,
        mode,
      };
    });

    const triggerResultTimeoutRecovery = Effect.gen(function* () {
      const alreadyTriggered = yield* Ref.modify(timeoutRecoveryStartedRef, (started) => [started, true] as const);
      if (alreadyTriggered) return;
      yield* Effect.logWarning(
        "SessionTurnDriver result timeout detected. Shutting down driver and closing transport."
      );
      yield* Effect.forkDetach(
        shutdown.pipe(
          Effect.andThen(
            close.pipe(
              Effect.tapError((error) =>
                Effect.logWarning(`SessionTurnDriver transport close failed during timeout recovery: ${error.message}`)
              ),
              Effect.catch(() => Effect.void)
            )
          ),
          Effect.catchCause(() => Effect.void)
        )
      );
    });

    const runTurn = (request: TurnRequest): Effect.Effect<void, SessionError> =>
      Effect.gen(function* () {
        const sendOutcome = yield* withOptionalTimeoutOutcome(send(request.message), timeouts?.turnSendTimeout);
        if (sendOutcome._tag === "TimedOut") {
          return yield* makeTurnTimeoutError(turnTimeoutReason.send);
        }

        const drain = takeTurn(stream).pipe(Stream.runForEach((message) => publishOutput(request, message)));

        const resultOutcome = yield* withOptionalTimeoutOutcome(drain, timeouts?.turnResultTimeout);
        if (resultOutcome._tag === "TimedOut") {
          yield* triggerResultTimeoutRecovery;
          return yield* makeTurnTimeoutError(turnTimeoutReason.result);
        }

        yield* completeTurn(request);
      });

    const processTurnRequest = (request: TurnRequest) =>
      Effect.gen(function* () {
        const closed = yield* SynchronizedRef.get(stateRef).pipe(Effect.map((state) => state.closed));
        if (closed) {
          yield* failTurn(request, closedError());
          return;
        }

        yield* markActiveTurn(request.id).pipe(Effect.andThen(logState(`turn-active:${request.id}`)));
        yield* runTurn(request).pipe(Effect.catch((error) => failTurn(request, error)));
      }).pipe(Effect.ensuring(finishTurn.pipe(Effect.andThen(logState(`turn-finished:${request.id}`)))));

    const drainPendingTurns = (error: SessionError) =>
      Effect.gen(function* () {
        let dropped = 0;
        while (true) {
          const next = yield* Queue.poll(turnQueue);
          if (Option.isNone(next)) break;
          dropped += 1;
          yield* failTurn(next.value, error);
        }
        return dropped;
      });

    const shutdown = Effect.gen(function* () {
      const alreadyClosed = yield* SynchronizedRef.modify(stateRef, (state): readonly [boolean, DriverState] =>
        state.closed
          ? [true, state]
          : [
              false,
              {
                ...state,
                closed: true,
              },
            ]
      );
      if (alreadyClosed) return;
      yield* logState("shutdown-start");

      const dropped = yield* drainPendingTurns(closedError());
      if (dropped > 0) {
        yield* SynchronizedRef.update(stateRef, (state) => {
          const turnQueueDepth = Math.max(0, state.turnQueueDepth - dropped);
          const mode: DriverMode = turnQueueDepth > 0 ? "turn" : state.rawInFlight > 0 ? "raw" : "idle";
          return {
            ...state,
            turnQueueDepth,
            mode,
          };
        });
      }
      yield* logState("shutdown-complete");
    }).pipe(Effect.catchCause(() => Effect.void));

    yield* Effect.forkScoped(
      Effect.forever(Queue.take(turnQueue).pipe(Effect.flatMap(processTurnRequest))).pipe(
        Effect.catchCause(() => Effect.void)
      )
    );

    yield* Effect.addFinalizer(() => shutdown.pipe(Effect.andThen(Queue.shutdown(turnQueue).pipe(Effect.ignore))));

    const createRequest = Effect.fn("SessionTurnDriver.createRequest")(function* (message: string | SDKUserMessage) {
      const id = yield* Ref.updateAndGet(turnIdRef, (n) => n + 1);
      const output = yield* Queue.unbounded<TurnOutput>();
      const consumerDetached = yield* Ref.make(false);
      return {
        id: `turn-${id}`,
        message,
        output,
        consumerDetached,
      } satisfies TurnRequest;
    });

    const turn = (message: string | SDKUserMessage) =>
      Stream.unwrap(
        Effect.gen(function* () {
          const request = yield* createRequest(message);
          yield* enqueueTurn;
          yield* logState(`turn-enqueued:${request.id}`);
          const enqueueExit = yield* Effect.exit(Queue.offer(turnQueue, request).pipe(Effect.asVoid));
          if (Exit.isFailure(enqueueExit)) {
            yield* finishTurn;
            return yield* TransportError.make("Failed to enqueue turn request");
          }
          return makeOutputStream(request);
        })
      );

    const sendRaw = Effect.fn("SessionTurnDriver.sendRaw")((message: string | SDKUserMessage) =>
      Effect.acquireUseRelease(
        beginRaw.pipe(Effect.andThen(logState("raw-send-begin"))),
        () => send(message),
        () => endRaw.pipe(Effect.andThen(logState("raw-send-end")))
      )
    );

    const streamRawBase = Stream.unwrap(
      Effect.gen(function* () {
        yield* beginRaw;
        yield* logState("raw-stream-begin");
        yield* Effect.addFinalizer(() => endRaw.pipe(Effect.andThen(logState("raw-stream-end"))));
        return stream;
      })
    );

    const streamRaw = onOutputMessage
      ? streamRawBase.pipe(Stream.tap((message) => onOutputMessage(message)))
      : streamRawBase;

    return {
      turn,
      sendRaw,
      streamRaw,
      shutdown,
    } satisfies SessionTurnDriver;
  });
