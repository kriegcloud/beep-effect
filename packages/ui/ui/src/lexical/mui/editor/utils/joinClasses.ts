import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";

export const joinClasses = (...args: Array<string | boolean | null | undefined>) => {
  return F.pipe(args, A.filter(P.isString), A.join(" "));
};
