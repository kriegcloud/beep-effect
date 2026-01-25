# AllowedTags Discriminated Union Design

## Overview

The `AllowedTags` type models the three-state behavior of sanitize-html's `allowedTags` option:
- Allow all HTML tags
- Allow no HTML tags (strip all)
- Allow specific HTML tags (validated against `HtmlTag`)

## Design Rationale

### Why Three Variants?

sanitize-html's `allowedTags` accepts:
- `false` → allow ALL tags
- `[]` → allow NO tags (strip everything)
- `["p", "a", ...]` → allow SPECIFIC tags

The discriminated union provides type-safe modeling of these three states with:
1. **Exhaustiveness checking** via Match.value
2. **Type-safe tag validation** via `HtmlTag` schema
3. **Clear intent** via factory methods (`.all()`, `.none()`, `.specific()`)

### Why Not Model `undefined` (defaults)?

The `undefined` case (use library defaults) is a configuration-level concern, not a data concern. When encoding/decoding sanitize-html options, we want explicit control over which tags are allowed. The defaults case would be handled by:
- Optional field with default value at the options schema level
- Or separate configuration that merges defaults before validation

## Schema Implementation

```typescript
import * as S from "effect/Schema";
import { HtmlTag } from "@beep/schema/integrations/html";

/**
 * AllTags variant - Allow all HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: false`
 */
const AllTags = S.Struct({
  _tag: S.Literal("AllTags"),
}).annotations({
  identifier: "AllTags",
  title: "All Tags Allowed",
  description: "Allow all HTML tags (no tag filtering)",
});

/**
 * NoneTags variant - Allow no HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: []`
 * All tags will be stripped, leaving only text content
 */
const NoneTags = S.Struct({
  _tag: S.Literal("NoneTags"),
}).annotations({
  identifier: "NoneTags",
  title: "No Tags Allowed",
  description: "Strip all HTML tags, preserving only text content",
});

/**
 * SpecificTags variant - Allow specific HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: ["p", "a", ...]`
 * Tags are validated against the HtmlTag schema (140+ valid tags)
 */
const SpecificTags = S.Struct({
  _tag: S.Literal("SpecificTags"),
  tags: S.Array(HtmlTag).annotations({
    title: "Allowed Tags",
    description: "Array of HTML tag names to allow",
  }),
}).annotations({
  identifier: "SpecificTags",
  title: "Specific Tags Allowed",
  description: "Allow only the specified HTML tags",
});

/**
 * AllowedTags discriminated union
 *
 * Represents the allowedTags configuration for HTML sanitization.
 * Discriminated on the `_tag` field for exhaustive pattern matching.
 */
export const AllowedTags = S.Union(AllTags, NoneTags, SpecificTags).annotations({
  identifier: "AllowedTags",
  title: "Allowed Tags Configuration",
  description: "Specifies which HTML tags are permitted in sanitized output",
  examples: [
    { _tag: "AllTags" },
    { _tag: "NoneTags" },
    { _tag: "SpecificTags", tags: ["p", "a", "strong", "em"] },
  ],
});

export type AllowedTags = S.Schema.Type<typeof AllowedTags>;
```

## Factory Functions

```typescript
/**
 * AllowedTags namespace with factory methods
 */
export namespace AllowedTags {
  /**
   * Create AllTags variant - allow all HTML tags
   *
   * @example
   * const config = AllowedTags.all();
   * // → { _tag: "AllTags" }
   */
  export const all = (): AllowedTags => ({ _tag: "AllTags" });

  /**
   * Create NoneTags variant - allow no HTML tags
   *
   * @example
   * const config = AllowedTags.none();
   * // → { _tag: "NoneTags" }
   */
  export const none = (): AllowedTags => ({ _tag: "NoneTags" });

