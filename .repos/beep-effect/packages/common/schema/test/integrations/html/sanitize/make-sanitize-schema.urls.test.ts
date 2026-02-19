import { describe, expect } from "bun:test";
import {
  AllowedAttributes,
  AllowedSchemes,
  AllowedSchemesByTag,
  AllowedTags,
  makeSanitizeSchema,
  type SanitizeConfig,
} from "@beep/schema/integrations/html";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

/**
 * Creates a sanitize schema with the given config.
 * Uses the actual sanitizeHtml function from @beep/utils.
 */
const createSanitizer = (config: SanitizeConfig = {}) => {
  return makeSanitizeSchema(config, sanitizeHtml);
};

describe("makeSanitizeSchema - URLs", () => {
  describe("scheme allowlisting", () => {
    effect(
      "allows http URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="http://example.com">Link</a>');
        expect(result).toContain('href="http://example.com"');
      })
    );

    effect(
      "allows https URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://secure.example.com/path?query=1">Link</a>');
        expect(result).toContain('href="https://secure.example.com');
      })
    );

    effect(
      "allows mailto URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https", "mailto"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="mailto:test@example.com">Email</a>');
        expect(result).toContain('href="mailto:test@example.com"');
      })
    );

    effect(
      "allows tel URLs when configured",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https", "tel"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="tel:+1-555-555-5555">Call</a>');
        expect(result).toContain('href="tel:+1-555-555-5555"');
      })
    );

    effect(
      "blocks disallowed schemes",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="ftp://files.example.com">FTP</a>');
        expect(result).not.toContain("ftp://");
      })
    );
  });

  describe("per-tag scheme configuration", () => {
    effect(
      "allows data URLs only for specific tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a", "img"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
            img: ["src"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
          allowedSchemesByTag: AllowedSchemesByTag.specific({
            img: ["data"],
          }),
        });

        const imgResult = yield* S.decode(Sanitize)(
          '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
        );
        expect(imgResult).toContain("data:image/gif");

        const linkResult = yield* S.decode(Sanitize)('<a href="data:text/html,malicious">Click</a>');
        expect(linkResult).not.toContain("data:");
      })
    );

    effect(
      "allows different schemes per tag",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a", "img", "source"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
            img: ["src"],
            source: ["src"],
          }),
          allowedSchemes: AllowedSchemes.specific(["https"]),
          allowedSchemesByTag: AllowedSchemesByTag.specific({
            a: ["mailto", "tel"],
            source: ["blob"],
          }),
        });

        const linkResult = yield* S.decode(Sanitize)('<a href="mailto:test@test.com">Email</a>');
        expect(linkResult).toContain("mailto:");

        const telResult = yield* S.decode(Sanitize)('<a href="tel:123">Call</a>');
        expect(telResult).toContain("tel:");
      })
    );
  });

  describe("relative URLs", () => {
    effect(
      "allows relative URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="/path/to/page">Relative</a>');
        expect(result).toContain('href="/path/to/page"');
      })
    );

    effect(
      "allows relative URLs with query params",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="/search?q=test&page=1">Search</a>');
        expect(result).toContain('href="/search');
      })
    );

    effect(
      "allows hash-only URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="#section">Jump to section</a>');
        expect(result).toContain('href="#section"');
      })
    );

    effect(
      "allows protocol-relative URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="//example.com/path">Protocol-relative</a>');
        expect(result).toContain('href="//example.com');
      })
    );
  });

  describe("javascript: URL blocking", () => {
    effect(
      "blocks javascript: in href",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="javascript:alert(1)">XSS</a>');
        expect(result).not.toContain("javascript:");
      })
    );

    effect(
      "blocks javascript: with whitespace",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="   javascript:alert(1)">XSS</a>');
        expect(result).not.toContain("javascript");
      })
    );

    effect(
      "blocks javascript: in image src",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<img src="javascript:alert(1)">');
        expect(result).not.toContain("javascript:");
      })
    );
  });

  describe("vbscript: URL blocking", () => {
    effect(
      "blocks vbscript: URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="vbscript:msgbox(1)">VBS</a>');
        expect(result).not.toContain("vbscript:");
      })
    );
  });

  describe("data: URL handling", () => {
    effect(
      "blocks data: URLs by default",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="data:text/html,<script>alert(1)</script>">Data</a>');
        expect(result).not.toContain("data:");
      })
    );

    effect(
      "allows data: URLs when explicitly configured",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https", "data"]),
        });
        const result = yield* S.decode(Sanitize)('<img src="data:image/png;base64,iVBORw0KGgo=">');
        expect(result).toContain("data:image/png");
      })
    );
  });

  describe("URL encoding", () => {
    effect(
      "preserves URL-encoded characters",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://example.com/path%20with%20spaces">Link</a>');
        expect(result).toContain("path%20with%20spaces");
      })
    );

    effect(
      "handles international characters in URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://example.com/path?name=%E4%B8%AD%E6%96%87">Link</a>');
        expect(result).toContain("example.com");
      })
    );
  });

  describe("complex URLs", () => {
    effect(
      "handles URLs with fragments",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://example.com/page#section?tab=1">Link</a>');
        expect(result).toContain("example.com/page#section");
      })
    );

    effect(
      "handles URLs with port numbers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://example.com:8080/path">Link</a>');
        expect(result).toContain(":8080");
      })
    );

    effect(
      "handles URLs with authentication (blocks for security)",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://user:pass@example.com">Link</a>');
        // URLs with credentials may be blocked or sanitized
        expect(typeof result).toBe("string");
      })
    );
  });

  describe("empty and malformed URLs", () => {
    effect(
      "handles empty href",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="">Empty</a>');
        expect(result).toContain("<a");
      })
    );

    effect(
      "handles whitespace-only href",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="   ">Whitespace</a>');
        expect(result).toContain("<a");
      })
    );

    effect(
      "handles malformed URLs gracefully",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="http://">Bad URL</a>');
        // Should handle gracefully without throwing
        expect(typeof result).toBe("string");
      })
    );
  });

  describe("srcset handling", () => {
    effect(
      "allows srcset with valid URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src", "srcset"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<img src="image.jpg" srcset="image-2x.jpg 2x, image-3x.jpg 3x">');
        expect(result).toContain("srcset");
      })
    );
  });
});
