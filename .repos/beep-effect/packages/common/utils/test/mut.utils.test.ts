import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { removeReadonly, removeReadonlyNonEmpty } from "@beep/utils/mut.utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

effect(
  "removeReadonly returns a mutable array view",
  Effect.fn(function* () {
    const readonly = [1, 2, 3];
    const mutable = removeReadonly(readonly);

    mutable[mutable.length] = 4;

    expect(mutable).toEqual([1, 2, 3, 4]);
    expect(F.pipe(mutable, A.head)).toEqual(A.head([1, 2, 3, 4] as const));
  })
);

effect(
  "removeReadonlyNonEmpty preserves non-empty typing",
  Effect.fn(function* () {
    const readonly = [5, 6] as const;
    const mutable = removeReadonlyNonEmpty(readonly);

    expect(mutable).toEqual([5, 6]);
    // @ts-expect-error
    mutable[mutable.length] = 7;
    // @ts-expect-error
    expect(mutable).toEqual([5, 6, 7]);
  })
);
