---
title: Owl.ts
nav_order: 8
parent: "@beep/rdf"
---

## Owl.ts overview

OWL vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [OWL_NAMESPACE](#owl_namespace)
- [models](#models)
  - [OWL_CLASS](#owl_class)
  - [OWL_DATATYPE_PROPERTY](#owl_datatype_property)
  - [OWL_OBJECT_PROPERTY](#owl_object_property)
---

# configuration

## OWL_NAMESPACE

OWL namespace IRI.

**Example**

```ts
import { OWL_NAMESPACE } from "@beep/rdf/Vocab/Owl"

console.log(OWL_NAMESPACE)
```

**Signature**

```ts
declare const OWL_NAMESPACE: "http://www.w3.org/2002/07/owl#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Owl.ts#L24)

Since v0.0.0

# models

## OWL_CLASS

`owl:Class`

**Example**

```ts
import { OWL_CLASS } from "@beep/rdf/Vocab/Owl"

console.log(OWL_CLASS)
```

**Signature**

```ts
declare const OWL_CLASS: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Owl.ts#L39)

Since v0.0.0

## OWL_DATATYPE_PROPERTY

`owl:DatatypeProperty`

**Example**

```ts
import { OWL_DATATYPE_PROPERTY } from "@beep/rdf/Vocab/Owl"

console.log(OWL_DATATYPE_PROPERTY)
```

**Signature**

```ts
declare const OWL_DATATYPE_PROPERTY: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Owl.ts#L69)

Since v0.0.0

## OWL_OBJECT_PROPERTY

`owl:ObjectProperty`

**Example**

```ts
import { OWL_OBJECT_PROPERTY } from "@beep/rdf/Vocab/Owl"

console.log(OWL_OBJECT_PROPERTY)
```

**Signature**

```ts
declare const OWL_OBJECT_PROPERTY: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Owl.ts#L54)

Since v0.0.0