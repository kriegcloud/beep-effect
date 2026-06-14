---
title: Oa.ts
nav_order: 7
parent: "@beep/rdf"
---

## Oa.ts overview

Web Annotation vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [OA_NAMESPACE](#oa_namespace)
- [models](#models)
  - [OA_ANNOTATION](#oa_annotation)
  - [OA_HAS_SELECTOR](#oa_has_selector)
  - [OA_HAS_TARGET](#oa_has_target)
---

# configuration

## OA_NAMESPACE

OA namespace IRI.

**Example**

```ts
import { OA_NAMESPACE } from "@beep/rdf/Vocab/Oa"

console.log(OA_NAMESPACE)
```

**Signature**

```ts
declare const OA_NAMESPACE: "http://www.w3.org/ns/oa#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Oa.ts#L24)

Since v0.0.0

# models

## OA_ANNOTATION

`oa:Annotation`

**Example**

```ts
import { OA_ANNOTATION } from "@beep/rdf/Vocab/Oa"

console.log(OA_ANNOTATION)
```

**Signature**

```ts
declare const OA_ANNOTATION: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Oa.ts#L39)

Since v0.0.0

## OA_HAS_SELECTOR

`oa:hasSelector`

**Example**

```ts
import { OA_HAS_SELECTOR } from "@beep/rdf/Vocab/Oa"

console.log(OA_HAS_SELECTOR)
```

**Signature**

```ts
declare const OA_HAS_SELECTOR: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Oa.ts#L69)

Since v0.0.0

## OA_HAS_TARGET

`oa:hasTarget`

**Example**

```ts
import { OA_HAS_TARGET } from "@beep/rdf/Vocab/Oa"

console.log(OA_HAS_TARGET)
```

**Signature**

```ts
declare const OA_HAS_TARGET: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Oa.ts#L54)

Since v0.0.0