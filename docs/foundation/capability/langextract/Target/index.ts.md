---
title: index.ts
nav_order: 6
parent: "@beep/langextract"
---

## index.ts overview

Extraction target schemas for LangExtract-style prompts.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ExtractionExample (class)](#extractionexample-class)
  - [ExtractionExampleItem (class)](#extractionexampleitem-class)
  - [ExtractionTarget (class)](#extractiontarget-class)
  - [ExtractionTargetKind (type alias)](#extractiontargetkind-type-alias)
- [schemas](#schemas)
  - [ExtractionTargetKind](#extractiontargetkind)
---

# models

## ExtractionExample (class)

Few-shot example for a source text and expected extractions.

**Example**

```ts
import { ExtractionExample, ExtractionExampleItem } from "@beep/langextract/Target"

console.log(ExtractionExample.make({
  extractions: [ExtractionExampleItem.make({ label: "person", text: "Ada Lovelace" })],
  text: "Ada Lovelace wrote notes."
}))
```

**Signature**

```ts
declare class ExtractionExample
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Target/index.ts#L106)

Since v0.0.0

## ExtractionExampleItem (class)

Example extraction included in a few-shot prompt.

**Example**

```ts
import { ExtractionExampleItem } from "@beep/langextract/Target"

console.log(ExtractionExampleItem.make({ label: "person", text: "Ada Lovelace" }))
```

**Signature**

```ts
declare class ExtractionExampleItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Target/index.ts#L79)

Since v0.0.0

## ExtractionTarget (class)

A single extraction target requested from a language model.

**Example**

```ts
import { ExtractionTarget } from "@beep/langextract/Target"

console.log(ExtractionTarget.make({ kind: "entity", name: "person" }))
```

**Signature**

```ts
declare class ExtractionTarget
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Target/index.ts#L54)

Since v0.0.0

## ExtractionTargetKind (type alias)

Type for `ExtractionTargetKind`.

**Signature**

```ts
type ExtractionTargetKind = typeof ExtractionTargetKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Target/index.ts#L39)

Since v0.0.0

# schemas

## ExtractionTargetKind

V1 target kinds understood by the provider-neutral extraction contract.

**Example**

```ts
import { ExtractionTargetKind } from "@beep/langextract/Target"

console.log(ExtractionTargetKind.is.entity("entity"))
```

**Signature**

```ts
declare const ExtractionTargetKind: AnnotatedSchema<LiteralKit<readonly ["entity", "relation", "attribute", "event", "custom"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/langextract/blob/main/src/Target/index.ts#L27)

Since v0.0.0