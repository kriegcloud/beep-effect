import { dual, type LazyArg } from "effect";
/**
 * This function returns the result of either of the given functions depending on the value of the boolean parameter.
 * It is useful when you have to run one of two functions depending on the boolean value.
 *
 * @example
 * ```ts
 * import * as Boolean from "effect/Boolean"
 * import * as assert from "node:assert"
 *
 * assert.deepStrictEqual(
 *   Boolean.match(true, {
 *     onFalse: () => "It's false!",
 *     onTrue: () => "It's true!"
 *   }),
 *   "It's true!"
 * )
 * ```
 *
 * @category pattern matching
 * @since 2.0.0
 */
export const thunkMatch: () => {
  <A, B = A>(options: {
    readonly onFalse: LazyArg<A>;
    readonly onTrue: LazyArg<B>;
  }): (value: boolean) => A | B;
  <A, B>(value: boolean, options: {
    readonly onFalse: LazyArg<A>;
    readonly onTrue: LazyArg<B>;
  }): A | B;
} = () =>
  dual(
    2,
    <A, B>(value: boolean, options: {
      readonly onFalse: LazyArg<A>;
      readonly onTrue: LazyArg<B>;
    }): A | B => (value ? options.onTrue() : options.onFalse())
  );

export * from "effect/Boolean";
