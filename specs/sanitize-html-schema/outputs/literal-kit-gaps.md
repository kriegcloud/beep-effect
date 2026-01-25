# Literal-Kit Gap Analysis

> Phase 1 Discovery - Task 1.4

## Summary

The literal-kits in `@beep/schema` provide comprehensive coverage for HTML tags, attributes, and schemes. However, there are several gaps when compared to `sanitize-html` defaults.

---

## Current Literal-Kit Coverage

### HtmlTag (html-tag.ts)

**Total**: 135 HTML tags

| Derived Class | Tags | Count |
|---------------|------|-------|
| `MediaTag` | img, audio, video, picture, svg, object, map, iframe, embed | 9 |
| `VulnerarbleTag` | script, style | 2 |
| `NonTextTag` | script, style, textarea, option | 4 |
| `ContentSectioningTag` | address, article, aside, footer, header, h1-h6, hgroup, main, nav, section | 15 |
| `TextContentTag` | blockquote, dd, div, dl, dt, figcaption, figure, hr, li, menu, ol, p, pre, ul | 14 |
| `InlineTextSemanticsTag` | a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kbd, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, u, var, wbr | 31 |
| `TableContentTag` | caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr | 10 |
| `SelfClosing` | img, br, hr, area, base, basefont, input, link, meta | 9 |

### HtmlAttribute (html-attributes.ts)

**Total**: 232 HTML attributes

| Derived Class | Count |
|---------------|-------|
| `NonBooleanEventHandlerAttribute` | 86 (on* events) |
| `NonBooleanAttribute` | 199 (includes events) |
| `AnchorAttribute` | 3 (href, name, target) |
| `ImgAttribute` | 7 (src, srcset, alt, title, width, height, loading) |

### AllowedScheme (allowed-schemes.ts)

**Literals**: `http`, `data`, `cid`, `https`, `mailto`, `ftp`, `tel` (7 total)

### AllowedSchemesAppliedToAttributes

**Literals**: `href`, `src`, `cite` (3 total)

### TagsMode (tags-mode.ts)

**Literals**: `escape`, `recursiveEscape`, `discard`, `completelyDiscard` (4 total)

---

## Gap Analysis

### 1. Tags: Full Coverage

| Requirement | Literal-Kit | Status |
|-------------|-------------|--------|
| `defaults.allowedTags` (76) | Covered by derived classes | OK |
| `defaults.selfClosing` (9) | `SelfClosing` class | OK |
| `defaults.mediaTags` (9) | `MediaTag` class | OK |
| `defaults.vulnerableTags` (2) | `VulnerarbleTag` class | OK (typo) |

### 2. Schemes: Gaps Identified

| defaults.allowedSchemes | AllowedScheme | Status |
|-------------------------|---------------|--------|
| `http` | `http` | OK |
| `https` | `https` | OK |
| `ftp` | `ftp` | OK |
| `mailto` | `mailto` | OK |
| `tel` | `tel` | OK |
| - | `data` | EXTRA (security risk) |
| - | `cid` | EXTRA (security risk) |

**Issue**: `AllowedScheme` contains `data` and `cid` which are NOT in defaults. `data:` URLs can embed executable content.

**Recommendation**: Create `SafeScheme` derived class excluding `data` and `cid`.

### 3. Attributes: Minor Gaps

**Missing from HtmlAttribute but in NonBooleanAttribute**:
- `imagesizes`
- `imagesrcset`
- `popovertarget`
- `popovertargetaction`
- `blocking`

**Issue**: `NonBooleanAttribute` extends `StringLiteralKit` separately instead of deriving from `HtmlAttribute`. This breaks type consistency.

### 4. TagsMode: Match

`TagsMode` literals match `DisallowedTagsMode` type exactly.

---

## Naming Inconsistencies

| Schema Class | Utils Constant | Issue |
|--------------|----------------|-------|
| `VulnerarbleTag` | `vulnerableTags` | **Typo**: "Vulnerarble" should be "Vulnerable" |
| `NonBooleanAttribute` | `nonBooleanAttributes` | Different inheritance hierarchy |

---

## Recommendations

### 1. Fix Typo

Rename `VulnerarbleTag` to `VulnerableTag` (breaking change - requires migration).

### 2. Create SafeScheme

```typescript
export class SafeScheme extends AllowedScheme.derive(
  "http", "https", "ftp", "mailto", "tel"
).annotations({
  identifier: "SafeScheme",
  description: "Safe URL schemes excluding data: and cid:",
}) {}
```

### 3. Add Missing Attributes to HtmlAttribute

Add 5 missing attributes:
- `imagesizes`
- `imagesrcset`
- `popovertarget`
- `popovertargetaction`
- `blocking`

### 4. Refactor NonBooleanAttribute

Change `NonBooleanAttribute` to derive from `HtmlAttribute` instead of standalone `StringLiteralKit`.

### 5. Create DefaultAllowedTag

Consider a composite class for sanitize-html defaults:

```typescript
export class DefaultAllowedTag extends HtmlTag.derive(
  ...ContentSectioningTag.Options,
  ...TextContentTag.Options,
  ...InlineTextSemanticsTag.Options,
  ...TableContentTag.Options,
) {}
```

---

## Summary Table

| Category | Schema | Defaults | Gap |
|----------|--------|----------|-----|
| Tags (allowed) | 135 | 76 | Full coverage |
| Tags (self-closing) | 9 | 9 | Match |
| Tags (media) | 9 | 9 | Match |
| Tags (vulnerable) | 2 | 2 | Match (typo in name) |
| Attributes (all) | 232 | N/A | N/A |
| Attributes (non-boolean) | 199 | 199 | Match |
| Schemes | 7 | 5 | **2 extra unsafe** |
| Schemes applied to attrs | 3 | 3 | Match |
| Tags mode | 4 | 4 | Match |
