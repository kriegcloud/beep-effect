import type { StringTypes } from "@beep/types";

type Segment<S extends string> = S extends "" ? never : S extends `/${string}` ? never : S;

export interface PathBuilder<R extends StringTypes.NonEmptyString> {
  <S extends StringTypes.NonEmptyString>(segment: Segment<S>): `${R}/${S}`;
  readonly root: R;
  child<S extends StringTypes.NonEmptyString>(child: Segment<S>): PathBuilder<`${R}/${S}`>;
}

export function createPath<R extends StringTypes.NonEmptyString>(rootPath: R & `/${string}`): PathBuilder<R> {
  const fn = <S extends StringTypes.NonEmptyString>(segment: Segment<S>): `${R}/${S}` =>
    `${rootPath}/${segment}` as `${R}/${S}`;
  return Object.assign(fn, {
    root: rootPath as R,
    child<S extends StringTypes.NonEmptyString>(child: Segment<S>) {
      return createPath(`${rootPath}/${child}` as `${R}/${S}` & `/${string}`);
    },
  });
}
