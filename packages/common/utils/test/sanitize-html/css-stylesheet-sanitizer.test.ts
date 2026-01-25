/**
 * CSS stylesheet sanitizer tests
 *
 * @since 0.1.0
 */
import { describe, expect } from "bun:test";
import { effect } from "@beep/testkit";
import {
  createCssConfig,
  createCssSanitizer,
  defaultAllowedAtRules,
  defaultAllowedProperties,
  defaultCssConfig,
  isPropertyAllowed,
  sanitizeCss,
} from "@beep/utils/sanitize-html";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";

// =============================================================================
// Basic Sanitization
// =============================================================================

describe("sanitizeCss - basic", () => {
  effect(
    "sanitizes simple CSS rule",
    Effect.fn(function* () {
      const result = sanitizeCss(".btn { color: red; }");
      expect(result).toContain("color: red");
      expect(result).toContain("{");
      expect(result).toContain("}");
    })
  );

  effect(
    "returns empty string for empty input",
    Effect.fn(function* () {
      expect(sanitizeCss("")).toBe("");
      expect(sanitizeCss("   ")).toBe("");
    })
  );

  effect(
    "returns empty string for non-string input",
    Effect.fn(function* () {
      // @ts-expect-error - Testing invalid input
      expect(sanitizeCss(null)).toBe("");
      // @ts-expect-error - Testing invalid input
      expect(sanitizeCss(undefined)).toBe("");
      // @ts-expect-error - Testing invalid input
      expect(sanitizeCss(123)).toBe("");
    })
  );

  effect(
    "removes CSS comments",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        /* This is a comment */
        .btn { color: red; }
        /* Another comment */
      `);
      expect(result).not.toContain("/*");
      expect(result).not.toContain("*/");
      expect(result).not.toContain("comment");
      expect(result).toContain("color: red");
    })
  );

  effect(
    "truncates CSS input exceeding max length",
    Effect.fn(function* () {
      const longCss = ".a{color:red}".repeat(10000);
      const config = createCssConfig({ maxCssLength: 100 });
      const result = sanitizeCss(longCss, config);
      // Note: truncation happens on INPUT, not output
      // Output may be slightly different due to parsing
      expect(result.length).toBeLessThan(200);
    })
  );
});

// =============================================================================
// Property Filtering
// =============================================================================

describe("sanitizeCss - property filtering", () => {
  effect(
    "allows default properties",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .container {
          color: red;
          font-size: 14px;
          margin: 10px;
          padding: 5px;
        }
      `);
      expect(result).toContain("color: red");
      expect(result).toContain("font-size: 14px");
      expect(result).toContain("margin: 10px");
      expect(result).toContain("padding: 5px");
    })
  );

  effect(
    "filters out disallowed properties",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .danger {
          color: red;
          behavior: url(malicious.htc);
          -moz-binding: url(evil.xml);
        }
      `);
      expect(result).toContain("color: red");
      expect(result).not.toContain("behavior");
      expect(result).not.toContain("-moz-binding");
    })
  );

  effect(
    "normalizes property names to lowercase",
    Effect.fn(function* () {
      const result = sanitizeCss(".btn { COLOR: red; FONT-SIZE: 14px; }");
      expect(result).toContain("color: red");
      expect(result).toContain("font-size: 14px");
    })
  );

  effect(
    "allows custom properties via config",
    Effect.fn(function* () {
      const config = createCssConfig({
        allowedProperties: ["grid", "gap", "grid-template-columns"],
      });
      const result = sanitizeCss(
        ".grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }",
        config
      );
      expect(result).toContain("display: grid");
      expect(result).toContain("grid-template-columns: 1fr 1fr");
      expect(result).toContain("gap: 10px");
    })
  );
});

// =============================================================================
// At-Rules
// =============================================================================

describe("sanitizeCss - at-rules", () => {
  effect(
    "allows @media rules",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        @media (max-width: 768px) {
          .container { color: red; }
        }
      `);
      expect(result).toContain("@media");
      expect(result).toContain("max-width: 768px");
      expect(result).toContain("color: red");
    })
  );

  effect(
    "allows @keyframes rules",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `);
      expect(result).toContain("@keyframes");
      expect(result).toContain("fadeIn");
      expect(result).toContain("opacity: 0");
      expect(result).toContain("opacity: 1");
    })
  );

  effect(
    "allows @font-face rules",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        @font-face {
          font-family: 'MyFont';
        }
      `);
      expect(result).toContain("@font-face");
      expect(result).toContain("font-family:");
    })
  );

  effect(
    "allows @import rules (in brace context)",
    Effect.fn(function* () {
      // Note: The parser handles at-rules with braces
      // Standalone @import statements pass through as-is
      const result = sanitizeCss(`
        @import { }
        .btn { color: red; }
      `);
      expect(result).toContain("@import");
    })
  );

  effect(
    "passes through content without braces",
    Effect.fn(function* () {
      // Content without braces passes through
      // This is a limitation of the brace-based parser
      const result = sanitizeCss(`
        @charset "UTF-8";
        .btn { color: red; }
      `);
      // Standalone at-rules without braces pass through
      expect(result).toContain(".btn");
      expect(result).toContain("color: red");
    })
  );
});

