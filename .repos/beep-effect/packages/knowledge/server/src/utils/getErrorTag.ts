import * as P from "effect/Predicate";

export const getErrorTag = (error: unknown): string =>
  P.isObject(error) &&
  P.isNotNullable(error) &&
  P.hasProperty("_tag")(error) &&
  P.struct({
    _tag: P.isString,
  })(error)
    ? error._tag
    : "UnknownError";
