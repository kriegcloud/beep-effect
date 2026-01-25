/**
 * Attribute filtering tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic attribute handling
effect(
  "allows href attribute on anchor tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "removes disallowed attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" onclick="alert()">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "removes all attributes when none allowed",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo" id="bar">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: {},
    });
    expect(result).toBe("<p>Text</p>");
  })
);

// Specific attributes per tag
effect(
  "allows tag-specific attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" title="Title">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href", "title"],
      },
    });
    expect(result).toBe('<a href="http://example.com" title="Title">Link</a>');
  })
);

effect(
  "handles mixed allowed/disallowed attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" onclick="alert()" title="Title">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href", "title"],
      },
    });
    expect(result).toBe('<a href="http://example.com" title="Title">Link</a>');
  })
);

// Wildcard attributes
effect(
  "allows wildcard attributes with *",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo" id="bar">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: {
        "*": ["class", "id"],
      },
    });
    expect(result).toBe('<p class="foo" id="bar">Text</p>');
  })
);

effect(
  "merges wildcard and tag-specific attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a class="link" href="http://example.com">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        "*": ["class"],
        a: ["href"],
      },
    });
    expect(result).toBe('<a class="link" href="http://example.com">Link</a>');
  })
);

// Glob patterns for attributes
effect(
  "supports glob patterns for attribute names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div data-foo="1" data-bar="2" onclick="alert()">Text</div>', {
      allowedTags: ["div"],
      allowedAttributes: {
        div: ["data-*"],
      },
    });
    expect(result).toBe('<div data-foo="1" data-bar="2">Text</div>');
  })
);

effect(
  "supports multiple glob patterns",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div aria-label="Label" data-id="1" onclick="alert()">Text</div>', {
      allowedTags: ["div"],
      allowedAttributes: {
        div: ["aria-*", "data-*"],
      },
    });
    expect(result).toBe('<div aria-label="Label" data-id="1">Text</div>');
  })
);

// Attribute value restrictions
effect(
  "allows attributes with value restrictions",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="image.jpg" alt="Image">', {
      allowedTags: ["img"],
      allowedAttributes: {
        img: [{ name: "src", values: ["image.jpg", "photo.png"] }, "alt"],
      },
    });
    expect(result).toBe('<img src="image.jpg" alt="Image" />');
  })
);

effect(
  "removes attributes with disallowed values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="evil.jpg" alt="Image">', {
      allowedTags: ["img"],
      allowedAttributes: {
        img: [{ name: "src", values: ["good.jpg"] }, "alt"],
      },
    });
    expect(result).toBe('<img alt="Image" />');
  })
);

// Multiple values for allowed attributes
effect(
  "allows multiple attribute values as array",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input type="text" name="username">', {
      allowedTags: ["input"],
      allowedAttributes: {
        input: [{ name: "type", values: ["text", "password", "email"] }, "name"],
      },
    });
    expect(result).toBe('<input type="text" name="username" />');
  })
);

// Boolean attributes
effect(
  "handles boolean attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input disabled="disabled" readonly="readonly">', {
      allowedTags: ["input"],
      allowedAttributes: {
        input: ["disabled", "readonly"],
      },
    });
    expect(result).toContain("disabled");
    expect(result).toContain("readonly");
  })
);

// Empty attributes
effect(
  "preserves empty allowed attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div data-empty="">Text</div>', {
      allowedTags: ["div"],
      allowedAttributes: {
        div: ["data-empty"],
      },
    });
    expect(result).toContain("data-empty");
    expect(result).toContain("Text");
  })
);

// allowedEmptyAttributes
effect(
  "removes empty attributes when not in allowedEmptyAttributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href"],
      },
      allowedEmptyAttributes: [],
    });
    expect(result).toBe("<a>Link</a>");
  })
);

effect(
  "preserves empty attributes when in allowedEmptyAttributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href"],
      },
      allowedEmptyAttributes: ["href"],
    });
    expect(result).toBe('<a href="">Link</a>');
  })
);

// Case sensitivity
effect(
  "normalizes attribute names to lowercase",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a HREF="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

// Attribute value encoding
effect(
  "encodes special characters in attribute values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com?a=1&b=2">Link</a>');
    expect(result).toBe('<a href="http://example.com?a=1&amp;b=2">Link</a>');
  })
);

effect(
  "encodes quotes in attribute values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a title="Say \\"Hello\\"">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["title"] },
    });
    expect(result).toContain("title=");
  })
);

// allowedAttributes: false (allow all)
effect(
  "allows all attributes when allowedAttributes is false",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo" id="bar" custom="value">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: false,
    });
    expect(result).toBe('<p class="foo" id="bar" custom="value">Text</p>');
  })
);

// Complex attribute patterns
effect(
  "handles srcset attribute",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img srcset="small.jpg 480w, large.jpg 800w" src="default.jpg">', {
      allowedTags: ["img"],
      allowedAttributes: {
        img: ["src", "srcset"],
      },
    });
    expect(result).toBe('<img srcset="small.jpg 480w, large.jpg 800w" src="default.jpg" />');
  })
);

effect(
  "handles style attribute when allowed",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: {
        p: ["style"],
      },
      allowedStyles: {
        "*": { color: [/.*/] },
      },
    });
    expect(result).toBe('<p style="color:red">Text</p>');
  })
);

// data-* attributes
effect(
  "allows specific data attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div data-id="123" data-name="test">Text</div>', {
      allowedTags: ["div"],
      allowedAttributes: {
        div: ["data-id", "data-name"],
      },
    });
    expect(result).toBe('<div data-id="123" data-name="test">Text</div>');
  })
);

// Target attribute handling
effect(
  "allows target attribute on anchors",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" target="_blank">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href", "target"],
      },
    });
    expect(result).toBe('<a href="http://example.com" target="_blank">Link</a>');
  })
);

// Rel attribute
effect(
  "allows rel attribute on anchors",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" rel="noopener noreferrer">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: {
        a: ["href", "rel"],
      },
    });
    expect(result).toBe('<a href="http://example.com" rel="noopener noreferrer">Link</a>');
  })
);

// Multiple tags with same attribute configuration
effect(
  "applies same attributes to multiple tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div class="d"><span class="s">Text</span></div>', {
      allowedTags: ["div", "span"],
      allowedAttributes: {
        "*": ["class"],
      },
    });
    expect(result).toBe('<div class="d"><span class="s">Text</span></div>');
  })
);

// Invalid attribute names (potential XSS vectors)
effect(
  "rejects attributes with invalid names",
  Effect.fn(function* () {
    // Standard event handlers should be rejected by default
    const result = sanitizeHtml('<div onclick="alert()">Text</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["class"] }, // only allow class
    });
    expect(result).not.toContain("onclick");
  })
);

// Attributes without values
effect(
  "handles attributes without values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input checked="">', {
      allowedTags: ["input"],
      allowedAttributes: {
        input: ["checked"],
      },
    });
    expect(result).toContain("checked");
  })
);
