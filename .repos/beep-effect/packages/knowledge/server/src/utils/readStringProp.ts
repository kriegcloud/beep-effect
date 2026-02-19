import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

export const readStringProp: {
  <Key extends string>(key: Key): (input: unknown) => O.Option<string>;
  <Key extends string>(input: unknown, key: Key): O.Option<string>;
} = dual(
  2,
  <Key extends string>(input: unknown, key: Key): O.Option<string> =>
    P.isObject(input) &&
    P.isNotNullable(input) &&
    P.hasProperty(input, key) &&
    P.struct({
      [key]: P.isString,
    })(input)
      ? O.some(input[key])
      : O.none()
);
