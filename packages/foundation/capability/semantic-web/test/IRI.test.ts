import { AbsoluteIRI, IRI, IRIReference, RelativeIRIReference } from "@beep/semantic-web/iri";
import { describe, expect, it } from "@effect/vitest";
import { pipe } from "effect";
import * as A from "effect/Array";
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

const bidiFormattingCharacters = ["\u200E", "\u200F", "\u202A", "\u202B", "\u202C", "\u202D", "\u202E"] as const;

describe("IRI", () => {
  it("accepts internationalized IRIs across host, path, query, and fragment", () => {
    const cases = [
      "https://例え.テスト/δοκιμή/𐌀?κλειδί=値#片段",
      "https://example.com/%C3%A9",
      "mailto:用户@example.org",
      "foo:",
      "foo:/",
      "foo://",
      "foo:bar",
      "foo:?q=1",
      "foo:#frag",
    ] as const;

    for (const value of cases) {
      expect(decodeIri(value)).toBe(value);
    }
  });

  it("accepts representative authority permutations including empty host, IPv6, IPvFuture, and dotted reg-name first-match", () => {
    const cases = [
      "https://user:pass@例え.テスト:8080/a",
      "https://1.2.3.4/",
      "https://10.20.30.40/",
      "https://100.0.0.1/",
      "https://249.0.0.1/",
      "https://255.255.255.255/",
      "https://1234.0.0.1/",
      "https://[::1]/",
      "https://[2001:db8::1]/",
      "https://[::ffff:192.0.2.128]:443/",
      "https://[::ffff:192.0.2.128]/",
      "https://[vF.FF-._~!$&'()*+,;=:]/",
      "https://999.0.0.1/",
      "scheme://",
      "scheme://@/path",
    ] as const;

    for (const value of cases) {
      expect(decodeIri(value)).toBe(value);
    }
  });

  it("accepts representative ucschar ranges and rejects excluded noncharacters or surrogate code points", () => {
    const validCases = [
      "https://example.com/\u00A1",
      "https://example.com/\uF900",
      "https://example.com/𐌀",
      "https://example.com/\u{E1000}",
    ] as const;

    const invalidCases = [
      "https://example.com/\uFDD0",
      "https://example.com/\u{EFFFE}",
      "https://example.com/\uD800",
    ] as const;

    for (const value of validCases) {
      expect(decodeIri(value)).toBe(value);
    }

    for (const value of invalidCases) {
      expect(() => decodeIri(value)).toThrow("Expected a valid RFC 3987 IRI");
    }
  });

  it("accepts iprivate characters in query components only", () => {
    const validCases = ["https://example.com/search?\uE000", "https://example.com/search?\u{F0000}"] as const;
    const invalidCases = [
      "https://\uE000.example.com/",
      "https://example.com/\uE000",
      "https://example.com/#\uE000",
    ] as const;

    for (const value of validCases) {
      expect(decodeIri(value)).toBe(value);
    }

    for (const value of invalidCases) {
      expect(() => decodeIri(value)).toThrow("Expected a valid RFC 3987 IRI");
    }
  });

  it("rejects malformed percent encoding across multiple components", () => {
    const cases = [
      "https://example.com/%",
      "https://example.com/%2",
      "https://example.com/%ZZ",
      "https://exa%mple.com/",
      "https://user%ZZ@example.com/",
      "https:/%ZZ",
      "https://example.com/ok/%ZZ",
      "foo:%ZZ",
      "foo:ok/%ZZ",
      "https://example.com/path?value=%GG",
      "https://example.com/path#frag%",
    ] as const;

    for (const value of cases) {
      expect(() => decodeIri(value)).toThrow("Expected a valid RFC 3987 IRI");
    }
  });

  it("rejects malformed authorities and illegal delimiters", () => {
    const cases = [
      "https://user@@example.com/",
      "https://example.com:port/",
      "https://example:80:90/",
      "https://[2001:db8::1/",
      "https://[2001:db8::1]:port/",
      "https://[192.168.0.1::1]/",
      "https://[2001:db8:12345::1]/",
      "https://[1:2:3:4:5:6:7:]/",
      "https://[2001::db8::1]/",
      "https://[2001:db8:::1]/",
      "https://[2001:db8::zzzz]/",
      "https://[vFabc]/",
      "https://[v1.]/",
      "https://example.com/has space",
      "https://example.com/<bad>",
      "https://example.com/`bad`",
    ] as const;

    for (const value of cases) {
      expect(() => decodeIri(value)).toThrow("Expected a valid RFC 3987 IRI");
    }
  });

  it("rejects bidi formatting characters that RFC 3987 section 4.1 forbids", () => {
    const cases = pipe(
      bidiFormattingCharacters,
      A.map((character) => `https://example.com/${character}`)
    );

    for (const value of cases) {
      expect(() => decodeIri(value)).toThrow("Expected a valid RFC 3987 IRI");
    }
  });

  it("rejects leading or trailing whitespace", () => {
    const cases = [" https://example.com", "https://example.com ", "\nhttps://example.com"] as const;

    for (const value of cases) {
      expect(() => decodeIri(value)).toThrow("IRI values must not contain leading or trailing whitespace");
    }
  });
});

