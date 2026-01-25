# SanitizeConfig Schema Design

## Overview

Complete Effect Schema design for sanitize-html configuration with support for all serializable fields. This design excludes callback functions (runtime-only) and provides serializable representations for RegExp patterns.

## Design Principles

1. **Discriminated Unions** for variant types (`AllowedTags`, `AllowedAttributes`, etc.)
2. **RegExp Serialization** via `{ source: string, flags: string }` pattern
3. **Sensible Defaults** matching sanitize-html library defaults
4. **Type Safety** using branded types and literal-kits where applicable
5. **Documentation** for every field explaining purpose and behavior

## Core Schema Implementation

```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";

// ============================================================================
// RegExp Pattern Schema
// ============================================================================

/**
 * Serializable representation of a RegExp pattern.
 * Stores source and flags separately for JSON serialization.
 */
export class RegExpPattern extends S.Class<RegExpPattern>("RegExpPattern")({
  source: S.String.annotations({
    description: "The regular expression source string",
    examples: ["^https?://", "\\d{3}-\\d{4}"],
  }),
  flags: S.optional(S.String).annotations({
    description: "RegExp flags (i, g, m, s, u, y)",
    examples: ["i", "gi", ""],
  }),
}).annotations({
  identifier: "RegExpPattern",
  description: "Serializable RegExp representation",
}) {
  /**
   * Convert to native RegExp instance
   */
  toRegExp(): RegExp {
    return new RegExp(this.source, this.flags);
  }

  /**
   * Create RegExpPattern from native RegExp
   */
  static fromRegExp(regex: RegExp): RegExpPattern {
    return new RegExpPattern({
      source: regex.source,
      flags: regex.flags,
    });
  }
}

// ============================================================================
// Discriminated Union Types
// ============================================================================

/**
 * AllowedTags configuration:
 * - AllowAll: false (allow all tags)
 * - AllowSpecific: array of allowed tag names
 */
export const AllowedTags = S.Union(
  S.Struct({
    _tag: S.Literal("AllowAll"),
  }).annotations({
    identifier: "AllowedTags.AllowAll",
    description: "Allow all HTML tags (allowedTags: false)",
  }),
  S.Struct({
    _tag: S.Literal("AllowSpecific"),
    tags: S.Array(HtmlTag).annotations({
      description: "Array of allowed HTML tag names",
    }),
  }).annotations({
    identifier: "AllowedTags.AllowSpecific",
    description: "Allow only specific HTML tags",
  })
).annotations({
  identifier: "AllowedTags",
  description: "Configuration for allowed HTML tags",
});

export type AllowedTags = S.Schema.Type<typeof AllowedTags>;

/**
 * AllowedAttribute configuration for a single attribute:
 * - String: simple attribute name
 * - Pattern: attribute name with RegExp pattern for values
 */
export const AllowedAttribute = S.Union(
  S.String.annotations({
    description: "Simple attribute name (allows any value)",
  }),
  S.Struct({
    name: HtmlAttribute,
    pattern: RegExpPattern,
  }).annotations({
    identifier: "AllowedAttribute.Pattern",
    description: "Attribute with regex pattern constraint on values",
  })
).annotations({
  identifier: "AllowedAttribute",
  description: "Single allowed attribute configuration",
});

export type AllowedAttribute = S.Schema.Type<typeof AllowedAttribute>;

/**
 * AllowedAttributes configuration:
 * - AllowAll: false (allow all attributes on all tags)
 * - AllowSpecific: Record mapping tag names to allowed attributes
 */
export const AllowedAttributes = S.Union(
  S.Struct({
    _tag: S.Literal("AllowAll"),
  }).annotations({
    identifier: "AllowedAttributes.AllowAll",
    description: "Allow all attributes on all tags (allowedAttributes: false)",
  }),
  S.Struct({
    _tag: S.Literal("AllowSpecific"),
    byTag: S.Record(S.String, S.Array(AllowedAttribute)).annotations({
      description: "Map of tag names to their allowed attributes",
    }),
  }).annotations({
    identifier: "AllowedAttributes.AllowSpecific",
    description: "Allow only specific attributes per tag",
  })
).annotations({
  identifier: "AllowedAttributes",
  description: "Configuration for allowed HTML attributes",
});

export type AllowedAttributes = S.Schema.Type<typeof AllowedAttributes>;

/**
 * AllowedSchemes configuration:
 * - AllowAll: false (allow all URL schemes)
 * - AllowSpecific: array of allowed schemes
 */
export const AllowedSchemes = S.Union(
  S.Struct({
    _tag: S.Literal("AllowAll"),
  }).annotations({
    identifier: "AllowedSchemes.AllowAll",
    description: "Allow all URL schemes (allowedSchemes: false)",
  }),
  S.Struct({
    _tag: S.Literal("AllowSpecific"),
    schemes: S.Array(AllowedScheme).annotations({
      description: "Array of allowed URL schemes",
    }),
  }).annotations({
    identifier: "AllowedSchemes.AllowSpecific",
    description: "Allow only specific URL schemes",
  })
).annotations({
  identifier: "AllowedSchemes",
  description: "Configuration for allowed URL schemes",
});

export type AllowedSchemes = S.Schema.Type<typeof AllowedSchemes>;

/**
 * AllowedSchemesByTag configuration:
 * - AllowAll: false (allow all schemes on all tags)
 * - AllowSpecific: Record mapping tag names to allowed schemes
 */
export const AllowedSchemesByTag = S.Union(
  S.Struct({
    _tag: S.Literal("AllowAll"),
  }).annotations({
    identifier: "AllowedSchemesByTag.AllowAll",
    description: "Allow all schemes on all tags (allowedSchemesByTag: false)",
  }),
  S.Struct({
    _tag: S.Literal("AllowSpecific"),
    byTag: S.Record(S.String, S.Array(AllowedScheme)).annotations({
      description: "Map of tag names to their allowed URL schemes",
    }),
  }).annotations({
    identifier: "AllowedSchemesByTag.AllowSpecific",
    description: "Allow only specific schemes per tag",
  })
).annotations({
  identifier: "AllowedSchemesByTag",
  description: "Configuration for allowed URL schemes by tag",
});

export type AllowedSchemesByTag = S.Schema.Type<typeof AllowedSchemesByTag>;

/**
 * AllowedClasses configuration for a single tag:
 * - AllowAll: false (allow all classes)
 * - AllowSpecific: array of class patterns (string or RegExp)
 */
export const AllowedClassesForTag = S.Union(
  S.Struct({
    _tag: S.Literal("AllowAll"),
  }).annotations({
    identifier: "AllowedClassesForTag.AllowAll",
    description: "Allow all classes on this tag",
  }),
  S.Struct({
    _tag: S.Literal("AllowSpecific"),
    classes: S.Array(
      S.Union(
        S.String.annotations({ description: "Exact class name match" }),
        RegExpPattern.annotations({ description: "Class name pattern match" })
      )
    ),
  }).annotations({
    identifier: "AllowedClassesForTag.AllowSpecific",
    description: "Allow only specific classes (exact or pattern)",
  })
).annotations({
  identifier: "AllowedClassesForTag",
  description: "Configuration for allowed classes on a single tag",
});

export type AllowedClassesForTag = S.Schema.Type<typeof AllowedClassesForTag>;

// ============================================================================
// Main Configuration Schema
// ============================================================================

/**
 * Complete sanitize-html configuration schema.
 *
 * Excludes callback fields (textFilter, exclusiveFilter, transformTags,
 * onOpenTag, onCloseTag) as they cannot be serialized.
 *
 * Matches sanitize-html defaults where appropriate.
 */
export class SanitizeConfig extends S.Class<SanitizeConfig>("SanitizeConfig")({
  // -------------------------------------------------------------------------
  // Core Tag/Attribute Allow-lists
  // -------------------------------------------------------------------------

  allowedTags: BS.FieldOptionOmittable(AllowedTags).annotations({
    description:
      "Tags to allow. Undefined = default set, AllowAll = all tags, AllowSpecific = explicit list",
    examples: [
      { _tag: "AllowAll" },
      { _tag: "AllowSpecific", tags: ["p", "b", "i", "a", "div"] },
    ],
  }),

  allowedAttributes: BS.FieldOptionOmittable(AllowedAttributes).annotations({
    description:
      "Attributes to allow per tag. Undefined = default set, AllowAll = all attributes, AllowSpecific = per-tag map",
    examples: [
      { _tag: "AllowAll" },
      {
        _tag: "AllowSpecific",
        byTag: {
          a: ["href", { name: "target", pattern: { source: "_blank" } }],
          img: ["src", "alt"],
        },
      },
    ],
  }),

  disallowedTagsMode: BS.FieldOptionOmittable(TagsMode).annotations({
    description:
      "How to handle disallowed tags: 'discard' removes tag but keeps content, 'escape' HTML-encodes tag, 'recursiveEscape' encodes recursively, 'completelyDiscard' removes tag and content",
    default: "discard",
  }),

  // -------------------------------------------------------------------------
  // URL Scheme Filtering
  // -------------------------------------------------------------------------

  allowedSchemes: BS.FieldOptionOmittable(AllowedSchemes).annotations({
    description:
      "URL schemes to allow globally. Undefined = default schemes (http, https, mailto, ftp), AllowAll = all schemes, AllowSpecific = explicit list",
    examples: [
      { _tag: "AllowAll" },
      { _tag: "AllowSpecific", schemes: ["http", "https", "mailto"] },
    ],
  }),

  allowedSchemesByTag: BS.FieldOptionOmittable(AllowedSchemesByTag).annotations({
    description:
      "URL schemes to allow per tag. Undefined = use allowedSchemes, AllowAll = all schemes on all tags, AllowSpecific = per-tag map",
    examples: [
      {
        _tag: "AllowSpecific",
        byTag: {
          a: ["http", "https", "mailto"],
          img: ["http", "https", "data"],
        },
      },
    ],
  }),

  allowedSchemesAppliedToAttributes: BS.FieldOptionOmittable(S.Array(HtmlAttribute)).annotations({
    description:
      "Attributes to which scheme filtering applies. Defaults to ['href', 'src', 'cite']",
    examples: [["href", "src", "cite", "action"]],
  }),

  allowProtocolRelative: BS.BoolWithDefault(true).annotations({
    description:
      "Whether to allow protocol-relative URLs (//example.com). Default: true",
  }),

  // -------------------------------------------------------------------------
  // iframe Security
  // -------------------------------------------------------------------------

  allowIframeRelativeUrls: BS.FieldOptionOmittable(S.Boolean).annotations({
    description:
      "Whether to allow relative URLs in iframe src attributes. Default: undefined (disallow)",
  }),

  allowedIframeHostnames: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Whitelist of allowed iframe hostnames (exact match). Example: ['www.youtube.com']",
    examples: [["www.youtube.com", "player.vimeo.com"]],
  }),

  allowedIframeDomains: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Whitelist of allowed iframe domains (suffix match). Example: ['youtube.com'] allows 'www.youtube.com'",
    examples: [["youtube.com", "vimeo.com"]],
  }),

  // -------------------------------------------------------------------------
  // script Security
  // -------------------------------------------------------------------------

  allowedScriptHostnames: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Whitelist of allowed script hostnames (exact match). Requires script tag to be in allowedTags",
    examples: [["cdn.example.com", "js.stripe.com"]],
  }),

  allowedScriptDomains: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Whitelist of allowed script domains (suffix match). Requires script tag to be in allowedTags",
    examples: [["example.com", "stripe.com"]],
  }),

  // -------------------------------------------------------------------------
  // CSS/Style Filtering
  // -------------------------------------------------------------------------

  parseStyleAttributes: BS.BoolWithDefault(true).annotations({
    description:
      "Whether to parse and filter style attributes according to allowedStyles. Default: true",
  }),

  allowedStyles: BS.FieldOptionOmittable(
    S.Record(
      S.String,
      S.Record(S.String, S.Array(RegExpPattern))
    )
  ).annotations({
    description:
      "Map of tag names to map of CSS properties to array of allowed value patterns. Only applies if parseStyleAttributes is true",
    examples: [
      {
        "*": {
          color: [{ source: "^#[0-9a-f]{6}$", flags: "i" }],
          "text-align": [{ source: "^(left|right|center)$" }],
        },
        div: {
          "background-color": [{ source: "^#[0-9a-f]{6}$", flags: "i" }],
        },
      },
    ],
  }),

  allowedClasses: BS.FieldOptionOmittable(
    S.Record(S.String, AllowedClassesForTag)
  ).annotations({
    description:
      "Map of tag names to allowed class configurations. Each tag can specify AllowAll or AllowSpecific classes (exact or pattern)",
    examples: [
      {
        div: { _tag: "AllowAll" },
        p: {
          _tag: "AllowSpecific",
          classes: ["text-center", { source: "^bg-", flags: "" }],
        },
      },
    ],
  }),

  // -------------------------------------------------------------------------
  // Tag Behavior
  // -------------------------------------------------------------------------

  selfClosing: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Tags to treat as self-closing (e.g., <br> becomes <br />). Defaults to HTML5 self-closing tags",
    examples: [["br", "hr", "img", "input", "link", "meta"]],
  }),

  nonTextTags: BS.FieldOptionOmittable(S.Array(S.String)).annotations({
    description:
      "Tags whose content should not be treated as text (disables textFilter). Defaults to ['script', 'style', 'textarea', 'option']",
    examples: [["script", "style", "textarea", "noscript"]],
  }),

  enforceHtmlBoundary: BS.BoolWithDefault(false).annotations({
    description:
      "Whether to enforce that output is a complete HTML document with <html>, <head>, <body>. Default: false",
  }),

  // -------------------------------------------------------------------------
  // Attribute Behavior
  // -------------------------------------------------------------------------

  nonBooleanAttributes: BS.FieldOptionOmittable(S.Array(HtmlAttribute)).annotations({
    description:
      "Attributes that should always have a value (not treated as boolean). Defaults to common non-boolean attributes like 'href', 'src'",
    examples: [["href", "src", "alt", "title", "class"]],
  }),

  allowedEmptyAttributes: BS.FieldOptionOmittable(S.Array(HtmlAttribute)).annotations({
    description:
      "Attributes that are allowed to have empty string values. By default, attributes with empty values are removed",
    examples: [["alt", "title", "value"]],
  }),

  // -------------------------------------------------------------------------
  // Security Flags
  // -------------------------------------------------------------------------

  allowVulnerableTags: BS.BoolWithDefault(false).annotations({
    description:
      "Whether to allow potentially dangerous tags like <script>, <style>, <iframe> even if in allowedTags. Default: false (safer)",
  }),
}).annotations({
  identifier: "SanitizeConfig",
  title: "Sanitize HTML Configuration",
  description:
    "Complete configuration for sanitize-html library. Serializable subset excluding callback functions (textFilter, exclusiveFilter, transformTags, onOpenTag, onCloseTag)",
  examples: [
    {
      // Strict security preset
      allowedTags: { _tag: "AllowSpecific", tags: ["p", "b", "i", "strong", "em"] },
      allowedAttributes: { _tag: "AllowSpecific", byTag: {} },
      allowProtocolRelative: false,
      allowVulnerableTags: false,
      parseStyleAttributes: false,
    },
    {
      // Permissive preset with iframe/script restrictions
      allowedTags: { _tag: "AllowAll" },
      allowedAttributes: { _tag: "AllowAll" },
      allowedIframeDomains: ["youtube.com", "vimeo.com"],
      allowedScriptDomains: ["cdn.example.com"],
      allowVulnerableTags: false,
    },
  ],
}) {}

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Default sanitize-html configuration matching library defaults.
 * Strict but commonly used tags/attributes are allowed.
 */
export const DefaultSanitizeConfig = new SanitizeConfig({
  allowedTags: {
    _tag: "AllowSpecific",
    tags: [
      "address",
      "article",
      "aside",
      "footer",
      "header",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hgroup",
      "main",
      "nav",
      "section",
      "blockquote",
      "dd",
      "div",
      "dl",
      "dt",
      "figcaption",
      "figure",
      "hr",
      "li",
      "ol",
      "p",
      "pre",
      "ul",
      "a",
      "abbr",
      "b",
      "bdi",
      "bdo",
      "br",
      "cite",
      "code",
      "data",
      "dfn",
      "em",
      "i",
      "kbd",
      "mark",
      "q",
      "rb",
      "rp",
      "rt",
      "rtc",
      "ruby",
      "s",
      "samp",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "time",
      "u",
      "var",
      "wbr",
      "caption",
      "col",
      "colgroup",
      "table",
      "tbody",
      "td",
      "tfoot",
      "th",
      "thead",
      "tr",
    ],
  },
  allowedAttributes: {
    _tag: "AllowSpecific",
    byTag: {
      a: ["href", "name", "target"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    },
  },
  allowedSchemes: {
    _tag: "AllowSpecific",
    schemes: ["http", "https", "ftp", "mailto", "tel"],
  },
  allowProtocolRelative: true,
  parseStyleAttributes: true,
  allowVulnerableTags: false,
  enforceHtmlBoundary: false,
});

/**
 * Minimal configuration - only allow basic text formatting.
 */
export const MinimalSanitizeConfig = new SanitizeConfig({
  allowedTags: {
    _tag: "AllowSpecific",
    tags: ["p", "b", "i", "strong", "em", "br"],
  },
  allowedAttributes: {
    _tag: "AllowSpecific",
    byTag: {},
  },
  allowProtocolRelative: false,
  parseStyleAttributes: false,
  allowVulnerableTags: false,
});

/**
 * Permissive configuration - allow most tags but restrict dangerous ones.
 */
export const PermissiveSanitizeConfig = new SanitizeConfig({
  allowedTags: { _tag: "AllowAll" },
  allowedAttributes: { _tag: "AllowAll" },
  allowedSchemes: {
    _tag: "AllowSpecific",
    schemes: ["http", "https", "mailto", "tel", "data"],
  },
  allowedIframeDomains: ["youtube.com", "vimeo.com", "youtube-nocookie.com"],
  allowProtocolRelative: true,
  parseStyleAttributes: true,
  allowVulnerableTags: false, // Still block inline scripts
});
```

