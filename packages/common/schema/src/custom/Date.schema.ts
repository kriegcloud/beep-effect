import * as DateTime from "effect/DateTime";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

export const AllAcceptableDateInputs = S.Union(
  S.DateFromSelf,
  S.DateFromString,
  S.DateFromNumber,
  S.DateTimeUtcFromSelf,
);
export namespace AllAcceptableDateInputs {
  export type Type = typeof AllAcceptableDateInputs.Type;
  export type Encoded = typeof AllAcceptableDateInputs.Encoded;
}

export const DateFromAllAcceptable = S.transformOrFail(
  AllAcceptableDateInputs,
  S.ValidDateFromSelf,
  {
    strict: true,
    decode: (i, _, ast) =>
      ParseResult.try({
        try: () =>
          DateTime.isDateTime(i)
            ? DateTime.toDate(i)
            : S.decodeSync(S.ValidDateFromSelf)(i),
        catch: () => new ParseResult.Type(ast, i, "Invalid date"),
      }),
    encode: (i, _, ast) => ParseResult.succeed(i),
  },
);

export namespace DateFromAllAcceptable {
  export type Type = typeof DateFromAllAcceptable.Type;
  export type Encoded = typeof DateFromAllAcceptable.Encoded;
}

export const DateTimeUtcFromAllAcceptable = S.transformOrFail(
  AllAcceptableDateInputs,
  S.DateTimeUtc,
  {
    strict: false,
    decode: (i, _, ast) =>
      ParseResult.try({
        try: () => {
          if (DateTime.isDateTime(i)) {
            return DateTime.toUtc(i);
          }
          const date = S.decodeSync(S.ValidDateFromSelf)(i);
          return DateTime.unsafeFromDate(date);
        },
        catch: () => new ParseResult.Type(S.DateTimeUtc.ast, i, "Invalid date"),
      }),
    encode: (i, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(
          ast,
          i,
          "Encoding dates back to plain text is forbidden.",
        ),
      ),
  },
);

export namespace DateTimeUtcFromAllAcceptable {
  export type Type = typeof DateTimeUtcFromAllAcceptable.Type;
  export type Encoded = typeof DateTimeUtcFromAllAcceptable.Encoded;
}
