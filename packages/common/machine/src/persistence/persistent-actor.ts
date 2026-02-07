// @effect-diagnostics missingEffectContext:off
// @effect-diagnostics anyUnknownInErrorContext:off

import { Cause, Clock, Effect, Exit, Fiber, Option, Queue, Ref, Schedule, Scope, SubscriptionRef } from "effect";

import type { ActorRef } from "../actor";
import type { Inspector } from "../inspection";
import { Inspector as InspectorTag } from "../inspection";
import type { Listeners } from "../internal/actor-core";
import { buildActorRefCore, notifyListeners } from "../internal/actor-core";
import { emitWithTimestamp } from "../internal/inspection";
import type { ProcessEventError } from "../internal/transition";
import { processEventCore, resolveTransition, runSpawnEffects, runTransitionHandler } from "../internal/transition";
import { INTERNAL_INIT_EVENT } from "../internal/utils";
import type { Machine, MachineRef } from "../machine";
import type { EffectsDef, GuardsDef } from "../slot";

import type {
  ActorMetadata,
  PersistedEvent,
  PersistenceAdapter,
  PersistenceError,
  Snapshot,
  VersionConflictError,
} from "./adapter";
import { PersistenceAdapterTag } from "./adapter";
import type { PersistentMachine } from "./persistent-machine";

/**
 * Extended ActorRef with persistence capabilities
 */
export interface PersistentActorRef<S extends { readonly _tag: string }, E extends { readonly _tag: string }, R = never>
  extends ActorRef<S, E> {
  /**
   * Force an immediate snapshot save
   */
  readonly persist: Effect.Effect<void, PersistenceError | VersionConflictError>;

  /**
   * Get the current persistence version
   */
  readonly version: Effect.Effect<number>;

  /**
   * Replay events to restore actor to a specific version.
   * Note: This only computes state; does not re-run transition effects.
   */
  readonly replayTo: (version: number) => Effect.Effect<void, PersistenceError, R>;
}

/** Get current time in milliseconds using Effect Clock */
const now = Clock.currentTimeMillis;

/**
 * Replay persisted events to compute state.
 * Supports async handlers - used for initial restore.
 * @internal
 */
const replayEvents = Effect.fn("effect-machine.persistentActor.replayEvents")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(
  machine: Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>,
  startState: S,
  events: ReadonlyArray<PersistedEvent<E>>,
  self: MachineRef<E>,
  stopVersion?: undefined | number
) {
  let state = startState;
  let version = 0;

  for (const persistedEvent of events) {
    if (stopVersion !== undefined && persistedEvent.version > stopVersion) break;

    const transition = resolveTransition(machine, state, persistedEvent.event);
    if (transition !== undefined) {
      state = yield* runTransitionHandler(machine, transition, state, persistedEvent.event, self);
    }
    version = persistedEvent.version;
  }

  return { state, version };
});

/**
 * Build PersistentActorRef with all methods
 */
const buildPersistentActorRef = <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(
  id: string,
  persistentMachine: PersistentMachine<S, E, R>,
  stateRef: SubscriptionRef.SubscriptionRef<S>,
  versionRef: Ref.Ref<number>,
  eventQueue: Queue.Queue<E>,
  stoppedRef: Ref.Ref<boolean>,
  listeners: Listeners<S>,
  stop: Effect.Effect<void>,
  adapter: PersistenceAdapter
): PersistentActorRef<S, E, R> => {
  const { machine, persistence } = persistentMachine;
  const typedMachine = machine as unknown as Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>;

  const persist = Effect.gen(function* () {
    const state = yield* SubscriptionRef.get(stateRef);
    const version = yield* Ref.get(versionRef);
    const timestamp = yield* now;
    const snapshot: Snapshot<S> = {
      state,
      version,
      timestamp,
    };
    yield* adapter.saveSnapshot(id, snapshot, persistence.stateSchema);
  }).pipe(Effect.withSpan("effect-machine.persistentActor.persist"));

  const version = Ref.get(versionRef).pipe(Effect.withSpan("effect-machine.persistentActor.version"));

  // Replay only computes state - doesn't run spawn effects
  const replayTo = Effect.fn("effect-machine.persistentActor.replayTo")(function* (targetVersion: number) {
    const currentVersion = yield* Ref.get(versionRef);
    if (targetVersion <= currentVersion) {
      const maybeSnapshot = yield* adapter.loadSnapshot(id, persistence.stateSchema);
      if (Option.isSome(maybeSnapshot)) {
        const snapshot = maybeSnapshot.value;
        if (snapshot.version <= targetVersion) {
          const events = yield* adapter.loadEvents(id, persistence.eventSchema, snapshot.version);
          const dummySelf: MachineRef<E> = {
            send: Effect.fn("effect-machine.persistentActor.replay.send")((_event: E) => Effect.void),
          };

          const result = yield* replayEvents(typedMachine, snapshot.state, events, dummySelf, targetVersion);

          yield* SubscriptionRef.set(stateRef, result.state);
          yield* Ref.set(versionRef, result.version);
          notifyListeners(listeners, result.state);
        }
      } else {
        // No snapshot - replay from initial state if events exist
        const events = yield* adapter.loadEvents(id, persistence.eventSchema);
        if (events.length > 0) {
          const dummySelf: MachineRef<E> = {
            send: Effect.fn("effect-machine.persistentActor.replay.send")((_event: E) => Effect.void),
          };
          const result = yield* replayEvents(typedMachine, typedMachine.initial, events, dummySelf, targetVersion);
          yield* SubscriptionRef.set(stateRef, result.state);
          yield* Ref.set(versionRef, result.version);
          notifyListeners(listeners, result.state);
        }
      }
    }
  });

  const core = buildActorRefCore(id, typedMachine, stateRef, eventQueue, stoppedRef, listeners, stop);

  return {
    ...core,
    persist,
    version,
    replayTo,
  };
};

