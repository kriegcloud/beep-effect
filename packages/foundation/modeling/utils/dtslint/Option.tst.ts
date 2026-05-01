import { O } from "@beep/utils";
import { pipe } from "effect/Function";
import { describe, expect, it } from "tstyche";

describe("propFromNullishOr", () => {
  it("returns Option values without nullish in the success type", () => {
    interface Person {
      readonly age?: number | null | undefined;
      readonly name: string;
    }

    const person: Person = { name: "beep", age: 42 };

    expect(O.propFromNullishOr(person, "age")).type.toBe<O.Option<number>>();
    expect(pipe(person, O.propFromNullishOr("age"))).type.toBe<O.Option<number>>();
  });

  it("supports nested string and tuple paths", () => {
    const source: {
      readonly profile?: {
        readonly age?: number | null;
      };
    } = {
      profile: { age: 42 },
    };

    expect(O.propFromNullishOr(source, "profile.age")).type.toBe<O.Option<number>>();
    expect(O.propFromNullishOr(source, ["profile", "age"] as const)).type.toBe<O.Option<number>>();
  });

  it("rejects invalid string paths", () => {
    const source = { age: 1 } as const;

    // @ts-expect-error not assignable to parameter of type
    O.propFromNullishOr(source, "missing");
  });

  it("accepts record paths and returns unknown", () => {
    const record = {} as Record<string, unknown>;
    expect(O.propFromNullishOr(record, "anything")).type.toBe<O.Option<{}>>();
  });
});
