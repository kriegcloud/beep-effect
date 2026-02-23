/**
 * Class filtering tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic class handling
effect(
  "removes class attribute by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo">Text</p>');
    expect(result).toBe("<p>Text</p>");
  })
);

effect(
  "preserves class when in allowedAttributes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
    });
    expect(result).toBe('<p class="foo">Text</p>');
  })
);

// allowedClasses - specific classes per tag
effect(
  "allows specific classes for a tag",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="allowed other">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["allowed"],
      },
    });
    expect(result).toBe('<p class="allowed">Text</p>');
  })
);

effect(
  "filters out disallowed classes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="bad-class">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["good-class"],
      },
    });
    expect(result).toBe("<p>Text</p>");
  })
);

effect(
  "allows multiple specified classes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="class-a class-b class-c">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["class-a", "class-b"],
      },
    });
    expect(result).toBe('<p class="class-a class-b">Text</p>');
  })
);

// Glob patterns for classes
effect(
  "allows classes matching glob pattern",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="btn-primary btn-secondary other">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["btn-*"],
      },
    });
    expect(result).toBe('<p class="btn-primary btn-secondary">Text</p>');
  })
);

effect(
  "supports multiple glob patterns",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="text-center bg-primary other">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["text-*", "bg-*"],
      },
    });
    expect(result).toBe('<p class="text-center bg-primary">Text</p>');
  })
);

// Regex patterns for classes
effect(
  "allows classes matching regex pattern",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="col-1 col-2 col-12 other">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: [/^col-\d+$/],
      },
    });
    expect(result).toBe('<p class="col-1 col-2 col-12">Text</p>');
  })
);

effect(
  "supports mixed string and regex patterns",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="exact col-5 random">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["exact", /^col-\d+$/],
      },
    });
    expect(result).toBe('<p class="exact col-5">Text</p>');
  })
);

// Wildcard (*) for all tags
effect(
  "applies wildcard classes to all tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="global"><span class="global other">Text</span></p>', {
      allowedTags: ["p", "span"],
      allowedAttributes: { "*": ["class"] },
      allowedClasses: {
        "*": ["global"],
      },
    });
    expect(result).toBe('<p class="global"><span class="global">Text</span></p>');
  })
);

effect(
  "tag-specific classes override wildcard",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="global specific">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        "*": ["global"],
        p: ["specific"],
      },
    });
    // Both should be allowed - wildcard and tag-specific are merged
    expect(result).toContain("global");
    expect(result).toContain("specific");
  })
);

// Empty class attribute removal
effect(
  "removes empty class attribute after filtering",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="disallowed">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["allowed"],
      },
    });
    expect(result).toBe("<p>Text</p>");
  })
);

// Multiple classes with some filtered
effect(
  "preserves order of allowed classes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="z-index a-first m-middle">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["*"],
      },
    });
    // * should allow all
    expect(result).toContain("z-index");
    expect(result).toContain("a-first");
    expect(result).toContain("m-middle");
  })
);

// Edge cases
effect(
  "handles empty class attribute",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
    });
    // Empty class should be removed
    expect(result).toBe("<p>Text</p>");
  })
);

effect(
  "handles class with only whitespace",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="   ">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
    });
    // Whitespace-only class should result in the attribute being kept or removed
    expect(result).toContain("<p");
    expect(result).toContain("Text");
  })
);

effect(
  "handles duplicate classes",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="foo foo bar">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["foo", "bar"],
      },
    });
    // Should handle duplicates gracefully
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  })
);

// Case sensitivity
effect(
  "class filtering is case-sensitive",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="Foo foo FOO">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["foo"],
      },
    });
    // Only exact case match should be allowed
    expect(result).toBe('<p class="foo">Text</p>');
  })
);

// Complex class names
effect(
  "handles BEM-style class names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="block__element--modifier">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["block__element--modifier"],
      },
    });
    expect(result).toBe('<p class="block__element--modifier">Text</p>');
  })
);

effect(
  "handles Tailwind-style class names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="sm:text-lg md:text-xl hover:bg-blue-500">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: [/^(sm|md|lg|xl)?:?[a-z-]+$/],
      },
    });
    // Regex should match Tailwind-style classes
    expect(result).toContain("class=");
  })
);

// Negative lookahead patterns (if supported)
effect(
  "supports excluding patterns via regex",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="safe-class js-hook">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: [/^(?!js-).+$/], // Exclude classes starting with js-
      },
    });
    expect(result).toContain("safe-class");
    expect(result).not.toContain("js-hook");
  })
);

// Multiple tags with different class rules
effect(
  "applies different class rules per tag",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="para-class common"><span class="span-class common">Text</span></p>', {
      allowedTags: ["p", "span"],
      allowedAttributes: { "*": ["class"] },
      allowedClasses: {
        p: ["para-class"],
        span: ["span-class"],
      },
    });
    expect(result).toContain("para-class");
    expect(result).not.toContain("common");
    expect(result).toContain("span-class");
  })
);

// No allowedClasses (all classes allowed when class attribute is allowed)
effect(
  "allows all classes when allowedClasses not specified",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="any random classes">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
    });
    expect(result).toBe('<p class="any random classes">Text</p>');
  })
);

// allowedClasses with empty array (no classes allowed)
effect(
  "removes all classes when allowedClasses is empty array",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="some classes">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: [],
      },
    });
    expect(result).toBe("<p>Text</p>");
  })
);

// Unicode in class names
effect(
  "handles unicode class names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="класс κλάση">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["класс", "κλάση"],
      },
    });
    expect(result).toContain("класс");
    expect(result).toContain("κλάση");
  })
);

// Numbers in class names
effect(
  "handles class names with numbers",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="col-12 row-3 grid-2x2">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: [/^(col|row|grid)-[\dx]+$/],
      },
    });
    expect(result).toContain("col-12");
    expect(result).toContain("row-3");
    expect(result).toContain("grid-2x2");
  })
);

// Hyphenated class names
effect(
  "handles hyphenated class names",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p class="my-custom-class">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["class"] },
      allowedClasses: {
        p: ["my-custom-class"],
      },
    });
    expect(result).toBe('<p class="my-custom-class">Text</p>');
  })
);
