import { expect } from "bun:test";
import { InvariantViolation } from "@beep/invariant/error";
import { effect } from "@beep/testkit";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import { modelFieldKeys } from "@beep/utils/data/model.utils";
import { merge, recordKeys, recordStringValues, reverseRecord } from "@beep/utils/data/record.utils";
import { structEntries, structKeys, structStringEntries, structValues } from "@beep/utils/data/struct.utils";
import { getAt } from "@beep/utils/getters";
import { isNonEmptyRecordWithNonEmptyStringKeys, isUnsafeProperty } from "@beep/utils/guards";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

effect("record helpers extract keys, values, and reverse entries safely",
  Effect.fn(function* () {
    const locales = { en: "English", es: "Español" } as const;
    const keys = recordKeys(locales);
    const values = recordStringValues(locales);
    const reversed = reverseRecord(locales);

    const keySet = HashSet.make(...keys);

    expect(HashSet.has(keySet, "en")).toBe(true);
    expect(HashSet.has(keySet, "es")).toBe(true);
    expect(values).toEqual(["English", "Español"]);
    expect(reversed).toEqual({ English: "en", Español: "es" });
  })
);

effect("record merge respects undefined and unsafe properties",
  Effect.fn(function* () {
    const target = { nested: { count: 1 }, list: [1, { value: 1 }], keep: "kept" } as const;
    const source = {
      nested: { extra: 2 },
      list: [undefined, { value: 2 }],
      keep: undefined,
      __proto__: { polluted: true },
    } as Record<PropertyKey, unknown>;

    const merged = merge({ ...target }, source);

    // @ts-expect-error
    expect(merged.nested).toEqual({ count: 1, extra: 2 });
    // @ts-expect-error
    expect(merged.list).toEqual([1, { value: 2 }]);
    expect(merged.keep).toBe("kept");
    expect(isUnsafeProperty("__proto__")).toBe(true);
  })
);

effect("record merge creates arrays when the target slot is not an array",
  Effect.fn(function* () {
    const merged = merge({ items: { stale: true } } as Record<string, unknown>, { items: [1, 2] });

    expect(merged.items).toEqual([1, 2]);
  })
);

effect("struct utilities return non-empty collections and throw on empties",
  Effect.fn(function* () {
    const fields = { id: S.String, age: S.Number };

    const keys = structKeys(fields);
    const values = structValues(fields);
    const entries = structEntries(fields);
    const stringEntries = structStringEntries({ en: "English" } as const);

    expect(HashSet.has(HashSet.make(...keys), "id")).toBe(true);
    expect(values).toEqual([S.String, S.Number]);
    expect(entries).toEqual([
      ["id", S.String],
      ["age", S.Number],
    ] as UnsafeTypes.UnsafeAny);
    expect(stringEntries).toEqual([["en", "English"]]);

    // @ts-expect-error
    expect(() => structValues({} as Record<StringTypes.NonEmptyString, S.Any>)).toThrow(InvariantViolation);
    // @ts-expect-error
    expect(() => structEntries({} as Record<StringTypes.NonEmptyString, S.Any>)).toThrow(InvariantViolation);
  })
);

effect("modelFieldKeys asserts presence of fields",
  Effect.fn(function* () {
    const model = { fields: { id: {}, name: {} } } as const;
    const keys = modelFieldKeys(model);

    expect(keys).toEqual(["id", "name"]);
    expect(() => modelFieldKeys({ fields: {} })).toThrow(InvariantViolation);
  })
);

effect("getAt reads nested paths and defends against forbidden keys",
  Effect.fn(function* () {
    const payload = { items: [{ product: { name: "Widget" } }], empty: null };

    const found = getAt(payload, "items[0].product.name");
    const fallback = getAt(payload, "items[2].product.name", "missing");
    const forbidden = getAt(payload, ["__proto__", "value"], "skip");

    expect(found).toBe("Widget");
    expect(fallback).toBe("missing");
    expect(forbidden).toBe("skip");
  })
);

effect("isNonEmptyRecordWithNonEmptyStringKeys validates shape",
  Effect.fn(function* () {
    const valid = { foo: 1 } as const;
    const invalid = {} as Record<string, number>;

    expect(isNonEmptyRecordWithNonEmptyStringKeys(valid)).toBe(true);
    expect(
      isNonEmptyRecordWithNonEmptyStringKeys(invalid as unknown as Record<StringTypes.NonEmptyString, number>)
    ).toBe(false);
  })
);
