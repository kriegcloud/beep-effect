import type { UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";

export const entityKind = Symbol.for("@beep/rules/entityKind");
export const hasOwnEntityKind = Symbol.for("@beep/rules/hasOwnEntityKind");

export interface BeepRulesEntity {
  readonly [entityKind]: string;
}

export type BeepRulesEntityClass<T> = (
  | (abstract new (
      ...args: UnsafeTypes.UnsafeArray
    ) => T)
  | (new (
      ...args: Array<UnsafeTypes.UnsafeAny>
    ) => T)
) &
  BeepRulesEntity;
type NotPeepEntityErrorProps<T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>> = {
  readonly type: BeepRulesEntityClass<T>;
};

export class NotBeepEntityError<T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>> extends Data.TaggedError(
  "NotBeepEntityError"
)<NotPeepEntityErrorProps<T>> {
  constructor(type: NotPeepEntityErrorProps<T>["type"]) {
    super({ type });
  }

  get message() {
    return `Class '${this.type?.name ?? "<unknown>"}' doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`;
  }
}

export class UnknownException extends Data.TaggedError("UnknownException")<{
  readonly cause: unknown;
}> {}

export const isBeepPredicate = <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(
  value: UnsafeTypes.UnsafeAny,
  type: T
): value is InstanceType<T> => {
  if ((P.or(P.isNullable), P.not(P.isObject)(value))) {
    return false;
  }

  if (value instanceof type) {
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new NotBeepEntityError(type);
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    // Traverse the prototype chain to find the entityKind
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }

      cls = Object.getPrototypeOf(cls);
    }
  }

  return false;
};

export const isBeep = Effect.fn("isBeep")(function* <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(
  value: UnsafeTypes.UnsafeAny,
  type: T
) {
  return yield* Effect.try({
    try: () => isBeepPredicate(value, type),
    catch: (e) => {
      if (e instanceof NotBeepEntityError) {
        return e;
      }
      return new UnknownException({ cause: e });
    },
  });
});
