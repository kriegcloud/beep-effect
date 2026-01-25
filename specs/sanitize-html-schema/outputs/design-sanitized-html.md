# SanitizedHtml Branded Type Design

**Status**: Design Phase
**Phase**: P2 - Type System Design
**Date**: 2026-01-25

---

## Overview

`SanitizedHtml` is a **branded string type** that represents HTML that has been validated and sanitized according to a specific security policy. The brand provides compile-time guarantees that untrusted input has been processed through the sanitization pipeline before being rendered or stored.

---

## Design Principles

1. **Type Safety**: Impossible to accidentally use unsanitized HTML where sanitized is expected
2. **Minimal API Surface**: Simple schema with clear semantics
3. **Escape Hatch**: Provide `.unsafe()` for testing scenarios (explicit opt-out)
4. **Rich Metadata**: Comprehensive annotations for JSON Schema generation and documentation
5. **Codebase Alignment**: Follow `@beep/schema` brand patterns (Slug, Email, EntityId)

---

## Schema Implementation

### Core Schema

```typescript
import * as B from "effect/Brand";
import * as S from "effect/Schema";
import * as F from "effect/Function";

/**
 * Brand for HTML strings that have been sanitized according to a security policy.
 *
 * @since 1.0.0
 * @category Brands
 */
export type SanitizedHtmlBrand = B.Brand<"SanitizedHtml">;

/**
 * A string that has been sanitized to remove potentially dangerous HTML.
 *
 * This branded type ensures that HTML content has passed through a sanitization
 * pipeline before being rendered in the browser or stored in the database.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SanitizedHtml } from "@beep/schema/integrations/html";
 *
 * // Decode from untrusted input (requires sanitization)
 * const html = S.decodeSync(SanitizedHtml)("<p>Hello <script>alert('xss')</script></p>");
 * // Result: "<p>Hello </p>" (branded as SanitizedHtml)
 *
 * // Type error: cannot pass plain string where SanitizedHtml expected
 * function render(html: SanitizedHtml.Type) { ... }
 * render("<p>unsafe</p>");  // Type error!
 * render(html);  // OK - branded type
 * ```
 */
export const SanitizedHtml: S.BrandSchema<
  string & SanitizedHtmlBrand,
  string,
  never
> = S.String.pipe(S.brand("SanitizedHtml")).annotations({
  identifier: "SanitizedHtml",
  title: "Sanitized HTML",
  description:
    "HTML string that has been sanitized to remove potentially dangerous content according to a security policy. Safe for rendering in the browser.",
  examples: [
    "<p>Hello, world!</p>",
    "<div><strong>Bold text</strong> and <em>italic text</em></div>",
    "<ul><li>Item 1</li><li>Item 2</li></ul>",
    "",
  ],
  jsonSchema: {
    type: "string",
    format: "html",
    "x-sanitized": true,
  },
});

/**
 * Namespace for SanitizedHtml utilities and type aliases.
 *
 * @since 1.0.0
 * @category Namespace
 */
export declare namespace SanitizedHtml {
  /**
   * Decoded type (runtime representation).
   * @since 1.0.0
   */
  export type Type = string & SanitizedHtmlBrand;

  /**
   * Encoded type (wire format).
   * @since 1.0.0
   */
  export type Encoded = string;

  /**
   * Type guard for SanitizedHtml brand.
   * @since 1.0.0
   */
  export const is: (u: unknown) => u is Type;

  /**
   * Unsafe constructor - bypass sanitization for testing or pre-sanitized content.
   *
   * **WARNING**: Only use this when you have absolute certainty that the input
   * is already sanitized or in controlled test environments. Misuse can introduce
   * XSS vulnerabilities.
   *
   * @since 1.0.0
   * @category Unsafe
   * @example
   * ```typescript
   * // Testing scenario
   * const mockHtml = SanitizedHtml.unsafe("<p>Test content</p>");
   *
   * // Pre-sanitized content from trusted source
   * const trustedHtml = SanitizedHtml.unsafe(contentFromCMS);
   * ```
   */
  export const unsafe: (html: string) => Type;
}

/**
 * Implementation of SanitizedHtml namespace.
 */
export const SanitizedHtml: typeof SanitizedHtml = F.pipe(
  SanitizedHtml as S.BrandSchema<
    string & SanitizedHtmlBrand,
    string,
    never
  >,
  (schema) =>
    Object.assign(schema, {
      is: (u: unknown): u is SanitizedHtml.Type =>
        B.isBrand(u) && typeof u === "string",
      unsafe: (html: string): SanitizedHtml.Type =>
        html as SanitizedHtml.Type,
    })
);
```

---

## Integration with Factory

The `SanitizedHtml` brand integrates with the `makeSanitizeSchema` factory as the output type:

```typescript
import * as S from "effect/Schema";
import * as F from "effect/Function";
import { SanitizedHtml } from "./branded-types/sanitized-html";
import type { SanitizeConfig } from "./models";

