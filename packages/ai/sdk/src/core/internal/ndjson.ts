import { Effect, String as Str, Stream } from "effect";
import * as S from "effect/Schema";

/**
 * @since 0.0.0
 */
export type NdjsonDecodeStage = "parse" | "decode";

/**
 * @since 0.0.0
 */
export type NdjsonDecodeErrorDetails = Readonly<{
  readonly stage: NdjsonDecodeStage;
  readonly line: string;
  readonly cause: unknown;
}>;

/**
 * @since 0.0.0
 */
export const decodeNdjson = <S extends S.Top, E>(schema: S, onError: (details: NdjsonDecodeErrorDetails) => E) => {
  const parse = S.decodeUnknownEffect(S.UnknownFromJsonString);
  const decode = S.decodeUnknownEffect(schema);

  return <E0, R>(stream: Stream.Stream<string, E0, R>) =>
    stream.pipe(
      Stream.splitLines,
      Stream.map(Str.trim),
      Stream.filter((line) => line.length > 0),
      Stream.mapEffect(
        Effect.fn(
          function* (line) {
            const value = yield* parse(line).pipe(
              Effect.mapError((cause) =>
                onError({
                  stage: "parse",
                  line,
                  cause,
                })
              )
            );
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
