/**
 * Product-neutral Drizzle execution service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DrizzleId } from "@beep/identity";
import { Context, type Effect, Layer } from "effect";
import type { DrizzleError } from "./Drizzle.errors.ts";

const $I = $DrizzleId.create("Drizzle.service");

/**
 * Result rows returned by a product-neutral Drizzle adapter.
 *
 * @example
 * ```ts
 * import type { DrizzleRows } from "@beep/drizzle"
 *
 * const rows: DrizzleRows = []
 * void rows
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DrizzleRows = ReadonlyArray<unknown>;

/**
 * Narrow adapter accepted by {@link Drizzle.makeLayer}.
 *
 * The adapter is intentionally product-neutral: composition decides whether it
 * is backed by Postgres or another database runtime.
 *
 * @example
 * ```ts
 * import type { DrizzleClient } from "@beep/drizzle"
 * import { Effect } from "effect"
 *
 * const client: DrizzleClient = {
 *   execute: () => Effect.succeed([]),
 *   withTransaction: (use) => use(client)
 * }
 *
 * void client
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface DrizzleClient {
  readonly execute: (statement: string, parameters: ReadonlyArray<unknown>) => Effect.Effect<DrizzleRows, DrizzleError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DrizzleClient) => Effect.Effect<A, DrizzleError, R>
  ) => Effect.Effect<A, DrizzleError, R>;
}

/**
 * Runtime shape exposed by the {@link Drizzle} service.
 *
 * @example
 * ```ts
 * import type { DrizzleShape } from "@beep/drizzle"
 * import { Effect } from "effect"
 *
 * const service: DrizzleShape = {
 *   execute: () => Effect.succeed([]),
 *   withTransaction: (use) => use(service)
 * }
 *
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface DrizzleShape {
  readonly execute: (statement: string, parameters: ReadonlyArray<unknown>) => Effect.Effect<DrizzleRows, DrizzleError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DrizzleShape) => Effect.Effect<A, DrizzleError, R>
  ) => Effect.Effect<A, DrizzleError, R>;
}

const makeService = (client: DrizzleClient): DrizzleShape => {
  return {
    execute: client.execute,
    withTransaction: (use) => client.withTransaction((transaction) => use(makeService(transaction))),
  };
};

/**
 * Effect service for product-neutral Drizzle execution.
 *
 * @example
 * ```ts
 * import { Drizzle } from "@beep/drizzle"
 *
 * const tag = Drizzle
 * void tag
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class Drizzle extends Context.Service<Drizzle, DrizzleShape>()($I`Drizzle`) {
  /**
   * Build a Layer from a narrow product-neutral Drizzle adapter.
   *
   * @example
   * ```ts
   * import { Drizzle, type DrizzleClient } from "@beep/drizzle"
   * import { Effect } from "effect"
   *
   * const client: DrizzleClient = {
   *   execute: () => Effect.succeed([]),
   *   withTransaction: (use) => use(client)
   * }
   *
   * const layer = Drizzle.makeLayer(client)
   *
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (client: DrizzleClient): Layer.Layer<Drizzle> =>
    Layer.succeed(Drizzle, Drizzle.of(makeService(client)));
}
