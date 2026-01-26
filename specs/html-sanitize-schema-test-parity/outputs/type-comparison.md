# Type Comparison: Utils SanitizeOptions vs Schema SanitizeConfig

> Generated during Phase 1 (Discovery & Verification)

---

## Summary

| Category | Count |
|----------|-------|
| **Total utils options** | 29 |
| **Mapped to schema** | 23 |
| **Intentionally excluded (callbacks)** | 5 |
| **Missing serializable options** | 1 |

---

## Complete Option Mapping Table

| Utils Option | Type | Schema Field | Schema Type | Status |
|--------------|------|--------------|-------------|--------|
| `allowedTags` | `false \| readonly string[]` | `allowedTags` | `AllowedTags` (discriminated union) | **MAPPED** |
| `allowedAttributes` | `false \| Record<string, AllowedAttribute[]>` | `allowedAttributes` | `AllowedAttributes` (discriminated union) | **MAPPED** |
| `allowedStyles` | `Record<string, Record<string, RegExp[]>>` | `allowedStyles` | `AllowedStyles` (Record w/ RegExpPattern) | **MAPPED** |
| `allowedClasses` | `Record<string, false \| (string \| RegExp)[]>` | `allowedClasses` | `AllowedClasses` (Record w/ AllowedClassesForTag) | **MAPPED** |
| `allowedIframeHostnames` | `readonly string[]` | `allowedIframeHostnames` | `S.Array(S.String)` | **MAPPED** |
| `allowedIframeDomains` | `readonly string[]` | `allowedIframeDomains` | `S.Array(S.String)` | **MAPPED** |
| `allowIframeRelativeUrls` | `boolean` | `allowIframeRelativeUrls` | `S.Boolean` | **MAPPED** |
| `allowedSchemes` | `false \| readonly string[]` | `allowedSchemes` | `AllowedSchemes` (discriminated union) | **MAPPED** |
| `allowedSchemesByTag` | `false \| Record<string, string[]>` | `allowedSchemesByTag` | `AllowedSchemesByTag` (discriminated union) | **MAPPED** |
| `allowedSchemesAppliedToAttributes` | `readonly string[]` | `allowedSchemesAppliedToAttributes` | `S.Array(HtmlAttribute)` | **MAPPED** |
| `allowedScriptHostnames` | `readonly string[]` | `allowedScriptHostnames` | `S.Array(S.String)` | **MAPPED** |
| `allowedScriptDomains` | `readonly string[]` | `allowedScriptDomains` | `S.Array(S.String)` | **MAPPED** |
| `allowProtocolRelative` | `boolean` | `allowProtocolRelative` | `S.Boolean` | **MAPPED** |
| `allowVulnerableTags` | `boolean` | `allowVulnerableTags` | `S.Boolean` | **MAPPED** |
| `nestingLimit` | `number` | `nestingLimit` | `S.Number` | **MAPPED** |
| `nonTextTags` | `readonly string[]` | `nonTextTags` | `S.Array(S.String)` | **MAPPED** |
| `parseStyleAttributes` | `boolean` | `parseStyleAttributes` | `S.Boolean` | **MAPPED** |
| `selfClosing` | `readonly string[]` | `selfClosing` | `S.Array(S.String)` | **MAPPED** |
| `disallowedTagsMode` | `DisallowedTagsMode` | `disallowedTagsMode` | `TagsMode` | **MAPPED** |
| `enforceHtmlBoundary` | `boolean` | `enforceHtmlBoundary` | `S.Boolean` | **MAPPED** |
| `nonBooleanAttributes` | `readonly string[]` | `nonBooleanAttributes` | `S.Array(HtmlAttribute)` | **MAPPED** |
| `allowedEmptyAttributes` | `readonly string[]` | `allowedEmptyAttributes` | `S.Array(HtmlAttribute)` | **MAPPED** |
| `textFilter` | `(text, tagName) => string` | - | - | **EXCLUDED** (callback) |
| `exclusiveFilter` | `(frame) => boolean \| "excludeTag"` | - | - | **EXCLUDED** (callback) |
| `transformTags` | `Record<string, string \| Transformer>` | - | - | **EXCLUDED** (callback) |
| `onOpenTag` | `(name, attribs) => void` | - | - | **EXCLUDED** (callback) |
| `onCloseTag` | `(name, isImplied) => void` | - | - | **EXCLUDED** (callback) |
| `parser` | `ParserOptions` | - | - | **MISSING** |
| `preserveEscapedAttributes` | `boolean` | `preserveEscapedAttributes` | `S.Boolean` | **MAPPED** |

---

## Intentionally Excluded Options (Callbacks)

These 5 options are callbacks that cannot be serialized to JSON and are intentionally excluded from the schema:

### 1. `textFilter`
```typescript
readonly textFilter?: (text: string, tagName: string) => string;
```
**Purpose**: Filter or transform text content during sanitization.
**Why excluded**: Function cannot be serialized. Would require a DSL or string-based expression system.

### 2. `exclusiveFilter`
```typescript
readonly exclusiveFilter?: (frame: Frame) => boolean | "excludeTag";
```
**Purpose**: Conditionally exclude tags based on context (attributes, content, position).
**Why excluded**: Function with complex `Frame` parameter cannot be serialized.

### 3. `transformTags`
```typescript
readonly transformTags?: Record<string, string | Transformer>;
```
**Purpose**: Transform tag names or modify attributes during sanitization.
**Why excluded**: The `Transformer` function type cannot be serialized. The string-to-string variant could theoretically be supported but is rarely used alone.

