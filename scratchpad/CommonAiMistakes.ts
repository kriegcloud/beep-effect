import { $ScratchId } from "@beep/identity";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
const $I = $ScratchId.create("CommonAiMistakes");

const mistakePatterns = A.make(
  "Either",
  "fromNullable",
  "Context.Tag",
  "S.pattern",
  "Schema.pattern",
"ParseResult",
  ".annotations",
  "S.Record({",
  "Schema.Record({",
  "S.Union(S.",
  "Schema.Union(Schema.",
  "S.Literal(\"",
  "Schema.Literal(\"",
  "S.NonEmptyTrimmedString",
  "Schema.NonEmptyTrimmedString",
  "S.decodeUnknown(",
  "Schema.decodeUnknown(",
  "S.decode(",
  "Schema.decode(",
  "S.encode(",
  "Schema.encode(",
  "S.encodeUnknown(",
  "Schema.encodeUnknown(",
  "S.TaggedError<",
  "Schema.TaggedError<"
)

const goodAiOutputFilter = S.makeFilter(
  (u: unknown): u is string => P.isString(u) && A.every(mistakePatterns, P.not(Str.includes(u)))
);

export const GoodAiOutput = S.String.check(
  goodAiOutputFilter
)
