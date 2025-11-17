import { Duration } from "effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("duration");
const DurationValueMillis = S.TaggedStruct("Millis", { millis: S.NonNegativeInt }).annotations(
  Id.annotations("DurationValueMillis", {
    description: "an JSON-compatible tagged union to be decoded into a Duration",
  })
);
const DurationValueNanos = S.TaggedStruct("Nanos", { nanos: S.String }).annotations(
  Id.annotations("DurationValueNanos", {
    description: "an JSON-compatible tagged union to be decoded into a Duration",
  })
);
const DurationValueInfinity = S.TaggedStruct("Infinity", {}).annotations(
  Id.annotations("DurationValueInfinity", {
    description: "an JSON-compatible tagged union to be decoded into a Duration",
  })
);
const DurationValue = S.Union(DurationValueMillis, DurationValueNanos, DurationValueInfinity).annotations(
  Id.annotations("DurationValue", {
    description: "an JSON-compatible tagged union to be decoded into a Duration",
  })
);

const FiniteHRTime = S.Tuple(
  S.element(S.NonNegativeInt).annotations({ title: "seconds" }),
  S.element(S.NonNegativeInt).annotations({ title: "nanos" })
).annotations(
  Id.annotations("FiniteHRTime", {
    description: "a tuple of seconds and nanos to be decoded into a Duration",
  })
);

const InfiniteHRTime = S.Tuple(S.Literal(-1), S.Literal(0)).annotations(
  Id.annotations("InfiniteHRTime", {
    description: "a tuple of seconds and nanos to be decoded into a Duration",
  })
);

const HRTime: S.Schema<readonly [seconds: number, nanos: number]> = S.Union(FiniteHRTime, InfiniteHRTime).annotations(
  Id.annotations("HRTime", {
    description: "a tuple of seconds and nanos to be decoded into a Duration",
  })
);
export const DurationFromSelfInput = S.Union(DurationValue, HRTime).annotations(
  Id.annotations("DurationFromSelfInput", {
    description: "a union of DurationValue and HRTime to be decoded into a Duration",
  })
);

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
).annotations(
  Id.annotations("TaggedDurationInputUnion", {
    description: "a union of DurationValue and HRTime to be decoded into a Duration",
  })
);

export declare namespace TaggedDurationInputUnion {
  export type Type = typeof TaggedDurationInputUnion.Type;
  export type Encoded = typeof TaggedDurationInputUnion.Encoded;
}

export class DurationFromSeconds extends S.transform(
  S.NonNegative.annotations({
    description: "a non-negative number of seconds to be decoded into a Duration",
  }),
  S.DurationFromSelf,
  {
    decode: (i) => Duration.seconds(i),
    encode: (a) => Duration.toSeconds(a),
    strict: true,
  }
).annotations(
  Id.annotations("DurationFromSeconds", {
    description: "a non-negative number of seconds to be decoded into a Duration",
  })
) {}

export declare namespace DurationFromSeconds {
  export type Type = typeof DurationFromSeconds.Type;
  export type Encoded = typeof DurationFromSeconds.Encoded;
}
