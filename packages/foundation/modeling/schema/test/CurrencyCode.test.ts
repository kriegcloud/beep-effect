import { CurrencyCode, CurrencyName, isCurrencyCode, USD } from "@beep/schema/CurrencyCode";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("CurrencyCode", () => {
  it("decodes ISO 4217 literals from generated @beep/data values", () => {
    expect(S.decodeSync(CurrencyCode)("USD")).toBe("USD");
    expect(S.decodeSync(CurrencyCode)("EUR")).toBe("EUR");
    expect(CurrencyCode.Options).toContain("USD");
    expect(USD).toBe("USD");
  });

  it("exports a generated currency-name literal schema", () => {
    expect(S.decodeSync(CurrencyName)("US Dollar")).toBe("US Dollar");
    expect(CurrencyName.Options).toContain("Euro");
  });

  it("rejects unknown currency codes", () => {
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("usd")).toBe(false);
    expect(() => S.decodeSync(CurrencyCode)("ZZZ")).toThrow();
  });
});