## Design Rationale

### 1. Excluded Callback Fields

The following fields are **excluded** from the schema as they cannot be serialized:

- `textFilter: (text: string, tagName: string) => string` - Runtime text transformation
- `exclusiveFilter: (frame: Frame) => boolean | "excludeTag"` - Custom DOM filtering
- `transformTags: Record<string, string | Transformer>` - Tag transformation callbacks
- `onOpenTag: (name: string, attribs: Record<string, string>) => void` - Event hooks
- `onCloseTag: (name: string, isImplied: boolean) => void` - Event hooks

**Rationale**: These callbacks require runtime JavaScript functions that cannot be represented in JSON or Effect Schema. Applications needing these features must apply them separately after schema-based configuration.

### 2. RegExp Serialization

`RegExpPattern` schema stores regex as `{ source: string, flags?: string }`:

```typescript
// Serialize
const pattern = RegExpPattern.fromRegExp(/^https?:\/\//i);
// { source: "^https?:\\/\\/", flags: "i" }

// Deserialize
const regex = pattern.toRegExp();
// /^https?:\/\//i
```

**Rationale**: RegExp instances cannot be JSON-serialized. This pattern allows full round-trip serialization while preserving all regex semantics.

### 3. Discriminated Unions for Variant Types

Fields with `false = allow all` semantics use discriminated unions:

```typescript
// allowedTags: false → AllowAll
{ _tag: "AllowAll" }

// allowedTags: ["p", "div"] → AllowSpecific
{ _tag: "AllowSpecific", tags: ["p", "div"] }
```

**Rationale**: Type-safe pattern matching via `_tag` discriminator. Eliminates boolean/array union ambiguity and enables exhaustive checking.

### 4. Default Values

Defaults match sanitize-html library behavior:

| Field | Default | Rationale |
|-------|---------|-----------|
| `allowProtocolRelative` | `true` | Matches sanitize-html default |
| `allowVulnerableTags` | `false` | Security-first default |
| `parseStyleAttributes` | `true` | Matches sanitize-html default |
| `enforceHtmlBoundary` | `false` | Matches sanitize-html default |
| `disallowedTagsMode` | `"discard"` | Matches sanitize-html default |

### 5. Field Organization

Fields are grouped by semantic category:

1. **Core Tag/Attribute Allow-lists** - Primary filtering logic
2. **URL Scheme Filtering** - Link/resource security
3. **iframe Security** - Embed restrictions
4. **script Security** - Script source restrictions
5. **CSS/Style Filtering** - Style attribute controls
6. **Tag Behavior** - Self-closing, non-text tags
7. **Attribute Behavior** - Boolean attributes, empty values
8. **Security Flags** - Top-level security toggles

