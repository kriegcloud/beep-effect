import { AbsoluteIRI, IRI, IRIReference, RelativeIRIReference } from "@beep/schema/internal/IRI/IRI.ts";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const decodeIri = S.decodeUnknownSync(IRI);
const decodeAbsoluteIri = S.decodeUnknownSync(AbsoluteIRI);
const decodeIriReference = S.decodeUnknownSync(IRIReference);
const decodeRelativeIriReference = S.decodeUnknownSync(RelativeIRIReference);

const canParseWithNativeUrl = (value: string): boolean => {
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
};

describe("IRI", () => {
  it("accepts internationalized IRIs with Unicode host, path, query, and fragment characters", () => {
    const value = "https://例え.テスト/δοκιμή/𐌀?κλειδί=値#片段";

    expect(decodeIri(value)).toBe(value);
  });

  it("accepts representative ucschar code points and rejects excluded noncharacters", () => {
    expect(decodeIri("https://example.com/𐌀")).toBe("https://example.com/𐌀");
    expect(() => decodeIri("https://example.com/\uFDD0")).toThrow("Expected a valid RFC 3987 IRI");
  });

  it("accepts iprivate characters in query components only", () => {
    const queryValue = "https://example.com/search?\uE000";

    expect(decodeIri(queryValue)).toBe(queryValue);
    expect(() => decodeIri("https://example.com/\uE000")).toThrow("Expected a valid RFC 3987 IRI");
    expect(() => decodeIri("https://example.com/#\uE000")).toThrow("Expected a valid RFC 3987 IRI");
  });

  it("rejects malformed percent encoding", () => {
    expect(() => decodeIri("https://example.com/%")).toThrow("Expected a valid RFC 3987 IRI");
    expect(() => decodeIri("https://example.com/%2")).toThrow("Expected a valid RFC 3987 IRI");
    expect(() => decodeIri("https://example.com/%ZZ")).toThrow("Expected a valid RFC 3987 IRI");
  });

  it("rejects illegal delimiters and embedded whitespace", () => {
    expect(() => decodeIri("https://example.com/has space")).toThrow("Expected a valid RFC 3987 IRI");
    expect(() => decodeIri("https://example.com/<bad>")).toThrow("Expected a valid RFC 3987 IRI");
    expect(() => decodeIri(" https://example.com")).toThrow("IRI values must not contain leading or trailing whitespace");
  });
});

describe("AbsoluteIRI", () => {
  it("accepts fragmentless absolute IRIs and rejects fragments", () => {
    expect(decodeAbsoluteIri("https://example.com/δοκιμή?x=1")).toBe("https://example.com/δοκιμή?x=1");
    expect(() => decodeAbsoluteIri("https://example.com/δοκιμή#frag")).toThrow(
      "Expected a valid RFC 3987 absolute IRI"
    );
  });
});

describe("IRIReference", () => {
  it("accepts valid relative IRI references", () => {
    const value = "../r\u00E9sum\u00E9/\u03B4\u03BF\u03BA\u03B9\u03BC\u03AE?x=\u5024#\u7247\u6BB5";

    expect(decodeIriReference(value)).toBe(value);
    expect(decodeRelativeIriReference(value)).toBe(value);
  });

  it("enforces the ipath-noscheme colon restriction for relative references", () => {
    expect(decodeRelativeIriReference("folder/child:leaf")).toBe("folder/child:leaf");
    expect(() => decodeRelativeIriReference("folder:child/leaf")).toThrow(
      "Expected a valid RFC 3987 relative IRI reference"
    );

    expect(decodeIriReference("folder:child/leaf")).toBe("folder:child/leaf");
  });

  it("includes a negative control showing native URL parsing is not RFC 3987 validation", () => {
    const nativeUrlFriendlyButSpecInvalid = "https://example.com/\uE000";

    expect(S.is(IRI)(nativeUrlFriendlyButSpecInvalid)).toBe(false);
    expect(canParseWithNativeUrl(nativeUrlFriendlyButSpecInvalid)).toBe(true);
  });
});
