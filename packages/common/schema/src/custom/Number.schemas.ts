import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("number");
/**
 * Schema transformer that converts string or number input to number output.
 * Useful for APIs that may return numeric values as either strings or numbers.
 *
 * Examples:
 * - "42.5" -> 42.5
 * - 42.5 -> 42.5
 * - "0" -> 0
 * - 0 -> 0
 */
export const StringOrNumberToNumber = S.transformOrFail(S.Union(S.String, S.Number), S.Number, {
  decode: (value) => {
    if (typeof value === "number") {
      return ParseResult.succeed(value);
    }
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      return ParseResult.fail(new ParseResult.Type(S.Number.ast, value));
    }
    return ParseResult.succeed(parsed);
  },
  encode: (value) => ParseResult.succeed(String(value)),
  strict: true,
}).annotations(
  Id.annotations("StringOrNumberToNumber", {
    description: "Schema transformer that converts string or number input to number output.",
  })
);
