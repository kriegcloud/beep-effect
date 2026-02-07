/**
 * Machine namespace - fluent builder API for state machines.
 *
 * @example
 * ```ts
 * import { Machine, State, Event, Slot } from "effect-machine"
 *
 * const MyState = State({ Idle: {}, Running: { count: S.Number } })
 * const MyEvent = Event({ Start: {}, Stop: {} })
 *
 * const MyGuards = Slot.Guards({
 *   canStart: { threshold: S.Number },
 * })
 *
 * const MyEffects = Slot.Effects({
 *   notify: { message: S.String },
 * })
 *
 * const machine = Machine.make({
 *   state: MyState,
 *   event: MyEvent,
 *   guards: MyGuards,
 *   effects: MyEffects,
 *   initial: MyState.Idle,
 * })
 *   .on(MyState.Idle, MyEvent.Start, ({ state, guards, effects }) =>
 *     Effect.gen(function* () {
 *       if (yield* guards.canStart({ threshold: 5 })) {
 *         yield* effects.notify({ message: "Starting!" })
 *         return MyState.Running({ count: 0 })
 *       }
 *       return state
 *     })
 *   )
 *   .on(MyState.Running, MyEvent.Stop, () => MyState.Idle)
 *   .final(MyState.Idle)
 *   .build({
 *     canStart: ({ threshold }) => Effect.succeed(threshold > 0),
 *     notify: ({ message }) => Effect.log(message),
 *   })
 * ```
 *
 * @module
 */
import type { Context, Schedule } from "effect";
import { Cause, Effect, Exit, type Scope } from "effect";
import type * as S from "effect/Schema";
import { ProvisionValidationError, SlotProvisionError } from "./errors";
import type { BrandedEvent, BrandedState, TaggedOrConstructor } from "./internal/brands";
import type { TransitionResult } from "./internal/utils";
import { getTag, invalidateIndex } from "./internal/utils";
import type { PersistentMachine, WithPersistenceConfig } from "./persistence/persistent-machine";
import { persist as persistImpl } from "./persistence/persistent-machine";
import type { MachineEventSchema, MachineStateSchema, VariantsUnion } from "./schema";
import type {
  EffectSlots,
  EffectsDef,
  EffectsSchema,
  GuardHandlers,
  GuardSlots,
  GuardsDef,
  GuardsSchema,
  MachineContext,
  EffectHandlers as SlotEffectHandlers,
} from "./slot";
import { MachineContextTag } from "./slot";

// ============================================================================
// Core types
// ============================================================================

/**
 * Self reference for sending events back to the machine
 */
export interface MachineRef<Event> {
  readonly send: (event: Event) => Effect.Effect<void>;
}

/**
 * Handler context passed to transition handlers
 */
export interface HandlerContext<State, Event, GD extends GuardsDef, ED extends EffectsDef> {
  readonly state: State;
  readonly event: Event;
  readonly guards: GuardSlots<GD>;
  readonly effects: EffectSlots<ED>;
}

/**
 * Handler context passed to state effect handlers (onEnter, spawn, background)
 */
export interface StateHandlerContext<State, Event, ED extends EffectsDef> {
  readonly state: State;
  readonly event: Event;
  readonly self: MachineRef<Event>;
  readonly effects: EffectSlots<ED>;
}

/**
 * Transition handler function
 */
export type TransitionHandler<S, E, NewState, GD extends GuardsDef, ED extends EffectsDef, R> = (
  ctx: HandlerContext<S, E, GD, ED>
) => TransitionResult<NewState, R>;

/**
 * State effect handler function
 */
export type StateEffectHandler<S, E, ED extends EffectsDef, R> = (
  ctx: StateHandlerContext<S, E, ED>
) => Effect.Effect<void, never, R>;

/**
 * Transition definition
 */
export interface Transition<State, Event, GD extends GuardsDef, ED extends EffectsDef, R> {
  readonly stateTag: string;
  readonly eventTag: string;
  readonly handler: TransitionHandler<State, Event, State, GD, ED, R>;
  readonly reenter?: undefined | boolean;
}

/**
 * Spawn effect - state-scoped forked effect
 */
export interface SpawnEffect<State, Event, ED extends EffectsDef, R> {
  readonly stateTag: string;
  readonly handler: StateEffectHandler<State, Event, ED, R>;
}

/**
 * Background effect - runs for entire machine lifetime
 */
