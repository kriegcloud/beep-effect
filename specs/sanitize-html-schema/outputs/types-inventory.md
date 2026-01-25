# sanitize-html Type Inventory

> Phase 1 Discovery - Task 1.1

## Summary

The sanitize-html module contains 28 distinct types across 8 files, with the primary public API types defined in `packages/common/utils/src/sanitize-html/types.ts`.

---

## Primary Public Types (types.ts)

### Interface: `Attributes`
```typescript
export interface Attributes {
  [attr: string]: string;
}
```
**Schema Consideration**: Maps to `S.Record({ key: S.String, value: S.String })`

---

### Interface: `TransformedTag`
```typescript
export interface TransformedTag {
  readonly tagName: string;
  readonly attribs: Attributes;
  readonly text?: undefined | string;
}
```

---

### Type: `Transformer` (FUNCTION - cannot serialize)
```typescript
export type Transformer = (tagName: string, attribs: Attributes) => TransformedTag;
```

---

### Type: `AllowedAttribute`
```typescript
export type AllowedAttribute =
  | string
  | {
      readonly name: string;
      readonly multiple?: undefined | boolean;
      readonly values: readonly string[];
    };
```
**Schema Consideration**: Discriminated union - string or object with values constraint.

---

### Type: `DisallowedTagsMode`
```typescript
export type DisallowedTagsMode =
  | "discard"
  | "escape"
  | "recursiveEscape"
  | "completelyDiscard";
```
**Schema Consideration**: `S.Literal("discard", "escape", "recursiveEscape", "completelyDiscard")`

---

### Interface: `ParserOptions`
```typescript
export interface ParserOptions {
  readonly decodeEntities?: undefined | boolean;
  readonly lowerCaseTags?: undefined | boolean;
  readonly lowerCaseAttributeNames?: undefined | boolean;
}
```
All fields optional with defaults of `true`.

---

### Interface: `Frame`
```typescript
export interface Frame {
  readonly tag: string;
  readonly attribs: Attributes;
  readonly text: string;
  readonly tagPosition: number;
  readonly mediaChildren: readonly string[];
}
```

---

### Interface: `Defaults`
```typescript
export interface Defaults {
  readonly allowedAttributes: Record<string, readonly AllowedAttribute[]>;
  readonly allowedSchemes: readonly string[];
  readonly allowedSchemesByTag: Record<string, readonly string[]>;
  readonly allowedSchemesAppliedToAttributes: readonly string[];
  readonly allowedTags: readonly string[];
  readonly allowProtocolRelative: boolean;
  readonly disallowedTagsMode: DisallowedTagsMode;
  readonly enforceHtmlBoundary: boolean;
  readonly selfClosing: readonly string[];
  readonly nonBooleanAttributes: readonly string[];
}
```

---

### Interface: `SanitizeOptions` (27 fields)

See `outputs/options-matrix.md` for complete field inventory.

---

## Token Types (parser/token.ts)

| Type | Description |
|------|-------------|
| `TokenTag` | `"StartTag" \| "EndTag" \| "Text" \| "Comment" \| "Doctype"` |
| `StartTagToken` | Has `_tag: "StartTag"`, name, attributes, selfClosing |
| `EndTagToken` | Has `_tag: "EndTag"`, name |
| `TextToken` | Has `_tag: "Text"`, content |
| `CommentToken` | Has `_tag: "Comment"`, content |
| `DoctypeToken` | Has `_tag: "Doctype"`, content |
| `Token` | Union of all 5 token types |

**Note**: Token types already use `_tag` discriminator - perfect for `S.TaggedClass`.

---

## Union Types Requiring S.TaggedClass or Special Handling

| Type | Union Structure | Approach |
|------|-----------------|----------|
| `AllowedAttribute` | `string \| { name, multiple?, values }` | Union with type refinement |
| `SanitizeOptions.allowedTags` | `false \| readonly string[]` | Union with literal false |
| `SanitizeOptions.allowedAttributes` | `false \| Record<...>` | Union with literal false |
| `SanitizeOptions.allowedSchemes` | `false \| readonly string[]` | Union with literal false |
| `SanitizeOptions.allowedSchemesByTag` | `false \| Record<...>` | Union with literal false |
| `AllowedClasses` (nested) | `false \| readonly (string \| RegExp)[]` | Nested false handling |
| `Token` | 5-way discriminated union | S.Union with _tag |

---

## Callback/Function Types (Cannot Serialize)

| Field/Type | Signature |
|------------|-----------|
| `Transformer` | `(tagName: string, attribs: Attributes) => TransformedTag` |
| `textFilter` | `(text: string, tagName: string) => string` |
| `exclusiveFilter` | `(frame: Frame) => boolean \| "excludeTag"` |
| `onOpenTag` | `(name: string, attribs: Attributes) => void` |
| `onCloseTag` | `(name: string, isImplied: boolean) => void` |
| `transformTags` values | `string \| Transformer` |

---

## Types Containing `RegExp`

| Field/Type | Structure |
|------------|-----------|
| `allowedStyles` | `Record<string, Record<string, readonly RegExp[]>>` |
| `allowedClasses` | `Record<string, false \| readonly (string \| RegExp)[]>` |

**Recommendation**: Create a `RegExpPattern` schema that stores pattern string and flags.
