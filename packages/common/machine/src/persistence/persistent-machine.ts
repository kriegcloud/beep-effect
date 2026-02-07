import type { Schedule } from "effect";
import type * as S from "effect/Schema";
import { MissingSchemaError } from "../errors";
import type { EventBrand, StateBrand } from "../internal/brands";
import type { Machine } from "../machine";

// Branded type constraints
type BrandedState = { readonly _tag: string } & StateBrand;
type BrandedEvent = { readonly _tag: string } & EventBrand;

/**
 * Configuration for persistence behavior (after resolution).
 * Schemas are required at runtime - the persist function ensures this.
 *
 * Note: Schema types S and E should match the structural shape of the machine's
 * state and event types (without brands). The schemas don't know about brands.
 */
export interface PersistenceConfig<S, E, SSI = unknown, ESI = unknown> {
  /**
   * Schedule controlling when snapshots are taken.
   * Input is the new state after each transition.
   *
   * Examples:
   * - Schedule.forever — snapshot every transition
   * - Schedule.spaced("5 seconds") — debounced snapshots
   * - Schedule.recurs(100) — every N transitions
   */
  readonly snapshotSchedule: Schedule.Schedule<unknown, S>;

  /**
   * Whether to journal events for replay capability.
   * When true, all events are appended to the event log.
   */
  readonly journalEvents: boolean;

  /**
   * Schema for serializing/deserializing state.
   * Always present at runtime (resolved from config or machine).
   */
  readonly stateSchema: S.Schema<S, SSI, never>;

  /**
   * Schema for serializing/deserializing events.
   * Always present at runtime (resolved from config or machine).
   */
  readonly eventSchema: S.Schema<E, ESI, never>;

  /**
   * User-provided identifier for the machine type.
   * Used for filtering actors in restoreAll.
   * Optional — defaults to "unknown" if not provided.
   */
  readonly machineType?: undefined | string;
}

/**
 * Machine with persistence configuration attached.
 * Spawn auto-detects this and returns PersistentActorRef.
 */
export interface PersistentMachine<
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R = never,
> {
  readonly _tag: "PersistentMachine";
  readonly machine: Machine<S, E, R>;
  readonly persistence: PersistenceConfig<S, E>;
}

/**
 * Type guard to check if a value is a PersistentMachine
 */
export const isPersistentMachine = (
  value: unknown
): value is PersistentMachine<{ readonly _tag: string }, { readonly _tag: string }, unknown> =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  (value as { _tag: unknown })._tag === "PersistentMachine";

/**
 * Attach persistence configuration to a machine.
 *
 * Schemas are read from the machine - must use `Machine.make({ state, event, initial })`.
 *
 * @example
 * ```ts
 * const orderMachine = Machine.make({
 *   state: OrderState,
 *   event: OrderEvent,
 *   initial: OrderState.Idle(),
 * }).pipe(
 *   Machine.on(OrderState.Idle, OrderEvent.Submit, ({ event }) =>
 *     OrderState.Pending({ orderId: event.orderId })
 *   ),
 *   Machine.final(OrderState.Paid),
 *   Machine.persist({
 *     snapshotSchedule: Schedule.forever,
 *     journalEvents: true,
 *   }),
 * );
 * ```
 */
export interface WithPersistenceConfig {
  readonly snapshotSchedule: Schedule.Schedule<unknown, { readonly _tag: string }>;
  readonly journalEvents: boolean;
  readonly machineType?: undefined | string;
}

export const persist =
  (config: WithPersistenceConfig) =>
  <S extends BrandedState, E extends BrandedEvent, R>(machine: Machine<S, E, R>): PersistentMachine<S, E, R> => {
    const stateSchema = machine.stateSchema;
    const eventSchema = machine.eventSchema;

    if (stateSchema === undefined || eventSchema === undefined) {
      throw new MissingSchemaError({ operation: "persist" });
    }

    return {
      _tag: "PersistentMachine",
      machine,
      persistence: {
        ...config,
        stateSchema,
        eventSchema,
      } as unknown as PersistenceConfig<S, E>,
    };
  };