export interface BackgroundEffect<State, Event, ED extends EffectsDef, R> {
  readonly handler: StateEffectHandler<State, Event, ED, R>;
}

// ============================================================================
// Options types
// ============================================================================

/** Options for `persist` */
export interface PersistOptions {
  readonly snapshotSchedule: Schedule.Schedule<unknown, { readonly _tag: string }>;
  readonly journalEvents: boolean;
  readonly machineType?: undefined | string;
}

// ============================================================================
// Internal helpers
// ============================================================================

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsUnknown<T> = unknown extends T ? ([T] extends [unknown] ? true : false) : false;
type NormalizeR<T> = IsAny<T> extends true ? T : IsUnknown<T> extends true ? never : T;

// ============================================================================
// MakeConfig
// ============================================================================

export interface MakeConfig<
  SD extends Record<string, S.Struct.Fields>,
  ED extends Record<string, S.Struct.Fields>,
  S extends BrandedState,
  E extends BrandedEvent,
  GD extends GuardsDef,
  EFD extends EffectsDef,
> {
  readonly state: MachineStateSchema<SD> & { Type: S };
  readonly event: MachineEventSchema<ED> & { Type: E };
  readonly guards?: undefined | GuardsSchema<GD>;
  readonly effects?: undefined | EffectsSchema<EFD>;
  readonly initial: S;
}

// ============================================================================
// Provide types
// ============================================================================

/** Check if a GuardsDef has any actual keys */
type HasGuardKeys<GD extends GuardsDef> = [keyof GD] extends [never]
  ? false
  : GD extends Record<string, never>
    ? false
    : true;

/** Check if an EffectsDef has any actual keys */
type HasEffectKeys<EFD extends EffectsDef> = [keyof EFD] extends [never]
  ? false
  : EFD extends Record<string, never>
    ? false
    : true;

/** Context type passed to guard/effect handlers */
export type SlotContext<State, Event> = MachineContext<State, Event, MachineRef<Event>>;

/** Combined handlers for build() - guards and effects only */
export type ProvideHandlers<
  State,
  Event,
  GD extends GuardsDef,
  EFD extends EffectsDef,
  R,
> = (HasGuardKeys<GD> extends true ? GuardHandlers<GD, SlotContext<State, Event>, R> : object) &
  (HasEffectKeys<EFD> extends true ? SlotEffectHandlers<EFD, SlotContext<State, Event>, R> : object);

/** Whether the machine has any guard or effect slots */
type HasSlots<GD extends GuardsDef, EFD extends EffectsDef> = HasGuardKeys<GD> extends true ? true : HasEffectKeys<EFD>;

// ============================================================================
// BuiltMachine
// ============================================================================

/**
 * A finalized machine ready for spawning.
 *
 * Created by calling `.build()` on a `Machine`. This is the only type
 * accepted by `Machine.spawn` and `ActorSystem.spawn` (regular overload).
 * Testing utilities (`simulate`, `createTestHarness`, etc.) still accept `Machine`.
 */
export class BuiltMachine<State, Event, R = never> {
  readonly _builtMachine = true as const;
  /** @internal */
  // biome-ignore lint/suspicious/noExplicitAny: Schema fields need wide acceptance
  readonly _inner: Machine<State, Event, R, any, any, any, any>;

  /** @internal */
  // biome-ignore lint/suspicious/noExplicitAny: Schema fields need wide acceptance
  constructor(machine: Machine<State, Event, R, any, any, any, any>) {
    this._inner = machine;
  }

  get initial(): State {
    return this._inner.initial;
  }

  persist(
    config: PersistOptions
  ): PersistentMachine<State & { readonly _tag: string }, Event & { readonly _tag: string }, R> {
    return this._inner.persist(config);
  }
}

// ============================================================================
// Machine class
// ============================================================================

/**
 * Machine definition with fluent builder API.
 *
 * Type parameters:
 * - `State`: The state union type
 * - `Event`: The event union type
 * - `R`: Effect requirements
 * - `_SD`: State schema definition (for compile-time validation)
 * - `_ED`: Event schema definition (for compile-time validation)
 * - `GD`: Guard definitions
 * - `EFD`: Effect definitions
 */
export class Machine<
  State,
  Event,
  R = never,
  _SD extends Record<string, S.Struct.Fields> = Record<string, S.Struct.Fields>,
  _ED extends Record<string, S.Struct.Fields> = Record<string, S.Struct.Fields>,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
