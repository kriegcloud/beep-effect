import { Effect, SubscriptionRef } from "effect";
import { AssertionError } from "./errors";
import { executeTransition } from "./internal/transition";
import type { Machine, MachineRef } from "./machine";
import { BuiltMachine } from "./machine";
import type { EffectsDef, GuardsDef } from "./slot";

/** Accept either Machine or BuiltMachine for testing utilities. */
type MachineInput<S, E, R, GD extends GuardsDef, EFD extends EffectsDef> =
  // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
  Machine<S, E, R, any, any, GD, EFD> | BuiltMachine<S, E, R>;

/**
 * Result of simulating events through a machine
 */
export interface SimulationResult<S> {
  readonly states: ReadonlyArray<S>;
  readonly finalState: S;
}

/**
 * Simulate a sequence of events through a machine without running an actor.
 * Useful for testing state transitions in isolation.
 * Does not run onEnter/spawn/background effects, but does run guard/effect slots
 * within transition handlers.
 *
 * @example
 * ```ts
 * const result = yield* simulate(
 *   fetcherMachine,
 *   [
 *     Event.Fetch({ url: "https://example.com" }),
 *     Event._Done({ data: { foo: "bar" } })
 *   ]
 * )
 *
 * expect(result.finalState._tag).toBe("Success")
 * expect(result.states).toHaveLength(3) // Idle -> Loading -> Success
 * ```
 */
export const simulate = Effect.fn("effect-machine.simulate")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(input: MachineInput<S, E, R, GD, EFD>, events: ReadonlyArray<E>) {
  const machine = (input instanceof BuiltMachine ? input._inner : input) as Machine<
    S,
    E,
    R,
    Record<string, never>,
    Record<string, never>,
    GD,
    EFD
  >;

  // Create a dummy self for slot accessors
  const dummySelf: MachineRef<E> = {
    send: Effect.fn("effect-machine.testing.simulate.send")((_event: E) => Effect.void),
  };

  let currentState = machine.initial;
  const states: S[] = [currentState];

  for (const event of events) {
    const result = yield* executeTransition(machine, currentState, event, dummySelf);

    if (!result.transitioned) {
      continue;
    }

    currentState = result.newState;
    states.push(currentState);

    // Stop if final state
    if (machine.finalStates.has(currentState._tag)) {
      break;
    }
  }

  return { states, finalState: currentState };
});

// AssertionError is exported from errors.ts
export { AssertionError } from "./errors";

/**
 * Assert that a machine can reach a specific state given a sequence of events
 */
export const assertReaches = Effect.fn("effect-machine.assertReaches")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(input: MachineInput<S, E, R, GD, EFD>, events: ReadonlyArray<E>, expectedTag: string) {
  const result = yield* simulate(input, events);
  if (result.finalState._tag !== expectedTag) {
    return yield* new AssertionError({
      message:
        `Expected final state "${expectedTag}" but got "${result.finalState._tag}". ` +
        `States visited: ${result.states.map((s) => s._tag).join(" -> ")}`,
    });
  }
  return result.finalState;
});

/**
 * Assert that a machine follows a specific path of state tags
 *
 * @example
 * ```ts
 * yield* assertPath(
 *   machine,
 *   [Event.Start(), Event.Increment(), Event.Stop()],
 *   ["Idle", "Counting", "Counting", "Done"]
 * )
 * ```
 */
export const assertPath = Effect.fn("effect-machine.assertPath")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(input: MachineInput<S, E, R, GD, EFD>, events: ReadonlyArray<E>, expectedPath: ReadonlyArray<string>) {
  const result = yield* simulate(input, events);
  const actualPath = result.states.map((s) => s._tag);

  if (actualPath.length !== expectedPath.length) {
    return yield* new AssertionError({
      message:
        `Path length mismatch. Expected ${expectedPath.length} states but got ${actualPath.length}.\n` +
        `Expected: ${expectedPath.join(" -> ")}\n` +
        `Actual:   ${actualPath.join(" -> ")}`,
    });
  }

  for (let i = 0; i < expectedPath.length; i++) {
    if (actualPath[i] !== expectedPath[i]) {
      return yield* new AssertionError({
        message:
          `Path mismatch at position ${i}. Expected "${expectedPath[i]}" but got "${actualPath[i]}".\n` +
          `Expected: ${expectedPath.join(" -> ")}\n` +
          `Actual:   ${actualPath.join(" -> ")}`,
      });
    }
  }

  return result;
});

