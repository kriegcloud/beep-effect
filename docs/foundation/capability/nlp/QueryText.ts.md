---
title: QueryText.ts
nav_order: 43
parent: "@beep/nlp"
---

## QueryText.ts overview

Deterministic query-text normalization helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [normalization](#normalization)
  - [normalizePhrase](#normalizephrase)
  - [normalizeQuestion](#normalizequestion)
- [parsing](#parsing)
  - [extractBacktickValue](#extractbacktickvalue)
---

# normalization

## normalizePhrase

Normalize a short extracted phrase after it has been pulled from prose.

**Example**

```ts
```typescript
import * as QueryText from "@beep/nlp/QueryText"

const normalized = QueryText.normalizePhrase('"hello / world"')
console.log(normalized) // "hello/world"
```
```

**Signature**

```ts
declare const normalizePhrase: (input: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/QueryText.ts#L54)

Since v0.0.0

## normalizeQuestion

Canonicalize a free-form user question for deterministic matching.

**Example**

```ts
```typescript
import * as QueryText from "@beep/nlp/QueryText"

const normalized = QueryText.normalizeQuestion("  hello   world  ")
console.log(normalized) // "hello world"
```
```

**Signature**

```ts
declare const normalizeQuestion: (input: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/QueryText.ts#L33)

Since v0.0.0

# parsing

## extractBacktickValue

Extract the first value enclosed in backticks from a user question.

**Example**

```ts
```typescript
import * as O from "effect/Option"
import * as QueryText from "@beep/nlp/QueryText"

const result = QueryText.extractBacktickValue("What is `Effect.gen`?")
console.log(O.getOrElse(result, () => "none")) // "Effect.gen"
```
```

**Signature**

```ts
declare const extractBacktickValue: (input: string) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/QueryText.ts#L77)

Since v0.0.0