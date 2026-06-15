---
title: evidence.ts
nav_order: 8
parent: "@beep/semantic-web"
---

## evidence.ts overview

Evidence anchors and selectors for provenance-adjacent workflows.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BoundedEvidenceProjection (class)](#boundedevidenceprojection-class)
  - [EvidenceAnchor (class)](#evidenceanchor-class)
  - [EvidenceSelector](#evidenceselector)
  - [EvidenceSelector (type alias)](#evidenceselector-type-alias)
  - [EvidenceSelectorKind](#evidenceselectorkind)
  - [EvidenceSelectorKind (type alias)](#evidenceselectorkind-type-alias)
  - [EvidenceTarget (class)](#evidencetarget-class)
  - [FragmentSelector (class)](#fragmentselector-class)
  - [TextPositionSelector (class)](#textpositionselector-class)
  - [TextQuoteSelector (class)](#textquoteselector-class)
---

# models

## BoundedEvidenceProjection (class)

Bounded evidence projection.

**Example**

```ts
import { BoundedEvidenceProjection } from "@beep/semantic-web/evidence"

console.log(BoundedEvidenceProjection)
```

**Signature**

```ts
declare class BoundedEvidenceProjection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L294)

Since v0.0.0

## EvidenceAnchor (class)

Evidence anchor value referenced from provenance and verification services.

**Example**

```ts
import { EvidenceAnchor } from "@beep/semantic-web/evidence"

console.log(EvidenceAnchor)
```

**Signature**

```ts
declare class EvidenceAnchor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L260)

Since v0.0.0

## EvidenceSelector

Evidence selector union.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { EvidenceSelector } from "@beep/semantic-web/evidence"

const decoded = S.decodeUnknownSync(EvidenceSelector)({


})
console.log(decoded.kind) // "text-quote"
```
```

**Signature**

```ts
declare const EvidenceSelector: AnnotatedSchema<S.Union<readonly [typeof TextQuoteSelector, typeof TextPositionSelector, typeof FragmentSelector]> & TaggedUnionUtils<"kind", readonly [typeof TextQuoteSelector, typeof TextPositionSelector, typeof FragmentSelector], [typeof TextQuoteSelector, typeof TextPositionSelector, typeof FragmentSelector]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L192)

Since v0.0.0

## EvidenceSelector (type alias)

Type for `EvidenceSelector`.

**Example**

```ts
import type { EvidenceSelector } from "@beep/semantic-web/evidence"

const acceptEvidenceSelector = (value: EvidenceSelector) => value
console.log(acceptEvidenceSelector)
```

**Signature**

```ts
type EvidenceSelector = typeof EvidenceSelector.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L213)

Since v0.0.0

## EvidenceSelectorKind

Evidence selector discriminator.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { EvidenceSelectorKind } from "@beep/semantic-web/evidence"

console.log(S.is(EvidenceSelectorKind)("text-quote")) // true
console.log(S.is(EvidenceSelectorKind)("unknown")) // false
```
```

**Signature**

```ts
declare const EvidenceSelectorKind: AnnotatedSchema<LiteralKit<readonly ["text-quote", "text-position", "fragment"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L32)

Since v0.0.0

## EvidenceSelectorKind (type alias)

Type for `EvidenceSelectorKind`.

**Example**

```ts
import type { EvidenceSelectorKind } from "@beep/semantic-web/evidence"

const acceptEvidenceSelectorKind = (value: EvidenceSelectorKind) => value
console.log(acceptEvidenceSelectorKind)
```

**Signature**

```ts
type EvidenceSelectorKind = typeof EvidenceSelectorKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L52)

Since v0.0.0

## EvidenceTarget (class)

Target resource plus selector pair referenced by an evidence anchor.

**Example**

```ts
import { EvidenceTarget } from "@beep/semantic-web/evidence"

console.log(EvidenceTarget)
```

**Signature**

```ts
declare class EvidenceTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L228)

Since v0.0.0

## FragmentSelector (class)

Fragment selector for evidence anchors.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { FragmentSelector } from "@beep/semantic-web/evidence"

const selector = S.decodeUnknownSync(FragmentSelector)({


})
console.log(selector.value) // "section-1"
```
```

**Signature**

```ts
declare class FragmentSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L154)

Since v0.0.0

## TextPositionSelector (class)

Text-position selector for evidence anchors.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { TextPositionSelector } from "@beep/semantic-web/evidence"

const selector = S.decodeUnknownSync(TextPositionSelector)({
  kind: "text-position",
  start: 0,
  end: 5
})
console.log(selector.start) // 0
```
```

**Signature**

```ts
declare class TextPositionSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L114)

Since v0.0.0

## TextQuoteSelector (class)

Text-quote selector for evidence anchors.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { TextQuoteSelector } from "@beep/semantic-web/evidence"

const selector = S.decodeUnknownSync(TextQuoteSelector)({


})
console.log(selector.kind) // "text-quote"
```
```

**Signature**

```ts
declare class TextQuoteSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/evidence.ts#L72)

Since v0.0.0