/**
 * Create a persistent actor from a PersistentMachine.
 * Restores from existing snapshot if available, otherwise starts fresh.
 */
export const createPersistentActor = Effect.fn("effect-machine.persistentActor.spawn")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(
  id: string,
  persistentMachine: PersistentMachine<S, E, R>,
  initialSnapshot: Option.Option<Snapshot<S>>,
  initialEvents: ReadonlyArray<PersistedEvent<E>>
) {
  yield* Effect.annotateCurrentSpan("effect_machine.actor.id", id);
  const adapter = yield* PersistenceAdapterTag;
  const { machine, persistence } = persistentMachine;
  const typedMachine = machine as unknown as Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>;

  // Get optional inspector from context
  const inspector = Option.getOrUndefined(yield* Effect.serviceOption(InspectorTag)) as Inspector<S, E> | undefined;

  // Create self reference for sending events
  const eventQueue = yield* Queue.unbounded<E>();
  const stoppedRef = yield* Ref.make(false);
  const self: MachineRef<E> = {
    send: Effect.fn("effect-machine.persistentActor.self.send")(function* (event: E) {
      const stopped = yield* Ref.get(stoppedRef);
      if (stopped) {
        return;
      }
      yield* Queue.offer(eventQueue, event);
    }),
  };

  // Determine initial state and version
  let resolvedInitial: S;
  let initialVersion: number;

  if (Option.isSome(initialSnapshot)) {
    // Restore from snapshot + replay events
    const result = yield* replayEvents(typedMachine, initialSnapshot.value.state, initialEvents, self);
    resolvedInitial = result.state;
    initialVersion = initialEvents.length > 0 ? result.version : initialSnapshot.value.version;
  } else if (initialEvents.length > 0) {
    // Restore from events only
    const result = yield* replayEvents(typedMachine, typedMachine.initial, initialEvents, self);
    resolvedInitial = result.state;
    initialVersion = result.version;
  } else {
    // Fresh start
    resolvedInitial = typedMachine.initial;
    initialVersion = 0;
  }

  yield* Effect.annotateCurrentSpan("effect_machine.actor.initial_state", resolvedInitial._tag);

  // Initialize state refs
  const stateRef = yield* SubscriptionRef.make(resolvedInitial);
  const versionRef = yield* Ref.make(initialVersion);
  const listeners: Listeners<S> = new Set();

  // Track creation time for metadata - prefer existing metadata if restoring
  let createdAt: number;
  if (Option.isSome(initialSnapshot)) {
    // Restoring - try to get original createdAt from metadata
    const existingMeta =
      adapter.loadMetadata !== undefined ? yield* adapter.loadMetadata(id) : Option.none<ActorMetadata>();
    createdAt = Option.isSome(existingMeta) ? existingMeta.value.createdAt : initialSnapshot.value.timestamp; // fallback to snapshot time
  } else {
    createdAt = yield* now;
  }

  // Emit spawn event
  yield* emitWithTimestamp(inspector, (timestamp) => ({
    type: "@machine.spawn",
    actorId: id,
    initialState: resolvedInitial,
    timestamp,
  }));

  const snapshotEnabledRef = yield* Ref.make(true);
  const persistenceQueue = yield* Queue.unbounded<Effect.Effect<void, never>>();
  const persistenceFiber = yield* Effect.forkDaemon(persistenceWorker(persistenceQueue));

  // Save initial metadata
  yield* Queue.offer(
    persistenceQueue,
    saveMetadata(id, resolvedInitial, initialVersion, createdAt, persistence, adapter)
  );

  // Snapshot scheduler
  const snapshotQueue = yield* Queue.unbounded<{ state: S; version: number }>();
  const snapshotFiber = yield* Effect.forkDaemon(
    snapshotWorker(id, persistence, adapter, snapshotQueue, snapshotEnabledRef)
  );

  // Fork background effects (run for entire machine lifetime)
  const backgroundFibers: Fiber.Fiber<void, never>[] = [];
  const initEvent = { _tag: INTERNAL_INIT_EVENT } as E;
  const initCtx = { state: resolvedInitial, event: initEvent, self };
  const { effects: effectSlots } = typedMachine._slots;

  for (const bg of typedMachine.backgroundEffects) {
    const fiber = yield* Effect.forkDaemon(
      bg
        .handler({ state: resolvedInitial, event: initEvent, self, effects: effectSlots })
        .pipe(Effect.provideService(typedMachine.Context, initCtx))
    );
    backgroundFibers.push(fiber);
  }

  // Create state scope for spawn effects
  const stateScopeRef: { current: Scope.CloseableScope } = {
    current: yield* Scope.make(),
  };

  // Run initial spawn effects
  yield* runSpawnEffectsWithInspection(
    typedMachine,
    resolvedInitial,
    initEvent,
    self,
    stateScopeRef.current,
    id,
    inspector
  );

  // Check if initial state is final
  if (typedMachine.finalStates.has(resolvedInitial._tag)) {
    yield* Scope.close(stateScopeRef.current, Exit.void);
    yield* Effect.all(backgroundFibers.map(Fiber.interrupt), { concurrency: "unbounded" });
    yield* Fiber.interrupt(snapshotFiber);
    yield* Fiber.interrupt(persistenceFiber);
    yield* Ref.set(stoppedRef, true);
    yield* emitWithTimestamp(inspector, (timestamp) => ({
      type: "@machine.stop",
      actorId: id,
      finalState: resolvedInitial,
      timestamp,
    }));
    const stop = Ref.set(stoppedRef, true).pipe(Effect.withSpan("effect-machine.persistentActor.stop"), Effect.asVoid);
    return buildPersistentActorRef(
      id,
      persistentMachine,
      stateRef,
      versionRef,
      eventQueue,
      stoppedRef,
      listeners,
      stop,
      adapter
    );
  }

  // Start the persistent event loop
  const loopFiber = yield* Effect.forkDaemon(
    persistentEventLoop(
      id,
      persistentMachine,
      stateRef,
      versionRef,
      eventQueue,
      stoppedRef,
      self,
      listeners,
      adapter,
      createdAt,
      stateScopeRef,
      backgroundFibers,
      snapshotQueue,
      snapshotEnabledRef,
      persistenceQueue,
      snapshotFiber,
      persistenceFiber,
      inspector
    )
  );

  const stop = Effect.gen(function* () {
    const finalState = yield* SubscriptionRef.get(stateRef);
    yield* emitWithTimestamp(inspector, (timestamp) => ({
      type: "@machine.stop",
      actorId: id,
      finalState,
      timestamp,
    }));
    yield* Ref.set(stoppedRef, true);
    yield* Fiber.interrupt(loopFiber);
    yield* Scope.close(stateScopeRef.current, Exit.void);
    yield* Effect.all(backgroundFibers.map(Fiber.interrupt), { concurrency: "unbounded" });
    yield* Fiber.interrupt(snapshotFiber);
    yield* Fiber.interrupt(persistenceFiber);
  }).pipe(Effect.withSpan("effect-machine.persistentActor.stop"), Effect.asVoid);

  return buildPersistentActorRef(
    id,
    persistentMachine,
    stateRef,
    versionRef,
    eventQueue,
    stoppedRef,
    listeners,
    stop,
    adapter
  );
});

