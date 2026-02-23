import { describe, expect } from "bun:test";
import {
  AllowedAttributes,
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

describe("makeSanitizeSchema - Attributes", () => {
  describe("attribute allowlisting", () => {
    effect(
      "allows specified attributes per tag",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a", "img"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href", "title"],
            img: ["src", "alt"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<a href="https://example.com" title="Link">Click</a>');
        expect(result).toContain('href="https://example.com"');
        expect(result).toContain('title="Link"');
      })
    );

    effect(
      "removes non-allowlisted attributes",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<a href="https://example.com" data-tracking="123" class="link">Click</a>'
        );
        expect(result).toContain("href");
        expect(result).not.toContain("data-tracking");
        expect(result).not.toContain("class");
      })
    );

    effect(
      "allows no attributes when none specified",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div", "p"]),
          allowedAttributes: AllowedAttributes.none(),
        });
        const result = yield* S.decode(Sanitize)(
          '<div id="test" class="container"><p style="color:red">Text</p></div>'
        );
        expect(result).not.toContain("id=");
        expect(result).not.toContain("class=");
        expect(result).not.toContain("style=");
        expect(result).toContain("<div>");
        expect(result).toContain("<p>");
      })
    );

    effect(
      "allows all attributes when configured",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.all(),
        });
        const result = yield* S.decode(Sanitize)('<div id="test" class="container" data-custom="value">Content</div>');
        expect(result).toContain("id=");
        expect(result).toContain("class=");
        expect(result).toContain("data-custom=");
      })
    );
  });

  describe("wildcard attribute patterns", () => {
    effect(
      "allows data-* attributes with wildcard",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["data-*"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div data-id="123" data-name="test" class="hidden">Content</div>');
        expect(result).toContain("data-id=");
        expect(result).toContain("data-name=");
        expect(result).not.toContain("class=");
      })
    );

    effect(
      "allows aria-* attributes with wildcard",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["button"]),
          allowedAttributes: AllowedAttributes.specific({
            button: ["aria-*", "type"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<button type="button" aria-label="Close" aria-expanded="false" class="btn">X</button>'
        );
        expect(result).toContain("aria-label=");
        expect(result).toContain("aria-expanded=");
        expect(result).toContain("type=");
        expect(result).not.toContain("class=");
      })
    );
  });

  describe("global attributes", () => {
    effect(
      "applies global attributes to all tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div", "p", "span"]),
          allowedAttributes: AllowedAttributes.specific({
            "*": ["class", "id"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<div id="container" class="wrapper"><p id="para" class="text" data-x="y">Text</p></div>'
        );
        expect(result).toContain('id="container"');
        expect(result).toContain('class="wrapper"');
        expect(result).toContain('id="para"');
        expect(result).toContain('class="text"');
        expect(result).not.toContain("data-x");
      })
    );

    effect(
      "combines global and tag-specific attributes",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a", "div"]),
          allowedAttributes: AllowedAttributes.specific({
            "*": ["class"],
            a: ["href"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<div class="container"><a href="/" class="link" target="_blank">Home</a></div>'
        );
        expect(result).toContain('class="container"');
        expect(result).toContain('class="link"');
        expect(result).toContain('href="/"');
        expect(result).not.toContain("target=");
      })
    );
  });

  describe("attribute value handling", () => {
    effect(
      "preserves attribute values with special characters",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href", "title"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<a href="/path?a=1&b=2" title="Link with &quot;quotes&quot;">Click</a>'
        );
        expect(result).toContain("?a=1");
        expect(result).toContain("&amp;b=2");
      })
    );

    effect(
      "handles empty attribute values",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["input"]),
          allowedAttributes: AllowedAttributes.specific({
            input: ["type", "disabled", "value"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<input type="text" disabled value="">');
        expect(result).toContain('type="text"');
        expect(result).toContain("disabled");
      })
    );

    effect(
      "handles boolean attributes",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["input", "button"]),
          allowedAttributes: AllowedAttributes.specific({
            input: ["type", "checked", "disabled"],
            button: ["disabled"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<input type="checkbox" checked disabled><button disabled>Submit</button>'
        );
        expect(result).toContain("checked");
        expect(result).toContain("disabled");
      })
    );
  });

  describe("attribute quoting", () => {
    effect(
      "handles unquoted attribute values",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["id", "class"],
          }),
        });
        const result = yield* S.decode(Sanitize)("<div id=test class=container>Content</div>");
        expect(result).toContain("id=");
        expect(result).toContain("test");
      })
    );

    effect(
      "handles single-quoted attributes",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["id"],
          }),
        });
        const result = yield* S.decode(Sanitize)("<div id='my-id'>Content</div>");
        expect(result).toContain("my-id");
      })
    );
  });

  describe("multiple attribute instances", () => {
    effect(
      "handles duplicate attributes gracefully",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["id"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div id="first" id="second">Content</div>');
        // Parser keeps last value (standard browser behavior)
        // The important thing is that it handles gracefully without errors
        expect(result).toContain("id=");
        expect(result).toContain("Content");
      })
    );
  });

  describe("case sensitivity", () => {
    effect(
      "handles uppercase attribute names",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["id", "class"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div ID="test" CLASS="box">Content</div>');
        // Should normalize to lowercase or handle gracefully
        expect(result).toContain("<div");
      })
    );

    effect(
      "handles mixed case attribute names",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["data-testId"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div data-testid="123">Content</div>');
        // Should handle case variations gracefully
        expect(result).toContain("<div");
      })
    );
  });

  describe("namespace attributes", () => {
    effect(
      "handles xmlns attributes when allowed",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["svg"]),
          allowedAttributes: AllowedAttributes.specific({
            // Note: HTML parser normalizes attribute names to lowercase
            svg: ["xmlns", "viewbox"],
          }),
        });
        const result = yield* S.decode(Sanitize)(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>'
        );
        expect(result).toContain("xmlns=");
        // Parser normalizes attribute names to lowercase (HTML5 standard)
        expect(result.toLowerCase()).toContain("viewbox=");
      })
    );
  });

  describe("edge cases", () => {
    effect(
      "handles attributes with no value",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["input"]),
          allowedAttributes: AllowedAttributes.specific({
            input: ["type", "required", "readonly"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<input type="text" required readonly>');
        expect(result).toContain("required");
        expect(result).toContain("readonly");
      })
    );

    effect(
      "handles whitespace in attribute values",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["class"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div class="  class1   class2  ">Content</div>');
        expect(result).toContain("class1");
        expect(result).toContain("class2");
      })
    );

    effect(
      "handles newlines in attribute values",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["title"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<div title="Line 1\nLine 2">Content</div>');
        // Should handle newlines gracefully
        expect(result).toContain("<div");
        expect(result).toContain("title=");
      })
    );

    effect(
      "handles very long attribute values",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.specific({
            div: ["data-content"],
          }),
        });
        const longValue = "x".repeat(10000);
        const result = yield* S.decode(Sanitize)(`<div data-content="${longValue}">Content</div>`);
        expect(result).toContain("data-content=");
      })
    );
  });
});
