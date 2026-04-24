/**
 * DateTime helpers and Effect DateTime re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DateTime } from "effect";

/**
 * Constructs a `DateTime.Utc` from any supported `DateTime` input.
 *
 * This helper normalizes zoned inputs to UTC while preserving the instant.
 *
 * @example
 * ```typescript
 * import { makeUnsafeUtc } from "@beep/utils/DateTime"
 *
 * const value = makeUnsafeUtc("2026-01-01T00:00:00.000Z")
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeUnsafeUtc = <A extends Parameters<typeof DateTime.make>[0]>(input: A): DateTime.Utc =>
  DateTime.makeUnsafe(input).pipe(DateTime.toUtc);

/**
 * Re-export of all helpers from `effect/DateTime`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/DateTime";

import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

export class DateTimes extends Context.Service<DateTimes>()("@typed/id/DateTimes", {
  make: Effect.succeed({
    now: Effect.sync(() => Date.now()),
    date: Effect.sync(() => new Date()),
  }),
}) {
  static readonly now = Effect.flatMap(DateTimes.asEffect(), ({ now }) => now);
  static readonly date = Effect.flatMap(DateTimes.asEffect(), ({ date }) => date);

  static readonly Default = Layer.effect(DateTimes, DateTimes.make);

  static readonly Fixed = (baseDate: number | string | Date) =>
    Layer.effect(
      DateTimes,
      Effect.gen(function* () {
        const clock = yield* Clock.Clock;
        const base = new Date(baseDate);
        const baseN = BigInt(base.getTime());
        const startMillis = yield* clock.currentTimeMillis;
        const now = clock.currentTimeMillis.pipe(
          Effect.map((millis) =>
            // Use BigInt to avoid floating point precision issues which can break deterministic testing
            Number(baseN + BigInt(millis) - BigInt(startMillis)),
          ),
        );
        const date = now.pipe(Effect.map((millis) => new Date(millis)));

        return DateTimes.of({ now, date });
      }),
    );
}
