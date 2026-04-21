/**
 * Effect service for Drizzle SQL logging.
 *
 * @since 0.0.0
 * @module
 */

import { $SharedServerId } from "@beep/identity";
import type { Logger } from "drizzle-orm";
import { Context, Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SharedServerId.create("factories/effect-drizzle/Logger");

const encodeJson = S.encodeUnknownOption(S.UnknownFromJsonString);

const stringifyParam = (param: unknown): string =>
  pipe(
    encodeJson(param),
    O.getOrElse(() => "[[non-json-param]]")
  );

/**
 * Effect logger contract for Drizzle queries.
 *
 * @since 0.0.0
 * @category Services
 */
export interface DrizzleEffectLoggerShape {
  readonly logQuery: (query: string, params: ReadonlyArray<unknown>) => Effect.Effect<void>;
}

/**
 * Effect service used by the shared Drizzle adapter to log SQL queries.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { DrizzleEffectLogger } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const program = Effect.gen(function* () {
 * 
 * 
 * })
 * ```
 *
 * @since 0.0.0
 * @category Services
 */
export class DrizzleEffectLogger extends Context.Service<DrizzleEffectLogger, DrizzleEffectLoggerShape>()(
  $I`DrizzleEffectLogger`
) {
  /**
   * Default no-op logger layer.
   *
   * @since 0.0.0
   * @category Layers
   */
  static readonly Default = Layer.succeed(
    DrizzleEffectLogger,
    DrizzleEffectLogger.of({
      logQuery: Effect.fn("DrizzleEffectLogger.logQuery.noop")(() => Effect.void),
    })
  );

  /**
   * Effect-native logging layer that forwards query annotations into Effect logs.
   *
   * @since 0.0.0
   * @category Layers
   */
  static readonly layer = Layer.succeed(
    DrizzleEffectLogger,
    DrizzleEffectLogger.of({
      logQuery: Effect.fn("DrizzleEffectLogger.logQuery")(function* (query: string, params: ReadonlyArray<unknown>) {
        yield* Effect.log("drizzle query").pipe(
          Effect.annotateLogs({
            query,
            params: A.map(params, stringifyParam),
          })
        );
      }),
    })
  );

  /**
   * Adapt a standard Drizzle logger into the Effect logger service.
   *
   * @since 0.0.0
   * @category Constructors
   */
  static fromDrizzle = (logger: Logger): DrizzleEffectLoggerShape => ({
    logQuery: Effect.fn("DrizzleEffectLogger.logQuery.fromDrizzle")((query: string, params: ReadonlyArray<unknown>) =>
      Effect.sync(() => logger.logQuery(query, A.fromIterable(params)))
    ),
  });

  /**
   * Layer adapter for a standard Drizzle logger.
   *
   * @since 0.0.0
   * @category Layers
   */
  static readonly layerFromDrizzle = (logger: Logger) =>
    Layer.succeed(DrizzleEffectLogger, DrizzleEffectLogger.of(DrizzleEffectLogger.fromDrizzle(logger)));
}
