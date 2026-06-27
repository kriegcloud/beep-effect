import { Sanity, SanityConfigInput, SanityQueryRequest } from "@beep/sanity";
import { describe, expect, it } from "tstyche";

describe("@beep/sanity", () => {
  it("exposes the typed public surface", () => {
    expect(Sanity).type.not.toBe<never>();
    expect(SanityConfigInput.make({ projectId: "oip", dataset: "production" })).type.toBe<SanityConfigInput>();
    expect(SanityQueryRequest.make({ query: "*[]" })).type.toBe<SanityQueryRequest>();
  });
});
