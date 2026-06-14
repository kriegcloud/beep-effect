---
title: web-annotation.ts
nav_order: 7
parent: "@beep/semantic-web"
---

## web-annotation.ts overview

Web Annotation seam DTOs for optional evidence interop.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [WebAnnotation (class)](#webannotation-class)
  - [WebAnnotationFragmentSelector (class)](#webannotationfragmentselector-class)
  - [WebAnnotationSelector](#webannotationselector)
  - [WebAnnotationSelector (type alias)](#webannotationselector-type-alias)
  - [WebAnnotationTarget (class)](#webannotationtarget-class)
  - [WebAnnotationTextPositionSelector (class)](#webannotationtextpositionselector-class)
  - [WebAnnotationTextQuoteSelector (class)](#webannotationtextquoteselector-class)
- [utilities](#utilities)
  - [evidenceAnchorToWebAnnotation](#evidenceanchortowebannotation)
  - [evidenceSelectorToWebAnnotationSelector](#evidenceselectortowebannotationselector)
  - [evidenceTargetToWebAnnotationTarget](#evidencetargettowebannotationtarget)
  - [webAnnotationSelectorToEvidenceSelector](#webannotationselectortoevidenceselector)
  - [webAnnotationTargetToEvidenceTarget](#webannotationtargettoevidencetarget)
  - [webAnnotationToEvidenceAnchor](#webannotationtoevidenceanchor)
---

# models

## WebAnnotation (class)

Web Annotation DTO.

**Example**

```ts
import { WebAnnotation } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotation)
```

**Signature**

```ts
declare class WebAnnotation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L202)

Since v0.0.0

## WebAnnotationFragmentSelector (class)

Web Annotation fragment selector DTO.

**Example**

```ts
import { WebAnnotationFragmentSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotationFragmentSelector)
```

**Signature**

```ts
declare class WebAnnotationFragmentSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L112)

Since v0.0.0

## WebAnnotationSelector

Web Annotation selector union.

**Example**

```ts
import { WebAnnotationSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotationSelector)
```

**Signature**

```ts
declare const WebAnnotationSelector: AnnotatedSchema<S.Union<readonly [typeof WebAnnotationTextQuoteSelector, typeof WebAnnotationTextPositionSelector, typeof WebAnnotationFragmentSelector]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L139)

Since v0.0.0

## WebAnnotationSelector (type alias)

Type for `WebAnnotationSelector`.

**Example**

```ts
import type { WebAnnotationSelector } from "@beep/semantic-web/adapters/web-annotation"

const acceptWebAnnotationSelector = (value: WebAnnotationSelector) => value
console.log(acceptWebAnnotationSelector)
```

**Signature**

```ts
type WebAnnotationSelector = typeof WebAnnotationSelector.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L163)

Since v0.0.0

## WebAnnotationTarget (class)

Web Annotation target DTO.

**Example**

```ts
import { WebAnnotationTarget } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotationTarget)
```

**Signature**

```ts
declare class WebAnnotationTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L178)

Since v0.0.0

## WebAnnotationTextPositionSelector (class)

Web Annotation text-position selector DTO.

**Example**

```ts
import { WebAnnotationTextPositionSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotationTextPositionSelector)
```

**Signature**

```ts
declare class WebAnnotationTextPositionSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L82)

Since v0.0.0

## WebAnnotationTextQuoteSelector (class)

Web Annotation text-quote selector DTO.

**Example**

```ts
import { WebAnnotationTextQuoteSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(WebAnnotationTextQuoteSelector)
```

**Signature**

```ts
declare class WebAnnotationTextQuoteSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L51)

Since v0.0.0

# utilities

## evidenceAnchorToWebAnnotation

Map an evidence anchor to a Web Annotation DTO.

**Example**

```ts
import { evidenceAnchorToWebAnnotation } from "@beep/semantic-web/adapters/web-annotation"

console.log(evidenceAnchorToWebAnnotation)
```

**Signature**

```ts
declare const evidenceAnchorToWebAnnotation: (anchor: EvidenceAnchor) => WebAnnotation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L351)

Since v0.0.0

## evidenceSelectorToWebAnnotationSelector

Map an evidence selector to a Web Annotation selector DTO.

**Example**

```ts
import { evidenceSelectorToWebAnnotationSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(evidenceSelectorToWebAnnotationSelector)
```

**Signature**

```ts
declare const evidenceSelectorToWebAnnotationSelector: (selector: EvidenceSelector) => WebAnnotationSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L230)

Since v0.0.0

## evidenceTargetToWebAnnotationTarget

Map an evidence target to a Web Annotation target DTO.

**Example**

```ts
import { evidenceTargetToWebAnnotationTarget } from "@beep/semantic-web/adapters/web-annotation"

console.log(evidenceTargetToWebAnnotationTarget)
```

**Signature**

```ts
declare const evidenceTargetToWebAnnotationTarget: (target: EvidenceTarget) => WebAnnotationTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L309)

Since v0.0.0

## webAnnotationSelectorToEvidenceSelector

Map a Web Annotation selector DTO to an evidence selector.

**Example**

```ts
import { webAnnotationSelectorToEvidenceSelector } from "@beep/semantic-web/adapters/web-annotation"

console.log(webAnnotationSelectorToEvidenceSelector)
```

**Signature**

```ts
declare const webAnnotationSelectorToEvidenceSelector: (selector: WebAnnotationSelector) => EvidenceSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L268)

Since v0.0.0

## webAnnotationTargetToEvidenceTarget

Map a Web Annotation target DTO to an evidence target.

**Example**

```ts
import { webAnnotationTargetToEvidenceTarget } from "@beep/semantic-web/adapters/web-annotation"

console.log(webAnnotationTargetToEvidenceTarget)
```

**Signature**

```ts
declare const webAnnotationTargetToEvidenceTarget: (target: WebAnnotationTarget) => EvidenceTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L330)

Since v0.0.0

## webAnnotationToEvidenceAnchor

Map a Web Annotation DTO to an evidence anchor.

**Example**

```ts
import { webAnnotationToEvidenceAnchor } from "@beep/semantic-web/adapters/web-annotation"

console.log(webAnnotationToEvidenceAnchor)
```

**Signature**

```ts
declare const webAnnotationToEvidenceAnchor: (annotation: WebAnnotation) => EvidenceAnchor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/web-annotation.ts#L374)

Since v0.0.0