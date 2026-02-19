import { describe, expect, it } from "bun:test";
import { BS } from "@beep/schema";
import { CSPFromString, CSPString } from "@beep/schema/integrations";
import { deepStrictEqual } from "@beep/testkit";
import * as S from "effect/Schema";

const decodeFromString = S.decodeUnknownSync(CSPFromString);
const encodeFromStruct = S.encodeSync(CSPFromString);
const decodeStringSchema = S.decodeUnknownSync(CSPString);
const encodeStringSchema = S.encodeSync(CSPString);

describe("CSPFromString", () => {
  it("decodes a single directive with urls", () => {
    const input = "script-src='self',https://example.com,https://google.com;";
    const result = decodeFromString(input);

    deepStrictEqual(result.directives["script-src"], [
      "'self'",
      BS.Url.make("https://example.com"),
      BS.Url.make("https://google.com"),
    ]);
  });

  it("decodes multiple directives and preserves order", () => {
    const input = "script-src='self',https://example.com;style-src='self','unsafe-inline',https://cdn.example.com;";

    const result = decodeFromString(input);

    expect(result.directives["script-src"]).toEqual(["'self'", BS.Url.make("https://example.com")]);
    expect(result.directives["style-src"]).toEqual([
      "'self'",
      "'unsafe-inline'",
      BS.Url.make("https://cdn.example.com"),
    ]);
  });

  it("normalizes whitespace before decoding", () => {
    const input = "script-src='self', https://example.com;style-src='self' , 'none';";
    const result = decodeFromString(input);

    expect(result.directives["script-src"]).toEqual(["'self'", BS.Url.make("https://example.com")]);
    expect(result.directives["style-src"]).toEqual(["'self'", "'none'"]);
  });

  it("throws if a directive appears multiple times", () => {
    const input = "script-src='self';script-src='self',https://example.com;";

    expect(() => decodeFromString(input)).toThrow(/Duplicate CSP directive detected: script-src/);
  });

  it("throws for directives missing the trailing policy delimiter", () => {
    const input = "script-src='self',https://example.com";

    expect(() => decodeFromString(input)).toThrow();
  });

  it("throws when the default 'self' value is missing", () => {
    const input = "script-src=https://example.com;";

    expect(() => decodeFromString(input)).toThrow(/must start with 'self'/);
  });

  it("throws when additional values contain invalid urls", () => {
    const input = "script-src='self',notaurl;";

    expect(() => decodeFromString(input)).toThrow();
  });

  it("encodes a CSP struct into a normalized policy string", () => {
    const struct = {
      directives: {
        "script-src": ["'self'", BS.Url.make("https://example.com")],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    } as const;

    const encoded = encodeFromStruct(struct);

    expect(encoded).toBe("script-src='self',https://example.com;style-src='self','unsafe-inline';");
  });

  it("throws when encoding a directive whose values do not start with 'self'", () => {
    const struct = {
      directives: {
        "script-src": [BS.Url.make("https://example.com"), "'self'"],
      },
    } as const;

    expect(() => encodeFromStruct(struct)).toThrow(/must start with 'self'/);
  });

  it("throws when encoding an invalid directive value", () => {
    const struct = {
      directives: {
        "script-src": ["'self'", "notaurl"],
      },
    } as const;
    // @ts-expect-error
    expect(() => encodeFromStruct(struct)).toThrow();
  });

  it("roundtrips a complex policy through encode and decode", () => {
    const struct = {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", BS.Url.make("https://example.com"), BS.Url.make("https://cdn.example.com")],
        "style-src": ["'self'", "'unsafe-inline'", BS.Url.make("https://fonts.googleapis.com")],
        "img-src": ["'self'", "data:", BS.Url.make("https://images.example.com")],
      },
    } as const;

    const encoded = encodeFromStruct(struct);
    const decoded = decodeFromString(encoded);

    expect(decoded.directives["default-src"]).toEqual(["'self'"]);
    expect(decoded.directives["script-src"]).toEqual([
      "'self'",
      BS.Url.make("https://example.com"),
      BS.Url.make("https://cdn.example.com"),
    ]);
    expect(decoded.directives["style-src"]).toEqual([
      "'self'",
      "'unsafe-inline'",
      BS.Url.make("https://fonts.googleapis.com"),
    ]);
    expect(decoded.directives["img-src"]).toEqual(["'self'", "data:", BS.Url.make("https://images.example.com")]);
  });
});

describe("CSPString", () => {
  it("decodes to directive parts and encodes back to the original normalized string", () => {
    const input = "script-src='self', https://example.com;";
    const directiveParts = decodeStringSchema(input);

    expect(directiveParts).toHaveLength(1);
    expect(directiveParts[0][0]).toBe("script-src");

    const normalized = encodeStringSchema(directiveParts);
    expect(normalized).toBe("script-src='self',https://example.com;");
  });

  it("throws during decoding when encountering an unknown directive", () => {
    const input = "unknown-directive='self';";

    expect(() => decodeStringSchema(input)).toThrow();
  });
});
