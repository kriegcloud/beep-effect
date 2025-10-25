import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export const DateTimeUtcByInstantSchemaId = Symbol.for("@beep/schema/custom/DateTimeUtcByInstant");

const DateTimeUtcByInstant = S.DateTimeUtcFromSelf.annotations({
  equivalence: () => (a: DateTime.Utc, b: DateTime.Utc) =>
    DateTime.toDate(a).getTime() === DateTime.toDate(b).getTime(),
  jsonSchema: {
    type: "string",
    format: "date-time",
  },
  schemaId: DateTimeUtcByInstantSchemaId,
});

export const AllAcceptableDateInputsSchemaId = Symbol.for("@beep/schema/custom/AllAcceptableDateInputs");

export const AllAcceptableDateInputs = S.Union(
  S.DateFromSelf.annotations({
    jsonSchema: {
      type: "string",
      format: "date-time",
    },
  }),
  S.DateFromString.annotations({
    jsonSchema: {
      type: "string",
      format: "date-time",
    },
  }),
  S.DateFromNumber.annotations({
    jsonSchema: {
      type: "number",
      format: "timestamp",
    },
  }),
  DateTimeUtcByInstant
).annotations({
  schemaId: AllAcceptableDateInputsSchemaId,
});
export declare namespace AllAcceptableDateInputs {
  export type Type = typeof AllAcceptableDateInputs.Type;
  export type Encoded = typeof AllAcceptableDateInputs.Encoded;
}

export const DateFromAllAcceptable = S.transformOrFail(AllAcceptableDateInputs, S.ValidDateFromSelf, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => (DateTime.isDateTime(i) ? DateTime.toDate(i) : S.decodeSync(S.ValidDateFromSelf)(i)),
      catch: () => new ParseResult.Type(ast, i, "Invalid date"),
    }),
  encode: (i, _, ast) => ParseResult.succeed(i),
}).annotations({
  jsonSchema: {
    type: "string",
    format: "date-time",
  },
});

export declare namespace DateFromAllAcceptable {
  export type Type = typeof DateFromAllAcceptable.Type;
  export type Encoded = typeof DateFromAllAcceptable.Encoded;
}

export const DateTimeUtcFromAllAcceptable = S.transformOrFail(
  S.Union(DateFromAllAcceptable, DateTimeUtcByInstant),
  DateTimeUtcByInstant,
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
      ParseResult.fail(new ParseResult.Forbidden(ast, i, "Encoding dates back to plain text is forbidden.")),
  }
).annotations({
  jsonSchema: {
    type: "string",
    format: "date-time",
  },
});

export declare namespace DateTimeUtcFromAllAcceptable {
  export type Type = typeof DateTimeUtcFromAllAcceptable.Type;
  export type Encoded = typeof DateTimeUtcFromAllAcceptable.Encoded;
}

export const normalizeIsoString = (dateValue: number | string | Date): string =>
  F.pipe(new Date(dateValue).toISOString(), Str.replace(/\.\d{3}Z$/, "Z"));

export const IsoStringToTimestamp = S.transform(S.Union(S.String, S.Number), S.Number, {
  decode: (input: string | number) => new Date(input).getTime(),
  encode: normalizeIsoString,
  strict: true,
});