/**
 * Creates a transformation schema that sanitizes input to produce SanitizedHtml.
 *
 * @since 1.0.0
 * @category Factories
 * @example
 * ```typescript
 * import { makeSanitizeSchema, SanitizeConfig } from "@beep/schema/integrations/html";
 *
 * const config = SanitizeConfig.make({
 *   allowedTags: ["p", "strong", "em"],
 *   allowedAttributes: { "p": ["class"] },
 * });
 *
 * const Sanitize = makeSanitizeSchema(config);
 *
 * const html = S.decodeSync(Sanitize)("<p class='text'>Hello <script>xss</script></p>");
 * // Result: "<p class='text'>Hello </p>" (branded SanitizedHtml)
 * ```
 */
export const makeSanitizeSchema = (
  config: SanitizeConfig.Type
): S.transformOrFail<
  S.Union<
    [
      S.Schema<string, string, never>,
      S.Schema<number, number, never>,
      S.Schema<null, null, never>,
      S.Schema<undefined, undefined, never>,
    ]
  >,
  typeof SanitizedHtml,
  never
> =>
  S.transformOrFail(
    S.Union(S.String, S.Number, S.Null, S.Undefined),
    SanitizedHtml,
    {
      strict: true,
      decode: (dirty, _options, _ast) =>
        S.ParseResult.succeed(sanitize(dirty, config) as SanitizedHtml.Type),
      encode: (sanitized, _options, _ast) =>
        S.ParseResult.succeed(sanitized),
    }
  );
```

**Key Design Decisions**:

1. **Input Union**: Accepts `string | number | null | undefined` to match `sanitize-html` library behavior
2. **Output Brand**: Returns `SanitizedHtml.Type` to enforce type safety downstream
3. **Encoding Identity**: Encoding is identity function (no reverse transformation needed)
4. **ParseResult**: Uses `ParseResult.succeed` for infallible transformation

---

## Type Aliases and Exports

```typescript
/**
 * Decoded type (runtime representation).
 * @since 1.0.0
 */
export type SanitizedHtml = SanitizedHtml.Type;

/**
 * Encoded type (wire format).
 * @since 1.0.0
 */
export type SanitizedHtmlEncoded = SanitizedHtml.Encoded;
```

---

## Usage Examples

### Basic Sanitization

```typescript
import * as S from "effect/Schema";
import { SanitizedHtml, SanitizeConfig, makeSanitizeSchema } from "@beep/schema/integrations/html";

const config = SanitizeConfig.make({
  allowedTags: ["p", "strong", "em"],
  allowedAttributes: {},
});

const Sanitize = makeSanitizeSchema(config);

const html = S.decodeSync(Sanitize)("<p>Hello <script>alert('xss')</script></p>");
// html: SanitizedHtml.Type
// value: "<p>Hello </p>"
```

### Type Safety Enforcement

```typescript
function renderHtml(html: SanitizedHtml.Type): void {
  document.body.innerHTML = html;
}

const unsafeHtml = "<p>User input</p>";
renderHtml(unsafeHtml);  // Type error: string is not assignable to SanitizedHtml.Type

const safeHtml = S.decodeSync(Sanitize)(unsafeHtml);
renderHtml(safeHtml);  // OK - branded type
```

### Unsafe Escape Hatch (Testing)

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { SanitizedHtml } from "@beep/schema/integrations/html";

effect("sanitizes script tags", () =>
  Effect.gen(function* () {
    const input = "<p>Hello <script>alert('xss')</script></p>";
    const result = yield* S.decode(Sanitize)(input);

    const expected = SanitizedHtml.unsafe("<p>Hello </p>");
    strictEqual(result, expected);
  })
);
```

### Domain Model Integration

```typescript
import * as S from "effect/Schema";
import { SanitizedHtml } from "@beep/schema/integrations/html";

export class BlogPost extends S.Class<BlogPost>("BlogPost")({
  id: S.String,
  title: S.String,
  content: SanitizedHtml,  // Ensures content is always sanitized
  createdAt: S.DateFromString,
}) {}

// Type error: cannot construct with plain string
const post = new BlogPost({
  id: "1",
  title: "My Post",
  content: "<p>Raw HTML</p>",  // Type error!
  createdAt: "2026-01-25T00:00:00Z",
});

// Correct: sanitize before constructing
const sanitizedContent = S.decodeSync(Sanitize)("<p>Raw HTML</p>");
const validPost = new BlogPost({
  id: "1",
  title: "My Post",
  content: sanitizedContent,  // OK - branded type
  createdAt: "2026-01-25T00:00:00Z",
});
```

---

## Comparison with Existing Patterns

### EntityId Pattern

**Similarities**:
- Branded string type for domain safety
- Namespace with `.Type`, `.Encoded`, `.is()` utilities
- Rich annotations for JSON Schema generation

**Differences**:
- EntityId has `.create()` (generates UUIDs) - `SanitizedHtml` does NOT (must sanitize)
- EntityId uses `.make()` for validation - `SanitizedHtml` uses schema decode
- EntityId has prefix validation - `SanitizedHtml` validates HTML structure

### Slug/Email Pattern

