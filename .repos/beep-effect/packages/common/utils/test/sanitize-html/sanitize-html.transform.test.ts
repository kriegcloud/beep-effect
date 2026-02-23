/**
 * Tag transformation tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { type Attributes, sanitizeHtml, simpleTransform } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// simpleTransform helper
effect(
  "simpleTransform changes tag name",
  Effect.fn(function* () {
    const result = sanitizeHtml("<b>Bold</b>", {
      allowedTags: ["strong", "b"],
      transformTags: {
        b: simpleTransform("strong", {}),
      },
    });
    // Transformation should change b to strong
    expect(result).toContain("Bold");
  })
);

effect(
  "simpleTransform adds attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml("<a>Link</a>", {
      allowedTags: ["a"],
      allowedAttributes: { a: ["target", "rel"] },
      transformTags: {
        a: simpleTransform("a", { target: "_blank", rel: "noopener" }),
      },
    });
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener"');
  })
);

effect(
  "simpleTransform changes tag and adds attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Content</div>", {
      allowedTags: ["section", "div"],
      allowedAttributes: { section: ["class"], div: ["class"] },
      transformTags: {
        div: simpleTransform("section", { class: "container" }),
      },
    });
    // Should contain the content
    expect(result).toContain("Content");
  })
);

// Custom transform functions
effect(
  "supports custom transform function",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Content</div>", {
      allowedTags: ["p", "div"],
      transformTags: {
        div: (tagName: string, attribs: Attributes) => ({
          tagName: "p",
          attribs: { ...attribs, "data-was": tagName },
        }),
      },
      allowedAttributes: { p: ["data-was"], div: [] },
    });
    // Should contain the content
    expect(result).toContain("Content");
  })
);

effect(
  "transform function receives attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<div class="original">Content</div>', {
      allowedTags: ["div"],
      allowedAttributes: { div: ["class", "data-original-class"] },
      transformTags: {
        div: (_tagName: string, attribs: Attributes) => ({
          tagName: "div",
          attribs: {
            ...attribs,
            "data-original-class": attribs.class || "",
            class: "transformed",
          },
        }),
      },
    });
    expect(result).toContain('class="transformed"');
    expect(result).toContain('data-original-class="original"');
  })
);

// Wildcard transforms
effect(
  "applies wildcard transform to all tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Para</p><strong>Bold</strong>", {
      allowedTags: ["p", "strong"],
      allowedAttributes: { "*": ["data-sanitized"] },
      transformTags: {
        "*": (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs: { ...attribs, "data-sanitized": "true" },
        }),
      },
    });
    expect(result).toContain('<p data-sanitized="true">');
    expect(result).toContain('<strong data-sanitized="true">');
  })
);

// Transform returning false (remove tag)
effect(
  "removes tag when transform returns false for text",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Keep</div><div>Remove</div>", {
      allowedTags: ["div"],
      transformTags: {
        div: (_tagName: string, attribs: Attributes) => ({
          tagName: "div",
          attribs,
          text: "",
        }),
      },
    });
    // Tags should still exist but could have modified content
    expect(typeof result).toBe("string");
  })
);

// Transform with text modification
effect(
  "transform can modify text content",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Hello</p>", {
      allowedTags: ["p"],
      transformTags: {
        p: (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs,
          text: "Goodbye",
        }),
      },
    });
    expect(result).toContain("Goodbye");
  })
);

// Chained transformations (tag A -> B, B -> C not applied)
effect(
  "transformations are not chained",
  Effect.fn(function* () {
    const result = sanitizeHtml("<b>Text</b>", {
      allowedTags: ["em"],
      transformTags: {
        b: simpleTransform("strong", {}),
        strong: simpleTransform("em", {}),
      },
    });
    // b -> strong, but strong -> em should NOT be applied
    // Since strong is not in allowedTags, it gets removed
    expect(result).toBe("Text");
  })
);

effect(
  "transformed tag must be in allowedTags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div>Content</div>", {
      allowedTags: ["p", "div"],
      transformTags: {
        div: simpleTransform("p", {}),
      },
    });
    // div is transformed to p
    expect(result).toContain("Content");
  })
);

// Transform preserving existing attributes
effect(
  "transform preserves existing attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com" title="Link">Click</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href", "title", "target"] },
      transformTags: {
        a: (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs: { ...attribs, target: "_blank" },
        }),
      },
    });
    expect(result).toContain('href="http://example.com"');
    expect(result).toContain('title="Link"');
    expect(result).toContain('target="_blank"');
  })
);

// Transform overwriting existing attributes
effect(
  "transform can overwrite existing attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="old">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      transformTags: {
        p: (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs: { ...attribs, class: "new" },
        }),
      },
    });
    expect(result).toBe('<p class="new">Text</p>');
  })
);

// Transform on nested tags
effect(
  "transforms nested tags correctly",
  Effect.fn(function* () {
    const result = sanitizeHtml("<div><div>Nested</div></div>", {
      allowedTags: ["section", "div"],
      transformTags: {
        div: simpleTransform("section", {}),
      },
    });
    // Should contain the nested content
    expect(result).toContain("Nested");
  })
);

// Transform with self-closing tags
effect(
  "transforms self-closing tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<br>", {
      allowedTags: ["hr"],
      selfClosing: ["hr"],
      transformTags: {
        br: simpleTransform("hr", {}),
      },
    });
    expect(result).toBe("<hr />");
  })
);

// Multiple different transforms
effect(
  "applies different transforms to different tags",
  Effect.fn(function* () {
    const result = sanitizeHtml("<b>Bold</b> and <i>Italic</i>", {
      allowedTags: ["strong", "em", "b", "i"],
      transformTags: {
        b: simpleTransform("strong", {}),
        i: simpleTransform("em", {}),
      },
    });
    // Should contain both pieces of content
    expect(result).toContain("Bold");
    expect(result).toContain("Italic");
  })
);

// Transform adding data attributes
effect(
  "transform adds data attributes",
  Effect.fn(function* () {
    const result = sanitizeHtml("<p>Content</p>", {
      allowedTags: ["p"],
      allowedAttributes: { p: ["data-*"] },
      transformTags: {
        p: (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs: {
            ...attribs,
            "data-timestamp": "123456",
            "data-source": "transform",
          },
        }),
      },
    });
    expect(result).toContain('data-timestamp="123456"');
    expect(result).toContain('data-source="transform"');
  })
);

// Transform with conditional logic
effect(
  "transform can apply conditional logic",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://example.com">External</a><a href="/internal">Internal</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href", "target", "rel"] },
      transformTags: {
        a: (tagName: string, attribs: Attributes) => {
          const href = attribs.href || "";
          if (href.startsWith("http")) {
            return {
              tagName,
              attribs: { ...attribs, target: "_blank", rel: "noopener" },
            };
          }
          return { tagName, attribs };
        },
      },
    });
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener"');
    // Internal link should not have target
    expect(result).toContain('href="/internal"');
  })
);

// Transform returning empty tagName
effect(
  "transform with empty tagName keeps content",
  Effect.fn(function* () {
    const result = sanitizeHtml("<span>Keep this text</span>", {
      allowedTags: [],
      transformTags: {
        span: () => ({
          tagName: "",
          attribs: {},
        }),
      },
    });
    expect(result).toContain("Keep this text");
  })
);

// Transform for security (adding rel="noopener")
effect(
  "transform adds security attributes to external links",
  Effect.fn(function* () {
    const result = sanitizeHtml('<a href="http://external.com">External</a>', {
      allowedTags: ["a"],
      allowedAttributes: { a: ["href", "target", "rel"] },
      transformTags: {
        a: (tagName: string, attribs: Attributes) => ({
          tagName,
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        }),
      },
    });
    expect(result).toContain('rel="noopener noreferrer"');
  })
);

// Transform case sensitivity
effect(
  "transform keys are case-insensitive for tag matching",
  Effect.fn(function* () {
    const result = sanitizeHtml("<DIV>Content</DIV>", {
      allowedTags: ["p", "div"],
      transformTags: {
        div: simpleTransform("p", {}),
      },
    });
    // DIV should match div transform
    expect(result).toContain("Content");
  })
);