> {
  readonly initial: State;
  /** @internal */ readonly _transitions: Array<Transition<State, Event, GD, EFD, R>>;
  /** @internal */ readonly _spawnEffects: Array<SpawnEffect<State, Event, EFD, R>>;
  /** @internal */ readonly _backgroundEffects: Array<BackgroundEffect<State, Event, EFD, R>>;
  /** @internal */ readonly _finalStates: Set<string>;
  /** @internal */ readonly _guardsSchema?: undefined | GuardsSchema<GD>;
  /** @internal */ readonly _effectsSchema?: undefined | EffectsSchema<EFD>;
  /** @internal */ readonly _guardHandlers: Map<
    string,
    (params: unknown, ctx: SlotContext<State, Event>) => boolean | Effect.Effect<boolean, never, R>
  >;
  /** @internal */ readonly _effectHandlers: Map<
    string,
    (params: unknown, ctx: SlotContext<State, Event>) => Effect.Effect<void, never, R>
  >;
  /** @internal */ readonly _slots: {
    guards: GuardSlots<GD>;
    effects: EffectSlots<EFD>;
  };
  readonly stateSchema?: undefined | S.Schema<State, unknown, never>;
  readonly eventSchema?: undefined | S.Schema<Event, unknown, never>;

  /**
   * Context tag for accessing machine state/event/self in slot handlers.
   * Uses shared module-level tag for all machines.
   */
  readonly Context: Context.Tag<
    MachineContext<State, Event, MachineRef<Event>>,
    MachineContext<State, Event, MachineRef<Event>>
  > = MachineContextTag as Context.Tag<
    MachineContext<State, Event, MachineRef<Event>>,
    MachineContext<State, Event, MachineRef<Event>>
  >;

  // Public readonly views
  get transitions(): ReadonlyArray<Transition<State, Event, GD, EFD, R>> {
    return this._transitions;
  }
  get spawnEffects(): ReadonlyArray<SpawnEffect<State, Event, EFD, R>> {
    return this._spawnEffects;
  }
  get backgroundEffects(): ReadonlyArray<BackgroundEffect<State, Event, EFD, R>> {
    return this._backgroundEffects;
  }
  get finalStates(): ReadonlySet<string> {
    return this._finalStates;
  }
  get guardsSchema(): GuardsSchema<GD> | undefined {
    return this._guardsSchema;
  }
  get effectsSchema(): EffectsSchema<EFD> | undefined {
    return this._effectsSchema;
  }

  /** @internal */
  constructor(
    initial: State,
    stateSchema?: undefined | S.Schema<State, unknown, never>,
    eventSchema?: undefined | S.Schema<Event, unknown, never>,
    guardsSchema?: undefined | GuardsSchema<GD>,
    effectsSchema?: undefined | EffectsSchema<EFD>
  ) {
    this.initial = initial;
    this._transitions = [];
    this._spawnEffects = [];
    this._backgroundEffects = [];
    this._finalStates = new Set();
    this._guardsSchema = guardsSchema;
    this._effectsSchema = effectsSchema;
    this._guardHandlers = new Map();
    this._effectHandlers = new Map();
    this.stateSchema = stateSchema;
    this.eventSchema = eventSchema;

    const guardSlots =
      this._guardsSchema !== undefined
        ? this._guardsSchema._createSlots((name: string, params: unknown) =>
            Effect.flatMap(Effect.serviceOptional(this.Context).pipe(Effect.orDie), (ctx) => {
              const handler = this._guardHandlers.get(name);
              if (handler === undefined) {
                return Effect.die(new SlotProvisionError({ slotName: name, slotType: "guard" }));
              }
              const result = handler(params, ctx);
              const normalized = typeof result === "boolean" ? Effect.succeed(result) : result;
              return normalized as Effect.Effect<boolean, never, never>;
            })
          )
        : ({} as GuardSlots<GD>);

    const effectSlots =
      this._effectsSchema !== undefined
        ? this._effectsSchema._createSlots((name: string, params: unknown) =>
            Effect.flatMap(Effect.serviceOptional(this.Context).pipe(Effect.orDie), (ctx) => {
              const handler = this._effectHandlers.get(name);
              if (handler === undefined) {
                return Effect.die(new SlotProvisionError({ slotName: name, slotType: "effect" }));
              }
              return handler(params, ctx) as Effect.Effect<void, never, never>;
            })
          )
        : ({} as EffectSlots<EFD>);

    this._slots = { guards: guardSlots, effects: effectSlots };
  }

  // ---- on ----

  /** Register transition for a single state */
  on<
    NS extends VariantsUnion<_SD> & BrandedState,
    NE extends VariantsUnion<_ED> & BrandedEvent,
    RS extends VariantsUnion<_SD> & BrandedState,
  >(
    state: TaggedOrConstructor<NS>,
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<NS, NE, RS, GD, EFD, never>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD>;
  /** Register transition for multiple states (handler receives union of state types) */
  on<
    NS extends ReadonlyArray<TaggedOrConstructor<VariantsUnion<_SD> & BrandedState>>,
    NE extends VariantsUnion<_ED> & BrandedEvent,
    RS extends VariantsUnion<_SD> & BrandedState,
  >(
    states: NS,
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<NS[number] extends TaggedOrConstructor<infer S> ? S : never, NE, RS, GD, EFD, never>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD>;
  // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
  on(stateOrStates: any, event: any, handler: any): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const states = Array.isArray(stateOrStates) ? stateOrStates : [stateOrStates];
    for (const s of states) {
      this.addTransition(s, event, handler, false);
    }
    return this;
  }

  // ---- reenter ----

  /**
   * Like `on()`, but forces onEnter/spawn to run even when transitioning to the same state tag.
   * Use this to restart timers, re-run spawned effects, or reset state-scoped effects.
   */
  /** Single state */
  reenter<
    NS extends VariantsUnion<_SD> & BrandedState,
    NE extends VariantsUnion<_ED> & BrandedEvent,
    RS extends VariantsUnion<_SD> & BrandedState,
  >(
    state: TaggedOrConstructor<NS>,
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<NS, NE, RS, GD, EFD, never>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD>;
  /** Multiple states */
  reenter<
    NS extends ReadonlyArray<TaggedOrConstructor<VariantsUnion<_SD> & BrandedState>>,
    NE extends VariantsUnion<_ED> & BrandedEvent,
    RS extends VariantsUnion<_SD> & BrandedState,
  >(
    states: NS,
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<NS[number] extends TaggedOrConstructor<infer S> ? S : never, NE, RS, GD, EFD, never>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD>;

  reenter(
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    stateOrStates: any,
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    event: any,
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    handler: any
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const states = Array.isArray(stateOrStates) ? stateOrStates : [stateOrStates];
    for (const s of states) {
      this.addTransition(s, event, handler, true);
    }
    return this;
  }

  // ---- onAny ----

  /**
   * Register a wildcard transition that fires from any state when no specific transition matches.
   * Specific `.on()` transitions always take priority over `.onAny()`.
   */
  onAny<NE extends VariantsUnion<_ED> & BrandedEvent, RS extends VariantsUnion<_SD> & BrandedState>(
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<VariantsUnion<_SD> & BrandedState, NE, RS, GD, EFD, never>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const eventTag = getTag(event);
    const transition: Transition<State, Event, GD, EFD, R> = {
      stateTag: "*",
      eventTag,
      handler: handler as unknown as Transition<State, Event, GD, EFD, R>["handler"],
      reenter: false,
    };
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    (this._transitions as any[]).push(transition);
    invalidateIndex(this);
    return this;
  }

  /** @internal */
  private addTransition<NS extends BrandedState, NE extends BrandedEvent>(
    state: TaggedOrConstructor<NS>,
    event: TaggedOrConstructor<NE>,
    handler: TransitionHandler<NS, NE, BrandedState, GD, EFD, never>,
    reenter: boolean
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const stateTag = getTag(state);
    const eventTag = getTag(event);

    const transition: Transition<State, Event, GD, EFD, R> = {
      stateTag,
      eventTag,
      handler: handler as unknown as Transition<State, Event, GD, EFD, R>["handler"],
      reenter,
    };

    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    (this._transitions as any[]).push(transition);
    invalidateIndex(this);

    return this;
  }

  // ---- spawn ----

  /**
   * State-scoped effect that is forked on state entry and automatically cancelled on state exit.
   * Use effect slots defined via `Slot.Effects` for the actual work.
   *
   * @example
   * ```ts
   * const MyEffects = Slot.Effects({
   *   fetchData: { url: S.String },
   * });
   *
   * machine
   *   .spawn(State.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }))
   *   .build({
   *     fetchData: ({ url }, { self }) =>
   *       Effect.gen(function* () {
   *         yield* Effect.addFinalizer(() => Effect.log("Leaving Loading"));
   *         const data = yield* Http.get(url);
   *         yield* self.send(Event.Loaded({ data }));
   *       }),
   *   });
   * ```
   */
  spawn<NS extends VariantsUnion<_SD> & BrandedState>(
    state: TaggedOrConstructor<NS>,
    handler: StateEffectHandler<NS, VariantsUnion<_ED> & BrandedEvent, EFD, Scope.Scope>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const stateTag = getTag(state);
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    (this._spawnEffects as any[]).push({
      stateTag,
      handler: handler as unknown as SpawnEffect<State, Event, EFD, R>["handler"],
    });
    invalidateIndex(this);
    return this;
  }

  // ---- task ----

  /**
   * State-scoped task that runs on entry and sends success/failure events.
   * Interrupts do not emit failure events.
   */
  task<
    NS extends VariantsUnion<_SD> & BrandedState,
    A,
    E1,
    ES extends VariantsUnion<_ED> & BrandedEvent,
    EF extends VariantsUnion<_ED> & BrandedEvent,
  >(
    state: TaggedOrConstructor<NS>,
    run: (ctx: StateHandlerContext<NS, VariantsUnion<_ED> & BrandedEvent, EFD>) => Effect.Effect<A, E1, Scope.Scope>,
    options: {
      readonly onSuccess: (value: A, ctx: StateHandlerContext<NS, VariantsUnion<_ED> & BrandedEvent, EFD>) => ES;
      readonly onFailure?:
        | undefined
        | ((cause: Cause.Cause<E1>, ctx: StateHandlerContext<NS, VariantsUnion<_ED> & BrandedEvent, EFD>) => EF);
    }
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const handler = Effect.fn("effect-machine.task")(function* (
      ctx: StateHandlerContext<NS, VariantsUnion<_ED> & BrandedEvent, EFD>
    ) {
      const exit = yield* Effect.exit(run(ctx));
      if (Exit.isSuccess(exit)) {
        yield* ctx.self.send(options.onSuccess(exit.value, ctx));
        yield* Effect.yieldNow();
        return;
      }

      const cause = exit.cause;
      if (Cause.isInterruptedOnly(cause)) {
        return;
      }
      if (options.onFailure !== undefined) {
        yield* ctx.self.send(options.onFailure(cause, ctx));
        yield* Effect.yieldNow();
        return;
      }
      return yield* Effect.failCause(cause).pipe(Effect.orDie);
    });

    return this.spawn(state, handler);
  }

  // ---- background ----

  /**
   * Machine-lifetime effect that is forked on actor spawn and runs until the actor stops.
   * Use effect slots defined via `Slot.Effects` for the actual work.
   *
   * @example
   * ```ts
   * const MyEffects = Slot.Effects({
   *   heartbeat: {},
   * });
   *
   * machine
   *   .background(({ effects }) => effects.heartbeat())
   *   .build({
   *     heartbeat: (_, { self }) =>
   *       Effect.forever(
   *         Effect.sleep("30 seconds").pipe(Effect.andThen(self.send(Event.Ping)))
   *       ),
   *   });
   * ```
   */
  background(handler: StateEffectHandler<State, Event, EFD, Scope.Scope>): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    (this._backgroundEffects as any[]).push({
      handler: handler as unknown as BackgroundEffect<State, Event, EFD, R>["handler"],
    });
    return this;
  }

  // ---- final ----

  final<NS extends VariantsUnion<_SD> & BrandedState>(
    state: TaggedOrConstructor<NS>
  ): Machine<State, Event, R, _SD, _ED, GD, EFD> {
    const stateTag = getTag(state);
    this._finalStates.add(stateTag);
    return this;
  }

  // ---- build ----

  /**
   * Finalize the machine. Returns a `BuiltMachine` — the only type accepted by `Machine.spawn`.
   *
   * - Machines with slots: pass implementations as the first argument.
   * - Machines without slots: call with no arguments.
   */
  build<R2 = never>(
    ...args: HasSlots<GD, EFD> extends true
      ? [handlers: ProvideHandlers<State, Event, GD, EFD, R2>]
      : [handlers?: undefined | ProvideHandlers<State, Event, GD, EFD, R2>]
  ): BuiltMachine<State, Event, R | NormalizeR<R2>> {
    const handlers = args[0];
    if (handlers !== undefined) {
      // Collect all required slot names in a single pass
      const requiredSlots = new Set<string>();
      if (this._guardsSchema !== undefined) {
        for (const name of Object.keys(this._guardsSchema.definitions)) {
          requiredSlots.add(name);
        }
      }
      if (this._effectsSchema !== undefined) {
        for (const name of Object.keys(this._effectsSchema.definitions)) {
          requiredSlots.add(name);
        }
      }

      // Single-pass validation: collect all missing and extra handlers
      const providedSlots = new Set(Object.keys(handlers));
      const missing: string[] = [];
      const extra: string[] = [];

      for (const name of requiredSlots) {
        if (!providedSlots.has(name)) {
          missing.push(name);
        }
      }
      for (const name of providedSlots) {
        if (!requiredSlots.has(name)) {
          extra.push(name);
        }
      }

      // Report all validation errors at once
      if (missing.length > 0 || extra.length > 0) {
        throw new ProvisionValidationError({ missing, extra });
      }

      // Create new machine to preserve original for reuse with different providers
      const result = new Machine<State, Event, R | R2, _SD, _ED, GD, EFD>(
        this.initial,
        this.stateSchema as S.Schema<State, unknown, never>,
        this.eventSchema as S.Schema<Event, unknown, never>,
        this._guardsSchema,
        this._effectsSchema
      );

      // Copy arrays/sets to avoid mutation bleed
      // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
      (result as any)._transitions = [...this._transitions];
      // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
      (result as any)._finalStates = new Set(this._finalStates);
      // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
      (result as any)._spawnEffects = [...this._spawnEffects];
      // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
      (result as any)._backgroundEffects = [...this._backgroundEffects];

      // Register handlers from provided object
      // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
      const anyHandlers = handlers as Record<string, any>;
      if (this._guardsSchema !== undefined) {
        for (const name of Object.keys(this._guardsSchema.definitions)) {
          result._guardHandlers.set(name, anyHandlers[name]);
        }
      }
      if (this._effectsSchema !== undefined) {
        for (const name of Object.keys(this._effectsSchema.definitions)) {
          result._effectHandlers.set(name, anyHandlers[name]);
        }
      }

      return new BuiltMachine(result as unknown as Machine<State, Event, R | NormalizeR<R2>>);
    }
    // biome-ignore lint/suspicious/noExplicitAny: need wide acceptance
    return new BuiltMachine(this as any);
  }

  // ---- persist (on Machine, for unbuilt usage in testing) ----

  /** @internal Persist from raw Machine — prefer BuiltMachine.persist() */
  persist(
    config: PersistOptions
  ): PersistentMachine<State & { readonly _tag: string }, Event & { readonly _tag: string }, R> {
    return persistImpl(config as WithPersistenceConfig)(
      this as unknown as Machine<BrandedState, BrandedEvent, R>
    ) as unknown as PersistentMachine<State & { readonly _tag: string }, Event & { readonly _tag: string }, R>;
  }

  // ---- Static factory ----

  static make<
    SD extends Record<string, S.Struct.Fields>,
    ED extends Record<string, S.Struct.Fields>,
    S extends BrandedState,
    E extends BrandedEvent,
    GD extends GuardsDef = Record<string, never>,
    EFD extends EffectsDef = Record<string, never>,
  >(config: MakeConfig<SD, ED, S, E, GD, EFD>): Machine<S, E, never, SD, ED, GD, EFD> {
    return new Machine<S, E, never, SD, ED, GD, EFD>(
      config.initial,
      config.state as unknown as S.Schema<S, unknown, never>,
      config.event as unknown as S.Schema<E, unknown, never>,
      config.guards as GuardsSchema<GD> | undefined,
      config.effects as EffectsSchema<EFD> | undefined
    );
  }
}

// ============================================================================
// make function (alias for Machine.make)
// ============================================================================

export const make = Machine.make;

// Transition lookup (introspection)
export { findTransitions } from "./internal/transition";
// Persistence types
export type { PersistenceConfig, PersistentMachine } from "./persistence/index";
// spawn function — re-exported from spawn.ts to avoid circular dependency
export { spawn } from "./spawn";