/**
 * Main event loop for persistent actor
 */
const persistentEventLoop = Effect.fn("effect-machine.persistentActor.eventLoop")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(
  id: string,
  persistentMachine: PersistentMachine<S, E, R>,
  stateRef: SubscriptionRef.SubscriptionRef<S>,
  versionRef: Ref.Ref<number>,
  eventQueue: Queue.Queue<E>,
  stoppedRef: Ref.Ref<boolean>,
  self: MachineRef<E>,
  listeners: Listeners<S>,
  adapter: PersistenceAdapter,
  createdAt: number,
  stateScopeRef: { current: Scope.CloseableScope },
  backgroundFibers: ReadonlyArray<Fiber.Fiber<void, never>>,
  snapshotQueue: Queue.Queue<{ state: S; version: number }>,
  snapshotEnabledRef: Ref.Ref<boolean>,
  persistenceQueue: Queue.Queue<Effect.Effect<void, never>>,
  snapshotFiber: Fiber.Fiber<void, never>,
  persistenceFiber: Fiber.Fiber<void, never>,
  inspector?: undefined | Inspector<S, E>
) {
  const { machine, persistence } = persistentMachine;
  const typedMachine = machine as unknown as Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>;

  const hooks =
    inspector === undefined
      ? undefined
      : {
          onSpawnEffect: (state: S) =>
            emitWithTimestamp(inspector, (timestamp) => ({
              type: "@machine.effect",
              actorId: id,
              effectType: "spawn",
              state,
              timestamp,
            })),
          onTransition: (from: S, to: S, ev: E) =>
            emitWithTimestamp(inspector, (timestamp) => ({
              type: "@machine.transition",
              actorId: id,
              fromState: from,
              toState: to,
              event: ev,
              timestamp,
            })),
          onError: (info: ProcessEventError<S, E>) =>
            emitWithTimestamp(inspector, (timestamp) => ({
              type: "@machine.error",
              actorId: id,
              phase: info.phase,
              state: info.state,
              event: info.event,
              error: Cause.pretty(info.cause),
              timestamp,
            })),
        };

  while (true) {
    const event = yield* Queue.take(eventQueue);
    const currentState = yield* SubscriptionRef.get(stateRef);
    const currentVersion = yield* Ref.get(versionRef);

    // Emit event received
    yield* emitWithTimestamp(inspector, (timestamp) => ({
      type: "@machine.event",
      actorId: id,
      state: currentState,
      event,
      timestamp,
    }));

    const result = yield* processEventCore(typedMachine, currentState, event, self, stateScopeRef, hooks);

    if (!result.transitioned) {
      continue;
    }

    // Increment version
    const newVersion = currentVersion + 1;
    yield* Ref.set(versionRef, newVersion);

    // Update state and notify listeners
    yield* SubscriptionRef.set(stateRef, result.newState);
    notifyListeners(listeners, result.newState);

    // Journal event if enabled (async)
    if (persistence.journalEvents) {
      const timestamp = yield* now;
      const persistedEvent: PersistedEvent<E> = {
        event,
        version: newVersion,
        timestamp,
      };
      const journalTask = adapter.appendEvent(id, persistedEvent, persistence.eventSchema).pipe(
        Effect.catchAll((e) => Effect.logWarning(`Failed to journal event for actor ${id}`, e)),
        Effect.asVoid
      );
      yield* Queue.offer(persistenceQueue, journalTask);
    }

    // Save metadata (async)
    yield* Queue.offer(
      persistenceQueue,
      saveMetadata(id, result.newState, newVersion, createdAt, persistence, adapter)
    );

    // Schedule snapshot (non-blocking)
    if (yield* Ref.get(snapshotEnabledRef)) {
      yield* Queue.offer(snapshotQueue, { state: result.newState, version: newVersion });
    }

    // Check if final state reached
    if (result.lifecycleRan && result.isFinal) {
      yield* emitWithTimestamp(inspector, (timestamp) => ({
        type: "@machine.stop",
        actorId: id,
        finalState: result.newState,
        timestamp,
      }));
      yield* Ref.set(stoppedRef, true);
      yield* Scope.close(stateScopeRef.current, Exit.void);
      yield* Effect.all(backgroundFibers.map(Fiber.interrupt), { concurrency: "unbounded" });
      yield* Fiber.interrupt(snapshotFiber);
      yield* Fiber.interrupt(persistenceFiber);
      return;
    }
  }
});

