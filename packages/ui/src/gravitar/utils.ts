import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Random from "effect/Random";
import type {
  EarSize,
  EyeBrowStyle,
  EyeStyle,
  GlassesStyle,
  HairStyleMan,
  HairStyleWoman,
  HatStyle,
  MouthStyle,
  NoseStyle,
  Sex,
  ShirtStyle,
} from "./enums";

/**
 * Pick random from the list
 */
interface PickRandomOpt<T> {
  readonly avoidList?: ReadonlyArray<T> | null | undefined;
  readonly usually?: ReadonlyArray<T> | null | undefined;
}

export type PickRandomFromList = <T>(data: ReadonlyArray<T>, opt?: PickRandomOpt<T | undefined>) => T;

export const optDefaults = <const T extends string>(opt: PickRandomOpt<T | undefined> | null | undefined) =>
  F.pipe(
    opt,
    O.fromNullable,
    O.flatMap((opt) => (P.isNotNullable(opt) ? O.some(opt) : O.none<PickRandomOpt<T | undefined>>())),
    O.map((opts) => ({
      avoidList: O.fromNullable(opts.avoidList).pipe(
        O.match({
          onNone: () => [] as ReadonlyArray<T>,
          onSome: (list) =>
            F.pipe(
              A.filter(list, P.isNotNullable),
              A.reduce([] as ReadonlyArray<T>, (acc, cur) => acc.concat(new Array(15).fill(cur)))
            ),
        })
      ),
      usually: O.fromNullable(opts.usually).pipe(
        O.match({
          onNone: () => [] as ReadonlyArray<T>,
          onSome: (list) =>
            F.pipe(
              list,
              A.filter(P.isNotNullable),
              A.reduce([] as ReadonlyArray<T>, (acc, curr) => acc.concat(new Array(15).fill(curr)))
            ),
        })
      ),
    }))
  );

export const pickRandomFromList = <const T extends string>(
  data: ReadonlyArray<T>,
  opt?: PickRandomOpt<T | undefined> | null | undefined
) =>
  F.pipe(
    optDefaults(opt),
    O.match({
      onNone: () => new Cause.NoSuchElementException(),
      onSome: (opts) => {
        const avoidSet = HashSet.fromIterable(opts.avoidList);
        const avoidSetHas = (item: T) => HashSet.has(item)(avoidSet);
        let myData = A.filter(data, avoidSetHas);
        myData = myData.concat(opts.usually);
        return F.pipe(
          Random.nextIntBetween(0, A.length(myData)),
          Effect.flatMap((idx) => A.get(idx)(myData)),
          Effect.runSync
        );
      },
    }),
    Effect.succeed
  );

export interface DefaultOptions {
  sex: Sex.Type;
  faceColor: string[];
  earSize: EarSize.OptionsType;
  hairColor: string[];
  hairStyleMan: HairStyleMan.OptionsType;
  hairStyleWoman: HairStyleWoman.OptionsType;
  hatColor: string[];
  hatStyle: HatStyle.OptionsType;
  eyeBrowWoman: EyeBrowStyle.OptionsType;
  eyeStyle: EyeStyle.OptionsType;
  glassesStyle: GlassesStyle.OptionsType;
  noseStyle: NoseStyle.OptionsType;
  mouthStyle: MouthStyle.OptionsType;
  shirtStyle: ShirtStyle.OptionsType;
  shirtColor: string[];
  bgColor: string[];
  gradientBgColor: string[];
}
