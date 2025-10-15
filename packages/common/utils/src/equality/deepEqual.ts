import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";

type Stack = WeakMap<object, object>;

const objectToString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const sameValueZero = (a: unknown, b: unknown) => a === b || (a !== a && b !== b);

const isObjectLike = (value: unknown): value is object =>
  value !== null && (typeof value === "object" || typeof value === "function");

const equalArrays = (
  array: ReadonlyArray<unknown>,
  other: ReadonlyArray<unknown>,
  stack: Stack,
  equal: (left: unknown, right: unknown, shared: Stack) => boolean
): boolean => {
  if (array.length !== other.length) {
    return false;
  }
  const compare = (index: number): boolean => {
    if (index >= array.length) {
      return true;
    }
    if (!equal(array[index], other[index], stack)) {
      return false;
    }
    return compare(index + 1);
  };
  return compare(0);
};

const equalArrayBuffer = (
  viewA: ArrayLike<number>,
  viewB: ArrayLike<number>,
  stack: Stack,
  equal: (left: unknown, right: unknown, shared: Stack) => boolean
) => {
  if (viewA.length !== viewB.length) {
    return false;
  }
  const compare = (index: number): boolean => {
    if (index >= viewA.length) {
      return true;
    }
    if (!equal(viewA[index], viewB[index], stack)) {
      return false;
    }
    return compare(index + 1);
  };
  return compare(0);
};

const equalPlainObjects = (
  value: Record<PropertyKey, unknown>,
  other: Record<PropertyKey, unknown>,
  stack: Stack,
  equal: (left: unknown, right: unknown, shared: Stack) => boolean
): boolean => {
  const keysValue = Struct.keys(value as Record<string, unknown>);
  const keysOther = Struct.keys(other as Record<string, unknown>);
  if (keysValue.length !== keysOther.length) {
    return false;
  }
  const compareKeys = (index: number): boolean => {
    if (index >= keysValue.length) {
      return true;
    }
    return F.pipe(
      O.fromNullable(keysValue[index]),
      O.filter((key) => hasOwnProperty.call(other, key)),
      O.filter((key) => equal(value[key], other[key], stack)),
      O.match({
        onNone: () => false,
        onSome: () => compareKeys(index + 1),
      })
    );
  };
  return compareKeys(0);
};

const equalByTag = (
  value: unknown,
  other: unknown,
  tag: string,
  stack: Stack,
  equal: (left: unknown, right: unknown, shared: Stack) => boolean
): boolean => {
  switch (tag) {
    case "[object Date]":
    case "[object Boolean]":
    case "[object Number]":
      return sameValueZero((value as Date | Boolean | Number).valueOf(), (other as Date | Boolean | Number).valueOf());
    case "[object String]":
    case "[object RegExp]":
      return `${value}` === `${other}`;
    case "[object Symbol]":
      return (value as symbol).valueOf() === (other as symbol).valueOf();
    case "[object BigInt]":
      return BigInt(value as string | number | bigint) === BigInt(other as string | number | bigint);
    case "[object ArrayBuffer]": {
      const viewA = new Uint8Array(value as ArrayBuffer);
      const viewB = new Uint8Array(other as ArrayBuffer);
      return equalArrayBuffer(viewA, viewB, stack, equal);
    }
    case "[object DataView]": {
      const dataViewA = value as DataView;
      const dataViewB = other as DataView;
      return equalArrayBuffer(new Uint8Array(dataViewA.buffer), new Uint8Array(dataViewB.buffer), stack, equal);
    }
    case "[object Set]": {
      const setValue = value as Set<unknown>;
      const setOther = other as Set<unknown>;
      if (setValue.size !== setOther.size) {
        return false;
      }
      let allMatch = true;
      setValue.forEach((entry) => {
        if (!setOther.has(entry)) {
          allMatch = false;
        }
      });
      return allMatch;
    }
    case "[object Map]": {
      const mapValue = value as Map<unknown, unknown>;
      const mapOther = other as Map<unknown, unknown>;
      if (mapValue.size !== mapOther.size) {
        return false;
      }
      let allMatch = true;
      mapValue.forEach((entry, key) => {
        if (!mapOther.has(key) || !equal(entry, mapOther.get(key), stack)) {
          allMatch = false;
        }
      });
      return allMatch;
    }
    default:
      if (tag.startsWith("[object Uint") || tag.startsWith("[object Int") || tag.startsWith("[object Float")) {
        const typedA = value as ArrayLike<number>;
        const typedB = other as ArrayLike<number>;
        return equalArrayBuffer(typedA, typedB, stack, equal);
      }
      return false;
  }
};

const baseEqual = (value: unknown, other: unknown, stack: Stack): boolean => {
  if (sameValueZero(value, other)) {
    return true;
  }
  if (!isObjectLike(value) || !isObjectLike(other)) {
    return false;
  }
  const tagValue = objectToString.call(value);
  const tagOther = objectToString.call(other);
  if (tagValue !== tagOther) {
    return false;
  }

  if (stack.has(value as object) && stack.get(value as object) === other) {
    return true;
  }
  stack.set(value as object, other as object);

  if (A.isArray(value)) {
    return equalArrays(value, other as ReadonlyArray<unknown>, stack, baseEqual);
  }

  if (tagValue === "[object Object]") {
    if (Object.getPrototypeOf(value) !== Object.getPrototypeOf(other)) {
      return false;
    }
    return equalPlainObjects(
      value as Record<PropertyKey, unknown>,
      other as Record<PropertyKey, unknown>,
      stack,
      baseEqual
    );
  }

  return equalByTag(value, other, tagValue, stack, baseEqual);
};

export const deepEqual = (value: unknown, other: unknown): boolean => baseEqual(value, other, new WeakMap());
