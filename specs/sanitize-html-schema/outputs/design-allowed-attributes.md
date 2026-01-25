# AllowedAttributes Discriminated Union Design

**Phase**: P2 Evaluation
**Date**: 2026-01-25
**Status**: Draft Design

---

## Executive Summary

This document presents the design for `AllowedAttributes`, a discriminated union representing sanitize-html's `allowedAttributes` configuration option. The design handles three distinct modes: allow all attributes, allow no attributes, and per-tag attribute constraints.

---

## Design Decisions

### 1. Wildcard Key Handling

**Decision**: Option A - Use `S.Record` with `S.Union(HtmlTag, S.Literal("*"))`

**Rationale**:
- Aligns with sanitize-html's native behavior where `*` is treated as a special key in the same object
- Simpler mental model - one unified mapping rather than split global/per-tag fields
- TypeScript Record type naturally supports string literal unions as keys
- Allows Match.value patterns to operate on a single unified structure

**Alternative Rejected**:
- Option B (separate `globalAttributes` field): Increases complexity, splits related concerns
- Option C (custom `TagOrWildcard` schema): Over-engineering for what Record already handles

### 2. AllowedAttribute Union Structure

**Decision**: Use `S.Union` of simple string OR constraint object

```typescript
const AttributeConstraint = S.Struct({
  name: S.String,
  multiple: S.optional(S.Boolean),
  values: S.Array(S.String),
}).annotations({
  identifier: "AttributeConstraint",
  description: "Attribute with value constraints",
});

const AllowedAttribute = S.Union(
  S.String,  // Simple attribute name
  AttributeConstraint  // Constrained attribute
).annotations({
  identifier: "AllowedAttribute",
  description: "An allowed attribute name or constrained attribute definition",
});
```

**Rationale**:
- Direct mapping to sanitize-html's runtime type
- `S.String` handles simple cases (90% of usage)
- `AttributeConstraint` handles advanced validation use cases
- Union order matters: simpler schema first for better error messages

---

## Complete Schema Design

### Core Schemas

```typescript
import * as S from "effect/Schema";
import { HtmlTag } from "@beep/schema/integrations/html/literal-kits/html-tag";

// ============================================================================
// AllowedAttribute Union
// ============================================================================

/**
 * Attribute with value constraints
 *
 * @example
 * { name: "target", values: ["_blank", "_self"] }
 * { name: "class", multiple: true, values: ["btn", "btn-primary"] }
 */
export const AttributeConstraint = S.Struct({
  name: S.String,
  multiple: S.optional(S.Boolean),
  values: S.Array(S.String),
}).annotations({
  identifier: "AttributeConstraint",
  description: "Attribute with value constraints",
  examples: [
    { name: "target", values: ["_blank", "_self"] },
    { name: "class", multiple: true, values: ["btn", "btn-primary"] },
  ],
});

export type AttributeConstraint = S.Schema.Type<typeof AttributeConstraint>;

/**
 * An allowed attribute - either a simple name or a constrained definition
 *
 * @example
 * "class"
 * "id"
 * { name: "target", values: ["_blank", "_self"] }
 */
export const AllowedAttribute = S.Union(
  S.String,
  AttributeConstraint
).annotations({
  identifier: "AllowedAttribute",
  description: "An allowed attribute name or constrained attribute definition",
  examples: [
    "class",
    "id",
    { name: "target", values: ["_blank", "_self"] },
  ],
});

export type AllowedAttribute = S.Schema.Type<typeof AllowedAttribute>;

// ============================================================================
// Tag Key (HtmlTag | "*")
// ============================================================================

/**
 * Tag key for attribute mappings - either a specific HTML tag or wildcard "*"
 *
 * The wildcard "*" applies to all tags.
 */
export const TagKey = S.Union(
  HtmlTag,
  S.Literal("*")
).annotations({
  identifier: "TagKey",
  description: "HTML tag name or wildcard '*' for global attributes",
});

export type TagKey = S.Schema.Type<typeof TagKey>;

// ============================================================================
// Discriminated Union Variants
// ============================================================================

/**
 * Allow ALL attributes on all tags (allowedAttributes: false)
 */
export class AllAttributes extends S.TaggedStruct<AllAttributes>()("AllAttributes", {
  // No additional fields
}) {}

/**
 * Allow NO attributes (allowedAttributes: undefined with no defaults)
 */
export class NoneAttributes extends S.TaggedStruct<NoneAttributes>()("NoneAttributes", {
  // No additional fields
}) {}

/**
 * Per-tag attribute mapping with wildcard support
 *
 * @example
 * {
 *   _tag: "SpecificAttributes",
 *   attributes: {
 *     "*": ["class", "id"],
 *     "a": ["href", "target"]
 *   }
 * }
 */
export class SpecificAttributes extends S.TaggedStruct<SpecificAttributes>()("SpecificAttributes", {
  attributes: S.Record({
    key: TagKey,
    value: S.Array(AllowedAttribute),
  }).annotations({
    description: "Per-tag attribute allowlist with optional wildcard '*' key",
  }),
}) {}

// ============================================================================
// Union Schema
// ============================================================================

/**
 * Allowed attributes configuration for sanitize-html
 *
 * Three modes:
 * - AllAttributes: Allow ALL attributes on all tags
 * - NoneAttributes: Disallow all attributes
 * - SpecificAttributes: Per-tag attribute allowlist
 *
 * @example
 * AllowedAttributes.all()
 * AllowedAttributes.none()
 * AllowedAttributes.specific({
 *   "*": ["class", "id"],
 *   "a": ["href", { name: "target", values: ["_blank", "_self"] }]
 * })
 */
export const AllowedAttributes = S.Union(
  AllAttributes,
  NoneAttributes,
  SpecificAttributes
).annotations({
  identifier: "AllowedAttributes",
  description: "Allowed attributes configuration for sanitize-html",
  title: "Allowed Attributes",
});

export type AllowedAttributes = S.Schema.Type<typeof AllowedAttributes>;

// ============================================================================
// Factory Functions
// ============================================================================

export const AllowedAttributesFactory = {
  /**
   * Allow ALL attributes on all tags
   */
  all: (): AllAttributes => new AllAttributes({ _tag: "AllAttributes" }),

  /**
   * Allow NO attributes
   */
  none: (): NoneAttributes => new NoneAttributes({ _tag: "NoneAttributes" }),

  /**
   * Per-tag attribute allowlist
   *
   * @param attributes - Mapping from tag name (or "*") to allowed attributes
   *
   * @example
   * AllowedAttributesFactory.specific({
   *   "*": ["class", "id"],
   *   "a": ["href", "target"]
   * })
   */
  specific: (
    attributes: Record<TagKey, readonly AllowedAttribute[]>
  ): SpecificAttributes =>
    new SpecificAttributes({
      _tag: "SpecificAttributes",
      attributes,
    }),
} as const;
```

