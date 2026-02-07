/**
 * Slot module - schema-based, parameterized guards and effects.
 *
 * Guards and Effects are defined with schemas for their parameters,
 * and provided implementations receive typed parameters plus machine context.
 *
 * @example
 * ```ts
 * import { Slot } from "effect-machine"
 * import { Schema } from "effect"
 *
 * const MyGuards = Slot.Guards({
 *   canRetry: { max: S.Number },
 *   isValid: {},  // no params
 * })
 *
 * const MyEffects = Slot.Effects({
 *   fetchData: { url: S.String },
 *   notify: { message: S.String },
 * })
 *
 * // Used in handlers:
 * .on(State.X, Event.Y, ({ guards, effects }) =>
 *   Effect.gen(function* () {
 *     if (yield* guards.canRetry({ max: 3 })) {
 *       yield* effects.fetchData({ url: "/api" })
 *       return State.Next
 *     }
 *     return state
 *   })
 * )
 * ```
 *
 * @module
 */

import { $MachineId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";

const $I = $MachineId.create("slot");

// ============================================================================
// Type-level utilities
// ============================================================================

/** Schema fields definition (like S.Struct.Fields) */
type Fields = Record<string, S.Schema.All>;

/** Extract the encoded type from schema fields (used for parameters) */
type FieldsToParams<F extends Fields> = keyof F extends never ? void : S.Schema.Type<S.Struct<F>>;

// ============================================================================
// Slot Types
// ============================================================================

/**
 * A guard slot - callable function that returns Effect<boolean>.
 */
export interface GuardSlot<Name extends string, Params> {
  readonly _tag: "GuardSlot";
  readonly name: Name;
  (params: Params): Effect.Effect<boolean>;
}

/**
 * An effect slot - callable function that returns Effect<void>.
 */
export interface EffectSlot<Name extends string, Params> {
  readonly _tag: "EffectSlot";
  readonly name: Name;
  (params: Params): Effect.Effect<void>;
}

/**
 * Guard definition - name to schema fields mapping
 */
export type GuardsDef = Record<string, Fields>;

/**
 * Effect definition - name to schema fields mapping
 */
export type EffectsDef = Record<string, Fields>;

/**
 * Convert guard definitions to callable guard slots
 */
export type GuardSlots<D extends GuardsDef> = {
  readonly [K in keyof D & string]: GuardSlot<K, FieldsToParams<D[K]>>;
};

/**
 * Convert effect definitions to callable effect slots
 */
export type EffectSlots<D extends EffectsDef> = {
  readonly [K in keyof D & string]: EffectSlot<K, FieldsToParams<D[K]>>;
};

// ============================================================================
// Machine Context Tag
// ============================================================================

/**
 * Type for machine context - state, event, and self reference.
 * Shared across all machines via MachineContextTag.
 */
export interface MachineContext<State, Event, Self> {
  readonly state: State;
  readonly event: Event;
  readonly self: Self;
}

/**
 * Shared Context tag for all machines.
 * Single module-level tag instead of per-machine allocation.
 * @internal
 */

export const MachineContextTag =
  // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
  Context.GenericTag<MachineContext<any, any, any>>($I`MachineContext`);

// ============================================================================
// Handler Types (for provide)
// ============================================================================

/**
 * Guard handler implementation.
 * Receives params and context, returns Effect<boolean>.
 */
export type GuardHandler<Params, Ctx, R = never> = (
  params: Params,
  ctx: Ctx
) => boolean | Effect.Effect<boolean, never, R>;

/**
 * Effect handler implementation.
 * Receives params and context, returns Effect<void>.
 */
export type EffectHandler<Params, Ctx, R = never> = (params: Params, ctx: Ctx) => Effect.Effect<void, never, R>;

/**
 * Handler types for all guards in a definition
 */
export type GuardHandlers<D extends GuardsDef, MachineCtx, R = never> = {
  readonly [K in keyof D & string]: GuardHandler<FieldsToParams<D[K]>, MachineCtx, R>;
};

/**
 * Handler types for all effects in a definition
 */
export type EffectHandlers<D extends EffectsDef, MachineCtx, R = never> = {
  readonly [K in keyof D & string]: EffectHandler<FieldsToParams<D[K]>, MachineCtx, R>;
};

// ============================================================================
// Schema Types (for Machine.make)
// ============================================================================

/**
 * Guards schema - returned by Slot.Guards()
 */
export interface GuardsSchema<D extends GuardsDef> {
  readonly _tag: "GuardsSchema";
  readonly definitions: D;
  /** Create callable guard slots (used by Machine internally) */
  readonly _createSlots: (
    resolve: <N extends keyof D & string>(name: N, params: FieldsToParams<D[N]>) => Effect.Effect<boolean>
  ) => GuardSlots<D>;
}

/**
 * Effects schema - returned by Slot.Effects()
 */
export interface EffectsSchema<D extends EffectsDef> {
  readonly _tag: "EffectsSchema";
  readonly definitions: D;
  /** Create callable effect slots (used by Machine internally) */
  readonly _createSlots: (
    resolve: <N extends keyof D & string>(name: N, params: FieldsToParams<D[N]>) => Effect.Effect<void>
  ) => EffectSlots<D>;
}

// ============================================================================
// Slot Factories
// ============================================================================

/**
 * Generic slot schema factory. Used internally by Guards() and Effects().
 * @internal
 */
const createSlotSchema = <Tag extends "GuardsSchema" | "EffectsSchema", D extends Record<string, Fields>>(
  tag: Tag,
  slotTag: "GuardSlot" | "EffectSlot",
  definitions: D
): {
  readonly _tag: Tag;
  readonly definitions: D;
  readonly _createSlots: (
    resolve: <N extends keyof D & string>(name: N, params: FieldsToParams<D[N]>) => Effect.Effect<unknown>
  ) => Record<string, unknown>;
} => ({
  _tag: tag,
  definitions,
  _createSlots: (resolve) => {
    const slots: Record<string, unknown> = {};
    for (const name of Object.keys(definitions)) {
      const slot = (params: unknown) => resolve(name, params as FieldsToParams<D[typeof name]>);
      Object.defineProperty(slot, "_tag", { value: slotTag, enumerable: true });
      Object.defineProperty(slot, "name", { value: name, enumerable: true });
      slots[name] = slot;
    }
    return slots;
  },
});

/**
 * Create a guards schema with parameterized guard definitions.
 *
 * @example
 * ```ts
 * const MyGuards = Slot.Guards({
 *   canRetry: { max: S.Number },
 *   isValid: {},
 * })
 * ```
 */
export const Guards = <D extends GuardsDef>(definitions: D): GuardsSchema<D> =>
  createSlotSchema("GuardsSchema", "GuardSlot", definitions) as GuardsSchema<D>;

/**
 * Create an effects schema with parameterized effect definitions.
 *
 * @example
 * ```ts
 * const MyEffects = Slot.Effects({
 *   fetchData: { url: S.String },
 *   notify: { message: S.String },
 * })
 * ```
 */
export const Effects = <D extends EffectsDef>(definitions: D): EffectsSchema<D> =>
  createSlotSchema("EffectsSchema", "EffectSlot", definitions) as EffectsSchema<D>;

// ============================================================================
// Type extraction helpers
// ============================================================================

/** Extract guard definition type from GuardsSchema */
export type GuardsDefOf<G> = G extends GuardsSchema<infer D> ? D : never;

/** Extract effect definition type from EffectsSchema */
export type EffectsDefOf<E> = E extends EffectsSchema<infer D> ? D : never;

/** Extract guard slots type from GuardsSchema */
export type GuardSlotsOf<G> = G extends GuardsSchema<infer D> ? GuardSlots<D> : never;

/** Extract effect slots type from EffectsSchema */
export type EffectSlotsOf<E> = E extends EffectsSchema<infer D> ? EffectSlots<D> : never;

// ============================================================================
// Slot namespace export
// ============================================================================

export const Slot = {
  Guards,
  Effects,
} as const;
