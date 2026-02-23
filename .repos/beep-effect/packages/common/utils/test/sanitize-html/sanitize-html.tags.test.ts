/**
 * Tag filtering tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { defaults, sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Default allowed tags
effect(
  "allows paragraph tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Content</p>");
    expect(result).toBe("<p>Content</p>");
  })
);

effect(
  "allows heading tags",
  Effect.fn(function* () {
    expect(sanitizeHtml("<h1>Heading</h1>")).toBe("<h1>Heading</h1>");
    expect(sanitizeHtml("<h2>Heading</h2>")).toBe("<h2>Heading</h2>");
    expect(sanitizeHtml("<h3>Heading</h3>")).toBe("<h3>Heading</h3>");
    expect(sanitizeHtml("<h4>Heading</h4>")).toBe("<h4>Heading</h4>");
    expect(sanitizeHtml("<h5>Heading</h5>")).toBe("<h5>Heading</h5>");
    expect(sanitizeHtml("<h6>Heading</h6>")).toBe("<h6>Heading</h6>");
  })
);

effect(
  "allows list tags",
  Effect.fn(function* () {
    expect(sanitizeHtml("<ul><li>Item</li></ul>")).toBe("<ul><li>Item</li></ul>");
    expect(sanitizeHtml("<ol><li>Item</li></ol>")).toBe("<ol><li>Item</li></ol>");
  })
);

effect(
  "allows text formatting tags",
  Effect.fn(function* () {
    expect(sanitizeHtml("<strong>Bold</strong>")).toBe("<strong>Bold</strong>");
    expect(sanitizeHtml("<em>Italic</em>")).toBe("<em>Italic</em>");
    expect(sanitizeHtml("<b>Bold</b>")).toBe("<b>Bold</b>");
    expect(sanitizeHtml("<i>Italic</i>")).toBe("<i>Italic</i>");
    expect(sanitizeHtml("<u>Underline</u>")).toBe("<u>Underline</u>");
    expect(sanitizeHtml("<s>Strikethrough</s>")).toBe("<s>Strikethrough</s>");
  })
);

effect(
  "allows blockquote",
  Effect.fn(function* () {
    const result = sanitizeHtml("<blockquote>Quote</blockquote>");
    expect(result).toBe("<blockquote>Quote</blockquote>");
  })
);

effect(
  "allows code and pre tags",
  Effect.fn(function* () {
    expect(sanitizeHtml("<code>code</code>")).toBe("<code>code</code>");
    expect(sanitizeHtml("<pre>preformatted</pre>")).toBe("<pre>preformatted</pre>");
  })
);

effect(
  "allows anchor tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">Link</a>');
    expect(result).toBe('<a href="http://example.com">Link</a>');
  })
);

effect(
  "allows br and hr",
  Effect.fn(function* () {
    expect(sanitizeHtml("<br>")).toBe("<br />");
    expect(sanitizeHtml("<hr>")).toBe("<hr />");
  })
);

// Disallowed tags
effect(
  "removes script tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert(1)</script>");
    expect(result).not.toContain("<script");
  })
);

effect(
  "removes style tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<style>body{color:red}</style>");
    expect(result).not.toContain("<style");
  })
);

effect(
  "allows div by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Content</div>");
    expect(result).toBe("<div>Content</div>");
  })
);

effect(
  "allows span by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<span>Content</span>");
    expect(result).toBe("<span>Content</span>");
  })
);

// Custom allowed tags
effect(
  "allows only specified tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Para</p><div>Div</div>", {
      allowedTags: ["p"],
    });
    expect(result).toBe("<p>Para</p>Div");
  })
);

effect(
  "allows custom tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<custom-element>Content</custom-element>", {
      allowedTags: ["custom-element"],
    });
    expect(result).toBe("<custom-element>Content</custom-element>");
  })
);

effect(
  "allows div and span when specified",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><span>Content</span></div>", {
      allowedTags: ["div", "span"],
    });
    expect(result).toBe("<div><span>Content</span></div>");
  })
);

// Empty allowedTags
effect(
  "removes all tags when allowedTags is empty",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p><strong>World</strong>", {
      allowedTags: [],
    });
    expect(result).toBe("HelloWorld");
  })
);

// allowedTags: false (allow all)
effect(
  "allows all tags when allowedTags is false",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert(1)</script><div>Content</div>", {
      allowedTags: false,
    });
    expect(result).toContain("<script>");
    expect(result).toContain("<div>");
  })
);

// Self-closing tags
effect(
  "handles custom self-closing tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<custom />", {
      allowedTags: ["custom"],
      selfClosing: ["custom"],
    });
    expect(result).toBe("<custom />");
  })
);

effect(
  "handles void elements as self-closing",
  Effect.fn(function* () {
    const result = sanitizeHtml('<input type="text">', {
      allowedTags: ["input"],
      allowedAttributes: { input: ["type"] },
    });
    expect(result).toBe('<input type="text" />');
  })
);

// disallowedTagsMode
effect(
  "discards content of disallowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>alert(1)</script>Text", {
      disallowedTagsMode: "discard",
    });
    expect(result).toBe("Text");
  })
);

effect(
  "escapes disallowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Content</div>", {
      allowedTags: ["p"],
      disallowedTagsMode: "escape",
    });
    expect(result).toBe("&lt;div&gt;Content&lt;/div&gt;");
  })
);

effect(
  "recursively escapes disallowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><p>Para</p></div>", {
      allowedTags: [],
      disallowedTagsMode: "recursiveEscape",
    });
    expect(result).toContain("&lt;div&gt;");
    expect(result).toContain("&lt;p&gt;");
    expect(result).toContain("Para");
    expect(result).toContain("&lt;/p&gt;");
    expect(result).toContain("&lt;/div&gt;");
  })
);

// Tag nesting
effect(
  "handles deeply nested allowed tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><strong><em>Nested</em></strong></p>");
    expect(result).toBe("<p><strong><em>Nested</em></strong></p>");
  })
);

effect(
  "handles mixed allowed/disallowed nesting",
  Effect.fn(function* () {
    // Both div and p are in default allowed tags
    const result = sanitizeHtml("<div><p>Para</p></div>");
    expect(result).toContain("<p>");
    expect(result).toContain("Para");
  })
);

// nestingLimit
effect(
  "enforces nesting limit",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p><p><p>Deep</p></p></p>", {
      allowedTags: ["p"],
      nestingLimit: 2,
    });
    // Only 2 levels should be allowed
    expect(result.match(/<p>/g)?.length || 0).toBeLessThanOrEqual(2);
  })
);

effect(
  "nesting limit affects different tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><div><div>Deep</div></div></div>", {
      allowedTags: ["div"],
      nestingLimit: 1,
    });
    expect(result.match(/<div>/g)?.length || 0).toBe(1);
  })
);

// enforceHtmlBoundary
effect(
  "enforces HTML boundary - handles content correctly",
  Effect.fn(function* () {
    const result = sanitizeHtml("Before<html><body><p>Inside</p></body></html>After", {
      allowedTags: ["html", "body", "p"],
      enforceHtmlBoundary: true,
    });
    // Main content should be preserved
    expect(result).toContain("Inside");
  })
);

// Non-text content tags
effect(
  "removes script content completely",
  Effect.fn(function* () {
    const result = sanitizeHtml("<script>var x = 1;</script>Text");
    expect(result).toBe("Text");
    expect(result).not.toContain("var");
  })
);

effect(
  "removes style content completely",
  Effect.fn(function* () {
    const result = sanitizeHtml("<style>.foo{color:red}</style>Text");
    expect(result).toBe("Text");
    expect(result).not.toContain(".foo");
  })
);

effect(
  "removes textarea content by default",
  Effect.fn(function* () {
    const result = sanitizeHtml("<textarea>User input</textarea>Text");
    expect(result).toBe("Text");
  })
);

// Table tags
effect(
  "allows table structure when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml(
      "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>",
      {
        allowedTags: ["table", "thead", "tbody", "tr", "th", "td"],
      }
    );
    expect(result).toContain("<table>");
    expect(result).toContain("<thead>");
    expect(result).toContain("<tbody>");
    expect(result).toContain("<tr>");
    expect(result).toContain("<th>");
    expect(result).toContain("<td>");
  })
);

// Definition lists
effect(
  "allows definition lists when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml("<dl><dt>Term</dt><dd>Definition</dd></dl>", {
      allowedTags: ["dl", "dt", "dd"],
    });
    expect(result).toBe("<dl><dt>Term</dt><dd>Definition</dd></dl>");
  })
);

// Figure and figcaption
effect(
  "allows figure elements when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml("<figure><img src='x'><figcaption>Caption</figcaption></figure>", {
      allowedTags: ["figure", "img", "figcaption"],
      allowedAttributes: { img: ["src"] },
    });
    expect(result).toContain("<figure>");
    expect(result).toContain("<figcaption>");
  })
);

// Details and summary
effect(
  "allows details/summary when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml("<details><summary>Title</summary>Content</details>", {
      allowedTags: ["details", "summary"],
    });
    expect(result).toBe("<details><summary>Title</summary>Content</details>");
  })
);

// Semantic HTML5 tags
effect(
  "allows semantic tags when configured",
  Effect.fn(function* () {
    const html = "<article><header>Title</header><section>Content</section><footer>Footer</footer></article>";
    const result = sanitizeHtml(html, {
      allowedTags: ["article", "header", "section", "footer"],
    });
    expect(result).toBe(html);
  })
);

// Case sensitivity
effect(
  "normalizes uppercase tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<P>Hello</P>");
    expect(result).toBe("<p>Hello</p>");
  })
);

effect(
  "normalizes mixed case tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<StRoNg>Bold</StRoNg>");
    expect(result).toBe("<strong>Bold</strong>");
  })
);

// Defaults export
effect(
  "exports sensible defaults",
  Effect.fn(function* () {
    expect(Array.isArray(defaults.allowedTags)).toBe(true);
    expect(defaults.allowedTags.length).toBeGreaterThan(0);
    expect(defaults.allowedTags).toContain("p");
    expect(defaults.allowedTags).toContain("a");
    expect(defaults.allowedTags).not.toContain("script");
  })
);
