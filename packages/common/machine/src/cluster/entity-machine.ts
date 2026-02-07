/**
 * EntityMachine adapter - wires a machine to a cluster Entity layer.
 *
 * @module
 */
import { Entity } from "@effect/cluster";
import type { Rpc } from "@effect/rpc";
import { Effect, type Layer, Queue, Ref, Scope } from "effect";
import type { ProcessEventHooks } from "../actor";
import { processEventCore, runSpawnEffects } from "../actor";
import type { Machine, MachineRef } from "../machine";
import type { EffectsDef, GuardsDef } from "../slot";

/**
 * Options for EntityMachine.layer
 */
export interface EntityMachineOptions<S, E> {
  /**
   * Initialize state from entity ID.
   * Called once when entity is first activated.
   *
   * @example
   * ```ts
   * EntityMachine.layer(OrderEntity, orderMachine, {
   *   initializeState: (entityId) => OrderState.Pending({ orderId: entityId }),
   * })
   * ```
   */
  readonly initializeState?: undefined | ((entityId: string) => S);

  /**
   * Optional hooks for inspection/tracing.
   * Called at specific points during event processing.
   *
   * @example
   * ```ts
   * EntityMachine.layer(OrderEntity, orderMachine, {
   *   hooks: {
   *     onTransition: (from, to, event) =>
   *       Effect.log(`Transition: ${from._tag} -> ${to._tag}`),
   *     onSpawnEffect: (state) =>
   *       Effect.log(`Running spawn effects for ${state._tag}`),
   *     onError: ({ phase, state }) =>
   *       Effect.log(`Defect in ${phase} at ${state._tag}`),
   *   },
   * })
   * ```
   */
  readonly hooks?: undefined | ProcessEventHooks<S, E>;
}

/**
 * Process a single event through the machine using shared core.
 * Returns the new state after processing.
 */
const processEvent = Effect.fn("effect-machine.cluster.processEvent")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
  GD extends GuardsDef = Record<string, never>,
  EFD extends EffectsDef = Record<string, never>,
>(
  machine: Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>,
  stateRef: Ref.Ref<S>,
  event: E,
  self: MachineRef<E>,
  stateScopeRef: { current: Scope.CloseableScope },
  hooks?: undefined | ProcessEventHooks<S, E>
) {
  const currentState = yield* Ref.get(stateRef);

  // Process event using shared core
  const result = yield* processEventCore(machine, currentState, event, self, stateScopeRef, hooks);

  // Update state ref if transition occurred
  if (result.transitioned) {
    yield* Ref.set(stateRef, result.newState);
  }

  return result.newState;
});

/**
 * Create an Entity layer that wires a machine to handle RPC calls.
 *
 * The layer:
 * - Maintains state via Ref per entity instance
 * - Resolves transitions using the indexed lookup
 * - Evaluates guards in registration order
 * - Runs lifecycle effects (onEnter/spawn)
 * - Processes internal events from spawn effects
 *
 * @example
 * ```ts
 * const OrderEntity = toEntity(orderMachine, {
 *   type: "Order",
 *   stateSchema: OrderState,
 *   eventSchema: OrderEvent,
 * })
 *
 * const OrderEntityLayer = EntityMachine.layer(OrderEntity, orderMachine, {
 *   initializeState: (entityId) => OrderState.Pending({ orderId: entityId }),
 * })
 *
 * // Use in cluster
 * const program = Effect.gen(function* () {
 *   const client = yield* ShardingClient.client(OrderEntity)
 *   yield* client.Send("order-123", { event: OrderEvent.Ship({ trackingId: "abc" }) })
 * })
 * ```
 */
export const EntityMachine = {
  /**
   * Create a layer that wires a machine to an Entity.
   *
   * @param entity - Entity created via toEntity()
   * @param machine - Machine with all effects provided
   * @param options - Optional configuration (state initializer, inspection hooks)
   */
  layer: <
    S extends { readonly _tag: string },
    E extends { readonly _tag: string },
    R,
    GD extends GuardsDef,
    EFD extends EffectsDef,
    EntityType extends string,
    Rpcs extends Rpc.Any,
  >(
    entity: Entity.Entity<EntityType, Rpcs>,
    machine: Machine<S, E, R, Record<string, never>, Record<string, never>, GD, EFD>,
    options?: undefined | EntityMachineOptions<S, E>
  ): Layer.Layer<never, never, R> => {
    const layer = Effect.fn("effect-machine.cluster.layer")(function* () {
      // Get entity ID from context if available
      const entityId = yield* Effect.serviceOption(Entity.CurrentAddress).pipe(
        Effect.map((opt) => (opt._tag === "Some" ? opt.value.entityId : ""))
      );

      // Initialize state - use provided initializer or machine's initial state
      const initialState = options?.initializeState !== undefined ? options.initializeState(entityId) : machine.initial;

      // Create self reference for sending events back to machine
      const internalQueue = yield* Queue.unbounded<E>();
      const self: MachineRef<E> = {
        send: Effect.fn("effect-machine.cluster.self.send")(function* (event: E) {
          yield* Queue.offer(internalQueue, event);
        }),
      };

      // Create state ref
      const stateRef = yield* Ref.make<S>(initialState);

      // Create state scope for spawn effects
      const stateScopeRef: { current: Scope.CloseableScope } = {
        current: yield* Scope.make(),
      };

      // Use $init event for initial lifecycle
      const initEvent = { _tag: "$init" } as E;

      // Run initial spawn effects
      yield* runSpawnEffects(machine, initialState, initEvent, self, stateScopeRef.current, options?.hooks?.onError);

      // Process internal events in background
      const runInternalEvent = Effect.fn("effect-machine.cluster.internalEvent")(function* () {
        const event = yield* Queue.take(internalQueue);
        yield* processEvent(machine, stateRef, event, self, stateScopeRef, options?.hooks);
      });
      yield* Effect.forkScoped(Effect.forever(runInternalEvent()));

      // Return handlers matching the Entity's RPC protocol
      // The actual types are inferred from the entity definition
      return entity.of({
        Send: (envelope: { payload: { event: E } }) =>
          processEvent(machine, stateRef, envelope.payload.event, self, stateScopeRef, options?.hooks),

        GetState: () => Ref.get(stateRef),
        // Entity.of expects handlers matching Rpcs type param - dynamic construction requires cast
      } as unknown as Parameters<typeof entity.of>[0]);
    });
    return entity.toLayer(layer()) as unknown as Layer.Layer<never, never, R>;
  },
};
