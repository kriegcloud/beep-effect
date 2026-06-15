---
title: IdentifierText.ts
nav_order: 34
parent: "@beep/nlp"
---

## IdentifierText.ts overview

Deterministic identifier tokenization and variant helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [normalization](#normalization)
  - [variants](#variants)
- [parsing](#parsing)
  - [tokens](#tokens)
---

# normalization

## variants

Generate common source-code spellings for a symbol phrase.

**Example**

```ts
```typescript
import * as IdentifierText from "@beep/nlp/IdentifierText"

const result = IdentifierText.variants("user name")
// Produces camelCase, PascalCase, snake_case, kebab-case, and joined variants
console.log(result.includes("userName")) // true
console.log(result.includes("UserName")) // true
console.log(result.includes("user_name")) // true
```
```

**Signature**

```ts
declare const variants: (input: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/IdentifierText.ts#L65)

Since v0.0.0

# parsing

## tokens

Split a source identifier or symbol-like phrase into normalized words.

**Example**

```ts
```typescript
import * as IdentifierText from "@beep/nlp/IdentifierText"

const result = IdentifierText.tokens("myVariableName")
console.log(result) // ["my", "variable", "name"]
```
```

**Signature**

```ts
declare const tokens: (input: string) => Array<Lowercase<string>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/IdentifierText.ts#L40)

Since v0.0.0