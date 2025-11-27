import { pipe } from "effect";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Struct from "effect/Struct";

type SimplifyObject<A> = {
  [K in keyof A]: A[K];
} extends infer B extends object
  ? B
  : never;

type ArrayWithDefaultData<S extends ReadonlyArray<unknown>> = {
  array: S;
  default: () => A.ReadonlyArray.Infer<S>;
};
const ArrayWithDefaultTaggedClass: new <S extends ReadonlyArray<unknown>>(
  args: Readonly<ArrayWithDefaultData<S>>
) => Readonly<ArrayWithDefaultData<S>> & {
  readonly _tag: "ArrayWithDefault";
} = Data.TaggedClass("ArrayWithDefault");
export class ArrayWithDefault<const S extends ReadonlyArray<unknown>> extends ArrayWithDefaultTaggedClass<S> {}

export const wrap =
  <S extends ReadonlyArray<unknown>>(options: { default: () => A.ReadonlyArray.Infer<S> }) =>
  (array: S) =>
    new ArrayWithDefault({
      array,
      default: options.default,
    });

export const wrapNonEmpty =
  <S extends A.NonEmptyReadonlyArray<unknown>>(options: { default: () => A.ReadonlyArray.Infer<S> }) =>
  (array: S) =>
    new ArrayWithDefault({
      array,
      default: options.default,
    });

export const wrapEither =
  <S extends ReadonlyArray<Either.Either<unknown, unknown>>>(options: {
    default: () => Either.Either.Right<A.ReadonlyArray.Infer<S>>;
  }) =>
  (array: S) =>
    new ArrayWithDefault({
      array: pipe(
        array as ReadonlyArray<Either.Either<Either.Either.Right<A.ReadonlyArray.Infer<S>>, unknown>>,
        A.map(Either.getOrElse(options.default))
      ),
      default: options.default,
    });

export const wrapEitherNonEmpty =
  <S extends A.NonEmptyReadonlyArray<Either.Either<unknown, unknown>>>(options: {
    default: () => Either.Either.Right<A.ReadonlyArray.Infer<S>>;
  }) =>
  (array: S) =>
    new ArrayWithDefault({
      array: pipe(
        array as A.NonEmptyReadonlyArray<Either.Either<Either.Either.Right<A.ReadonlyArray.Infer<S>>, unknown>>,
        A.map(Either.getOrElse(options.default))
      ),
      default: options.default,
    });

export const wrapOption =
  <S extends ReadonlyArray<O.Option<unknown>>>(options: { default: () => O.Option.Value<A.ReadonlyArray.Infer<S>> }) =>
  (array: S) =>
    new ArrayWithDefault({
      array: pipe(
        array as ReadonlyArray<O.Option<O.Option.Value<A.ReadonlyArray.Infer<S>>>>,
        A.map(O.getOrElse(options.default))
      ),
      default: options.default,
    });

export const wrapOptionNonEmpty =
  <S extends A.NonEmptyReadonlyArray<O.Option<unknown>>>(options: {
    default: () => O.Option.Value<A.ReadonlyArray.Infer<S>>;
  }) =>
  (array: S) =>
    new ArrayWithDefault({
      array: pipe(
        array as A.NonEmptyReadonlyArray<O.Option<O.Option.Value<A.ReadonlyArray.Infer<S>>>>,
        A.map(O.getOrElse(options.default))
      ),
      default: options.default,
    });

export type InferArray<A extends ArrayWithDefault<ReadonlyArray<unknown>>> =
  A extends ArrayWithDefault<infer S> ? S : never;
export type Infer<A extends ArrayWithDefault<ReadonlyArray<unknown>>> = A.ReadonlyArray.Infer<InferArray<A>>;

export const toArray = <S extends ArrayWithDefault<ReadonlyArray<unknown>>>(a: S) => a.array as InferArray<S>;
export const getDefault = <S extends ArrayWithDefault<ReadonlyArray<unknown>>>(a: S) => a.default() as Infer<S>;

export const zip =
  <T extends ArrayWithDefault<ReadonlyArray<object>>>(b: T) =>
  <S extends ArrayWithDefault<ReadonlyArray<object>>>(a: S) => {
    const arrayA = toArray(a);
    const arrayB = toArray(b);

    const maxLength = Order.max(Order.number)(A.length(arrayA), A.length(arrayB));

    return pipe(
      A.zip(
        A.appendAll(
          A.copy(arrayA),
          A.makeBy(maxLength - A.length(arrayA), () => getDefault(a))
        ),
        A.appendAll(
          A.copy(arrayB),
          A.makeBy(maxLength - A.length(arrayB), () => getDefault(b))
        )
      ),
      A.map(([a, b]) => ({ ...a, ...b }) as Infer<S> & Infer<T>),
      wrap({ default: () => ({ ...getDefault(a), ...getDefault(b) }) })
    );
  };

