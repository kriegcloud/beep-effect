import type { DeepNonNullable } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

export function deepRemoveNull<T>(obj: T): DeepNonNullable<T> {
  return F.pipe(
    obj as any,
    Struct.entries,
    A.filter(([_, v]) => P.isNotNullable(v)),
    A.map(([k, v]) => [k, v === Object(v) ? deepRemoveNull(v) : v] as const),
    R.fromEntries
  ) as DeepNonNullable<T>;
}
