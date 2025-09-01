import type * as S from "effect/Schema";

import { create } from "mutative";

type Fields = S.Struct.Fields;

// const baseState = {} as Fields;

export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b: B): A & B;

export function mergeFields<const A extends Fields>(a: A): <const B extends Fields>(b: B) => A & B;

export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b?: B) {
  if (b === undefined) {
    return <const C extends Fields>(bb: C): A & C =>
      create<A & C>(a as A & C, (draft) => {
        // Right-bias: bb overwrites keys from a on conflicts
        Object.assign(draft, bb);
      });
  }

  return create<A & B>(a as A & B, (draft) => {
    // Right-bias: b overwrites keys from a on conflicts
    Object.assign(draft, b as B);
  });
}
