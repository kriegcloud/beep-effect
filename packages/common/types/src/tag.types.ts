import type { LowerChar } from "./literal.types";
export type SnakeTag<S extends string> = S extends `${LowerChar}${infer R}` ? ValidateSnakeAfterLetter<R, S> : never;

export type Underscore = "_";

type ValidateSnakeAfterLetter<R extends string, Original extends string> = R extends ""
  ? Original
  : R extends `${LowerChar}${infer Rest}`
    ? ValidateSnakeAfterLetter<Rest, Original>
    : R extends `${Underscore}${LowerChar}${infer Rest}`
      ? ValidateSnakeAfterLetter<Rest, Original>
      : never;
