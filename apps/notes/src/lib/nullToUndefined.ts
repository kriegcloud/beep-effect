import type { Primitive } from "ts-essentials";
// ["I intend to stop using `null` in my JS code in favor of `undefined`"](https://github.com/sindresorhus/meta/discussions/7)
// [Proposal: NullToUndefined and UndefinedToNull](https://github.com/sindresorhus/type-fest/issues/603)

// Types implementation inspired by
// https://github.com/sindresorhus/type-fest/blob/v2.12.2/source/delimiter-cased-properties-deep.d.ts
// https://github.com/sindresorhus/type-fest/blob/v2.12.2/source/readonly-deep.d.ts

// https://gist.github.com/tkrotoff/a6baf96eb6b61b445a9142e5555511a0

export type NullToUndefined<T> = T extends null
  ? undefined
  : T extends Date | Function | Primitive | RegExp
    ? T
    : T extends (infer U)[]
      ? NullToUndefined<U>[]
      : T extends Map<infer K, infer V>
        ? Map<K, NullToUndefined<V>>
        : T extends Set<infer U>
          ? Set<NullToUndefined<U>>
          : T extends object
            ? { [K in keyof T]: NullToUndefined<T[K]> }
            : unknown;

function _nullToUndefined<T>(obj: T): NullToUndefined<T> {
  if (obj === null) {
    return undefined as any;
  }
  if (typeof obj === "object") {
    if (obj instanceof Map) {
      obj.forEach((value, key) => obj.set(key, _nullToUndefined(value)));
    } else {
      for (const key in obj) {
        obj[key] = _nullToUndefined(obj[key]) as any;
      }
    }
  }

  return obj as any;
}

export function nullToUndefined<T>(obj: T) {
  return _nullToUndefined(structuredClone(obj));
}

function _falsyToUndefined<T>(obj: T): NullToUndefined<T> {
  if (!obj) {
    return undefined as any;
  }
  if (typeof obj === "object") {
    if (obj instanceof Map) {
      obj.forEach((value, key) => obj.set(key, _falsyToUndefined(value)));
    } else {
      for (const key in obj) {
        obj[key] = _falsyToUndefined(obj[key]) as any;
      }
    }
  }

  return obj as any;
}

/**
 * Recursively converts all null values to undefined.
 *
 * @param obj Object to convert
 * @returns A copy of the object with all its null values converted to undefined
 */
export function falsyToUndefined<T>(obj: T) {
  return _falsyToUndefined(structuredClone(obj));
}
