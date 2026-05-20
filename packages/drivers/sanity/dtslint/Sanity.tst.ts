import { Sanity, SanityConfigInput, SanityQueryRequest, VERSION } from "@beep/sanity";
import { describe, expect, it } from "tstyche";

describe("@beep/sanity", () => {
  it("exposes the typed public surface", () => {
    expect(VERSION).type.toBe<"0.0.0">();
    expect(Sanity).type.not.toBe<never>();
    expect(new SanityConfigInput({ projectId: "oip", dataset: "production" })).type.toBe<SanityConfigInput>();
    expect(new SanityQueryRequest({ query: "*[]" })).type.toBe<SanityQueryRequest>();
  });
});