  /**
   * Create SpecificTags variant - allow specific HTML tags
   *
   * @param tags - Array of HTML tag names to allow (validated against HtmlTag)
   *
   * @example
   * const config = AllowedTags.specific(["p", "a", "strong"]);
   * // → { _tag: "SpecificTags", tags: ["p", "a", "strong"] }
   */
  export const specific = (tags: ReadonlyArray<HtmlTag>): AllowedTags => ({
    _tag: "SpecificTags",
    tags,
  });
}
```

## Type Definitions

```typescript
import type { HtmlTag } from "@beep/schema/integrations/html";

/**
 * AllTags variant type
 */
export type AllTags = {
  readonly _tag: "AllTags";
};

/**
 * NoneTags variant type
 */
export type NoneTags = {
  readonly _tag: "NoneTags";
};

/**
 * SpecificTags variant type
 */
export type SpecificTags = {
  readonly _tag: "SpecificTags";
  readonly tags: ReadonlyArray<HtmlTag>;
};

/**
 * AllowedTags discriminated union type
 */
export type AllowedTags = AllTags | NoneTags | SpecificTags;
```

## Usage Examples

### Basic Construction

```typescript
import { AllowedTags } from "./allowed-tags";

// Allow all tags
const allConfig = AllowedTags.all();
// → { _tag: "AllTags" }

// Allow no tags (strip all HTML)
const noneConfig = AllowedTags.none();
// → { _tag: "NoneTags" }

// Allow specific tags
const specificConfig = AllowedTags.specific(["p", "a", "strong", "em", "ul", "ol", "li"]);
// → { _tag: "SpecificTags", tags: ["p", "a", "strong", "em", "ul", "ol", "li"] }
```

### Pattern Matching with Match.value

```typescript
import * as Match from "effect/Match";
import type { AllowedTags } from "./allowed-tags";

const processConfig = (config: AllowedTags): string =>
  Match.value(config).pipe(
    Match.tag("AllTags", () => "Allowing all HTML tags"),
    Match.tag("NoneTags", () => "Stripping all HTML tags"),
    Match.tag("SpecificTags", ({ tags }) =>
      `Allowing ${tags.length} specific tags: ${tags.join(", ")}`
    ),
    Match.exhaustive
  );

// Examples
processConfig(AllowedTags.all());
// → "Allowing all HTML tags"

processConfig(AllowedTags.none());
// → "Stripping all HTML tags"

processConfig(AllowedTags.specific(["p", "a"]));
// → "Allowing 2 specific tags: p, a"
```

### Encoding/Decoding with Effect Schema

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import { AllowedTags } from "./allowed-tags";

// Decode from unknown data
const decodeConfig = (data: unknown) =>
  Effect.gen(function* () {
    const config = yield* S.decodeUnknown(AllowedTags)(data);
    return config;
  });

// Valid inputs
decodeConfig({ _tag: "AllTags" });
// → Effect<AllowedTags, ParseError>

decodeConfig({ _tag: "SpecificTags", tags: ["p", "a", "div"] });
// → Effect<AllowedTags, ParseError>

// Invalid input (fails validation)
decodeConfig({ _tag: "SpecificTags", tags: ["invalid-tag"] });
// → Effect<never, ParseError> (HtmlTag validation fails)
```

### Integration with sanitize-html

```typescript
import sanitizeHtml from "sanitize-html";
import * as Match from "effect/Match";
import type { AllowedTags } from "./allowed-tags";

const toSanitizeHtmlAllowedTags = (
  config: AllowedTags
): false | ReadonlyArray<string> =>
  Match.value(config).pipe(
    Match.tag("AllTags", () => false as const),
    Match.tag("NoneTags", () => [] as const),
    Match.tag("SpecificTags", ({ tags }) => tags),
    Match.exhaustive
  );

// Usage
const config = AllowedTags.specific(["p", "a", "strong"]);
const sanitized = sanitizeHtml("<p>Hello <a href='#'>world</a></p>", {
  allowedTags: toSanitizeHtmlAllowedTags(config),
});
```

### Type Guards

