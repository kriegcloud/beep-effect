import { normalizeHexColorInput } from "@beep/ui/components/color-picker";
import { findCountryOption, isCountryCode } from "@beep/ui/components/country-select";
import { formatPhoneDraft, isValidPhoneNumberE164, parsePhoneDraft } from "@beep/ui/components/phone-input";
import { describe, expect, it } from "vitest";

describe("@beep/ui form widget helpers", () => {
  it("resolves country metadata by ISO alpha-2 code", () => {
    expect(isCountryCode("US")).toBe(true);
    expect(isCountryCode("NOPE")).toBe(false);
    expect(findCountryOption("US")?.label).toBe("United States");
  });

  it("formats and parses US phone drafts as E.164", () => {
    expect(formatPhoneDraft("4155552671", "US")).toBe("(415) 555-2671");
    expect(parsePhoneDraft("4155552671", "US")).toBe("+14155552671");
    expect(isValidPhoneNumberE164("+14155552671")).toBe(true);
  });

  it("normalizes compact hex colors through @beep/schema", () => {
    expect(normalizeHexColorInput("#3bf")).toBe("#33bbff");
    expect(normalizeHexColorInput("not-a-color")).toBeUndefined();
  });
});