// =============================================================================
// URL Handling
// =============================================================================

describe("sanitizeCss - URL handling", () => {
  effect(
    "allows URLs from allowed domains",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .bg {
          background: url('https://fonts.googleapis.com/icon');
        }
      `);
      expect(result).toContain("url('https://fonts.googleapis.com/icon')");
    })
  );

  effect(
    "blocks URLs from disallowed domains",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .bg {
          background: url('https://evil.com/malicious.png');
        }
      `);
      expect(result).not.toContain("evil.com");
    })
  );

  effect(
    "allows custom domains via config",
    Effect.fn(function* () {
      const config = createCssConfig({
        allowedDomains: ["cdn.example.com"],
      });
      const result = sanitizeCss(
        ".bg { background: url('https://cdn.example.com/img.png'); }",
        config
      );
      expect(result).toContain("cdn.example.com");
    })
  );

  effect(
    "passes through background without URL",
    Effect.fn(function* () {
      const result = sanitizeCss(".box { background: #ff0000; }");
      expect(result).toContain("background: #ff0000");
    })
  );
});

// =============================================================================
// Security - Dangerous Patterns
// =============================================================================

describe("sanitizeCss - security", () => {
  effect(
    "filters dangerous properties",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .danger {
          behavior: url(evil.htc);
          -moz-binding: url(evil.xml);
        }
      `);
      expect(result).not.toContain("behavior");
      expect(result).not.toContain("-moz-binding");
    })
  );

  effect(
    "handles nested at-rules safely",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        @media print {
          @media screen {
            .nested { color: red; }
          }
        }
      `);
      // Should handle nesting without breaking
      expect(result).toContain("@media");
    })
  );
});

// =============================================================================
// Multiple Selectors and Rules
// =============================================================================

