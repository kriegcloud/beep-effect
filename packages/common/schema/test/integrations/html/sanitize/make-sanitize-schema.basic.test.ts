import { describe, expect } from "bun:test";
import {
  AllowedAttributes,
  AllowedTags,
  makeSanitizeSchema,
  type SanitizeConfig,
  type SanitizedHtml,
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

describe("makeSanitizeSchema - Basic", () => {
  describe("plain text handling", () => {
    effect(
      "passes through plain text unchanged",
      Effect.fn(function* () {
        const Sanitize = createSanitizer();
        const result = yield* S.decode(Sanitize)("Hello, World!");
        expect(result).toBe("Hello, World!" as SanitizedHtml);
      })
    );

    effect(
      "handles empty string",
      Effect.fn(function* () {
        const Sanitize = createSanitizer();
        const result = yield* S.decode(Sanitize)("");
        expect(result).toBe("" as SanitizedHtml);
      })
    );

    effect(
      "handles whitespace-only string",
      Effect.fn(function* () {
        const Sanitize = createSanitizer();
        const result = yield* S.decode(Sanitize)("   ");
        expect(result).toBe("   " as SanitizedHtml);
      })
    );

    effect(
      "preserves newlines in text",
      Effect.fn(function* () {
        const Sanitize = createSanitizer();
        const result = yield* S.decode(Sanitize)("Line 1\nLine 2\nLine 3");
        expect(result).toBe("Line 1\nLine 2\nLine 3" as SanitizedHtml);
      })
    );
  });

  describe("HTML entity handling", () => {
    effect(
      "preserves HTML entities in text",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>&amp; &lt; &gt;</p>");
        expect(result).toBe("<p>&amp; &lt; &gt;</p>" as SanitizedHtml);
      })
    );

    effect(
      "handles numeric entities",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>&#60; &#62;</p>");
        expect(result).toBe("<p>&lt; &gt;</p>" as SanitizedHtml);
      })
    );

    effect(
      "handles hex entities",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>&#x3C; &#x3E;</p>");
        expect(result).toBe("<p>&lt; &gt;</p>" as SanitizedHtml);
      })
    );

    effect(
      "escapes unencoded angle brackets in text",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.none(),
        });
        const result = yield* S.decode(Sanitize)("5 < 10 and 10 > 5");
        expect(result).toContain("&lt;");
        expect(result).toContain("&gt;");
      })
    );
  });

  describe("tag allowlisting", () => {
    effect(
      "allows configured tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "strong", "em"]),
        });
        const result = yield* S.decode(Sanitize)("<p><strong>Bold</strong> and <em>italic</em></p>");
        expect(result).toBe("<p><strong>Bold</strong> and <em>italic</em></p>" as SanitizedHtml);
      })
    );

    effect(
      "strips disallowed tags but keeps content",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p><span>Keep this text</span></p>");
        expect(result).toBe("<p>Keep this text</p>" as SanitizedHtml);
      })
    );

    effect(
      "allows all tags when configured",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.all(),
          allowedAttributes: AllowedAttributes.none(),
        });
        const result = yield* S.decode(Sanitize)("<div><custom-tag>Content</custom-tag></div>");
        expect(result).toContain("<div>");
        expect(result).toContain("<custom-tag>");
      })
    );

    effect(
      "removes all tags when none allowed",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.none(),
        });
        const result = yield* S.decode(Sanitize)("<p>Just <strong>text</strong></p>");
        expect(result).toBe("Just text" as SanitizedHtml);
      })
    );
  });

  describe("nesting", () => {
    effect(
      "handles deeply nested allowed tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div", "p", "span"]),
        });
        const result = yield* S.decode(Sanitize)("<div><p><span>Nested</span></p></div>");
        expect(result).toBe("<div><p><span>Nested</span></p></div>" as SanitizedHtml);
      })
    );

    effect(
      "respects nesting limits when configured",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          nestingLimit: 2,
        });
        const result = yield* S.decode(Sanitize)("<div><div><div><div>Deep</div></div></div></div>");
        // Content beyond nesting limit should be flattened
        expect(result).not.toContain("<div><div><div><div>");
      })
    );
  });

  describe("self-closing tags", () => {
    effect(
      "handles self-closing tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["br", "hr", "img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src", "alt"],
          }),
        });
        const result = yield* S.decode(Sanitize)("<br /><hr />");
        expect(result).toContain("br");
        expect(result).toContain("hr");
      })
    );

    effect(
      "preserves void elements",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "br"]),
        });
        const result = yield* S.decode(Sanitize)("<p>Line 1<br>Line 2</p>");
        expect(result).toContain("<br");
      })
    );
  });

  describe("edge cases", () => {
    effect(
      "handles malformed HTML gracefully",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>Unclosed paragraph");
        expect(result).toContain("Unclosed paragraph");
      })
    );

    effect(
      "handles mismatched tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "div"]),
        });
        const result = yield* S.decode(Sanitize)("<p>Start<div>Middle</p>End</div>");
        // Should handle gracefully without throwing
        expect(typeof result).toBe("string");
      })
    );

    effect(
      "handles comments",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>Before<!-- comment -->After</p>");
        expect(result).not.toContain("<!--");
        expect(result).not.toContain("-->");
        expect(result).toContain("Before");
        expect(result).toContain("After");
      })
    );

    effect(
      "handles CDATA sections",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p><![CDATA[Some content]]></p>");
        expect(result).not.toContain("CDATA");
      })
    );
  });

  describe("schema output type", () => {
    effect(
      "produces branded SanitizedHtml type",
      Effect.fn(function* () {
        const Sanitize = createSanitizer();
        const result = yield* S.decode(Sanitize)("<p>Test</p>");
        // The result should be usable as a string
        expect(typeof result).toBe("string");
        // But it's branded as SanitizedHtml
        expect(result).toContain("Test");
      })
    );
  });
});