export const zipArray =
  <T extends ArrayWithDefault<ReadonlyArray<ReadonlyArray<unknown>>>>(b: T) =>
  <S extends ArrayWithDefault<ReadonlyArray<ReadonlyArray<unknown>>>>(a: S) => {
    const arrayA = toArray(a);
    const arrayB = toArray(b);

    const maxLength = Order.max(Order.number)(A.length(arrayA), A.length(arrayB));

    return pipe(
      A.zip(
        A.appendAll(
          A.copy(arrayA),
          A.makeBy(maxLength - A.length(arrayA), () => getDefault(a))
        ),
        A.appendAll(
          A.copy(arrayB),
          A.makeBy(maxLength - A.length(arrayB), () => getDefault(b))
        )
      ),
      A.map(([a, b]) => [...a, ...b] as [...Infer<S>, ...Infer<T>]),
      wrap({
        default: () => [...getDefault(a), ...getDefault(b)] as [...Infer<S>, ...Infer<T>],
      })
    );
  };

export const map =
  <S extends ArrayWithDefault<ReadonlyArray<unknown>>, B>(mapper: (a: Infer<S>) => B) =>
  (a: S) =>
    pipe(
      toArray(a),
      A.map(mapper),
      wrap({
        default: () => mapper(getDefault(a)) as A.ReadonlyArray.Infer<A.ReadonlyArray.With<InferArray<S>, B>>,
      })
    );

export const mapEffect =
  <S extends ArrayWithDefault<ReadonlyArray<unknown>>, B, E, R>(mapper: (a: Infer<S>) => Effect.Effect<B, E, R>) =>
  (a: S): Effect.Effect<ArrayWithDefault<ReadonlyArray<B>>, E, R> =>
    pipe(
      Effect.all(
        {
          array: Effect.forEach(toArray(a), mapper, {
            concurrency: "unbounded",
          }) as Effect.Effect<A.ReadonlyArray.With<InferArray<S>, B>, E, R>,
          default: mapper(getDefault(a)) as Effect.Effect<B, E, R>,
        },
        { concurrency: "unbounded" }
      ),
      Effect.map(({ array, default: defaultValue }) =>
        pipe(
          array as A.ReadonlyArray.With<InferArray<S>, B>,
          wrap({
            default: () => defaultValue as A.ReadonlyArray.Infer<A.ReadonlyArray.With<InferArray<S>, B>>,
          })
        )
      )
    );

export const zipMap =
  <S extends ArrayWithDefault<ReadonlyArray<object>>, B extends object>(mapper: (a: Infer<S>) => B) =>
  (a: S) =>
    pipe(a, zip(pipe(a, map(mapper))));

export const zipMapArray =
  <S extends ArrayWithDefault<ReadonlyArray<unknown[]>>, B extends ReadonlyArray<unknown>>(
    mapper: (a: Infer<S>) => B
  ) =>
  (a: S) =>
    pipe(a, zipArray(pipe(a, map(mapper))));

export const replaceKeysFromHead =
  <
    S extends ArrayWithDefault<ReadonlyArray<object>>,
    Keys extends A.NonEmptyReadonlyArray<
      {
        [K in keyof Infer<S>]: Infer<S>[K] extends O.Option<unknown> ? K : never;
      }[keyof Infer<S>]
    >,
  >(
    ...keys: Keys
  ) =>
  (a: S): S =>
    pipe(
      a,
      zip(
        pipe(
          [] as SimplifyObject<Pick<Infer<S>, Keys[number]>>[],
          wrap({
            default: () =>
              pipe(
                A.head(toArray(a)),
                O.map((head) => Struct.pick(head, keys as never)),
                (v) =>
                  Object.fromEntries(
                    pipe(
                      keys,
                      A.map((key) => [key, pipe(v, O.flatMap(Struct.get(key) as (v: object) => O.Option<unknown>))])
                    )
                  )
              ) as SimplifyObject<Pick<Infer<S>, Keys[number]>>,
          })
        ) as ArrayWithDefault<ReadonlyArray<SimplifyObject<Pick<Infer<S>, Keys[number]>>>>
      )
    ) as unknown as S;

export const replaceKeysFromHeadNonEmpty =
  <S extends ArrayWithDefault<A.NonEmptyReadonlyArray<object>>, Keys extends A.NonEmptyReadonlyArray<keyof Infer<S>>>(
    ...keys: Keys
  ) =>
  (a: S): S =>
    pipe(
      a,
      zip(
        pipe(
          [] as SimplifyObject<Pick<Infer<S>, Keys[number]>>[],
          wrap({
            default: () =>
              Struct.pick(A.headNonEmpty(toArray(a)) as Infer<S>, keys as never) as SimplifyObject<
                Pick<Infer<S>, Keys[number]>
              >,
          })
        ) as ArrayWithDefault<ReadonlyArray<SimplifyObject<Pick<Infer<S>, Keys[number]>>>>
      )
    ) as unknown as S;