describe("AbsoluteIRI", () => {
  it("accepts fragmentless absolute IRIs and rejects fragments or relative forms", () => {
    const validCases = ["https://example.com/δοκιμή?x=1", "mailto:用户@example.org"] as const;
    const invalidCases = ["https://example.com/δοκιμή#frag", "#frag", "?q", "folder/child"] as const;

    for (const value of validCases) {
      expect(decodeAbsoluteIri(value)).toBe(value);
    }

    expect(() => decodeAbsoluteIri("")).toThrow("Absolute IRI values must not be empty");

    for (const value of invalidCases) {
      expect(() => decodeAbsoluteIri(value)).toThrow("Expected a valid RFC 3987 absolute IRI");
    }
  });
});

describe("IRIReference", () => {
  it("accepts empty, query-only, fragment-only, authority, absolute-path, no-scheme, and rootless relative references", () => {
    const cases = [
      "",
      "#片段",
      "?κλειδί=値",
      "../r\u00E9sum\u00E9/\u03B4\u03BF\u03BA\u03B9\u03BC\u03AE?x=\u5024#\u7247\u6BB5",
      "//例え.テスト/path",
      "///path",
      "abc",
      "/absolute/path",
      "/segment/%C3%A9",
      "folder/child:leaf",
      "folder/%F0%90%8C%80",
      ".",
    ] as const;

    for (const value of cases) {
      expect(decodeIriReference(value)).toBe(value);
      expect(decodeRelativeIriReference(value)).toBe(value);
    }
  });

  it("distinguishes absolute IRIs from relative references when a scheme is present", () => {
    const value = "folder:child/leaf";

    expect(decodeIriReference(value)).toBe(value);
    expect(() => decodeRelativeIriReference(value)).toThrow("Expected a valid RFC 3987 relative IRI reference");
  });

  it("enforces the ipath-noscheme colon restriction on the first segment only", () => {
    expect(decodeRelativeIriReference("folder/child:leaf")).toBe("folder/child:leaf");
    expect(() => decodeRelativeIriReference("folder:child/leaf")).toThrow(
      "Expected a valid RFC 3987 relative IRI reference"
    );
  });

  it("rejects malformed relative references", () => {
    const cases = [
      "foo/%ZZ",
      "/%ZZ",
      "/ok/%ZZ",
      "?%ZZ",
      "#%ZZ",
      "folder?%ZZ",
      "folder#%ZZ",
      "//user@@example.com/path",
      "//[2001::db8::1]/",
      "//[vFabc]/path",
      "//example.com:port/path",
      "\u202Erelative/path",
    ] as const;

    for (const value of cases) {
      expect(() => decodeRelativeIriReference(value)).toThrow("Expected a valid RFC 3987 relative IRI reference");
    }
  });

  it("includes a negative control showing native URL parsing is not RFC 3987 validation", () => {
    const nativeUrlFriendlyButSpecInvalid = "https://example.com/\uE000";

    expect(S.is(IRI)(nativeUrlFriendlyButSpecInvalid)).toBe(false);
    expect(canParseWithNativeUrl(nativeUrlFriendlyButSpecInvalid)).toBe(true);
  });
});