**Rationale**: Logical grouping improves maintainability and makes common configuration patterns easier to find.

## Type Exports

```typescript
export type SanitizeConfig = S.Schema.Type<typeof SanitizeConfig>;
export type AllowedTags = S.Schema.Type<typeof AllowedTags>;
export type AllowedAttributes = S.Schema.Type<typeof AllowedAttributes>;
export type AllowedSchemes = S.Schema.Type<typeof AllowedSchemes>;
export type AllowedSchemesByTag = S.Schema.Type<typeof AllowedSchemesByTag>;
export type AllowedAttribute = S.Schema.Type<typeof AllowedAttribute>;
export type AllowedClassesForTag = S.Schema.Type<typeof AllowedClassesForTag>;
export type RegExpPattern = S.Schema.Type<typeof RegExpPattern>;
```

## Usage Examples

### Basic Usage

```typescript
import * as S from "effect/Schema";
import { SanitizeConfig, DefaultSanitizeConfig } from "@beep/schema";

// Use default configuration
const config = DefaultSanitizeConfig;

// Create custom configuration
const customConfig = new SanitizeConfig({
  allowedTags: {
    _tag: "AllowSpecific",
    tags: ["p", "b", "i", "a"],
  },
  allowedAttributes: {
    _tag: "AllowSpecific",
    byTag: {
      a: ["href", "title"],
    },
  },
  allowProtocolRelative: false,
});

// Serialize to JSON
const json = S.encodeSync(SanitizeConfig)(config);

// Deserialize from JSON
const decoded = S.decodeUnknownSync(SanitizeConfig)(json);
```

