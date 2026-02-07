/**
 * Generate Entity definition from a machine.
 *
 * @module
 */
import { Entity } from "@effect/cluster";
import { Rpc } from "@effect/rpc";
import type * as S from "effect/Schema";
import { MissingSchemaError } from "../errors";
import type { Machine } from "../machine";
/**
 * Options for toEntity.
 */
export interface ToEntityOptions {
  /**
   * Entity type name (e.g., "Order", "User")
   */
  readonly type: string;
}

/**
 * Default RPC protocol for entity machines.
 *
 * - `Send` - Send event to machine, returns new state
 * - `GetState` - Get current state
 */
export type EntityRpcs<StateSchema extends S.Schema.Any, EventSchema extends S.Schema.Any> = readonly [
  Rpc.Rpc<"Send", S.Struct<{ readonly event: EventSchema }>, StateSchema, typeof S.Never, never>,
  Rpc.Rpc<"GetState", typeof S.Void, StateSchema, typeof S.Never, never>,
];

/**
 * Generate an Entity definition from a machine.
 *
 * Creates an Entity with a standard RPC protocol:
 * - `Send(event)` - Process event through machine, returns new state
 * - `GetState()` - Returns current state
 *
 * Schemas are read from the machine - must use `Machine.make({ state, event, initial })`.
 *
 * @example
 * ```ts
 * const OrderState = State({
 *   Pending: { orderId: S.String },
 *   Shipped: { trackingId: S.String },
 * })
 *
 * const OrderEvent = Event({
 *   Ship: { trackingId: S.String },
 * })
 *
 * const orderMachine = Machine.make({
 *   state: OrderState,
 *   event: OrderEvent,
 *   initial: OrderState.Pending({ orderId: "" }),
 * }).pipe(
 *   Machine.on(OrderState.Pending, OrderEvent.Ship, ...),
 * )
 *
 * const OrderEntity = toEntity(orderMachine, { type: "Order" })
 * ```
 */
export const toEntity = <S extends { readonly _tag: string }, E extends { readonly _tag: string }, R>(
  // biome-ignore lint/suspicious/noExplicitAny: Schema fields need wide acceptance
  machine: Machine<S, E, R, any, any, any, any>,
  options: ToEntityOptions
) => {
  const stateSchema = machine.stateSchema;
  const eventSchema = machine.eventSchema;

  if (stateSchema === undefined || eventSchema === undefined) {
    throw new MissingSchemaError({ operation: "toEntity" });
  }

  return Entity.make(options.type, [
    Rpc.make("Send", {
      payload: { event: eventSchema },
      success: stateSchema,
    }),
    Rpc.make("GetState", {
      success: stateSchema,
    }),
  ]);
};
