import type { UnsafeTypes } from "@beep/types";
import { formatCauseHeading, formatCausePretty, readEnvLoggerConfig, withLogContext, withRootSpan } from "@beep/utils";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

export const entityKind = Symbol.for("@beep/rules/entityKind");

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
  value: unknown,
  type: T
): value is InstanceType<T> => {
  if (P.or(P.isNullable, P.not(P.isObject))(value)) {
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

/**
 * Build a Schema that recognizes values matching the provided Beep entity class or sharing its entityKind.
 * Useful to obtain a synchronous type guard via Schema.is and to integrate with Schema-based decoding.
 */
export const makeBeepEntitySchema = <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(type: T) =>
  S.declare((input: unknown): input is InstanceType<T> => isBeepPredicate(input as UnsafeTypes.UnsafeAny, type), {
    identifier: `BeepEntity<${type?.name ?? "Anonymous"}>`,
    description: "Checks value is a BeepRulesEntity matching the given class or entityKind",
  });

/**
 * Synchronous TypeScript type guard derived from Schema.
 * Example: const isFoo = isBeepBySchema(Foo); if (isFoo(x)) { // x is InstanceType<typeof Foo> }
 */
export const isBeepBySchema = <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(type: T) =>
  S.is(makeBeepEntitySchema(type));

/**
 * Assertion function variant for imperative refinement.
 */
export function assertIsBeep<const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(
  value: unknown,
  type: T
): asserts value is InstanceType<T> {
  if (!isBeepPredicate(value, type)) {
    throw new NotBeepEntityError(type);
  }
}

/**
 * Effectful helper that refines the value to InstanceType<T> on success, or fails with NotBeepEntityError.
 * This preserves narrowing in Effect pipelines: const v = yield* ensureBeepEffect(Foo)(u);
 */
export const ensureBeepEffect =
  <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(type: T) =>
  (value: unknown): Effect.Effect<InstanceType<T>, NotBeepEntityError<T> | UnknownException> =>
    isBeepPredicate(value as UnsafeTypes.UnsafeAny, type)
      ? Effect.succeed(value as InstanceType<T>)
      : Effect.fail(new NotBeepEntityError(type));

export const isBeep = Effect.fn("isBeep")(function* <const T extends BeepRulesEntityClass<UnsafeTypes.UnsafeAny>>(
  value: UnsafeTypes.UnsafeAny,
  type: T
) {
  const { format } = yield* readEnvLoggerConfig;
  const isPretty = format === "pretty";
  const environment = process.env.NODE_ENV;

  return yield* Effect.try({
    try: () => isBeepPredicate(value, type),
    catch: (e) => e,
  }).pipe(
    Effect.catchAll((e) =>
      Effect.gen(function* () {
        const err = e instanceof NotBeepEntityError ? e : new UnknownException({ cause: e });
        const cause = Cause.fail(err);

        if (isPretty) {
          const heading = formatCauseHeading(cause, {
            colors: true,
            includeCodeFrame: true,
            service: "rules",
            environment,
          });
          if (heading) yield* Effect.sync(() => console.error(heading));

          const pretty = formatCausePretty(cause, true);
          if (pretty) yield* Effect.sync(() => console.error(pretty));
        }

        yield* Effect.logError("isBeep failed", { className: type?.name });
        return yield* Effect.fail(err);
      })
    ),
    withRootSpan("rules.isBeep"),
    withLogContext({ service: "rules", component: "entity", func: "isBeep" })
  );
});
