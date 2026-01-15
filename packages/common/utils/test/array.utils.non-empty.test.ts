import { expect } from "bun:test";
import { InvariantViolation } from "@beep/invariant/error";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { isNonEmptyReadonlyArrayOfGuard } from "../src/data/array.utils/array.utils";
import * as NonEmptyReadonly from "../src/data/array.utils/NonEmptyReadonly/NonEmptyreadonly";

effect("guards and assertions validate non-empty schema arrays",
  Effect.fn(function* () {
    const guard = isNonEmptyReadonlyArrayOfGuard(S.String);

    expect(guard(["a"])).toBe(true);
    expect(guard([])).toBe(false);
    expect(guard([1])).toBe(false);
  })
);

effect("NonEmptyReadonly.make preserves tuples and arrays",
  Effect.fn(function* () {
    const tuple = NonEmptyReadonly.make("a", "b", "c");
    const fromArray = NonEmptyReadonly.make(...(["x", "y"] as const));

    expect(tuple).toEqual(["a", "b", "c"]);
    expect(fromArray).toEqual(["x", "y"]);
  })
);

effect("NonEmptyReadonly.mapWith supports curried and uncurried usage",
  Effect.fn(function* () {
    const curried = NonEmptyReadonly.mapWith((value: number, index) => value + index)([1, 2, 3]);
    const uncurried = NonEmptyReadonly.mapWith(["a"] as const, (value) => F.pipe(value, Str.toUpperCase));

    expect(curried).toEqual([1, 3, 5]);
    expect(uncurried).toEqual(["A"]);
  })
);

effect("NonEmptyReadonly.filter enforces non-empty output",
  Effect.fn(function* () {
    const kept = NonEmptyReadonly.filter<number>((value) => value > 1)([1, 2, 3]);

    expect(kept).toEqual([2, 3]);
    expect(() => NonEmptyReadonly.filter(() => false)([1])).toThrow(InvariantViolation);
  })
);

effect("NonEmptyReadonly.from and fromIterable reject empty inputs",
  Effect.fn(function* () {
    const iterable = new Set([1, 2]);
    const fromSet = NonEmptyReadonly.fromIterable(iterable);
    const fromArray = NonEmptyReadonly.from([3, 4] as const);

    expect(fromSet).toEqual([1, 2]);
    expect(fromArray).toEqual([3, 4]);

    expect(() => NonEmptyReadonly.fromIterable([])).toThrow(InvariantViolation);
    expect(() => NonEmptyReadonly.from([])).toThrow(InvariantViolation);
  })
);
