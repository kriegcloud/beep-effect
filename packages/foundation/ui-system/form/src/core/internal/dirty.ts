/**
 * Dirty-field recalculation helpers for nested form values.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { TUnsafe } from "@beep/types";
import { HashSet, Number as N } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import { getNestedValue, isPathUnderRoot } from "../Path.ts";

/**
 * Recalculates dirty paths for an array field after item changes.
 *
 * @example
 * ```ts
 * import { recalculateDirtyFieldsForArray } from "@beep/form/core/internal/dirty"
 * import * as HashSet from "effect/HashSet"
 *
 * const dirty = recalculateDirtyFieldsForArray({
 *   dirtyFields: HashSet.empty(),
 *   initialValues: { items: [] },
 *   arrayPath: "items",
 *   newItems: ["A"]
 * })
 * console.log(HashSet.has(dirty, "items")) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const recalculateDirtyFieldsForArray = ({
  dirtyFields,
  initialValues,
  arrayPath,
  newItems,
}: {
  dirtyFields: HashSet.HashSet<string>;
  initialValues: unknown;
  arrayPath: string;
  newItems: ReadonlyArray<unknown>;
}): HashSet.HashSet<string> => {
  const initialItems = (getNestedValue(initialValues, arrayPath) ?? []) as ReadonlyArray<unknown>;

  if (newItems === initialItems) {
    return dirtyFields;
  }

  let nextDirty = pipe(
    dirtyFields,
    HashSet.filter((path) => !isPathUnderRoot(path, arrayPath))
  );

  const loopLength = N.max(A.length(newItems), A.length(initialItems));
  for (let i = 0; i < loopLength; i++) {
    const itemPath = `${arrayPath}[${i}]`;
    const newItem = newItems[i];
    const initialItem = initialItems[i];

    if (newItem === initialItem) continue;

    if (!Eq.equals(newItem, initialItem)) {
      nextDirty = HashSet.add(nextDirty, itemPath);
    }
  }

  if (A.length(newItems) !== A.length(initialItems)) {
    nextDirty = HashSet.add(nextDirty, arrayPath);
  } else {
    nextDirty = HashSet.remove(nextDirty, arrayPath);
  }

  return nextDirty;
};

/**
 * Recalculates dirty paths below a root path.
 *
 * @example
 * ```ts
 * import { recalculateDirtySubtree } from "@beep/form/core/internal/dirty"
 * import * as HashSet from "effect/HashSet"
 *
 * const dirty = recalculateDirtySubtree({
 *   currentDirty: HashSet.empty(),
 *   allInitial: { name: "A" },
 *   allValues: { name: "B" },
 *   rootPath: "name"
 * })
 * console.log(HashSet.has(dirty, "name")) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const recalculateDirtySubtree = ({
  currentDirty,
  allInitial,
  allValues,
  rootPath = "",
}: {
  currentDirty: HashSet.HashSet<string>;
  allInitial: unknown;
  allValues: unknown;
  rootPath?: string;
}): HashSet.HashSet<string> => {
  const targetValue = rootPath !== "" ? getNestedValue(allValues, rootPath) : allValues;
  const targetInitial = rootPath !== "" ? getNestedValue(allInitial, rootPath) : allInitial;

  if (targetValue === targetInitial) {
    if (rootPath === "") {
      return HashSet.empty();
    }

    let changed = false;
    let nextDirty = currentDirty;
    for (const path of currentDirty) {
      if (isPathUnderRoot(path, rootPath)) {
        nextDirty = HashSet.remove(nextDirty, path);
        changed = true;
      }
    }
    return changed ? nextDirty : currentDirty;
  }

  let nextDirty = currentDirty;

  if (rootPath === "") {
    nextDirty = HashSet.empty();
  } else {
    for (const path of nextDirty) {
      if (isPathUnderRoot(path, rootPath)) {
        nextDirty = HashSet.remove(nextDirty, path);
      }
    }
  }

  const recurse = (current: unknown, initial: unknown, path: string): void => {
    if (current === initial) return;

    if (A.isArray(current)) {
      const initialArr = (initial ?? []) as ReadonlyArray<unknown>;
      for (let i = 0; i < N.max(A.length(current), A.length(initialArr)); i++) {
        recurse(current[i], initialArr[i], path !== "" ? `${path}[${i}]` : `[${i}]`);
      }
    } else if (P.isObject(current)) {
      const currentObj = current as TUnsafe.Any as R.ReadonlyRecord<string, unknown>;
      const initialObj = P.isObject(initial)
        ? (initial as TUnsafe.Any as R.ReadonlyRecord<string, unknown>)
        : R.empty<string, unknown>();
      for (const key of R.keys(currentObj)) {
        recurse(
          pipe(R.get(currentObj, key), O.getOrUndefined),
          pipe(R.get(initialObj, key), O.getOrUndefined),
          path !== "" ? `${path}.${key}` : key
        );
      }
      for (const key of R.keys(initialObj)) {
        if (!R.has(currentObj, key)) {
          recurse(undefined, pipe(R.get(initialObj, key), O.getOrUndefined), path !== "" ? `${path}.${key}` : key);
        }
      }
    } else {
      if (!Eq.equals(current, initial) && path !== "") nextDirty = HashSet.add(nextDirty, path);
    }
  };

  recurse(targetValue, targetInitial, rootPath);
  return nextDirty;
};
