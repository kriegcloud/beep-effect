import { $ScratchId } from "@beep/identity";
import { DateTime, Effect, Option, SchemaGetter, SchemaIssue } from "effect";
import * as S from "effect/Schema";

const $I = $ScratchId.create("RocketPoolUtcTimestamp");

const rocketPoolUtcTimestampPattern = /^(\d{4})-(\d{2})-(\d{2}), (\d{2}):(\d{2}) \+0000 UTC$/;

const invalidRocketPoolUtcTimestamp = (input: string): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(Option.some(input), {
    message: "RocketPoolUtcTimestamp must match YYYY-MM-DD, HH:mm +0000 UTC",
  });

const formatPart = (value: number, width: number): string => String(value).padStart(width, "0");

/**
 * Scratchpad-local schema for Rocket Pool CLI UTC timestamp strings.
 */
export const RocketPoolUtcTimestamp = S.String.pipe(
  S.decodeTo(S.DateTimeUtcFromString, {
    decode: SchemaGetter.transformOrFail((input) => {
      const match = input.match(rocketPoolUtcTimestampPattern);

      if (match === null) {
        return Effect.fail(invalidRocketPoolUtcTimestamp(input));
      }

      const [, year, month, day, hour, minute] = match;
      const iso = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
      const dateTime = DateTime.make(iso);

      if (Option.isNone(dateTime)) {
        return Effect.fail(invalidRocketPoolUtcTimestamp(input));
      }

      return Effect.succeed(iso);
    }),
    encode: SchemaGetter.transformOrFail((iso) => {
      const dateTime = DateTime.make(iso);

      if (Option.isNone(dateTime)) {
        return Effect.fail(invalidRocketPoolUtcTimestamp(iso));
      }

      const parts = DateTime.toPartsUtc(DateTime.toUtc(dateTime.value));

      return Effect.succeed(
        `${formatPart(parts.year, 4)}-${formatPart(parts.month, 2)}-${formatPart(parts.day, 2)}, ${formatPart(parts.hour, 2)}:${formatPart(parts.minute, 2)} +0000 UTC`
      );
    }),
  }),
  S.annotate(
    $I.annote("RocketPoolUtcTimestamp", {
      description: "Rocket Pool CLI timestamp decoded into DateTime.Utc.",
    })
  )
);

export type RocketPoolUtcTimestamp = typeof RocketPoolUtcTimestamp.Type;