```typescript
import type { AllowedTags } from "./allowed-tags";

const isAllTags = (config: AllowedTags): config is AllTags =>
  config._tag === "AllTags";

const isNoneTags = (config: AllowedTags): config is NoneTags =>
  config._tag === "NoneTags";

const isSpecificTags = (config: AllowedTags): config is SpecificTags =>
  config._tag === "SpecificTags";

// Usage
const config = AllowedTags.specific(["p", "a"]);
if (isSpecificTags(config)) {
  console.log(`Allowing ${config.tags.length} tags`);
  // TypeScript knows config.tags exists
}
```

## Design Decisions

### 1. Why S.Struct instead of TaggedStruct helper?

**Decision**: Use `S.Struct` with explicit `_tag` field instead of `TaggedStruct` helper.

**Rationale**:
- `TaggedStruct` is designed for tagged classes/complex objects
- Our variants are simple data structures (AllTags/NoneTags have no fields beyond `_tag`)
- `S.Struct({ _tag: S.Literal(...) })` is more explicit and readable for simple cases
- Follows Effect Schema documentation examples for discriminated unions

### 2. Why ReadonlyArray instead of Array?

**Decision**: Use `ReadonlyArray<HtmlTag>` in type definitions and factory signatures.

**Rationale**:
- Immutability is a core Effect principle
- `S.Array(HtmlTag)` decodes to `ReadonlyArray<HtmlTag>` by default
- Prevents accidental mutation of tag lists
- Type-safe integration with Effect utilities (`A.map`, `A.filter`, etc.)

### 3. Why not model the "defaults" case?

**Decision**: No `DefaultTags` variant for sanitize-html's `undefined` behavior.

**Rationale**:
- `undefined` is a configuration absence, not a data value
- Defaults should be handled at the options schema level with `S.optional` or `BS.FieldOptionOmittable`
- Keeping the union focused on explicit tag filtering behavior
- Example: `allowedTags: S.optional(AllowedTags)` at the options level

### 4. Why not use TaggedUnionFactory?

**Decision**: Manual union construction instead of `TaggedUnionFactory` from `@beep/schema`.

**Rationale**:
- `TaggedUnionFactory` is designed for dynamic union generation from runtime values
- Our three variants are statically known at compile time
- Manual construction provides better type inference for factory methods
- Simpler for future maintainers to understand (no abstraction overhead)

### 5. Why validate tags against HtmlTag schema?

**Decision**: Use `S.Array(HtmlTag)` instead of `S.Array(S.String)`.

**Rationale**:
- **Type safety**: Catch typos at validation time ("dvi" instead of "div")
- **Documentation**: HtmlTag provides autocomplete for 140+ valid tags
- **Consistency**: Aligns with other HTML-related schemas in `@beep/schema/integrations/html`
- **Future-proofing**: If HTML spec changes, we update HtmlTag once, not every consumer

## File Structure

```
packages/common/schema/src/integrations/sanitize-html/
├── index.ts                    # Public exports
├── allowed-tags.ts             # This schema
└── test/
    └── allowed-tags.test.ts    # Tests for AllowedTags schema
```

## Testing Strategy

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { AllowedTags } from "./allowed-tags";

effect("AllTags factory creates correct structure", () =>
  Effect.gen(function* () {
    const config = AllowedTags.all();
    strictEqual(config._tag, "AllTags");
  })
);

effect("NoneTags factory creates correct structure", () =>
  Effect.gen(function* () {
    const config = AllowedTags.none();
    strictEqual(config._tag, "NoneTags");
  })
);

effect("SpecificTags factory creates correct structure", () =>
  Effect.gen(function* () {
    const config = AllowedTags.specific(["p", "a", "div"]);
    strictEqual(config._tag, "SpecificTags");
    strictEqual(A.length(config.tags), 3);
  })
);

