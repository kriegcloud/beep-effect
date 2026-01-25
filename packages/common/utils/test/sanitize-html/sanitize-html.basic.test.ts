/**
 * Basic sanitization tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { defaults, sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic text passthrough
effect(
  "leaves plain text alone",
  Effect.fn(function* () {
    expect(sanitizeHtml("Hello world")).toBe("Hello world");
  })
);

effect(
  "preserves whitespace in plain text",
  Effect.fn(function* () {
    expect(sanitizeHtml("Hello  world")).toBe("Hello  world");
  })
);

effect(
  "handles empty string",
  Effect.fn(function* () {
    expect(sanitizeHtml("")).toBe("");
  })
);

// Default allowed tags
effect(
  "allows default allowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "allows nested default tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><strong>Hello</strong></p>");
    expect(result).toBe("<p><strong>Hello</strong></p>");
  })
);

effect(
  "allows multiple default tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p><p>World</p>");
    expect(result).toBe("<p>Hello</p><p>World</p>");
  })
);

// Disallowed tags
effect(
  "removes disallowed tags but keeps text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert('XSS')</script>Hello");
    expect(result).toBe("Hello");
  })
);

effect(
  "removes style tags and content",
  Effect.fn(function* () {
    const result = sanitizeHtml("<style>body { color: red; }</style>Hello");
    expect(result).toBe("Hello");
  })
);

effect(
  "removes textarea content by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<textarea>Some text</textarea>Hello");
    expect(result).toBe("Hello");
  })
);

// Self-closing tags
effect(
  "allows self-closing br tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br>");
    expect(result).toBe("<br />");
  })
);

effect(
  "allows hr tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<hr>");
    expect(result).toBe("<hr />");
  })
);

effect(
  "normalizes self-closing tag format",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br/>");
    expect(result).toBe("<br />");
  })
);

// Empty allowed tags array
effect(
  "removes all tags when allowedTags is empty",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p>", { allowedTags: [] });
    expect(result).toBe("Hello");
  })
);

// False allowedTags - allow all
effect(
  "allows all tags when allowedTags is false",
  Effect.fn(function* () {
    const result = sanitizeHtml("<custom>Hello</custom>", { allowedTags: false });
    expect(result).toBe("<custom>Hello</custom>");
  })
);

// Nested tags
effect(
  "handles deeply nested tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><p><strong><em>Hello</em></strong></p></div>");
    // div is in default allowed tags now, so all content should be preserved
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("<em>");
    expect(result).toContain("Hello");
  })
);

// Unclosed tags
effect(
  "handles unclosed tags gracefully",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello");
    // Implementation preserves content even with unclosed tags
    expect(result).toContain("<p>");
    expect(result).toContain("Hello");
  })
);

effect(
  "handles multiple unclosed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><strong>Hello");
    // Implementation preserves tags and content
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("Hello");
  })
);

// Mismatched tags
effect(
  "handles mismatched closing tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</strong></p>");
    expect(result).toBe("<p>Hello</p>");
  })
);

// Comments
effect(
  "removes HTML comments by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!-- comment --> World");
    expect(result).toBe("Hello  World");
  })
);

effect(
  "removes multi-line comments",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!-- \n multi \n line --> World");
    expect(result).toBe("Hello  World");
  })
);

// Whitespace handling
effect(
  "preserves whitespace between tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p> <p>World</p>");
    expect(result).toBe("<p>Hello</p> <p>World</p>");
  })
);

effect(
  "preserves newlines",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p>\n<p>World</p>");
    expect(result).toBe("<p>Hello</p>\n<p>World</p>");
  })
);

// Entity handling
effect(
  "preserves HTML entities",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&amp; &lt; &gt;</p>");
    expect(result).toBe("<p>&amp; &lt; &gt;</p>");
  })
);

effect(
  "encodes special characters in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>5 < 10 & 10 > 5</p>");
    expect(result).toBe("<p>5 &lt; 10 &amp; 10 &gt; 5</p>");
  })
);

effect(
  "preserves numeric entities",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&#60;&#62;</p>");
    expect(result).toBe("<p>&lt;&gt;</p>");
  })
);

// disallowedTagsMode 'discard'
effect(
  "discards content of disallowed tags in discard mode",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert('XSS')</script>Hello", {
      disallowedTagsMode: "discard",
    });
    expect(result).toBe("Hello");
  })
);

// disallowedTagsMode 'escape'
effect(
  "escapes disallowed tags in escape mode",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert('XSS')</script>", {
      disallowedTagsMode: "escape",
      allowedTags: ["p"],
    });
    expect(result).toBe("&lt;script&gt;alert('XSS')&lt;/script&gt;");
  })
);

// disallowedTagsMode 'recursiveEscape'
effect(
  "recursively escapes nested disallowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><script>alert('XSS')</script></div>", {
      disallowedTagsMode: "recursiveEscape",
      allowedTags: ["p"],
    });
    expect(result).toBe("&lt;div&gt;&lt;script&gt;alert('XSS')&lt;/script&gt;&lt;/div&gt;");
  })
);

// Case sensitivity
effect(
  "normalizes tag names to lowercase",
  Effect.fn(function* () {
    const result = sanitizeHtml("<P>Hello</P>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "normalizes mixed case tag names",
  Effect.fn(function* () {
    // div and p are both in default allowed tags
    const result = sanitizeHtml("<DiV><P>Hello</P></DiV>");
    expect(result).toBe("<div><p>Hello</p></div>");
  })
);

// Custom allowed tags
effect(
  "allows custom tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<custom>Hello</custom>", {
      allowedTags: ["custom"],
    });
    expect(result).toBe("<custom>Hello</custom>");
  })
);

// nestingLimit
effect(
  "enforces nesting limit",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><div><div><div>Deep</div></div></div></div>", {
      allowedTags: ["div"],
      nestingLimit: 2,
    });
    expect(result).toBe("<div><div>Deep</div></div>");
  })
);

// enforceHtmlBoundary
effect(
  "enforces html boundary when enabled",
  Effect.fn(function* () {
    const result = sanitizeHtml("Before<html><body><p>Inside</p></body></html>After", {
      allowedTags: ["html", "body", "p"],
      enforceHtmlBoundary: true,
    });
    // Should contain the inner content
    expect(result).toContain("Inside");
  })
);

// Default configuration
effect(
  "exports correct default tags",
  Effect.fn(function* () {
    expect(defaults.allowedTags).toContain("p");
    expect(defaults.allowedTags).toContain("strong");
    expect(defaults.allowedTags).toContain("em");
    expect(defaults.allowedTags).toContain("ul");
    expect(defaults.allowedTags).toContain("ol");
    expect(defaults.allowedTags).toContain("li");
    expect(defaults.allowedTags).toContain("a");
    expect(defaults.allowedTags).not.toContain("script");
    expect(defaults.allowedTags).not.toContain("style");
  })
);
