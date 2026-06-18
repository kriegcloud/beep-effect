import { Timezone } from "@beep/schema/Timezone";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("Timezone", () => {
  it("decodes IANA timezone literals from generated @beep/data values", () => {
    expect(S.decodeSync(Timezone)("UTC")).toBe("UTC");
    expect(S.decodeSync(Timezone)("America/New_York")).toBe("America/New_York");
    expect(Timezone.Options).toContain("Europe/London");
  });

  it("rejects unknown timezone names", () => {
    expect(() => S.decodeSync(Timezone)("Mars/Base")).toThrow();
  });
});
