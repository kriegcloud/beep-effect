import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

export function getFilledArray<T extends (v: number, k: number) => unknown>(range: number, mapfn: T): ReturnType<T>[] {
  return range <= 0 ? [] : (A.makeBy(range, (i) => mapfn(i, i)) as ReturnType<T>[]);
}

export function updateIndex<T extends unknown[]>(array: T, indexItem: number, item: T[keyof T]): T {
  return F.pipe(
    array,
    A.map((chipItem, index) => {
      return indexItem === index ? item : chipItem;
    })
  ) as unknown as T;
}

export function joinArrayStrings(array: readonly string[]): string {
  return A.join("")(array);
}

export function append<T extends unknown[]>(array: T, item: T[keyof T]): T {
  return [...array, item] as T;
}

export function mergeArrayStringFromIndex(
  array: readonly string[],
  arrayToMerge: readonly string[],
  fromIndex: number
): string[] {
  return A.reduce(
    array,
    { restArrayMerged: arrayToMerge, characters: A.empty<string>() },
    (accumulator, currentValue, index) => {
      const { characters, restArrayMerged } = accumulator;

      if (index < fromIndex) {
        return {
          restArrayMerged,
          characters: append(characters, currentValue),
        };
      }

      const [firstCharacter, ...restArrayWithoutFirstCharacter] = restArrayMerged;

      return {
        restArrayMerged: restArrayWithoutFirstCharacter,
        characters: append(characters, firstCharacter || ""),
      };
    }
  ).characters;
}

export function mergeRefs<T = unknown>(
  refs: (React.RefObject<T> | React.Ref<T> | undefined | null)[]
): React.RefCallback<T> {
  return (value) => {
    A.forEach(refs, (ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null && ref !== undefined) {
        ref.current = value;
      }
    });
  };
}

export function split(string: string): string[] {
  return F.pipe(string, Str.split(""));
}