---

## Usage Examples

### Factory Functions

```typescript
import { AllowedAttributesFactory as AAF } from "./allowed-attributes";

// Allow all attributes
const allowAll = AAF.all();
// → { _tag: "AllAttributes" }

// Allow no attributes
const allowNone = AAF.none();
// → { _tag: "NoneAttributes" }

// Per-tag allowlist
const perTag = AAF.specific({
  "*": ["class", "id"],  // Global attributes
  "a": ["href", "target"],  // Link attributes
  "img": [
    "src",
    "alt",
    { name: "loading", values: ["lazy", "eager"] }  // Constrained attribute
  ],
});
// → {
//   _tag: "SpecificAttributes",
//   attributes: {
//     "*": ["class", "id"],
//     "a": ["href", "target"],
//     "img": ["src", "alt", { name: "loading", values: [...] }]
//   }
// }
```

### Match.value Pattern

```typescript
import * as Match from "effect/Match";
import * as A from "effect/Array";
import { AllowedAttributes } from "./allowed-attributes";

const getAttributesForTag = (
  config: AllowedAttributes,
  tag: string
): readonly string[] =>
  Match.value(config).pipe(
    Match.tag("AllAttributes", () =>
      ["*"]  // Special marker: all attributes allowed
    ),
    Match.tag("NoneAttributes", () =>
      []  // No attributes allowed
    ),
    Match.tag("SpecificAttributes", ({ attributes }) => {
      const tagSpecific = attributes[tag] ?? [];
      const global = attributes["*"] ?? [];

      // Merge global and tag-specific attributes
      return A.appendAll(global, tagSpecific);
    }),
    Match.exhaustive
  );

// Usage
const config = AAF.specific({
  "*": ["class", "id"],
  "a": ["href", "target"],
});

getAttributesForTag(config, "a");
// → ["class", "id", "href", "target"]

getAttributesForTag(config, "div");
// → ["class", "id"]
```

### Schema Validation

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

const validateConfig = (input: unknown) =>
  Effect.gen(function* () {
    const config = yield* S.decodeUnknown(AllowedAttributes)(input);

    return Match.value(config).pipe(
      Match.tag("AllAttributes", () => "Allowing all attributes"),
      Match.tag("NoneAttributes", () => "Blocking all attributes"),
      Match.tag("SpecificAttributes", ({ attributes }) =>
        `Configured ${Object.keys(attributes).length} tag rules`
      ),
      Match.exhaustive
    );
  });

// Valid inputs
yield* validateConfig({ _tag: "AllAttributes" });
// → "Allowing all attributes"

yield* validateConfig({
  _tag: "SpecificAttributes",
  attributes: {
    "*": ["class"],
    "a": ["href"]
  }
});
// → "Configured 2 tag rules"

// Invalid input
yield* validateConfig({ _tag: "Unknown" });
// → ParseError: Expected AllAttributes | NoneAttributes | SpecificAttributes
```

---

## Integration with sanitize-html

### Encoding to Runtime Format

```typescript
import * as S from "effect/Schema";
import * as Match from "effect/Match";