describe("sanitizeCss - multiple rules", () => {
  effect(
    "handles multiple CSS rules",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .header { color: blue; }
        .content { font-size: 16px; }
        .footer { margin: 20px; }
      `);
      expect(result).toContain("color: blue");
      expect(result).toContain("font-size: 16px");
      expect(result).toContain("margin: 20px");
    })
  );

  effect(
    "handles complex selectors",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .parent > .child { color: red; }
        .item:hover { background: blue; }
        #main .class { padding: 10px; }
      `);
      expect(result).toContain("color: red");
      expect(result).toContain("background: blue");
      expect(result).toContain("padding: 10px");
    })
  );

  effect(
    "handles pseudo-classes in selectors",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .btn:hover { color: blue; }
        .link:visited { color: purple; }
        .input:focus { border: 1px solid blue; }
      `);
      expect(result).toContain(":hover");
      expect(result).toContain(":visited");
      expect(result).toContain(":focus");
    })
  );
});

// =============================================================================
// createCssSanitizer Factory
// =============================================================================

describe("createCssSanitizer", () => {
  effect(
    "creates a reusable sanitizer function",
    Effect.fn(function* () {
      const sanitize = createCssSanitizer();
      const result = sanitize(".btn { color: red; }");
      expect(result).toContain("color: red");
    })
  );

  effect(
    "applies custom config to created sanitizer",
    Effect.fn(function* () {
      const sanitize = createCssSanitizer({
        maxCssLength: 50,
      });
      const longCss = ".a { color: red; } .b { color: blue; } .c { color: green; }";
      const result = sanitize(longCss);
      expect(result.length).toBeLessThanOrEqual(50);
    })
  );

  effect(
    "maintains config across multiple calls",
    Effect.fn(function* () {
      const sanitize = createCssSanitizer({
        allowedDomains: ["custom.cdn.com"],
      });

      const result1 = sanitize(".a { background: url('https://custom.cdn.com/1.png'); }");
      const result2 = sanitize(".b { background: url('https://custom.cdn.com/2.png'); }");

      expect(result1).toContain("custom.cdn.com");
      expect(result2).toContain("custom.cdn.com");
    })
  );
});

// =============================================================================
// Configuration
// =============================================================================

describe("createCssConfig", () => {
  effect(
    "creates config with default values",
    Effect.fn(function* () {
      const config = createCssConfig();
      expect(config.maxCssLength).toBe(65536);
      expect(HashSet.size(config.allowedProperties)).toBeGreaterThan(0);
      expect(HashSet.size(config.allowedAtRules)).toBeGreaterThan(0);
    })
  );

  effect(
    "merges custom properties with defaults",
    Effect.fn(function* () {
      const config = createCssConfig({
        allowedProperties: ["custom-prop"],
      });
      // Should have both default and custom
      expect(HashSet.has(config.allowedProperties, "color")).toBe(true);
      expect(HashSet.has(config.allowedProperties, "custom-prop")).toBe(true);
    })
  );

  effect(
    "allows custom max length",
    Effect.fn(function* () {
      const config = createCssConfig({
        maxCssLength: 1024,
      });
      expect(config.maxCssLength).toBe(1024);
    })
  );

  effect(
    "allows custom URL validator",
    Effect.fn(function* () {
      let validatorCalled = false;
      const config = createCssConfig({
        validateUrl: (url) => {
          validatorCalled = true;
          return url.startsWith("https://");
        },
      });

      const result = sanitizeCss(
        ".bg { background: url('https://example.com/img.png'); }",
        config
      );

      expect(validatorCalled).toBe(true);
    })
  );
});

// =============================================================================
// Guard Functions
// =============================================================================

describe("isPropertyAllowed", () => {
  effect(
    "returns true for allowed properties",
    Effect.fn(function* () {
      expect(isPropertyAllowed("color")).toBe(true);
      expect(isPropertyAllowed("font-size")).toBe(true);
      expect(isPropertyAllowed("margin")).toBe(true);
    })
  );

  effect(
    "returns false for disallowed properties",
    Effect.fn(function* () {
      expect(isPropertyAllowed("behavior")).toBe(false);
      expect(isPropertyAllowed("-moz-binding")).toBe(false);
      expect(isPropertyAllowed("random-prop")).toBe(false);
    })
  );

  effect(
    "normalizes property names",
    Effect.fn(function* () {
      expect(isPropertyAllowed("COLOR")).toBe(true);
      expect(isPropertyAllowed("  color  ")).toBe(true);
      expect(isPropertyAllowed("Font-Size")).toBe(true);
    })
  );

  effect(
    "uses custom config when provided",
    Effect.fn(function* () {
      const config = createCssConfig({
        allowedProperties: ["custom-property"],
      });
      expect(isPropertyAllowed("custom-property", config)).toBe(true);
    })
  );
});

// =============================================================================
// Default Values
// =============================================================================

describe("default values", () => {
  effect(
    "defaultAllowedProperties contains common CSS properties",
    Effect.fn(function* () {
      expect(defaultAllowedProperties).toContain("color");
      expect(defaultAllowedProperties).toContain("font-size");
      expect(defaultAllowedProperties).toContain("margin");
      expect(defaultAllowedProperties).toContain("padding");
      expect(defaultAllowedProperties).toContain("border");
      expect(defaultAllowedProperties).toContain("background");
    })
  );

  effect(
    "defaultAllowedAtRules contains common at-rules",
    Effect.fn(function* () {
      expect(defaultAllowedAtRules).toContain("@media");
      expect(defaultAllowedAtRules).toContain("@keyframes");
      expect(defaultAllowedAtRules).toContain("@font-face");
      expect(defaultAllowedAtRules).toContain("@import");
    })
  );

  effect(
    "defaultCssConfig is pre-configured",
    Effect.fn(function* () {
      expect(defaultCssConfig.maxCssLength).toBe(65536);
      expect(HashSet.size(defaultCssConfig.allowedProperties)).toBeGreaterThan(50);
      expect(HashSet.size(defaultCssConfig.allowedAtRules)).toBe(4);
    })
  );
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("sanitizeCss - edge cases", () => {
  effect(
    "handles CSS with only comments",
    Effect.fn(function* () {
      const result = sanitizeCss("/* just a comment */");
      expect(result).toBe("");
    })
  );

  effect(
    "handles empty rule bodies",
    Effect.fn(function* () {
      const result = sanitizeCss(".empty { }");
      // Should not output empty rules
      expect(result).not.toContain("{}");
    })
  );

  effect(
    "handles CSS content property",
    Effect.fn(function* () {
      // Note: Braces inside strings may confuse the simple parser
      // Use escaped content or avoid braces in content values
      const result = sanitizeCss(`.quote { content: "Hello"; }`);
      expect(result).toContain("content:");
    })
  );

  effect(
    "handles multiple semicolons",
    Effect.fn(function* () {
      const result = sanitizeCss(".multi { color: red;; font-size: 14px; }");
      expect(result).toContain("color: red");
      expect(result).toContain("font-size: 14px");
    })
  );

  effect(
    "handles properties without values",
    Effect.fn(function* () {
      const result = sanitizeCss(".invalid { color; font-size: 14px; }");
      // Invalid property should be skipped
      expect(result).toContain("font-size: 14px");
    })
  );

  effect(
    "handles deeply nested at-rules",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        @media screen {
          @media (min-width: 768px) {
            .nested { color: red; }
          }
        }
      `);
      expect(result).toContain("@media");
      expect(result).toContain("color: red");
    })
  );

  effect(
    "handles animation shorthand",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .animated {
          animation: fadeIn 1s ease-in-out;
        }
      `);
      expect(result).toContain("animation: fadeIn 1s ease-in-out");
    })
  );

  effect(
    "handles transform property",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .rotated {
          transform: rotate(45deg) scale(1.5);
        }
      `);
      expect(result).toContain("transform: rotate(45deg) scale(1.5)");
    })
  );

  effect(
    "handles flexbox properties",
    Effect.fn(function* () {
      const result = sanitizeCss(`
        .flex-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          flex-direction: column;
        }
      `);
      expect(result).toContain("display: flex");
      expect(result).toContain("justify-content: center");
      expect(result).toContain("align-items: center");
      expect(result).toContain("flex-wrap: wrap");
      expect(result).toContain("flex-direction: column");
    })
  );
});
