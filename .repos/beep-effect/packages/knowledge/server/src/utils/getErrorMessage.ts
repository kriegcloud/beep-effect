import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

export const getErrorMessage = (error: unknown): string => {
  const raw =
    P.isObject(error) &&
    P.isNotNullable(error) &&
    P.hasProperty("message")(error) &&
    P.struct({
      message: P.isString,
    })(error)
      ? error.message
      : String(error);
  const collapsed = F.pipe(raw, Str.replace(/\s+/g, " "), Str.trim);
  const collapsedLength = Str.length(collapsed);
  return Str.match(/\b([45]\d{2})\b/)(collapsed).pipe(
    O.match({
      onNone: () => `len=${collapsedLength}`,
      onSome: ([_, match]) => `http_status=${match} len=${collapsedLength}`,
    })
  );
};
