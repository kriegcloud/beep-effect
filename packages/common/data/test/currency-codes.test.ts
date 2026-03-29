import { CurrencyCodeDataValues } from "@beep/data/CurrencyCodes";
import { describe, expect, it } from "@effect/vitest";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

describe("CurrencyCodes", () => {
  it("exports the generated ISO 4217 data through the public module", () => {
    const usd = pipe(
      CurrencyCodeDataValues,
      A.findFirst((entry) => entry.code === "USD")
    );

    expect(A.length(CurrencyCodeDataValues)).toBeGreaterThan(0);
    expect(O.isSome(usd)).toBe(true);
    if (O.isSome(usd)) {
      expect(usd.value.currency).toBe("US Dollar");
      expect(usd.value.number).toBe("840");
    }
  });

  it("keeps special-purpose codes with N.A. minor units normalized to zero digits", () => {
    const xba = pipe(
      CurrencyCodeDataValues,
      A.findFirst((entry) => entry.code === "XBA")
    );

    expect(O.isSome(xba)).toBe(true);
    if (O.isSome(xba)) {
      expect(xba.value.digits).toBe(0);
    }
  });
});
