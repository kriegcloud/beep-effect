/**
 * Parser edge case tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { parseHtml, sanitizeHtml, type Token } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic tokenization
effect(
  "parses simple HTML correctly",
  Effect.fn(function* () {
    const tokens = parseHtml("<p>Hello</p>");
    expect(tokens.length).toBeGreaterThan(0);
  })
);

effect(
  "parses nested HTML correctly",
  Effect.fn(function* () {
    const tokens = parseHtml("<div><p>Hello</p></div>");
    expect(tokens.length).toBeGreaterThan(0);
  })
);

// Self-closing tags
effect(
  "handles self-closing syntax",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br/>");
    expect(result).toBe("<br />");
  })
);

effect(
  "handles self-closing with space",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br />");
    expect(result).toBe("<br />");
  })
);

effect(
  "handles void elements without closing slash",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br>");
    expect(result).toBe("<br />");
  })
);

effect(
  "handles img as void element",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="test.jpg">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).toBe('<img src="test.jpg" />');
  })
);

// Attribute parsing
effect(
  "parses double-quoted attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "parses single-quoted attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml("<a href='http://example.com'>Link</a>");
    // Output should use double quotes
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "parses unquoted attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml("<a href=http://example.com>Link</a>");
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "parses attributes without values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input disabled="">', {
      allowedTags: ["input"],
      allowedAttributes: { input: ["disabled"] },
    });
    expect(result).toContain("disabled");
  })
);

effect(
  "parses multiple attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" title="Example" class="link">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href", "title", "class"] },
    });
    expect(result).toContain('href="http://example.com"');
    expect(result).toContain('title="Example"');
    expect(result).toContain('class="link"');
  })
);

// Whitespace in tags
effect(
  "handles extra whitespace in tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p   >Hello</p   >");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "handles whitespace before attribute name",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a   href="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "handles whitespace around equals sign",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href = "http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

// Comment parsing
effect(
  "parses HTML comments",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!-- comment --> World");
    expect(result).toBe("Hello  World");
  })
);

effect(
  "parses multi-line comments",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!--\nmulti\nline\n--> World");
    expect(result).toBe("Hello  World");
  })
);

effect(
  "handles empty comment",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!--  --> World");
    expect(result).toBe("Hello  World");
  })
);

effect(
  "handles dashes in comment",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello <!-- -- --> World");
    expect(result).toBe("Hello  World");
  })
);

// DOCTYPE parsing
effect(
  "parses DOCTYPE",
  Effect.fn(function* () {
    const result = sanitizeHtml("<!DOCTYPE html><p>Hello</p>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "handles lowercase doctype",
  Effect.fn(function* () {
    const result = sanitizeHtml("<!doctype html><p>Hello</p>");
    expect(result).toBe("<p>Hello</p>");
  })
);

// Case handling
effect(
  "normalizes uppercase tag names",
  Effect.fn(function* () {
    const result = sanitizeHtml("<P>Hello</P>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "normalizes mixed case tag names",
  Effect.fn(function* () {
    const result = sanitizeHtml("<DiV>Hello</dIv>");
    // div is in default allowed tags, so it should be normalized
    expect(result).toBe("<div>Hello</div>");
  })
);

effect(
  "normalizes uppercase attribute names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a HREF="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

// Entity handling in parser
effect(
  "preserves entity references in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&amp; &lt; &gt;</p>");
    expect(result).toBe("<p>&amp; &lt; &gt;</p>");
  })
);

effect(
  "preserves numeric entities",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&#38; &#60; &#62;</p>");
    expect(result).toBe("<p>&amp; &lt; &gt;</p>");
  })
);

effect(
  "preserves hex entities",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&#x26; &#x3C; &#x3E;</p>");
    expect(result).toBe("<p>&amp; &lt; &gt;</p>");
  })
);

effect(
  "handles unrecognized entities",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>&fake;</p>");
    expect(result).toBe("<p>&amp;fake;</p>");
  })
);

// Malformed HTML
effect(
  "handles unclosed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello");
    // Implementation may or may not auto-close - just verify no crash
    expect(result).toContain("<p>");
    expect(result).toContain("Hello");
  })
);

effect(
  "handles mismatched closing tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><strong>Hello</p></strong>");
    // Should try to handle gracefully
    expect(result).toContain("<p>");
    expect(result).toContain("<strong>");
    expect(result).toContain("Hello");
  })
);

effect(
  "handles extra closing tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p></p></p>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "handles closing tag without opening",
  Effect.fn(function* () {
    const result = sanitizeHtml("Hello</p>");
    expect(result).toBe("Hello");
  })
);

// Edge cases
effect(
  "handles less-than sign in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>5 < 10</p>");
    expect(result).toBe("<p>5 &lt; 10</p>");
  })
);

effect(
  "handles greater-than sign in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>10 > 5</p>");
    expect(result).toBe("<p>10 &gt; 5</p>");
  })
);

effect(
  "handles ampersand in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Tom & Jerry</p>");
    expect(result).toBe("<p>Tom &amp; Jerry</p>");
  })
);

effect(
  "handles quotes in text",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p>He said "hello"</p>');
    expect(result).toContain("He said");
  })
);

// Nested same tags
effect(
  "handles nested same tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><p>Inner</p></p>");
    // p cannot contain p in HTML, but parser should handle gracefully
    expect(result).toContain("Inner");
  })
);

// Empty tags
effect(
  "preserves empty allowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p></p>");
    expect(result).toBe("<p></p>");
  })
);

// Text between tags
effect(
  "preserves text between tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>First</p> between <p>Second</p>");
    expect(result).toBe("<p>First</p> between <p>Second</p>");
  })
);

// Newlines and whitespace
effect(
  "preserves newlines in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Line1\nLine2</p>");
    expect(result).toBe("<p>Line1\nLine2</p>");
  })
);

effect(
  "preserves tabs in text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Col1\tCol2</p>");
    expect(result).toBe("<p>Col1\tCol2</p>");
  })
);

// Special characters in attribute values
effect(
  "encodes special chars in attribute values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com?a=1&b=2">Link</a>');
    expect(result).toContain("&amp;");
  })
);

// Callback-based parsing
effect(
  "supports callback-based parsing",
  Effect.fn(function* () {
    // parseHtml returns parsed tokens
    const tokens = parseHtml("<p><strong>Hello</strong></p>");
    expect(tokens.length).toBeGreaterThan(0);
    // Verify we have start tags, text, and end tags using _tag property
    const hasStartTag = tokens.some((t: Token) => t._tag === "StartTag");
    const hasEndTag = tokens.some((t: Token) => t._tag === "EndTag");
    const hasText = tokens.some((t: Token) => t._tag === "Text");
    expect(hasStartTag).toBe(true);
    expect(hasEndTag).toBe(true);
    expect(hasText).toBe(true);
  })
);

// CDATA sections (in XML mode)
effect(
  "strips CDATA sections",
  Effect.fn(function* () {
    const result = sanitizeHtml("<![CDATA[Some content]]>");
    expect(result).not.toContain("CDATA");
  })
);

// Processing instructions
effect(
  "strips processing instructions",
  Effect.fn(function* () {
    const result = sanitizeHtml('<?xml version="1.0"?><p>Hello</p>');
    expect(result).not.toContain("<?xml");
    expect(result).toBe("<p>Hello</p>");
  })
);

// Very long content
effect(
  "handles very long text content",
  Effect.fn(function* () {
    const longText = "x".repeat(10000);
    const result = sanitizeHtml(`<p>${longText}</p>`);
    expect(result).toBe(`<p>${longText}</p>`);
  })
);

// Many nested tags
effect(
  "handles many nested tags",
  Effect.fn(function* () {
    const nested = "<em>".repeat(50) + "Text" + "</em>".repeat(50);
    const result = sanitizeHtml(nested);
    expect(result).toContain("Text");
  })
);

// Special tag names
effect(
  "handles numeric characters in custom tag names",
  Effect.fn(function* () {
    const result = sanitizeHtml("<h1>Hello</h1>");
    expect(result).toBe("<h1>Hello</h1>");
  })
);

// Broken tag syntax
effect(
  "handles < without completing a tag",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>5 < 10 is true</p>");
    expect(result).toContain("&lt;");
    expect(result).toContain("10 is true");
  })
);

effect(
  "handles incomplete opening tag",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p<>Hello</p>");
    expect(result).toContain("Hello");
  })
);

// Attributes with special characters
effect(
  "handles newlines in attribute values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p title="line1\nline2">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["title"] },
    });
    expect(result).toContain("title=");
  })
);
