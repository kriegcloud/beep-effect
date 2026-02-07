/**
 * Internal utilities for effect-machine.
 * @internal
 */
import type { Effect } from "effect";
import { Effect as E } from "effect";
import * as P from "effect/Predicate";

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Extracts _tag from a tagged union member
 */
export type TagOf<T> = T extends { readonly _tag: infer Tag } ? Tag : never;

/**
 * Extracts args type from a Data.taggedEnum constructor
 */
export type ArgsOf<C> = C extends (args: infer A) => unknown ? A : never;

/**
 * Extracts return type from a Data.taggedEnum constructor
 * @internal
 */
export type InstanceOf<C> = C extends (...args: unknown[]) => infer R ? R : never;

/**
 * A tagged union constructor (from Data.taggedEnum)
 */
export type TaggedConstructor<T extends { readonly _tag: string }> = (args: Omit<T, "_tag">) => T;

/**
 * Transition handler result - either a new state or Effect producing one
 */
export type TransitionResult<State, R> = State | Effect.Effect<State, never, R>;

// ============================================================================
// Constants
// ============================================================================

/**
 * Internal event tags used for lifecycle effect contexts.
 * Prefixed with $ to distinguish from user events.
 * @internal
 */
export const INTERNAL_INIT_EVENT = "$init" as const;
export const INTERNAL_ENTER_EVENT = "$enter" as const;

// ============================================================================
// Runtime Utilities
// ============================================================================

/**
 * Extract _tag from a tagged value or constructor.
 *
 * Supports:
 * - Plain values with `_tag` (MachineSchema empty structs)
 * - Constructors with static `_tag` (MachineSchema non-empty structs)
 * - Data.taggedEnum constructors (fallback via instantiation)
 */
export const getTag = (constructorOrValue: { _tag: string } | ((...args: never[]) => { _tag: string })): string => {
  // Direct _tag property (values or static on constructors)
  if (P.hasProperty("_tag")(constructorOrValue) && P.isString(constructorOrValue._tag)) {
    return constructorOrValue._tag;
  }
  // Fallback: instantiate (Data.taggedEnum compatibility)
  // Try zero-arg first, then empty object for record constructors
  try {
    return (constructorOrValue as () => { _tag: string })()._tag;
  } catch {
    return (constructorOrValue as (args: object) => { _tag: string })({})._tag;
  }
};

/** Check if a value is an Effect */
export const isEffect = (value: unknown): value is Effect.Effect<unknown, unknown, unknown> =>
  typeof value === "object" && value !== null && E.EffectTypeId in value;

// ============================================================================
// Transition Index Cache
// ============================================================================

/**
 * Module-level cache for transition indexes.
 * WeakMap allows GC of unreferenced machines.
 * @internal
 */
// biome-ignore lint/suspicious/noExplicitAny: Schema fields need wide acceptance
export const indexCache = new WeakMap<object, any>();

/**
 * Invalidate cached index for a machine (call after mutation).
 * @internal
 */
export const invalidateIndex = (machine: object): void => {
  indexCache.delete(machine);
};
