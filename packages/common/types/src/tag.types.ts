import type * as LiteralTypes from "./literal.types.js";

export type SnakeTag<S extends string = string> = S extends `${LiteralTypes.LowerChar}${infer R}`
  ? ValidateSnakeAfterLetter<R, S>
  : never;

export type Underscore = "_";

type ValidateSnakeAfterLetter<R extends string, Original extends string> = R extends ""
  ? Original
  : R extends `${LiteralTypes.LowerChar}${infer Rest}`
    ? ValidateSnakeAfterLetter<Rest, Original>
    : R extends `${Underscore}${LiteralTypes.LowerChar}${infer Rest}`
      ? ValidateSnakeAfterLetter<Rest, Original>
      : never;