effect("Decodes AllTags variant", () =>
  Effect.gen(function* () {
    const config = yield* S.decodeUnknown(AllowedTags)({ _tag: "AllTags" });
    strictEqual(config._tag, "AllTags");
  })
);

effect("Decodes SpecificTags variant with valid tags", () =>
  Effect.gen(function* () {
    const config = yield* S.decodeUnknown(AllowedTags)({
      _tag: "SpecificTags",
      tags: ["p", "a", "div"],
    });
    strictEqual(config._tag, "SpecificTags");
    strictEqual(A.length(config.tags), 3);
  })
);

effect("Fails to decode SpecificTags with invalid tag", () =>
  Effect.gen(function* () {
    const result = yield* S.decodeUnknown(AllowedTags)({
      _tag: "SpecificTags",
      tags: ["p", "invalid-tag"],
    }).pipe(Effect.either);

    strictEqual(result._tag, "Left");
    // ParseError should mention HtmlTag validation failure
  })
);
```

## Migration from sanitize-html Options

```typescript
import type { IOptions } from "sanitize-html";
import { AllowedTags } from "./allowed-tags";

/**
 * Convert sanitize-html allowedTags to AllowedTags schema
 */
const fromSanitizeHtmlAllowedTags = (
  allowedTags: IOptions["allowedTags"]
): AllowedTags => {
  if (allowedTags === false) {
    return AllowedTags.all();
  }

  if (allowedTags === undefined || allowedTags.length === 0) {
    return AllowedTags.none();
  }

  return AllowedTags.specific(allowedTags as ReadonlyArray<HtmlTag>);
};

/**
 * Convert AllowedTags schema to sanitize-html allowedTags
 */
const toSanitizeHtmlAllowedTags = (
  config: AllowedTags
): false | ReadonlyArray<string> =>
  Match.value(config).pipe(
    Match.tag("AllTags", () => false as const),
    Match.tag("NoneTags", () => [] as const),
    Match.tag("SpecificTags", ({ tags }) => tags),
    Match.exhaustive
  );
```

## JSON Schema Generation

The schema annotations support automatic JSON Schema generation:

```typescript
import * as JSONSchema from "@effect/schema/JSONSchema";

const jsonSchema = JSONSchema.make(AllowedTags);
```

**Output**:
```json
{
  "type": "object",
  "title": "Allowed Tags Configuration",
  "description": "Specifies which HTML tags are permitted in sanitized output",
  "oneOf": [
    {
      "type": "object",
      "title": "All Tags Allowed",
      "description": "Allow all HTML tags (no tag filtering)",
      "required": ["_tag"],
      "properties": {
        "_tag": { "const": "AllTags" }
      }
    },
    {
      "type": "object",
      "title": "No Tags Allowed",
      "description": "Strip all HTML tags, preserving only text content",
      "required": ["_tag"],
      "properties": {
        "_tag": { "const": "NoneTags" }
      }
    },
    {
      "type": "object",
      "title": "Specific Tags Allowed",
      "description": "Allow only the specified HTML tags",
      "required": ["_tag", "tags"],
      "properties": {
        "_tag": { "const": "SpecificTags" },
        "tags": {
          "type": "array",
          "title": "Allowed Tags",
          "description": "Array of HTML tag names to allow",
          "items": { "$ref": "#/$defs/HtmlTag" }
        }
      }
    }
  ]
}
```

## Summary

The `AllowedTags` discriminated union provides:

1. **Type Safety**: Validated HTML tags via `HtmlTag` schema
2. **Exhaustiveness**: Match.value ensures all cases handled
3. **Clear Intent**: Factory methods (`.all()`, `.none()`, `.specific()`) make usage obvious
4. **Effect Integration**: Works seamlessly with Effect Schema encoding/decoding
5. **Documentation**: Rich annotations for JSON Schema generation
6. **Immutability**: ReadonlyArray enforces immutable tag lists

This design aligns with Effect Schema best practices and integrates cleanly with the existing `@beep/schema/integrations/html` infrastructure.