### 4. `onOpenTag`
```typescript
readonly onOpenTag?: (name: string, attribs: Attributes) => void;
```
**Purpose**: Lifecycle hook called when a tag is opened.
**Why excluded**: Event callback cannot be serialized.

### 5. `onCloseTag`
```typescript
readonly onCloseTag?: (name: string, isImplied: boolean) => void;
```
**Purpose**: Lifecycle hook called when a tag is closed.
**Why excluded**: Event callback cannot be serialized.

---

## Missing Serializable Options

Only 1 option remains missing from the schema:

### 1. `parser` - **MISSING**

```typescript
// In utils SanitizeOptions
readonly parser?: ParserOptions;

interface ParserOptions {
  readonly decodeEntities?: boolean;      // default: true
  readonly lowerCaseTags?: boolean;       // default: true
  readonly lowerCaseAttributeNames?: boolean; // default: true
}
```

**Impact**: Low - these control parsing behavior, defaults are sensible for most use cases.

**Recommended action**: Consider adding `ParserOptions` to schema for completeness, but not critical for test parity.

### Previously Missing (Now Added)

- **`preserveEscapedAttributes`** - Added to schema during Phase 1. Enables full test coverage for `escape`/`recursiveEscape` modes.

---

## Conversion Edge Cases Analysis (toSanitizeOptions)

### 1. RegExp Pattern Conversion
```typescript
const toRegExp = (pattern: RegExpPattern.Type): RegExp =>
  new RegExp(pattern.source, pattern.flags);
```

| Edge Case | Behavior | Risk |
|-----------|----------|------|
| Empty `flags` string | Works - creates RegExp with no flags | None |
| `flags: undefined` | Works - creates RegExp with empty flags | None |
| Invalid regex source | **Throws at runtime** | Medium |
| Special characters in source | Works - already escaped in source string | None |

**Finding**: Schema does not validate regex syntax. Invalid patterns will throw at runtime during conversion, not during schema validation.

**Recommendation**: Consider adding regex syntax validation to `RegExpPattern` schema, or document that invalid patterns will fail at runtime.

### 2. AllowedClasses Conversion
```typescript
const allowedClassesForTagToRuntime = (config: AllowedClassesForTag) =>
  Match.value(config).pipe(
    Match.when({ _tag: "AllClasses" }, () => false as const),
    Match.when({ _tag: "SpecificClasses" }, ({ classes }) =>
      A.map(classes, classPatternToRuntime)),
    Match.exhaustive
  );
```

| Edge Case | Behavior | Risk |
|-----------|----------|------|
| `AllClasses` variant | Correctly maps to `false` | None |
| `SpecificClasses` with empty array | Correctly maps to `[]` | None |
| Mixed string/RegExpPattern classes | Correctly converts each | None |

**Finding**: Conversion is exhaustive and handles all variants correctly.

### 3. AllowedAttributes Conversion
```typescript
const allowedAttributeToRuntime = (attr: AllowedAttribute) => {
  if (typeof attr === "string") return attr;
  const result = { name: attr.name, values: attr.values };
  if (attr.multiple !== undefined) {
    return { ...result, multiple: attr.multiple };
  }
  return result;
};
```

| Edge Case | Behavior | Risk |
|-----------|----------|------|
| String attribute | Passed through unchanged | None |
| Object attribute with `multiple: true` | Correctly preserved | None |
| Object attribute with `multiple: false` | Correctly preserved | None |
| Object attribute with `multiple: undefined` | Correctly omitted from result | None |

**Finding**: Handles the optional `multiple` field correctly by only including it when explicitly set.

### 4. AllowedTags/AllowedSchemes Conversion

All discriminated unions use exhaustive `Match.value` pattern matching:
- `AllTags`/`AllSchemes` → `false`
- `NoneTags` → `[]`
- `SpecificTags`/`SpecificSchemes` → array value

**Finding**: All conversions are type-safe and exhaustive.

---

## Schema Type Enhancements

The schema uses discriminated unions with factory methods, which is more ergonomic than the utils raw types:

| Utils Pattern | Schema Pattern | Benefit |
|---------------|----------------|---------|
| `allowedTags: false` | `AllowedTags.all()` | Self-documenting |
| `allowedTags: []` | `AllowedTags.none()` | Clearer intent |
| `allowedTags: ["p", "a"]` | `AllowedTags.specific(["p", "a"])` | Type-safe tag names |
| `allowedClasses: { div: false }` | `{ div: AllowedClassesForTag.all() }` | Consistent API |

---

## Test Coverage Implications

Based on this analysis, Phase 2 test design should ensure:

1. **AllowedStyles tests**: Verify RegExpPattern → RegExp conversion with various patterns including edge cases
2. **AllowedClasses tests**: Cover both `AllClasses` and `SpecificClasses` variants
3. **DisallowedTagsMode tests**: Cover all 4 modes, especially `escape`/`recursiveEscape` (since `preserveEscapedAttributes` is missing)
4. **Discriminated union conversion**: Ensure all variants map correctly
5. **Edge cases**: Empty arrays, empty records, boundary conditions

---

## Recommendations for Phase 2

1. ~~**Add `preserveEscapedAttributes`** to schema before writing escape mode tests~~ **DONE**
2. **Consider adding `parser`** options if full parity is desired (low priority)
3. **Focus test coverage** on:
   - CSS style pattern matching (regex edge cases)
   - Class filtering (string vs pattern)
   - iframe/script hostname/domain validation
   - All 4 disallowed tags modes (now with `preserveEscapedAttributes` support)
   - Security-focused XSS prevention scenarios
