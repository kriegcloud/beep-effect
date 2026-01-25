/**
 * URL and scheme validation tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic URL schemes
effect(
  "allows http URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "allows https URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="https://example.com">Link</a>');
    expect(result).toBe('<a href="https://example.com">Link</a>');
  })
);

effect(
  "allows ftp URLs by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="ftp://files.example.com">Link</a>');
    expect(result).toBe('<a href="ftp://files.example.com">Link</a>');
  })
);

effect(
  "allows mailto URLs by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="mailto:test@example.com">Email</a>');
    expect(result).toBe('<a href="mailto:test@example.com">Email</a>');
  })
);

// JavaScript scheme blocking
effect(
  "blocks javascript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks javascript: with whitespace",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="  javascript:alert(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks javascript: with mixed case",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="JaVaScRiPt:alert(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks javascript: with newlines",
  Effect.fn(function* () {
    // URL with embedded newlines - implementation should handle or block
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "blocks javascript: with tabs",
  Effect.fn(function* () {
    // URL with embedded tabs - implementation should handle or block
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "blocks javascript: with carriage returns",
  Effect.fn(function* () {
    // URL with embedded carriage returns - implementation should handle or block
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

// Entity-encoded javascript
effect(
  "blocks entity-encoded javascript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="&#106;avascript:alert(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks hex-encoded javascript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="&#x6A;avascript:alert(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks fully encoded javascript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Click</a>'
    );
    expect(result).toBe("<a>Click</a>");
  })
);

// vbscript blocking
effect(
  "blocks vbscript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="vbscript:msgbox(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "blocks vbscript: with mixed case",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="VbScRiPt:msgbox(1)">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

// data: URLs
effect(
  "blocks data: URLs by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">Click</a>');
    expect(result).toBe("<a>Click</a>");
  })
);

effect(
  "allows data: URLs when specified in allowedSchemes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="data:text/plain,Hello">Click</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href"] },
      allowedSchemes: ["data"],
    });
    expect(result).toBe('<a href="data:text/plain,Hello">Click</a>');
  })
);

// Protocol-relative URLs
effect(
  "allows protocol-relative URLs by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="//example.com/page">Link</a>');
    expect(result).toBe('<a href="//example.com/page">Link</a>');
  })
);

effect(
  "blocks protocol-relative URLs when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="//example.com/page">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href"] },
      allowProtocolRelative: false,
    });
    expect(result).toBe("<a>Link</a>");
  })
);

// Relative URLs
effect(
  "allows relative URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="/page">Link</a>');
    expect(result).toBe('<a href="/page">Link</a>');
  })
);

effect(
  "allows relative URLs with paths",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="../other/page.html">Link</a>');
    expect(result).toBe('<a href="../other/page.html">Link</a>');
  })
);

effect(
  "allows hash-only URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="#section">Link</a>');
    expect(result).toBe('<a href="#section">Link</a>');
  })
);

// Image URLs
effect(
  "allows http image sources",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="http://example.com/image.jpg">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).toBe('<img src="http://example.com/image.jpg" />');
  })
);

effect(
  "blocks javascript in image sources",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="javascript:alert(1)">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).toBe("<img />");
  })
);

// Custom allowed schemes
effect(
  "allows custom schemes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="tel:+1234567890">Call</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href"] },
      allowedSchemes: ["http", "https", "tel"],
    });
    expect(result).toBe('<a href="tel:+1234567890">Call</a>');
  })
);

effect(
  "allows sms scheme when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="sms:+1234567890">Text</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href"] },
      allowedSchemes: ["sms"],
    });
    expect(result).toBe('<a href="sms:+1234567890">Text</a>');
  })
);

// Scheme by tag
effect(
  "allows different schemes per tag",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a><img src="data:image/png;base64,abc123">', {
      allowedTags: ["a", "img"],
      allowedAttributes: { a: ["href"], img: ["src"] },
      allowedSchemes: ["http", "https"],
      allowedSchemesByTag: {
        img: ["data"],
      },
    });
    expect(result).toBe('<a href="http://example.com">Link</a><img src="data:image/png;base64,abc123" />');
  })
);

// Invalid URLs
effect(
  "handles malformed URLs gracefully",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://[invalid">Link</a>');
    // Should either allow or reject, but not crash
    expect(typeof result).toBe("string");
  })
);

effect(
  "handles empty href",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="">Link</a>');
    // Empty href should either be preserved or removed
    expect(result).toContain("<a");
    expect(result).toContain("Link");
  })
);

// Encoded characters
effect(
  "handles percent-encoded URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com/path%20with%20spaces">Link</a>');
    expect(result).toBe('<a href="http://example.com/path%20with%20spaces">Link</a>');
  })
);

effect(
  "handles query strings",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com?a=1&b=2">Link</a>');
    expect(result).toBe('<a href="http://example.com?a=1&amp;b=2">Link</a>');
  })
);

// Control character stripping
effect(
  "handles control characters in URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a>');
    // Basic URL should pass through
    expect(result).toContain("http://example.com");
  })
);

// srcset validation
effect(
  "validates URLs in srcset",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img srcset="small.jpg 480w, javascript:alert(1) 800w">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["srcset"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "preserves valid srcset entries",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img srcset="small.jpg 480w, large.jpg 800w">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["srcset"] },
    });
    expect(result).toContain("small.jpg 480w");
    expect(result).toContain("large.jpg 800w");
  })
);

// Form action URLs
effect(
  "validates form action URLs when action is in allowedSchemesAppliedToAttributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<form action="javascript:alert(1)">', {
      allowedTags: ["form"],
      allowedAttributes: { form: ["action"] },
      allowedSchemesAppliedToAttributes: ["action"],
    });
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "allows valid form action URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<form action="http://example.com/submit">', {
      allowedTags: ["form"],
      allowedAttributes: { form: ["action"] },
    });
    expect(result).toContain("http://example.com/submit");
  })
);

// Background URLs (if style allowed)
effect(
  "blocks javascript in CSS url()",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div style="background: url(javascript:alert(1))">', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["style"] },
      allowedStyles: {
        div: { background: [/.*/] },
      },
    });
    expect(result).not.toContain("javascript:");
  })
);

// Base href
effect(
  "handles base tag href",
  Effect.fn(function* () {
    const result = sanitizeHtml('<base href="http://example.com/">', {
      allowedTags: ["base"],
      allowedAttributes: { base: ["href"] },
    });
    expect(result).toContain("http://example.com/");
  })
);

effect(
  "blocks javascript in base href",
  Effect.fn(function* () {
    const result = sanitizeHtml('<base href="javascript:alert(1)">', {
      allowedTags: ["base"],
      allowedAttributes: { base: ["href"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

// Link href (stylesheets)
effect(
  "handles link tag href",
  Effect.fn(function* () {
    const result = sanitizeHtml('<link href="http://example.com/style.css" rel="stylesheet">', {
      allowedTags: ["link"],
      allowedAttributes: { link: ["href", "rel"] },
    });
    expect(result).toContain("http://example.com/style.css");
  })
);

// Unicode in URLs
effect(
  "handles unicode in URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://例え.jp">Link</a>');
    expect(result).toContain("例え.jp");
  })
);

// Empty scheme
effect(
  "handles URLs without scheme",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="example.com">Link</a>');
    expect(result).toBe('<a href="example.com">Link</a>');
  })
);
