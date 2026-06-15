---
title: Rdfs.ts
nav_order: 11
parent: "@beep/rdf"
---

## Rdfs.ts overview

RDFS vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [RDFS_NAMESPACE](#rdfs_namespace)
- [models](#models)
  - [RDFS_CLASS](#rdfs_class)
  - [RDFS_COMMENT](#rdfs_comment)
  - [RDFS_LABEL](#rdfs_label)
---

# configuration

## RDFS_NAMESPACE

RDFS namespace IRI.

**Example**

```ts
import { RDFS_NAMESPACE } from "@beep/rdf/Vocab/Rdfs"

console.log(RDFS_NAMESPACE)
```

**Signature**

```ts
declare const RDFS_NAMESPACE: "http://www.w3.org/2000/01/rdf-schema#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Rdfs.ts#L24)

Since v0.0.0

# models

## RDFS_CLASS

`rdfs:Class`

**Example**

```ts
import { RDFS_CLASS } from "@beep/rdf/Vocab/Rdfs"

console.log(RDFS_CLASS)
```

**Signature**

```ts
declare const RDFS_CLASS: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Rdfs.ts#L69)

Since v0.0.0

## RDFS_COMMENT

`rdfs:comment`

**Example**

```ts
import { RDFS_COMMENT } from "@beep/rdf/Vocab/Rdfs"

console.log(RDFS_COMMENT)
```

**Signature**

```ts
declare const RDFS_COMMENT: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Rdfs.ts#L54)

Since v0.0.0

## RDFS_LABEL

`rdfs:label`

**Example**

```ts
import { RDFS_LABEL } from "@beep/rdf/Vocab/Rdfs"

console.log(RDFS_LABEL)
```

**Signature**

```ts
declare const RDFS_LABEL: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Rdfs.ts#L39)

Since v0.0.0