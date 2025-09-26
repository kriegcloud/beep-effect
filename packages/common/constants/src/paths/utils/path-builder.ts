type Segment<S extends string> = S extends "" ? never : S extends `/${string}` ? never : S;

export interface PathBuilder<R extends string> {
  <S extends string>(segment: Segment<S>): `${R}/${S}`;
  readonly root: R;
  child<S extends string>(child: Segment<S>): PathBuilder<`${R}/${S}`>;
}

export function createPath<R extends string>(rootPath: R & `/${string}`): PathBuilder<R> {
  const fn = <S extends string>(segment: Segment<S>): `${R}/${S}` => `${rootPath}/${segment}` as `${R}/${S}`;
  return Object.assign(fn, {
    root: rootPath as R,
    child<S extends string>(child: Segment<S>) {
      return createPath(`${rootPath}/${child}` as `${R}/${S}` & `/${string}`);
    },
  });
}