### Pattern Matching on Discriminated Unions

```typescript
import * as Match from "effect/Match";

const processTags = (config: SanitizeConfig) =>
  Match.value(config.allowedTags).pipe(
    Match.when({ _tag: "AllowAll" }, () => console.log("All tags allowed")),
    Match.when({ _tag: "AllowSpecific" }, ({ tags }) =>
      console.log(`Specific tags: ${tags.join(", ")}`)
    ),
    Match.orElse(() => console.log("Using default tag list"))
  );
```

### Working with RegExp Patterns

```typescript
import { RegExpPattern } from "@beep/schema";

// Create from native RegExp
const emailPattern = RegExpPattern.fromRegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/i);

// Use in configuration
const config = new SanitizeConfig({
  allowedAttributes: {
    _tag: "AllowSpecific",
    byTag: {
      a: [
        {
          name: "href",
          pattern: RegExpPattern.fromRegExp(/^https?:\/\//),
        },
      ],
    },
  },
});

// Convert back to RegExp for validation
const regex = emailPattern.toRegExp();
regex.test("user@example.com"); // true
```

## Migration from sanitize-html Options

### JavaScript Object → Schema

```typescript
// sanitize-html options (JavaScript)
const options = {
  allowedTags: ["p", "b", "i"],
  allowedAttributes: {
    a: ["href", { name: "target", values: ["_blank"] }],
  },
  allowedSchemes: false, // Allow all
  parseStyleAttributes: true,
};

// Schema representation (Effect Schema)
const config = new SanitizeConfig({
  allowedTags: {
    _tag: "AllowSpecific",
    tags: ["p", "b", "i"],
  },
  allowedAttributes: {
    _tag: "AllowSpecific",
    byTag: {
      a: [
        "href",
        {
          name: "target",
          pattern: RegExpPattern.fromRegExp(/^_blank$/),
        },
      ],
    },
  },
  allowedSchemes: {
    _tag: "AllowAll",
  },
  parseStyleAttributes: true,
});
```

