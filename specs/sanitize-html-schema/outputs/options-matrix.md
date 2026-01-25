# SanitizeOptions Configuration Matrix

> Phase 1 Discovery - Task 1.2

## Summary

The `SanitizeOptions` interface defines **27** configuration fields. All fields are optional (use `undefined | ...`).

---

## Complete Options Matrix

| # | Field | Type | Default | false=AllowAll | Category |
|---|-------|------|---------|----------------|----------|
| 1 | `allowedTags` | `undefined \| false \| readonly string[]` | 76 tags | Yes | Tags |
| 2 | `allowedAttributes` | `undefined \| false \| Record<string, readonly AllowedAttribute[]>` | `{ a: [...], img: [...] }` | Yes | Attributes |
| 3 | `allowedStyles` | `undefined \| Record<string, Record<string, readonly RegExp[]>>` | undefined | No | CSS |
| 4 | `allowedClasses` | `undefined \| Record<string, false \| readonly (string \| RegExp)[]>` | undefined | Yes (per-tag) | CSS |
| 5 | `allowedIframeHostnames` | `undefined \| readonly string[]` | undefined | No | IFrame |
| 6 | `allowedIframeDomains` | `undefined \| readonly string[]` | undefined | No | IFrame |
| 7 | `allowIframeRelativeUrls` | `undefined \| boolean` | undefined | No | IFrame |
| 8 | `allowedSchemes` | `undefined \| false \| readonly string[]` | `["http", "https", "ftp", "mailto", "tel"]` | Yes | URL |
| 9 | `allowedSchemesByTag` | `undefined \| false \| Record<string, readonly string[]>` | `{}` | Yes | URL |
| 10 | `allowedSchemesAppliedToAttributes` | `undefined \| readonly string[]` | `["href", "src", "cite"]` | No | URL |
| 11 | `allowedScriptHostnames` | `undefined \| readonly string[]` | undefined | No | Script |
| 12 | `allowedScriptDomains` | `undefined \| readonly string[]` | undefined | No | Script |
| 13 | `allowProtocolRelative` | `undefined \| boolean` | `true` | No | URL |
| 14 | `allowVulnerableTags` | `undefined \| boolean` | undefined (false) | No | Security |
| 15 | `textFilter` | `undefined \| ((text, tagName) => string)` | undefined | No | Callback |
| 16 | `exclusiveFilter` | `undefined \| ((frame) => boolean \| "excludeTag")` | undefined | No | Callback |
| 17 | `nestingLimit` | `undefined \| number` | undefined | No | Limits |
| 18 | `nonTextTags` | `undefined \| readonly string[]` | undefined | No | Parser |
| 19 | `parseStyleAttributes` | `undefined \| boolean` | true (implied) | No | Parser |
| 20 | `selfClosing` | `undefined \| readonly string[]` | 9 tags | No | Parser |
| 21 | `transformTags` | `undefined \| Record<string, string \| Transformer>` | undefined | No | Transform |
| 22 | `parser` | `undefined \| ParserOptions` | `{ decodeEntities: true, ... }` | No | Parser |
| 23 | `disallowedTagsMode` | `undefined \| DisallowedTagsMode` | `"discard"` | No | Mode |
| 24 | `enforceHtmlBoundary` | `undefined \| boolean` | `false` | No | Parser |
| 25 | `nonBooleanAttributes` | `undefined \| readonly string[]` | 112 attributes | No | Attributes |
| 26 | `allowedEmptyAttributes` | `undefined \| readonly string[]` | `["alt"]` | No | Attributes |
| 27 | `onOpenTag` | `undefined \| ((name, attribs) => void)` | undefined | No | Callback |
| 28 | `onCloseTag` | `undefined \| ((name, isImplied) => void)` | undefined | No | Callback |
| 29 | `preserveEscapedAttributes` | `undefined \| boolean` | undefined | No | Parser |

**Note**: Count is 29 if including `onCloseTag` and `preserveEscapedAttributes` which may have been added later.

---

## Pattern Categories

### Pattern 1: `false | readonly string[]` (false = Allow All)

| Field | Description |
|-------|-------------|
| `allowedTags` | `false` allows ALL HTML tags |
| `allowedAttributes` | `false` allows ALL attributes on all tags |
| `allowedSchemes` | `false` allows ALL URL schemes |
| `allowedSchemesByTag` | `false` allows ALL schemes for all tags |

### Pattern 2: `Record<string, ...>` with `*` Wildcard

| Field | Value Type | Description |
|-------|------------|-------------|
| `allowedAttributes` | `readonly AllowedAttribute[]` | `"*"` key applies to all tags |
| `allowedStyles` | `Record<string, readonly RegExp[]>` | `"*"` key applies to all tags |
| `allowedClasses` | `false \| readonly (string \| RegExp)[]` | `"*"` key applies to all tags |
| `transformTags` | `string \| Transformer` | `"*"` key transforms all tags |

### Pattern 3: Callback Functions (Cannot Serialize)

| Field | Signature |
|-------|-----------|
| `textFilter` | `(text: string, tagName: string) => string` |
| `exclusiveFilter` | `(frame: Frame) => boolean \| "excludeTag"` |
| `onOpenTag` | `(name: string, attribs: Attributes) => void` |
| `onCloseTag` | `(name: string, isImplied: boolean) => void` |

### Pattern 4: Boolean Flags

| Field | Default | Description |
|-------|---------|-------------|
| `allowProtocolRelative` | `true` | Allow `//example.com` URLs |
| `allowVulnerableTags` | false | Allow script/style tags |
| `allowIframeRelativeUrls` | undefined | Allow relative URLs in iframes |
| `parseStyleAttributes` | true | Parse style attributes |
| `enforceHtmlBoundary` | `false` | Only process inside `<html>` |
| `preserveEscapedAttributes` | undefined | Keep attrs on escaped tags |

### Pattern 5: Enum/Union Types

| Field | Values |
|-------|--------|
| `disallowedTagsMode` | `"discard" \| "escape" \| "recursiveEscape" \| "completelyDiscard"` |

---

## Default Values Summary

From `defaults.ts`:

| Constant | Value Count |
|----------|-------------|
| `defaults.allowedTags` | 76 tags |
| `defaults.allowedAttributes` | 2 tags (a, img) |
| `defaults.allowedSchemes` | 5 schemes |
| `defaults.selfClosing` | 9 tags |
| `defaults.nonBooleanAttributes` | 112+ attributes |
| `defaultAllowedEmptyAttributes` | 1 (`alt`) |
| `defaultParserOptions` | 3 boolean fields |

---

## Key Observations

1. **All fields are optional** - Every field uses `undefined | ...`
2. **Three-state fields** - `undefined` (use defaults), `false` (allow all), or explicit list
3. **Nested complexity** - `allowedClasses` has per-tag `false` support
4. **RegExp usage** - `allowedStyles` and `allowedClasses` use RegExp
5. **Wildcard key** - `*` is reserved meaning "all tags" in several Records
