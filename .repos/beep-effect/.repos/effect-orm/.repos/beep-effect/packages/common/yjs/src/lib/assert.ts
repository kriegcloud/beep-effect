import { invariant } from "@beep/invariant";
import * as Data from "effect/Data";
import * as P from "effect/Predicate";
export class AssertError extends Data.TaggedError("AssertError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Helper function that can be used to implement exhaustive switch statements
 * with TypeScript. Example usage:
 *
 *    type Fruit = "🍎" | "🍌";
 *
 *    switch (fruit) {
 *      case "🍎":
 *      case "🍌":
 *        return doSomething();
 *
 *      default:
 *        return assertNever(fruit, "Unknown fruit");
 *    }
 *
 * If now the Fruit union is extended (i.e. add "🍒"), TypeScript will catch
 * this *statically*, rather than at runtime, and force you to handle the
 * 🍒 case.
 */
export const assertNever = (_value: never, errmsg: string): never => {
  throw new AssertError({
    message: errmsg,
    cause: _value,
  });
};

/**
 * Asserts that a given value is non-nullable. This is similar to TypeScript's
 * `!` operator, but will throw an error at runtime (dev-mode only) indicating
 * an incorrect assumption.
 *
 * Instead of:
 *
 *     foo!.bar
 *
 * Use:
 *
 *     nn(foo).bar
 *
 */
export const nn = <T>(value: T, errmsg = "Expected value to be non-nullable"): NonNullable<T> => {
  invariant(P.isNotNullable(value), errmsg, {
    file: "@beep/yjs/lib/assert.ts",
    line: 54,
    args: [value],
  });

  return value;
};
