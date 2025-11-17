/**
 * Implementation backing `Utils.ObjectUtils.deepMerge`, detailing how the
 * helper defends against unsafe properties and preserves literal inference.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const objectUtilsModuleBase: FooTypes.Prettify<{ theme: { mode: string } }> = { theme: { mode: "light" } };
 * const objectUtilsModuleMerged = Utils.ObjectUtils.deepMerge(objectUtilsModuleBase, {
 *   theme: { accent: "blue" },
 * });
 * void objectUtilsModuleMerged;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import { isUnsafeProperty } from "@beep/utils/guards";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Struct from "effect/Struct";

type PlainRecord = Record<PropertyKey, unknown>;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type IsArray<T> = T extends ReadonlyArray<any> ? true : false;
type IsFunction<T> = T extends (...args: ReadonlyArray<any>) => unknown ? true : false;
type IsPlainObject<T> = T extends object
  ? IsArray<T> extends true
    ? false
    : IsFunction<T> extends true
      ? false
      : true
  : false;

type DeepMergeValue<TValue, TValueSource> = [TValueSource] extends [undefined]
  ? TValue
  : IsArray<TValue> extends true
    ? TValueSource extends ReadonlyArray<infer TSourceElement>
      ? TValue extends ReadonlyArray<infer TTargetElement>
        ? ReadonlyArray<DeepMergeValue<TTargetElement, TSourceElement>>
        : TValueSource
      : TValueSource
    : IsPlainObject<TValue> extends true
      ? IsPlainObject<TValueSource> extends true
        ? DeepMergeTwo<TValue & PlainRecord, TValueSource & PlainRecord>
        : TValueSource
      : TValueSource;

type DeepMergeTwo<Target, Source> = Simplify<{
  [Key in keyof Target | keyof Source]: DeepMergeValue<
    Key extends keyof Target ? Target[Key] : undefined,
    Key extends keyof Source ? Source[Key] : undefined
  >;
}>;

type DeepMergeAll<Target, Sources extends ReadonlyArray<object>> = Sources extends readonly [infer Head, ...infer Rest]
  ? Head extends object
    ? Rest extends ReadonlyArray<object>
      ? DeepMergeAll<DeepMergeTwo<Target, Head>, Rest>
      : DeepMergeTwo<Target, Head>
    : Target
  : Target;

/**
 * Result type produced by `deepMerge`, preserving literal structure when
 * merging a target with one or more sources.
 *
 * @example
 * import type { DeepMergeResult } from "@beep/utils/data/object.utils/deep-merge";
 *
 * type Output = DeepMergeResult<{ a: number }, [{ b: string }]>;
 *
 * @category Data/Object
 * @since 0.1.0
 */
export type DeepMergeResult<Target extends object, Sources extends ReadonlyArray<object>> = Simplify<
  DeepMergeAll<Target, Sources>
>;

const emptyArray: ReadonlyArray<unknown> = [];
const emptyObject: PlainRecord = {};

const isPlainObject = (value: unknown): value is PlainRecord => !A.isArray(value) && P.isRecord(value);

const assignProperty = (target: PlainRecord, key: PropertyKey, value: unknown): PlainRecord =>
  Object.is((target as PlainRecord)[key], value) ? target : { ...target, [key]: value };

const cloneValue = (value: unknown): unknown => {
  if (A.isArray(value)) {
    return mergeArrays(emptyArray, value);
  }

  if (isPlainObject(value)) {
    return mergeObjects(emptyObject, value);
  }

  return value;
};

const mergeArrayElement = (target: O.Option<unknown>, source: O.Option<unknown>): unknown =>
  F.pipe(
    source,
    O.match({
      onNone: () =>
        F.pipe(
          target,
          O.getOrElse(() => undefined)
        ),
      onSome: (sourceValue) =>
        sourceValue === undefined
          ? F.pipe(
              target,
              O.getOrElse(() => undefined)
            )
          : F.pipe(
              target,
              O.match({
                onNone: () => cloneValue(sourceValue),
                onSome: (targetValue) => mergeBranch(targetValue, sourceValue),
              })
            ),
    })
  );

const mergeArrays = (target: ReadonlyArray<unknown>, source: ReadonlyArray<unknown>): ReadonlyArray<unknown> => {
  const maxLength = Math.max(A.length(target), A.length(source));

  const loop = (index: number, acc: ReadonlyArray<unknown>): ReadonlyArray<unknown> =>
    index >= maxLength
      ? acc
      : loop(
          index + 1,
          F.pipe(acc, A.append(mergeArrayElement(F.pipe(target, A.get(index)), F.pipe(source, A.get(index)))))
        );

  return loop(0, emptyArray);
};

const mergeBranch = (targetValue: unknown, sourceValue: unknown): unknown => {
  if (A.isArray(sourceValue)) {
    const normalizedTarget = A.isArray(targetValue) ? targetValue : emptyArray;
    return mergeArrays(normalizedTarget, sourceValue);
  }

  if (isPlainObject(sourceValue)) {
    const normalizedTarget = isPlainObject(targetValue) ? targetValue : emptyObject;
    return mergeObjects(normalizedTarget, sourceValue);
  }

  return sourceValue;
};

const mergeObjects = (target: PlainRecord, source: PlainRecord): PlainRecord =>
  F.pipe(
    Struct.entries(source),
    A.reduce(target, (acc, [key, sourceValue]) => {
      if (isUnsafeProperty(key) || sourceValue === undefined) {
        return acc;
      }

      const currentValue = (acc as PlainRecord)[key];
      const nextValue = mergeBranch(currentValue, sourceValue);
      return assignProperty(acc, key, nextValue);
    })
  );

const cloneTarget = (target: PlainRecord): PlainRecord =>
  F.pipe(
    Struct.entries(target),
    A.reduce(emptyObject, (acc, [key, value]) => assignProperty(acc, key, value))
  );

/**
 * Deeply merges objects and arrays without mutating inputs, skipping unsafe
 * properties and `undefined` source values.
 *
 * Arrays merge by index, plain objects merge recursively, and primitives from
 * later sources overwrite earlier ones.
 *
 * @example
 * import { ObjectUtils } from "@beep/utils";
 *
 * const result = ObjectUtils.deepMerge({ a: { x: 1 } }, { a: { y: 2 } });
 * // { a: { x: 1, y: 2 } }
 *
 * @category Data/Object
 * @since 0.1.0
 */
export function deepMerge<Target extends object, const Sources extends ReadonlyArray<object>>(
  target: Target,
  ...sources: Sources
): DeepMergeResult<Target, Sources> {
  const normalizedSources = F.pipe(
    sources,
    A.filter((source): source is PlainRecord => isPlainObject(source))
  );

  const baseTarget = isPlainObject(target) ? target : emptyObject;

  return F.pipe(
    normalizedSources,
    A.reduce(cloneTarget(baseTarget), (acc, source) => mergeObjects(acc, source))
  ) as DeepMergeResult<Target, Sources>;
}