/**
 * Run spawn effects with inspection and tracing.
 * @internal
 */
const runSpawnEffectsWithInspection = Effect.fn("effect-machine.persistentActor.spawnEffects")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef,
  EFD extends EffectsDef,
>(
  machine: Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>,
  state: S,
  event: E,
  self: MachineRef<E>,
  stateScope: Scope.CloseableScope,
  actorId: string,
  inspector?: undefined | Inspector<S, E>
) {
  yield* emitWithTimestamp(inspector, (timestamp) => ({
    type: "@machine.effect",
    actorId,
    effectType: "spawn",
    state,
    timestamp,
  }));

  const onError =
    inspector === undefined
      ? undefined
      : (info: ProcessEventError<S, E>) =>
          emitWithTimestamp(inspector, (timestamp) => ({
            type: "@machine.error",
            actorId,
            phase: info.phase,
            state: info.state,
            event: info.event,
            error: Cause.pretty(info.cause),
            timestamp,
          }));

  yield* runSpawnEffects(machine, state, event, self, stateScope, onError);
});

/**
 * Persistence worker (journaling + metadata).
 */
const persistenceWorker = Effect.fn("effect-machine.persistentActor.persistenceWorker")(function* (
  queue: Queue.Queue<Effect.Effect<void, never>>
) {
  while (true) {
    const task = yield* Queue.take(queue);
    yield* task;
  }
});

