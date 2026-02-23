import { expect } from "bun:test";
import { InvariantViolation } from "@beep/invariant/error";
import { effect } from "@beep/testkit";
import { enumFromStringArray, enumOf, enumValues } from "@beep/utils/transformations/enumFromStringArray";
import { valuesFromEnum } from "@beep/utils/transformations/valuesFromEnum";
import type * as A from "effect/Array";
import * as Effect from "effect/Effect";

effect(
  "enum builders preserve literal mappings and expose values",
  Effect.fn(function* () {
    const Status = enumFromStringArray("pending", "active");
    const Derived = enumOf("draft", "live");
    const values = enumValues(Status);
    const derivedValues = valuesFromEnum(Derived);

    expect(Status).toEqual({ pending: "pending", active: "active" });
    expect(Derived).toEqual({ draft: "draft", live: "live" });
    expect(values).toEqual(["pending", "active"]);
    expect(derivedValues).toEqual(["draft", "live"]);

    const withSchema = enumOf(...(["one", "two"] as A.NonEmptyReadonlyArray<string>));
    expect(withSchema).toEqual({ one: "one", two: "two" });
  })
);

effect(
  "valuesFromEnum asserts non-empty enums",
  Effect.fn(function* () {
    expect(() => valuesFromEnum({} as Record<string, string>)).toThrow(InvariantViolation);
  })
);
