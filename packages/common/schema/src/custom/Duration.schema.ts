import { Duration } from "effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const DurationValueMillis = S.TaggedStruct("Millis", { millis: S.NonNegativeInt });
const DurationValueNanos = S.TaggedStruct("Nanos", { nanos: S.String });
const DurationValueInfinity = S.TaggedStruct("Infinity", {});
const DurationValue = S.Union(DurationValueMillis, DurationValueNanos, DurationValueInfinity).annotations({
  identifier: "DurationValue",
  description: "an JSON-compatible tagged union to be decoded into a Duration",
});

const FiniteHRTime = S.Tuple(
  S.element(S.NonNegativeInt).annotations({ title: "seconds" }),
  S.element(S.NonNegativeInt).annotations({ title: "nanos" })
).annotations({ identifier: "FiniteHRTime" });

const InfiniteHRTime = S.Tuple(S.Literal(-1), S.Literal(0)).annotations({ identifier: "InfiniteHRTime" });

const HRTime: S.Schema<readonly [seconds: number, nanos: number]> = S.Union(FiniteHRTime, InfiniteHRTime).annotations({
  identifier: "HRTime",
  description: "a tuple of seconds and nanos to be decoded into a Duration",
});
export const DurationFromSelfInput = S.Union(DurationValue, HRTime);

export const TaggedDurationInputUnion = S.Union(
  S.transformOrFail(
    S.DurationFromSelf,
    S.TaggedStruct("DurationFromSelf", {
      value: S.Duration,
    }),
    {
      strict: true,
      decode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const decoded = S.decodeSync(DurationFromSelfInput)({
              _tag: "Millis",
              millis: Duration.toMillis(i),
            });
            return {
              _tag: "DurationFromSelf" as const,
              value: decoded,
            };
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration from self"),
        }),
      encode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const parts = Duration.parts(S.decodeSync(S.Duration)(i.value));
            return Duration.decode([parts.millis, parts.nanos]);
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration from self"),
        }),
    }
  ),
  S.transformOrFail(
    S.DurationFromMillis,
    S.TaggedStruct("DurationFromMillis", {
      value: S.Duration,
    }),
    {
      strict: true,
      decode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const decoded = S.decodeSync(DurationFromSelfInput)({
              _tag: "Millis",
              millis: Duration.toMillis(i),
            });
            return {
              _tag: "DurationFromMillis" as const,
              value: decoded,
            };
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration from millis"),
        }),
      encode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const parts = Duration.parts(S.decodeSync(S.Duration)(i.value));
            return Duration.decode([parts.millis, parts.nanos]);
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration from millis"),
        }),
    }
  ),
  S.transformOrFail(
    S.Duration,
    S.TaggedStruct("Duration", {
      value: S.Duration,
    }),
    {
      strict: true,
      decode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const decoded = S.decodeSync(DurationFromSelfInput)({
              _tag: "Millis",
              millis: Duration.toMillis(i),
            });
            return {
              _tag: "Duration" as const,
              value: decoded,
            };
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
      encode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const parts = Duration.parts(S.decodeSync(S.Duration)(i.value));
            return Duration.decode([parts.millis, parts.nanos]);
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
    }
  ),
  S.transformOrFail(
    S.compose(S.NumberFromString, S.DurationFromMillis),
    S.TaggedStruct("DurationFromStringNumberMillis", {
      value: S.Duration,
    }),
    {
      strict: true,
      decode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const decoded = S.decodeSync(DurationFromSelfInput)({
              _tag: "Millis",
              millis: Duration.toMillis(i),
            });
            return {
              _tag: "DurationFromStringNumberMillis" as const,
              value: decoded,
            };
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
      encode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const parts = Duration.parts(S.decodeSync(S.Duration)(i.value));
            return Duration.decode([parts.millis, parts.nanos]);
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
    }
  ),
  S.transformOrFail(
    S.compose(S.BigInt, S.DurationFromNanos),
    S.TaggedStruct("DurationFromBigIntNanos", {
      value: S.Duration,
    }),
    {
      strict: true,
      decode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const decoded = S.decodeSync(DurationFromSelfInput)({
              _tag: "Millis",
              millis: Duration.toMillis(i),
            });
            return {
              _tag: "DurationFromBigIntNanos" as const,
              value: decoded,
            };
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
      encode: (i, _, ast) =>
        ParseResult.try({
          try: () => {
            const parts = Duration.parts(S.decodeSync(S.Duration)(i.value));
            return Duration.decode([parts.millis, parts.nanos]);
          },
          catch: () => new ParseResult.Type(ast, i, "Invalid duration"),
        }),
    }
  )
);

export namespace TaggedDurationInputUnion {
  export type Type = typeof TaggedDurationInputUnion.Type;
  export type Encoded = typeof TaggedDurationInputUnion.Encoded;
}
