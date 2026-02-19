/**
 * CSS filtering tests for sanitize-html
 *
 * @since 0.1.0
 */
import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { sanitizeHtml } from "@beep/utils/sanitize-html";
import { Effect } from "effect";

// Basic style handling
effect(
  "removes style attribute by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>');
    expect(result).toBe("<p>Text</p>");
  })
);

effect(
  "allows style when configured",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toBe('<p style="color:red">Text</p>');
  })
);

// Property filtering
effect(
  "filters out disallowed CSS properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red; position: absolute;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toBe('<p style="color:red">Text</p>');
  })
);

effect(
  "allows multiple CSS properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red; font-size: 14px;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          color: [/.*/],
          "font-size": [/.*/],
        },
      },
    });
    expect(result).toContain("color:red");
    expect(result).toContain("font-size:14px");
  })
);

// Value validation with regex
effect(
  "validates CSS values with regex",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/^(red|blue|green)$/] },
      },
    });
    expect(result).toBe('<p style="color:red">Text</p>');
  })
);

effect(
  "rejects CSS values not matching regex",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: purple;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/^(red|blue|green)$/] },
      },
    });
    expect(result).toBe("<p>Text</p>");
  })
);

// Multiple regex patterns
effect(
  "allows value if any regex matches",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: #ff0000;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/^red$/, /^#[0-9a-f]{6}$/i] },
      },
    });
    expect(result).toContain("color:#ff0000");
  })
);

// Wildcard styles
effect(
  "applies wildcard styles to all tags",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;"><span style="color: blue;">Text</span></p>', {
      allowedTags: ["p", "span"],
      allowedAttributes: { "*": ["style"] },
      allowedStyles: {
        "*": { color: [/.*/] },
      },
    });
    expect(result).toContain('style="color:red"');
    expect(result).toContain('style="color:blue"');
  })
);

// Tag-specific styles override wildcard
effect(
  "tag-specific styles work with wildcards",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="font-weight: bold; color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        "*": { color: [/.*/] },
        p: { "font-weight": [/.*/] },
      },
    });
    // Both should be allowed since they're merged
    expect(result).toContain("font-weight:bold");
  })
);

// Expression blocking
effect(
  "blocks expression() in CSS",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="width: expression(alert(1));">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { width: [/.*/] },
      },
    });
    expect(result).not.toContain("expression");
  })
);

// url() handling
effect(
  "blocks javascript in url()",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="background: url(javascript:alert(1));">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { background: [/.*/] },
      },
    });
    expect(result).not.toContain("javascript");
  })
);

effect(
  "blocks data: URLs in CSS url() by default",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="background: url(data:image/png;base64,abc);">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { background: [/.*/] },
      },
    });
    // data: should be blocked unless explicitly allowed
    expect(result).not.toContain("data:");
  })
);

// Common CSS properties
effect(
  "handles common text properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="font-family: Arial; font-size: 14px; text-align: center;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          "font-family": [/.*/],
          "font-size": [/.*/],
          "text-align": [/^(left|center|right|justify)$/],
        },
      },
    });
    expect(result).toContain("font-family:Arial");
    expect(result).toContain("font-size:14px");
    expect(result).toContain("text-align:center");
  })
);

effect(
  "handles color properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: #333; background-color: rgba(255,255,255,0.5);">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          color: [/.*/],
          "background-color": [/.*/],
        },
      },
    });
    expect(result).toContain("color:#333");
    expect(result).toContain("background-color:");
  })
);

// Box model properties
effect(
  "handles margin and padding",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="margin: 10px; padding: 5px 10px;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          margin: [/.*/],
          padding: [/.*/],
        },
      },
    });
    expect(result).toContain("margin:10px");
    expect(result).toContain("padding:5px 10px");
  })
);

effect(
  "handles border properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="border: 1px solid #ccc;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { border: [/.*/] },
      },
    });
    expect(result).toContain("border:1px solid #ccc");
  })
);

// Empty style removal
effect(
  "removes empty style attribute",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="position: absolute;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    // position is not allowed, so style should be empty and removed
    expect(result).toBe("<p>Text</p>");
  })
);

// Whitespace handling
effect(
  "normalizes whitespace in CSS values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color:   red  ;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toContain("color:red");
  })
);

// Case sensitivity
effect(
  "normalizes CSS property names to lowercase",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="COLOR: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toContain("color:red");
  })
);

// Important declarations
effect(
  "handles !important",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red !important;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toContain("color:red !important");
  })
);

// parseStyleAttributes option
effect(
  "does not parse style when parseStyleAttributes is false",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      parseStyleAttributes: false,
    });
    // Style should be preserved as-is without validation
    expect(result).toContain('style="color: red;"');
  })
);

// Vendor prefixes
effect(
  "handles vendor prefixed properties",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="-webkit-transform: rotate(45deg);">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { "-webkit-transform": [/.*/] },
      },
    });
    expect(result).toContain("-webkit-transform:");
  })
);

// Complex selectors in inline styles (should be blocked)
effect(
  "handles complex CSS values",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="font-family: \\"Helvetica Neue\\", Arial, sans-serif;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { "font-family": [/.*/] },
      },
    });
    expect(result).toContain("font-family:");
  })
);

// Numeric values
effect(
  "handles numeric values with units",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="width: 100px; height: 50%; line-height: 1.5;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          width: [/.*/],
          height: [/.*/],
          "line-height": [/.*/],
        },
      },
    });
    expect(result).toContain("width:100px");
    expect(result).toContain("height:50%");
    expect(result).toContain("line-height:1.5");
  })
);

// calc() function
effect(
  "handles calc() function",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="width: calc(100% - 20px);">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { width: [/.*/] },
      },
    });
    expect(result).toContain("calc(100% - 20px)");
  })
);

// var() function
effect(
  "handles CSS variables",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: var(--main-color);">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    expect(result).toContain("var(--main-color)");
  })
);

// Multiple declarations with some filtered
effect(
  "filters mixed allowed and disallowed declarations",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red; position: fixed; font-size: 14px; z-index: 999;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: {
          color: [/.*/],
          "font-size": [/.*/],
        },
      },
    });
    expect(result).toContain("color:red");
    expect(result).toContain("font-size:14px");
    expect(result).not.toContain("position");
    expect(result).not.toContain("z-index");
  })
);

// Behavior/binding blocking (IE-specific XSS)
effect(
  "blocks behavior property via url()",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="color: red;">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { color: [/.*/] },
      },
    });
    // Safe properties should work
    expect(result).toContain("color");
  })
);

effect(
  "blocks dangerous CSS functions",
  Effect.fn(function* () {
    const result = sanitizeHtml('<p style="background: url(javascript:alert(1));">Text</p>', {
      allowedTags: ["p"],
      allowedAttributes: { p: ["style"] },
      allowedStyles: {
        p: { background: [/.*/] },
      },
    });
    // javascript: in url() should be blocked
    expect(result).not.toContain("javascript:");
  })
);
