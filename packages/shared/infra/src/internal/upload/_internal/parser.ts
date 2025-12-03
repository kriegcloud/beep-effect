import type { BS } from "@beep/schema";
import type * as Standard from "@standard-schema/spec";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Runtime from "effect/Runtime";
import * as S from "effect/Schema";

export type ParseFn<TType> = (input: unknown) => Promise<TType>;

export type ParserZodEsque<TInput extends BS.Json.Type, TParsedInput> = {
  _input: TInput;
  _output: TParsedInput; // if using .transform etc
  parseAsync: ParseFn<TParsedInput>;
};

// In case we add support for more parsers later
export type JsonParser<In extends BS.Json.Type, Out = In> =
  | ParserZodEsque<In, Out>
  | Standard.StandardSchemaV1<In, Out>
  | S.Schema<Out, In>;

export class ParserError extends Data.TaggedError("ParserError")<{
  cause: unknown;
}> {
  override message = "Input validation failed. The original error with it's validation issues is in the error cause.";
}

export function getParseFn<TOut extends BS.Json.Type, TParser extends JsonParser<any, TOut>>(
  parser: TParser
): ParseFn<TOut> {
  if ("parseAsync" in parser && typeof parser.parseAsync === "function") {
    /**
     * Zod
     * TODO (next major): Consider wrapping ZodError in ParserError
     */
    return parser.parseAsync;
  }

  if (S.isSchema(parser)) {
    /**
     * Effect Schema
     */
    return (value) =>
      S.decodeUnknownPromise(parser as S.Schema<any, TOut>)(value).catch((error) => {
        throw new ParserError({
          cause: Cause.squash((error as Runtime.FiberFailure)[Runtime.FiberFailureCauseId]),
        });
      });
  }

  if ("~standard" in parser) {
    /**
     * Standard Schema
     * TODO (next major): Consider moving this to the top of the function
     */
    return async (value) => {
      const result = await parser["~standard"].validate(value);
      if (result.issues) {
        throw new ParserError({ cause: result.issues });
      }
      return result.value;
    };
  }

  throw new Error("Invalid parser");
}
