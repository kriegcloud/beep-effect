import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

/**
 * @since 0.0.0
 */
export type NdjsonDecodeStage = "parse" | "decode";

/**
 * @since 0.0.0
 */
export type NdjsonDecodeErrorDetails = {
  readonly stage: NdjsonDecodeStage;
  readonly line: string;
  readonly cause: unknown;
};

/**
 * @since 0.0.0
 */
export const decodeNdjson = <S extends S.Top, E>(schema: S, onError: (details: NdjsonDecodeErrorDetails) => E) => {
  const decode = S.decodeUnknownEffect(S.fromJsonString(schema));

  return <E0, R>(stream: Stream.Stream<string, E0, R>) =>
    stream.pipe(
      Stream.splitLines,
      Stream.map(Str.trim),
      Stream.filter((line) => line.length > 0),
      Stream.mapEffect(
        Effect.fn(
          function* (line) {
            const value = yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(line);
            return yield* decode(value);
          },
          (effect, line) =>
            Effect.mapError(effect, (cause) =>
              onError({
                stage: "decode",
                line,
                cause,
              })
            )
        )
      )
    );
};
