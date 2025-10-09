import * as P from "effect/Predicate";
import type { Var } from "../../network/types";

/*
 * something as simple as `isVar` to perform algebra on the essentially every beepin thang.
 * **/
const isVar = (obj: unknown): obj is Var.Type => {
  if (!P.isObject(obj)) {
    return false;
  }

  if (!P.and(P.hasProperty("name"), P.hasProperty("field"))(obj)) {
    return false;
  }

  return P.isNotUndefined(obj.field) && P.isNotUndefined(obj.name);
};

export default isVar;
