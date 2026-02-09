import * as A from "effect/Array";
import {pipe} from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Str from "effect/String";

export const subexp = (str: string): string =>
  `(?:${str})`;

export const merge = (...sets: A.NonEmptyArray<string>) => pipe(
  O.Do,
  O.bind("length", () => O.some(A.length(sets))),
  O.bind("sets", ({length}) => pipe(
    O.liftPredicate(length, Num.greaterThan(1)),
    O.map(() => sets),
  )),
  O.map(({sets, length}) => {
    sets[0] = Str.slice(0, -1)(sets[0]);
    const xl = length - 1;
    for (let x = 1; x < xl; ++x) {
      const elemOpt = A.get(x)(sets);
      if (O.isSome(elemOpt)) {
        const elem = elemOpt.value;
        sets[x] = Str.slice(0, -1)(elem);
      }
    }
    const elemOpt = A.get(xl)(sets);
    if (O.isSome(elemOpt)) {
      const elem = elemOpt.value;
      sets[xl] = Str.slice(1)(elem);
    }
    return A.join(sets, "");
  }),
  O.getOrElse(() => A.headNonEmpty(sets))
);
