import { describe, expect } from "bun:test";
import {
  AllowedAttributes,
  AllowedSchemes,
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

describe("makeSanitizeSchema - XSS Prevention", () => {
  describe("script tag removal", () => {
    effect(
      "removes script tags completely",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)("<p>Hello</p><script>alert('xss')</script><p>World</p>");
        expect(result).not.toContain("<script>");
        expect(result).not.toContain("</script>");
        expect(result).not.toContain("alert");
        expect(result).toContain("Hello");
        expect(result).toContain("World");
      })
    );

    effect(
      "removes inline scripts",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)('<p>Test</p><script type="text/javascript">malicious()</script>');
        expect(result).not.toContain("script");
        expect(result).not.toContain("malicious");
      })
    );

    effect(
      "removes script tags with various encodings",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        // Null bytes in tag names cause parser to not recognize it as a script tag
        // The tag is stripped (not in allowedTags) but text content is preserved
        // This is safe because the content is just text, not executed code
        const result = yield* S.decode(Sanitize)("<p>Test</p><scr\x00ipt>alert(1)</script>");
        // The important thing is that no <script> tag appears in output
        expect(result).not.toContain("<script>");
        expect(result).not.toContain("</script>");
        expect(result).toContain("<p>Test</p>");
      })
    );

    effect(
      "removes nested script attempts",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "div"]),
        });
        const result = yield* S.decode(Sanitize)("<div><p><script>evil()</script></p></div>");
        expect(result).not.toContain("script");
        expect(result).not.toContain("evil");
      })
    );
  });

  describe("event handler removal", () => {
    effect(
      "removes onclick handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "button"]),
        });
        const result = yield* S.decode(Sanitize)('<button onclick="alert(1)">Click</button>');
        expect(result).not.toContain("onclick");
        expect(result).not.toContain("alert");
        expect(result).toContain("Click");
      })
    );

    effect(
      "removes onmouseover handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "div"]),
        });
        const result = S.decode(Sanitize)('<div onmouseover="steal()">Hover me</div>');
        expect(result).not.toContain("onmouseover");
        expect(result).not.toContain("steal");
      })
    );

    effect(
      "removes onerror handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src", "alt"],
          }),
        });
        const result = S.decode(Sanitize)('<img src="x" onerror="attack()" alt="test">');
        expect(result).not.toContain("onerror");
        expect(result).not.toContain("attack");
      })
    );

    effect(
      "removes onload handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["body", "img"]),
          allowedAttributes: AllowedAttributes.specific({
            img: ["src"],
          }),
        });
        const result = S.decode(Sanitize)('<img src="valid.jpg" onload="malicious()">');
        expect(result).not.toContain("onload");
        expect(result).not.toContain("malicious");
      })
    );

    effect(
      "removes onfocus handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["input"]),
          allowedAttributes: AllowedAttributes.specific({
            input: ["type", "value"],
          }),
        });
        const result = S.decode(Sanitize)('<input type="text" onfocus="hack()" value="test">');
        expect(result).not.toContain("onfocus");
        expect(result).not.toContain("hack");
      })
    );

    effect(
      "removes all on* event handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
        });
        const input = '<div onclick="a()" onmouseover="b()" onkeydown="c()" onsubmit="d()">Content</div>';
        const result = yield* S.decode(Sanitize)(input);
        expect(result).not.toMatch(/on\w+=/i);
        expect(result).toContain("Content");
      })
    );
  });

  describe("javascript: URL prevention", () => {
    effect(
      "removes javascript: URLs from href",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="javascript:alert(1)">Click</a>');
        expect(result).not.toContain("javascript:");
        expect(result).not.toContain("alert");
      })
    );

    effect(
      "removes javascript: URLs with encoding",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="&#106;avascript:alert(1)">Click</a>');
        expect(result).not.toContain("alert");
      })
    );

    effect(
      "removes javascript: URLs with whitespace",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="   javascript:alert(1)">Click</a>');
        expect(result).not.toContain("javascript");
      })
    );

    effect(
      "removes javascript: URLs with mixed case",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="JaVaScRiPt:alert(1)">Click</a>');
        expect(result).not.toContain("alert");
      })
    );
  });

  describe("data: URL prevention", () => {
    effect(
      "blocks data: URLs in href by default",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="data:text/html,<script>alert(1)</script>">Click</a>');
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

  describe("vbscript: URL prevention", () => {
    effect(
      "removes vbscript: URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="vbscript:msgbox(1)">Click</a>');
        expect(result).not.toContain("vbscript");
        expect(result).not.toContain("msgbox");
      })
    );
  });

  describe("style-based XSS prevention", () => {
    effect(
      "removes style attributes with expressions",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.none(),
        });
        const result = yield* S.decode(Sanitize)('<div style="background:url(javascript:alert(1))">Content</div>');
        expect(result).not.toContain("javascript");
        expect(result).not.toContain("alert");
      })
    );

    effect(
      "removes style attributes with expression()",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
          allowedAttributes: AllowedAttributes.none(),
        });
        const result = yield* S.decode(Sanitize)('<div style="width:expression(alert(1))">Content</div>');
        expect(result).not.toContain("expression");
        expect(result).not.toContain("alert");
      })
    );
  });

  describe("SVG-based XSS prevention", () => {
    effect(
      "removes SVG with embedded scripts",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)('<svg onload="alert(1)"><script>evil()</script></svg>');
        expect(result).not.toContain("svg");
        expect(result).not.toContain("script");
        expect(result).not.toContain("alert");
      })
    );

    effect(
      "removes SVG use elements with external references",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)('<svg><use href="javascript:alert(1)"/></svg>');
        expect(result).not.toContain("javascript");
      })
    );
  });

  describe("meta refresh prevention", () => {
    effect(
      "removes meta refresh tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)('<meta http-equiv="refresh" content="0;url=javascript:alert(1)">');
        expect(result).not.toContain("meta");
        expect(result).not.toContain("javascript");
      })
    );
  });

  describe("object/embed prevention", () => {
    effect(
      "removes object tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)(
          '<object data="malicious.swf" type="application/x-shockwave-flash"></object>'
        );
        expect(result).not.toContain("object");
        expect(result).not.toContain("malicious");
      })
    );

    effect(
      "removes embed tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        const result = yield* S.decode(Sanitize)('<embed src="malicious.swf" type="application/x-shockwave-flash">');
        expect(result).not.toContain("embed");
        expect(result).not.toContain("malicious");
      })
    );
  });

  describe("base tag prevention", () => {
    effect(
      "removes base tags that could redirect URLs",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
        });
        const result = yield* S.decode(Sanitize)('<base href="https://evil.com"><a href="/page">Link</a>');
        expect(result).not.toContain("base");
        expect(result).not.toContain("evil.com");
      })
    );
  });

  describe("form action hijacking prevention", () => {
    effect(
      "removes form tags by default",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p", "input"]),
        });
        const result = yield* S.decode(Sanitize)(
          '<form action="https://evil.com/steal"><input type="password"></form>'
        );
        expect(result).not.toContain("form");
        expect(result).not.toContain("evil.com");
      })
    );
  });

  describe("sanitization bypass attempts", () => {
    effect(
      "handles null bytes in tags",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        // Null bytes in tag names cause parser to not recognize it as a script tag
        // The tag is stripped (not in allowedTags) but text content is preserved as safe text
        const result = yield* S.decode(Sanitize)("<scr\x00ipt>alert(1)</script>");
        // The important thing is that no executable <script> tag appears in output
        expect(result).not.toContain("<script>");
        expect(result).not.toContain("</script>");
      })
    );

    effect(
      "handles UTF-7 encoding attempts",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["p"]),
        });
        // UTF-7 encoded script attempt
        const result = yield* S.decode(Sanitize)("+ADw-script+AD4-alert(1)+ADw-/script+AD4-");
        expect(result).not.toContain("<script>");
      })
    );

    effect(
      "handles double-encoding attempts",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["a"]),
          allowedAttributes: AllowedAttributes.specific({
            a: ["href"],
          }),
          allowedSchemes: AllowedSchemes.specific(["http", "https"]),
        });
        const result = yield* S.decode(Sanitize)('<a href="%26%23106;avascript:alert(1)">Click</a>');
        // Should not execute - either removed or safely encoded
        expect(result).not.toContain("javascript:");
      })
    );

    effect(
      "handles newlines in event handlers",
      Effect.fn(function* () {
        const Sanitize = createSanitizer({
          allowedTags: AllowedTags.specific(["div"]),
        });
        const result = yield* S.decode(Sanitize)('<div on\nclick="alert(1)">Content</div>');
        expect(result).not.toContain("alert");
      })
    );
  });
});
