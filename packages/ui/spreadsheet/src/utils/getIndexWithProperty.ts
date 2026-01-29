import * as A from "effect/Array";

export function getIndexWithProperty<T extends {}, K extends keyof T>(array: T[], property: K, value: T[K]) {
  return A.findFirstIndex(array, (element) => element[property] === value);
}