/**
 * Assert that a machine never reaches a specific state given a sequence of events
 *
 * @example
 * ```ts
 * // Verify error handling doesn't reach crash state
 * yield* assertNeverReaches(
 *   machine,
 *   [Event.Error(), Event.Retry(), Event.Success()],
 *   "Crashed"
 * )
 * ```
 */
export const assertNeverReaches = Effect.fn("effect-machine.assertNeverReaches")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(input: MachineInput<S, E, R, GD, EFD>, events: ReadonlyArray<E>, forbiddenTag: string) {
  const result = yield* simulate(input, events);

  const visitedIndex = result.states.findIndex((s) => s._tag === forbiddenTag);
  if (visitedIndex !== -1) {
    return yield* new AssertionError({
      message:
        `Machine reached forbidden state "${forbiddenTag}" at position ${visitedIndex}.\n` +
        `States visited: ${result.states.map((s) => s._tag).join(" -> ")}`,
    });
  }

  return result;
});

/**
 * Create a controllable test harness for a machine
 */
export interface TestHarness<S, E, R> {
  readonly state: SubscriptionRef.SubscriptionRef<S>;
  readonly send: (event: E) => Effect.Effect<S, never, R>;
  readonly getState: Effect.Effect<S>;
}

/**
 * Options for creating a test harness
 */
export interface TestHarnessOptions<S, E> {
  /**
   * Called after each transition with the previous state, event, and new state.
   * Useful for logging or spying on transitions.
   */
  readonly onTransition?: undefined | ((from: S, event: E, to: S) => void);
}

/**
 * Create a test harness for step-by-step testing.
 * Does not run onEnter/spawn/background effects, but does run guard/effect slots
 * within transition handlers.
 *
 * @example Basic usage
 * ```ts
 * const harness = yield* createTestHarness(machine)
 * yield* harness.send(Event.Start())
 * const state = yield* harness.getState
 * ```
 *
 * @example With transition observer
 * ```ts
 * const transitions: Array<{ from: string; event: string; to: string }> = []
 * const harness = yield* createTestHarness(machine, {
 *   onTransition: (from, event, to) =>
 *     transitions.push({ from: from._tag, event: event._tag, to: to._tag })
 * })
 * ```
 */
export const createTestHarness = Effect.fn("effect-machine.createTestHarness")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(input: MachineInput<S, E, R, GD, EFD>, options?: undefined | TestHarnessOptions<S, E>) {
  const machine = (input instanceof BuiltMachine ? input._inner : input) as Machine<
    S,
    E,
    R,
    Record<string, never>,
    Record<string, never>,
    GD,
    EFD
  >;

  // Create a dummy self for slot accessors
  const dummySelf: MachineRef<E> = {
    send: Effect.fn("effect-machine.testing.harness.send")((_event: E) => Effect.void),
  };

  const stateRef = yield* SubscriptionRef.make(machine.initial);

  const send = Effect.fn("effect-machine.testHarness.send")(function* (event: E) {
    const currentState = yield* SubscriptionRef.get(stateRef);

    const result = yield* executeTransition(machine, currentState, event, dummySelf);

    if (!result.transitioned) {
      return currentState;
    }

    const newState = result.newState;
    yield* SubscriptionRef.set(stateRef, newState);

    // Call transition observer
    if (options?.onTransition !== undefined) {
      options.onTransition(currentState, event, newState);
    }

    return newState;
  });

  return {
    state: stateRef,
    send,
    getState: SubscriptionRef.get(stateRef),
  };
});
