# sanitize-html Internal Dependency Graph

> Phase 1 Discovery - Task 1.3

## Summary

The sanitize-html module contains 24 TypeScript files organized into 6 subdirectories. **No external package dependencies beyond Effect modules** - entirely self-contained.

---

## Directory Structure

```
packages/common/utils/src/sanitize-html/
├── sanitize-html.ts    # Main sanitization (720+ lines)
├── defaults.ts         # Default configuration
├── types.ts            # All type definitions
├── index.ts            # Public API barrel
├── parser/
│   ├── html-parser.ts  # HTML tokenization
│   ├── token.ts        # Token types
│   ├── entities.ts     # Entity encoding
│   └── index.ts
├── filters/
│   ├── tag-filter.ts   # Tag filtering logic
│   ├── attribute-filter.ts
│   ├── class-filter.ts
│   └── index.ts
├── url/
│   ├── url-validator.ts  # URL scheme validation
│   ├── srcset-parser.ts
│   └── index.ts
├── transform/
│   ├── tag-transform.ts  # Tag transformation
│   └── index.ts
├── css/
│   ├── css-parser.ts   # CSS parsing
│   ├── css-filter.ts   # Style filtering
│   └── index.ts
└── utils/
    ├── escape-regex.ts
    ├── glob-matcher.ts
    ├── is-plain-object.ts
    └── index.ts
```

---

## Dependency Graph (ASCII)

```
                            ┌─────────────────┐
                            │   index.ts      │  (Public API)
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
           │sanitize-html │  │  defaults.ts │  │   types.ts   │
           │     .ts      │  │              │  │              │
           └──────┬───────┘  └──────────────┘  └──────────────┘
                  │                                    ▲
    ┌─────────────┼─────────────────────────────┐     │
    │             │             │               │     │
    ▼             ▼             ▼               ▼     │
┌────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│filters/│  │ parser/  │  │   url/    │  │transform/│ │
└────┬───┘  └────┬─────┘  └─────┬─────┘  └──────────┘ │
     │           │              │                     │
     ▼           ▼              ▼                     │
┌────────┐  ┌──────────┐  ┌───────────┐               │
│ css/   │  │  utils/  │  │entities.ts│◄──────────────┘
└────────┘  └──────────┘  └───────────┘
```

---

## Layered Dependencies

### Layer 0 (Leaf Nodes - No Internal Dependencies)
- `types.ts`
- `parser/entities.ts`
- `filters/tag-filter.ts`
- `css/css-parser.ts`
- `utils/escape-regex.ts`
- `utils/is-plain-object.ts`

### Layer 1 (Depends on Layer 0)
- `defaults.ts` ← types.ts
- `parser/token.ts` ← types.ts
- `utils/glob-matcher.ts` ← utils/escape-regex.ts

### Layer 2 (Depends on Layer 0-1)
- `parser/html-parser.ts` ← types.ts, entities.ts, token.ts
- `url/url-validator.ts` ← entities.ts
- `transform/tag-transform.ts` ← types.ts
- `css/css-filter.ts` ← css-parser.ts

### Layer 3 (Depends on Layer 0-2)
- `filters/attribute-filter.ts` ← types.ts, glob-matcher.ts, is-plain-object.ts
- `filters/class-filter.ts` ← glob-matcher.ts
- `url/srcset-parser.ts` ← url-validator.ts

### Layer 4 (Top-Level Composition)
- `sanitize-html.ts` ← (depends on nearly everything)

### Layer 5 (Public API)
- `index.ts` ← re-exports all

---

## Effect Module Usage

| Module | Used By |
|--------|---------|
| `effect/Array` (A) | 11 files |
| `effect/Function` (F, pipe) | 12 files |
| `effect/Match` | 11 files |
| `effect/Option` (O) | 9 files |
| `effect/Predicate` (P) | 13 files |
| `effect/String` (Str) | 13 files |
| `effect/Record` (R) | 3 files |
| `effect/Struct` | 3 files |
| `effect/Number` (Num) | 1 file |

---

## Shared Utilities

| Utility | Used By |
|---------|---------|
| `types.ts` | 6 files (foundational types) |
| `parser/entities.ts` | 3 files (entity encoding) |
| `utils/glob-matcher.ts` | 2 files (attribute/class filtering) |
| `utils/is-plain-object.ts` | 1 file (attribute filtering) |

---

## Public API Exports

| Category | Exports |
|----------|---------|
| Main | `sanitizeHtml`, `simpleTransform` |
| Types | `Attributes`, `TransformedTag`, `Transformer`, `AllowedAttribute`, `DisallowedTagsMode`, `ParserOptions`, `Frame`, `Defaults`, `SanitizeOptions` |
| Defaults | `defaults`, `defaultParserOptions`, `mediaTags`, `vulnerableTags`, `defaultAllowedEmptyAttributes` |
| Parser | `parseHtml`, `parseHtmlWithCallbacks`, `encodeEntities`, `encodeHtml`, `decodeEntities` |
| Tokens | `Token`, `StartTagToken`, `EndTagToken`, `TextToken`, `CommentToken`, `DoctypeToken`, `matchToken` |
| Filters | `isTagAllowed`, `filterAttributes`, `filterClasses` |
| URL | `isNaughtyHref`, `validateIframeSrc`, `parseSrcset`, `filterSrcset` |
| CSS | `filterStyles`, `parseStyleAttribute` |

---

## Notes

- **Zero external dependencies** - Only Effect modules
- **Clean layered architecture** - Dependencies flow one direction
- **`types.ts` is foundational** - Referenced by 6 other files
- **Utils are pure functions** - No state, easily testable
