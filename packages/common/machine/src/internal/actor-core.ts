/**
 * Core ActorRef building blocks shared by regular and persistent actors.
 *
 * Extracted from actor.ts to break the circular dependency:
 *   actor.ts <-> persistent-actor.ts
 *
 * Both modules now import from this shared internal module instead of each other.
 *
 * @internal
 */
import { Deferred, Effect, Queue, Ref, Runtime, SubscriptionRef } from "effect";
import type { ActorRef } from "../actor";
import type { Machine } from "../machine";
import type { EffectsDef, GuardsDef } from "../slot";
import { resolveTransition } from "./transition";

// ============================================================================
// Actor Core Helpers
// ============================================================================

/** Listener set for sync subscriptions */
export type Listeners<S> = Set<(state: S) => void>;

/**
 * Notify all listeners of state change.
 */
export const notifyListeners = <S>(listeners: Listeners<S>, state: S): void => {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch {
      // Ignore listener failures to avoid crashing the actor loop
    }
  }
};

/**
 * Build core ActorRef methods shared between regular and persistent actors.
 */
export const buildActorRefCore = <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef,
  EFD extends EffectsDef,
>(
  id: string,
  // biome-ignore lint/suspicious/noExplicitAny: Schema fields need wide acceptance
  machine: Machine<S, E, R, any, any, GD, EFD>,
  stateRef: SubscriptionRef.SubscriptionRef<S>,
  eventQueue: Queue.Queue<E>,
  stoppedRef: Ref.Ref<boolean>,
  listeners: Listeners<S>,
  stop: Effect.Effect<void>
): ActorRef<S, E> => {
  const send = Effect.fn("effect-machine.actor.send")(function* (event: E) {
    const stopped = yield* Ref.get(stoppedRef);
    if (stopped) {
      return;
    }
    yield* Queue.offer(eventQueue, event);
  });

  const snapshot = SubscriptionRef.get(stateRef).pipe(Effect.withSpan("effect-machine.actor.snapshot"));

  const matches = Effect.fn("effect-machine.actor.matches")(function* (tag: S["_tag"]) {
    const state = yield* SubscriptionRef.get(stateRef);
    return state._tag === tag;
  });

  const can = Effect.fn("effect-machine.actor.can")(function* (event: E) {
    const state = yield* SubscriptionRef.get(stateRef);
    return resolveTransition(machine, state, event) !== undefined;
  });

  const waitFor = Effect.fn("effect-machine.actor.waitFor")(function* (
    predicateOrState: ((state: S) => boolean) | { readonly _tag: S["_tag"] }
  ) {
    const predicate =
      typeof predicateOrState === "function" && !("_tag" in predicateOrState)
        ? predicateOrState
        : (s: S) => s._tag === (predicateOrState as { readonly _tag: string })._tag;

    // Check current state first — SubscriptionRef.get acquires/releases
    // the semaphore quickly (read-only), no deadlock risk.
    const current = yield* SubscriptionRef.get(stateRef);
    if (predicate(current)) return current;

    // Use sync listener + Deferred to avoid holding the SubscriptionRef
    // semaphore for the duration of a stream (which causes deadlock when
    // send triggers SubscriptionRef.set concurrently).
    const done = yield* Deferred.make<S>();
    const rt = yield* Effect.runtime<never>();
    const runFork = Runtime.runFork(rt);
    const listener = (state: S) => {
      if (predicate(state)) {
        runFork(Deferred.succeed(done, state));
      }
    };
    listeners.add(listener);

    // Re-check after subscribing to close the race window
    const afterSubscribe = yield* SubscriptionRef.get(stateRef);
    if (predicate(afterSubscribe)) {
      listeners.delete(listener);
      return afterSubscribe;
    }

    const result = yield* Deferred.await(done);
    listeners.delete(listener);
    return result;
  });

  const awaitFinal = waitFor((state) => machine.finalStates.has(state._tag)).pipe(
    Effect.withSpan("effect-machine.actor.awaitFinal")
  );

  const sendAndWait = Effect.fn("effect-machine.actor.sendAndWait")(function* (
    event: E,
    predicateOrState?: undefined | (((state: S) => boolean) | { readonly _tag: S["_tag"] })
  ) {
    yield* send(event);
    if (predicateOrState !== undefined) {
      return yield* waitFor(predicateOrState);
    }
    return yield* awaitFinal;
  });

  return {
    id,
    send,
    state: stateRef,
    stop,
    stopSync: () => Effect.runFork(stop),
    snapshot,
    snapshotSync: () => Effect.runSync(SubscriptionRef.get(stateRef)),
    matches,
    matchesSync: (tag) => Effect.runSync(SubscriptionRef.get(stateRef))._tag === tag,
    can,
    canSync: (event) => {
      const state = Effect.runSync(SubscriptionRef.get(stateRef));
      return resolveTransition(machine, state, event) !== undefined;
    },
    changes: stateRef.changes,
    waitFor,
    awaitFinal,
    sendAndWait,
    sendSync: (event) => {
      const stopped = Effect.runSync(Ref.get(stoppedRef));
      if (!stopped) {
        Effect.runSync(Queue.offer(eventQueue, event));
      }
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
};