### Transformation Pipeline

For projects needing to bridge sanitize-html runtime and schema configuration:

```typescript
import * as Effect from "effect/Effect";

const applyConfig = (config: SanitizeConfig, html: string) =>
  Effect.gen(function* () {
    // Convert schema to sanitize-html options
    const options = configToSanitizeHtmlOptions(config);

    // Apply sanitization
    const sanitized = sanitizeHtml(html, options);

    return sanitized;
  });

function configToSanitizeHtmlOptions(
  config: SanitizeConfig
): sanitizeHtml.IOptions {
  // Convert discriminated unions to sanitize-html format
  const options: sanitizeHtml.IOptions = {};

  if (config.allowedTags) {
    options.allowedTags =
      config.allowedTags._tag === "AllowAll"
        ? false
        : config.allowedTags.tags;
  }

  // ... convert other fields

  return options;
}
```

## Next Steps

1. **Integration Tests**: Create test suite validating schema against sanitize-html runtime
2. **Preset Library**: Define common presets (strict, permissive, markdown-safe)
3. **Validation Rules**: Add cross-field validation (e.g., vulnerable tags require allowVulnerableTags)
4. **Documentation**: Add JSDoc examples for all union variants
5. **Runtime Bridge**: Implement `configToSanitizeHtmlOptions` transformer

## References

- **sanitize-html Options**: [github.com/apostrophecms/sanitize-html#options](https://github.com/apostrophecms/sanitize-html#options)
- **Effect Schema**: `.claude/rules/effect-patterns.md`
- **Literal-kits**: `packages/common/schema/src/integrations/html/literal-kits/`
- **Phase 1 Discovery**: `specs/sanitize-html-schema/outputs/types-inventory.md`