/**
 * Convert AllowedAttributes schema to sanitize-html runtime format
 */
const encodeToSanitizeHtml = (config: AllowedAttributes) =>
  Match.value(config).pipe(
    Match.tag("AllAttributes", () => false),  // false = allow all
    Match.tag("NoneAttributes", () => undefined),  // undefined = allow none
    Match.tag("SpecificAttributes", ({ attributes }) => attributes),
    Match.exhaustive
  );

// Usage in sanitize-html options
const sanitizeOptions = {
  allowedTags: ["a", "img", "div"],
  allowedAttributes: encodeToSanitizeHtml(
    AAF.specific({
      "*": ["class", "id"],
      "a": ["href", "target"],
    })
  ),
  // → { "*": ["class", "id"], "a": ["href", "target"] }
};
```

### Decoding from Runtime Format

```typescript
import * as O from "effect/Option";
import * as P from "effect/Predicate";

/**
 * Decode sanitize-html allowedAttributes to schema
 */
const decodeFromSanitizeHtml = (
  input: unknown
): AllowedAttributes => {
  // false → AllAttributes
  if (input === false) {
    return AAF.all();
  }

  // undefined → NoneAttributes
  if (input === undefined) {
    return AAF.none();
  }

  // Record → SpecificAttributes
  if (P.isRecord(input)) {
    return AAF.specific(input as Record<TagKey, readonly AllowedAttribute[]>);
  }

  // Fallback: treat unknown as NoneAttributes
  return AAF.none();
};
```

---

## Type Safety Guarantees

### 1. Exhaustive Tag Matching

TypeScript enforces exhaustive matching on the `_tag` discriminator:

```typescript
const handle = (config: AllowedAttributes): string =>
  Match.value(config).pipe(
    Match.tag("AllAttributes", () => "all"),
    Match.tag("NoneAttributes", () => "none"),
    // Missing SpecificAttributes case
    Match.exhaustive  // ← TypeScript error!
  );
```

### 2. Tag Key Validation

The `TagKey` schema ensures only valid HTML tags or `"*"` wildcard:

```typescript
// Valid
const valid = AAF.specific({
  "*": ["class"],
  "a": ["href"],
  "img": ["src"],
});

// Invalid - TypeScript error
const invalid = AAF.specific({
  "not-a-real-tag": ["class"],  // ← Type error: not in HtmlTag union
});
```

### 3. Attribute Constraint Validation

The `AllowedAttribute` union validates both simple strings and constraint objects:

```typescript
// Valid
const valid = AAF.specific({
  "a": [
    "href",  // Simple string
    { name: "target", values: ["_blank", "_self"] }  // Constraint object
  ]
});

// Invalid - Schema validation failure
const invalid = AAF.specific({
  "a": [
    { name: "target" }  // Missing required 'values' field
  ]
});
```

---

## Migration from Existing Code

### Before (Plain TypeScript)

```typescript
const allowedAttributes: Record<string, string[]> | false | undefined = {
  "*": ["class", "id"],
  "a": ["href", "target"],
};
```

### After (Effect Schema)

```typescript
import { AllowedAttributesFactory as AAF } from "./allowed-attributes";

const allowedAttributes = AAF.specific({
  "*": ["class", "id"],
  "a": ["href", "target"],
});
```

**Benefits**:
- Type-safe tag keys (only valid HTML tags)
- Runtime validation via schema decoding
- Pattern matching on discriminated union
- Clear semantic meaning via factory functions

---

## Open Questions

1. **Attribute Name Validation**: Should we validate attribute names against a known list (similar to `HtmlAttribute` literal kit)?
   - **Current**: Any string accepted
   - **Alternative**: `S.Union(HtmlAttribute, S.String)` to suggest valid attributes but allow custom

2. **Multiple Attribute Semantics**: What does `multiple: true` mean in sanitize-html?
   - Need to verify: Does it allow multiple space-separated values, or multiple instances of the attribute?
   - Current schema accepts the field but doesn't document behavior

3. **Value Validation**: Should we validate attribute values against known safe patterns?
   - **Example**: `target` values should be `_blank | _self | _parent | _top`
   - **Risk**: Over-constraining could break valid use cases
   - **Recommendation**: Phase 3 enhancement after core schema is validated

---

## Next Steps

1. Implement schema in `packages/common/utils/src/sanitize-html/schemas/allowed-attributes.ts`
2. Add unit tests for all three variants and factory functions
3. Add integration tests for encoding/decoding with sanitize-html runtime format
4. Validate attribute constraint behavior with sanitize-html library
5. Document wildcard `*` merging semantics in integration guide

---

## Related Documents

- `specs/sanitize-html-schema/outputs/types-inventory.md` - AllowedAttribute type definition
- `packages/common/schema/src/integrations/html/literal-kits/html-tag.ts` - HtmlTag schema
- `packages/common/schema/src/integrations/html/literal-kits/html-attributes.ts` - HtmlAttribute schema (future enhancement)
