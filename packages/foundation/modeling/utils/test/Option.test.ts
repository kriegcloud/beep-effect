import { it } from "@beep/test-runner";
import { O } from "@beep/utils";
import {
  thunk0,
  thunk1,
  thunkEmptyStr,
  thunkFalse,
  thunkNegative1,
  thunkSomeEmptyStr,
  thunkSomeFalse,
  thunkSomeTrue,
  thunkTrue,
} from "@beep/utils/thunk";
import { describe, expect, expectTypeOf } from "@effect/vitest";
import { pipe } from "effect/Function";

describe("@beep/utils literal fallbacks", () => {
  it("preserves literal types in named constant thunks", () => {
    expectTypeOf(thunkFalse).returns.toEqualTypeOf<false>();
    expectTypeOf(thunkTrue).returns.toEqualTypeOf<true>();
    expectTypeOf(thunkEmptyStr).returns.toEqualTypeOf<"">();
    expectTypeOf(thunk0).returns.toEqualTypeOf<0>();
    expectTypeOf(thunk1).returns.toEqualTypeOf<1>();
    expectTypeOf(thunkNegative1).returns.toEqualTypeOf<-1>();
    expectTypeOf(thunkSomeEmptyStr).returns.toEqualTypeOf<O.Option<"">>();
    expectTypeOf(thunkSomeFalse).returns.toEqualTypeOf<O.Option<false>>();
    expectTypeOf(thunkSomeTrue).returns.toEqualTypeOf<O.Option<true>>();
  });

  it("preserves fallback literals and the original Option value type", () => {
    expectTypeOf(O.getOrElseFalse(O.none())).toEqualTypeOf<false>();
    expectTypeOf(O.getOrElseTrue(O.none())).toEqualTypeOf<true>();
    expectTypeOf(O.getOrElse0(O.none())).toEqualTypeOf<0>();
    expectTypeOf(O.getOrElseEmptyStr(O.none())).toEqualTypeOf<"">();

    const value = O.some<"present">("present");
    expectTypeOf(O.getOrElseFalse(value)).toEqualTypeOf<"present" | false>();
    expectTypeOf(O.getOrElseTrue(value)).toEqualTypeOf<"present" | true>();
    expectTypeOf(O.getOrElse0(value)).toEqualTypeOf<"present" | 0>();
    expectTypeOf(O.getOrElseEmptyStr(value)).toEqualTypeOf<"present" | "">();

    expect(O.getOrElseFalse(O.none())).toBe(false);
    expect(O.getOrElseTrue(O.none())).toBe(true);
    expect(O.getOrElse0(O.none())).toBe(0);
    expect(O.getOrElseEmptyStr(O.none())).toBe("");
    expect(O.getOrElseFalse(value)).toBe("present");
    expect(O.getOrElseTrue(value)).toBe("present");
    expect(O.getOrElse0(value)).toBe("present");
    expect(O.getOrElseEmptyStr(value)).toBe("present");
  });
});

describe("@beep/utils O.propFromNullishOr", () => {
  it("supports data-first and data-last calls", () => {
    interface Person {
      readonly age?: number | null | undefined;
      readonly name: string;
    }

    const person: Person = { name: "beep", age: 42 };
    const dataFirst = O.propFromNullishOr(person, "age");
    const dataLast = pipe(person, O.propFromNullishOr("age"));

    expect(O.getOrNull(dataFirst)).toBe(42);
    expect(O.getOrNull(dataLast)).toBe(42);
    expectTypeOf(dataFirst).toEqualTypeOf<O.Option<number>>();
    expectTypeOf(dataLast).toEqualTypeOf<O.Option<number>>();
  });

  it("returns none for nullish and missing values", () => {
    const source = {
      nullable: null as number | null,
      maybeUndefined: undefined as number | undefined,
    };
    const missing = {} as { readonly nested?: { readonly age?: number | null } };

    expect(O.isNone(O.propFromNullishOr(source, "nullable"))).toBe(true);
    expect(O.isNone(O.propFromNullishOr(source, "maybeUndefined"))).toBe(true);
    expect(O.isNone(O.propFromNullishOr(missing, "nested.age"))).toBe(true);
  });

  it("supports tuple paths and removes nullish from nested value types", () => {
    const source: {
      readonly profile?: {
        readonly age?: number | null;
      };
    } = {
      profile: { age: 30 },
    };

    const age = pipe(source, O.propFromNullishOr(["profile", "age"] as const));

    expect(O.getOrNull(age)).toBe(30);
    expectTypeOf(age).toEqualTypeOf<O.Option<number>>();
  });
});

describe("@beep/utils O.getSomesStruct", () => {
  it("omits None fields and unwraps Some fields", () => {
    const result = O.getSomesStruct({
      id: O.some(1),
      name: O.none<string>(),
    });

    expect(result).toEqual({ id: 1 });
    expect("name" in result).toBe(false);
    expectTypeOf(result).toEqualTypeOf<{
      id?: number;
      name?: string;
    }>();
  });

  it("preserves explicitly present undefined values", () => {
    const result = O.getSomesStruct({
      value: O.some(undefined),
    });

    expect(result).toEqual({ value: undefined });
    expect("value" in result).toBe(true);
    expectTypeOf(result).toEqualTypeOf<{
      value?: undefined;
    }>();
  });
});