/**
 * Snapshot scheduler worker (runs in background).
 */
const snapshotWorker = Effect.fn("effect-machine.persistentActor.snapshotWorker")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
>(
  id: string,
  persistence: PersistentMachine<S, E>["persistence"],
  adapter: PersistenceAdapter,
  queue: Queue.Queue<{ state: S; version: number }>,
  enabledRef: Ref.Ref<boolean>
) {
  const driver = yield* Schedule.driver(persistence.snapshotSchedule);

  while (true) {
    const { state, version } = yield* Queue.take(queue);
    if (!(yield* Ref.get(enabledRef))) {
      continue;
    }
    const shouldSnapshot = yield* driver.next(state).pipe(
      Effect.match({
        onFailure: () => false,
        onSuccess: () => true,
      })
    );
    if (!shouldSnapshot) {
      yield* Ref.set(enabledRef, false);
      continue;
    }

    yield* saveSnapshot(id, state, version, persistence, adapter);
  }
});

/**
 * Save a snapshot after state transition.
 * Called by snapshot scheduler.
 */
const saveSnapshot = Effect.fn("effect-machine.persistentActor.saveSnapshot")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
>(
  id: string,
  state: S,
  version: number,
  persistence: PersistentMachine<S, E>["persistence"],
  adapter: PersistenceAdapter
) {
  const timestamp = yield* now;
  const snapshot: Snapshot<S> = {
    state,
    version,
    timestamp,
  };
  yield* adapter
    .saveSnapshot(id, snapshot, persistence.stateSchema)
    .pipe(Effect.catchAll((e) => Effect.logWarning(`Failed to save snapshot for actor ${id}`, e)));
});

/**
 * Save or update actor metadata if adapter supports registry.
 * Called on spawn and state transitions.
 */
const saveMetadata = Effect.fn("effect-machine.persistentActor.saveMetadata")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
>(
  id: string,
  state: S,
  version: number,
  createdAt: number,
  persistence: PersistentMachine<S, E>["persistence"],
  adapter: PersistenceAdapter
) {
  const save = adapter.saveMetadata;
  if (save === undefined) {
    return;
  }
  const lastActivityAt = yield* now;
  const metadata: ActorMetadata = {
    id,
    machineType: persistence.machineType ?? "unknown",
    createdAt,
    lastActivityAt,
    version,
    stateTag: state._tag,
  };
  yield* save(metadata).pipe(Effect.catchAll((e) => Effect.logWarning(`Failed to save metadata for actor ${id}`, e)));
});

/**
 * Restore an actor from persistence.
 * Returns None if no persisted state exists.
 */
export const restorePersistentActor = Effect.fn("effect-machine.persistentActor.restore")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
>(id: string, persistentMachine: PersistentMachine<S, E, R>) {
  const adapter = yield* PersistenceAdapterTag;
  const { persistence } = persistentMachine;

  // Try to load snapshot
  const maybeSnapshot = yield* adapter.loadSnapshot(id, persistence.stateSchema);

  // Load events (after snapshot if present)
  const events = yield* adapter.loadEvents(
    id,
    persistence.eventSchema,
    Option.isSome(maybeSnapshot) ? maybeSnapshot.value.version : undefined
  );

  if (Option.isNone(maybeSnapshot) && events.length === 0) {
    return Option.none();
  }

  // Create actor with restored state
  const actor = yield* createPersistentActor(id, persistentMachine, maybeSnapshot, events);

  return Option.some(actor);
});
