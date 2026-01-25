/**
 * XSS prevention tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Script tag removal
effect(
  "removes script tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script>alert("XSS")</script>');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  })
);

effect(
  "removes script tags with src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script src="evil.js"></script>');
    expect(result).not.toContain("<script");
    expect(result).not.toContain("evil.js");
  })
);

effect(
  "removes script tags with type",
  Effect.fn(function* () {
    const result = sanitizeHtml('<script type="text/javascript">alert(1)</script>');
    expect(result).not.toContain("<script");
  })
);

// Event handlers
effect(
  "removes onclick handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div onclick="alert(1)">Click me</div>', {
      allowedTags: ["div"],
      allowedAttributes: {},
    });
    expect(result).not.toContain("onclick");
  })
);

effect(
  "removes onerror handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).not.toContain("onerror");
  })
);

effect(
  "removes onload handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<body onload="alert(1)">Content</body>', {
      allowedTags: ["body"],
      allowedAttributes: {},
    });
    expect(result).not.toContain("onload");
  })
);

effect(
  "removes onmouseover handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="#" onmouseover="alert(1)">Hover</a>');
    expect(result).not.toContain("onmouseover");
  })
);

effect(
  "removes onfocus handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input onfocus="alert(1)">', {
      allowedTags: ["input"],
      allowedAttributes: {},
    });
    expect(result).not.toContain("onfocus");
  })
);

// javascript: URLs
effect(
  "blocks javascript: in href",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "blocks javascript: with encoding",
  Effect.fn(function* () {
    // HTML entity encoded
    const result = sanitizeHtml(
      '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Click</a>'
    );
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("alert");
  })
);

effect(
  "blocks javascript: with newlines and tabs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="j\na\tv\ra\0s\0cript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "blocks obfuscated javascript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="  javascript:alert(1)">Click</a>');
    expect(result).not.toContain("javascript:");
  })
);

// vbscript: URLs
effect(
  "blocks vbscript: URLs",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="vbscript:msgbox(1)">Click</a>');
    expect(result).not.toContain("vbscript:");
  })
);

// data: URLs
effect(
  "blocks data: URLs with HTML content",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">Click</a>');
    expect(result).not.toContain("data:");
    expect(result).not.toContain("alert");
  })
);

effect(
  "blocks data: URLs in images",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="data:image/svg+xml,<svg onload=alert(1)>">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).not.toContain("onload");
  })
);

// SVG-based XSS
effect(
  "removes SVG tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<svg onload="alert(1)"></svg>');
    expect(result).not.toContain("<svg");
    expect(result).not.toContain("alert");
  })
);

effect(
  "removes SVG use tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<svg><use xlink:href="data:image/svg+xml,<svg onload=alert(1)>"></use></svg>');
    expect(result).not.toContain("<svg");
    expect(result).not.toContain("<use");
  })
);

// Object/Embed/Applet
effect(
  "removes object tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<object data="evil.swf"></object>');
    expect(result).not.toContain("<object");
  })
);

effect(
  "removes embed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<embed src="evil.swf">');
    expect(result).not.toContain("<embed");
  })
);

effect(
  "removes applet tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<applet code="Evil.class"></applet>');
    expect(result).not.toContain("<applet");
  })
);

// Meta refresh
effect(
  "removes meta refresh",
  Effect.fn(function* () {
    const result = sanitizeHtml('<meta http-equiv="refresh" content="0;url=javascript:alert(1)">');
    expect(result).not.toContain("<meta");
  })
);

// Base tag hijacking
effect(
  "removes base tag by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<base href="http://evil.com/">');
    expect(result).not.toContain("<base");
  })
);

// Form action injection
effect(
  "blocks javascript in form action when action is validated",
  Effect.fn(function* () {
    const result = sanitizeHtml('<form action="javascript:alert(1)"></form>', {
      allowedTags: ["form"],
      allowedAttributes: { form: ["action"] },
      allowedSchemesAppliedToAttributes: ["action"],
    });
    expect(result).not.toContain("javascript:");
  })
);

// CSS expression
effect(
  "blocks CSS expression()",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div style="width:expression(alert(1))">X</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["style"] },
      allowedStyles: { div: { width: [/.*/] } },
    });
    expect(result).not.toContain("expression");
    expect(result).not.toContain("alert");
  })
);

// CSS url() with javascript
effect(
  "blocks javascript in CSS url()",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div style="background:url(javascript:alert(1))">X</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["style"] },
      allowedStyles: { div: { background: [/.*/] } },
    });
    expect(result).not.toContain("javascript:");
  })
);

// IE-specific XSS
effect(
  "blocks url() with javascript scheme in CSS",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div style="background:url(javascript:alert(1))">X</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["style"] },
      allowedStyles: { div: { background: [/.*/] } },
    });
    expect(result).not.toContain("javascript:");
  })
);