**Similarities**:
- Branded string with validation constraints
- Uses `S.brand()` for type branding
- Includes `.unsafe()` escape hatch

**Differences**:
- Slug/Email use refinement predicates - `SanitizedHtml` uses transformation
- Slug/Email validate format - `SanitizedHtml` transforms content

---

## Testing Considerations

### 1. Type Guard

```typescript
effect("type guard identifies branded values", () =>
  Effect.gen(function* () {
    const html = SanitizedHtml.unsafe("<p>Test</p>");
    strictEqual(SanitizedHtml.is(html), true);
    strictEqual(SanitizedHtml.is("<p>Plain string</p>"), false);
  })
);
```

### 2. Unsafe Constructor

```typescript
effect("unsafe constructor bypasses validation", () =>
  Effect.gen(function* () {
    const dangerous = SanitizedHtml.unsafe("<script>alert('xss')</script>");
    // Compiles but retains dangerous content (intentional for testing)
    strictEqual(dangerous, "<script>alert('xss')</script>");
  })
);
```

### 3. Schema Integration

```typescript
effect("schema decodes and brands", () =>
  Effect.gen(function* () {
    const input = "<p>Hello</p>";
    const result = yield* S.decode(Sanitize)(input);

    strictEqual(SanitizedHtml.is(result), true);
    strictEqual(result, "<p>Hello</p>");
  })
);
```

---

## JSON Schema Output

The annotations produce this JSON Schema:

```json
{
  "type": "string",
  "format": "html",
  "x-sanitized": true,
  "title": "Sanitized HTML",
  "description": "HTML string that has been sanitized to remove potentially dangerous content according to a security policy. Safe for rendering in the browser.",
  "examples": [
    "<p>Hello, world!</p>",
    "<div><strong>Bold text</strong> and <em>italic text</em></div>",
    "<ul><li>Item 1</li><li>Item 2</li></ul>",
    ""
  ]
}
```

**Custom Extension**: `x-sanitized: true` signals downstream tools that this string has security guarantees.

---

## Security Guarantees

### What the Brand Provides

1. **Compile-Time Safety**: TypeScript prevents mixing sanitized/unsanitized HTML
2. **Explicit Sanitization**: Must go through schema to obtain branded value
3. **Documentation**: Type signature documents security expectations

### What the Brand Does NOT Provide

1. **Runtime Validation**: Brand is erased at runtime (pure TypeScript construct)
2. **Content Policy Enforcement**: Brand doesn't encode which policy was used
3. **Re-Sanitization Prevention**: Already-sanitized content can be re-sanitized

**Implications**: The brand is a **developer safety net**, not a runtime security boundary. Actual XSS prevention depends on correct sanitization configuration and execution.

---

## Implementation Checklist

- [ ] Create `packages/common/schema/src/integrations/html/branded-types/sanitized-html.ts`
- [ ] Export from `packages/common/schema/src/integrations/html/index.ts`
- [ ] Update `makeSanitizeSchema` to use `SanitizedHtml` as output type
- [ ] Add unit tests for:
  - [ ] Type guard (`SanitizedHtml.is`)
  - [ ] Unsafe constructor (`SanitizedHtml.unsafe`)
  - [ ] Schema integration (decode/encode)
  - [ ] Type safety (compile-time tests)
- [ ] Document in `specs/sanitize-html-schema/outputs/api-reference.md`

---

## Open Questions

1. **Multiple Policies**: Should brand encode which policy was used? (e.g., `SanitizedHtml<"strict">`)
   - **Decision**: NO - keep simple for P2, revisit if needed in future phases

2. **Empty String**: Is empty string valid `SanitizedHtml`?
   - **Decision**: YES - included in examples, represents "no content after sanitization"

3. **Numeric Input**: Should `makeSanitizeSchema` accept `number`?
   - **Decision**: YES - matches `sanitize-html` library behavior (coerces to string)

4. **Null/Undefined**: How should `null`/`undefined` input be handled?
   - **Decision**: Transform to empty string `""` (matches library default)

---

## References

- **Brand Pattern**: `packages/common/schema/src/identity/entity-id/entity-id.ts`
- **String Primitives**: `packages/common/schema/src/primitives/string/slug.ts`, `email.ts`
- **Transformation Pattern**: `packages/common/schema/src/primitives/temporal/dates/date-time.ts`
- **Effect Brand API**: `node_modules/effect/src/Brand.ts`

---

## Summary

The `SanitizedHtml` branded type provides:

1. **Type Safety**: Impossible to mix sanitized/unsanitized HTML at compile time
2. **Minimal API**: `SanitizedHtml` schema + `.is()` + `.unsafe()` utilities
3. **Rich Metadata**: Comprehensive annotations for tooling and documentation
4. **Codebase Alignment**: Follows established `@beep/schema` brand patterns
5. **Security Intent**: Documents expectation that content has been sanitized

This design balances **developer ergonomics** (simple API, clear semantics) with **security clarity** (explicit sanitization requirement) while following Effect Schema and `@beep/schema` conventions.