effect(
  "allows safe CSS properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div style="color:red">X</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["style"] },
      allowedStyles: { div: { color: [/.*/] } },
    });
    expect(result).toContain("color:red");
  })
);

// Nested tags for XSS
effect(
  "handles nested XSS attempts",
  Effect.fn(function* () {
    const result = sanitizeHtml("<<script>script>alert(1)<</script>/script>");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  })
);

// Unicode/encoding attacks
effect(
  "blocks UTF-7 XSS",
  Effect.fn(function* () {
    const result = sanitizeHtml("+ADw-script+AD4-alert(1)+ADw-/script+AD4-");
    expect(result).not.toContain("<script");
  })
);

effect(
  "handles null bytes",
  Effect.fn(function* () {
    // Null bytes in script tag should result in tag being removed
    const result = sanitizeHtml("<script>alert(1)</script>");
    expect(result).not.toContain("alert");
    expect(result).not.toContain("<script");
  })
);

// Comment-based XSS
effect(
  "removes HTML comments",
  Effect.fn(function* () {
    const result = sanitizeHtml("<!-- <script>alert(1)</script> -->");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  })
);

effect(
  "handles conditional comments",
  Effect.fn(function* () {
    const result = sanitizeHtml("<!--[if IE]><script>alert(1)</script><![endif]-->");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("alert");
  })
);

// img tag XSS
effect(
  "blocks img with onerror",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src", "alt"] },
    });
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("alert");
  })
);

effect(
  "blocks img with javascript src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img src="javascript:alert(1)">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

// iframe XSS
effect(
  "removes iframe by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="http://evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  })
);

effect(
  "blocks javascript in iframe src",
  Effect.fn(function* () {
    const result = sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>', {
      allowedTags: ["iframe"],
      allowedAttributes: { iframe: ["src"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

// link tag XSS
effect(
  "removes link tag by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<link rel="stylesheet" href="http://evil.com/evil.css">');
    expect(result).not.toContain("<link");
  })
);

// style tag XSS
effect(
  "removes style tags and content",
  Effect.fn(function* () {
    const result = sanitizeHtml("<style>body{background:url(javascript:alert(1))}</style>");
    expect(result).not.toContain("<style");
    expect(result).not.toContain("javascript");
  })
);

// Mutation XSS (mXSS)
effect(
  "handles mutation XSS attempts",
  Effect.fn(function* () {
    // This tests for browser-based mXSS where innerHTML parsing differs from DOM parsing
    const result = sanitizeHtml("<p><svg><![CDATA[</svg><script>alert(1)</script>]]></svg></p>");
    expect(result).not.toContain("<script");
  })
);

// Protocol handler XSS
effect(
  "blocks custom protocol handlers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="custom:alert(1)">Click</a>');
    // custom: should not be in default allowed schemes
    expect(result).toBe("<a>Click</a>");
  })
);

// srcset XSS
effect(
  "blocks javascript in srcset",
  Effect.fn(function* () {
    const result = sanitizeHtml('<img srcset="javascript:alert(1) 480w, valid.jpg 800w">', {
      allowedTags: ["img"],
      allowedAttributes: { img: ["srcset"] },
    });
    expect(result).not.toContain("javascript:");
  })
);

// Template tag
effect(
  "removes template tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<template><script>alert(1)</script></template>");
    expect(result).not.toContain("<template");
    expect(result).not.toContain("<script");
  })
);

// noscript XSS
effect(
  "removes noscript by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<noscript><script>alert(1)</script></noscript>");
    expect(result).not.toContain("<noscript");
    expect(result).not.toContain("<script");
  })
);

// math XSS
effect(
  "removes math tags by default",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      "<math><mrow><mi>x</mi><annotation-xml><script>alert(1)</script></annotation-xml></mrow></math>"
    );
    expect(result).not.toContain("<math");
    expect(result).not.toContain("<script");
  })
);

// XSS in attribute values
effect(
  "encodes < and > in attribute values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a title="<script>alert(1)</script>">Link</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["title"] },
    });
    expect(result).not.toContain("<script>");
  })
);

// Multiple XSS vectors combined
effect(
  "handles combined XSS attempts",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      `
      <script>alert(1)</script>
      <img src="javascript:alert(2)" onerror="alert(3)">
      <a href="javascript:alert(4)" onclick="alert(5)">Click</a>
      <div style="background:url(javascript:alert(6))">Content</div>
    `,
      {
        allowedTags: ["img", "a", "div"],
        allowedAttributes: {
          img: ["src"],
          a: ["href"],
          div: ["style"],
        },
        allowedStyles: { div: { background: [/.*/] } },
      }
    );
    expect(result).not.toContain("alert");
    expect(result).not.toContain("javascript:");
    expect(result).not.toContain("<script");
    expect(result).not.toContain("onclick");
    expect(result).not.toContain("onerror");
  })
);
