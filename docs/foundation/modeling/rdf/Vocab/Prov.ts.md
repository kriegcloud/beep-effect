---
title: Prov.ts
nav_order: 9
parent: "@beep/rdf"
---

## Prov.ts overview

PROV vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [PROV_NAMESPACE](#prov_namespace)
- [models](#models)
  - [PROV_ACTIVITY](#prov_activity)
  - [PROV_AGENT](#prov_agent)
  - [PROV_ENTITY](#prov_entity)
  - [PROV_USED](#prov_used)
  - [PROV_WAS_GENERATED_BY](#prov_was_generated_by)
---

# configuration

## PROV_NAMESPACE

PROV namespace IRI.

**Example**

```ts
import { PROV_NAMESPACE } from "@beep/rdf/Vocab/Prov"

console.log(PROV_NAMESPACE)
```

**Signature**

```ts
declare const PROV_NAMESPACE: "http://www.w3.org/ns/prov#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L24)

Since v0.0.0

# models

## PROV_ACTIVITY

`prov:Activity`

**Example**

```ts
import { PROV_ACTIVITY } from "@beep/rdf/Vocab/Prov"

console.log(PROV_ACTIVITY)
```

**Signature**

```ts
declare const PROV_ACTIVITY: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L54)

Since v0.0.0

## PROV_AGENT

`prov:Agent`

**Example**

```ts
import { PROV_AGENT } from "@beep/rdf/Vocab/Prov"

console.log(PROV_AGENT)
```

**Signature**

```ts
declare const PROV_AGENT: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L69)

Since v0.0.0

## PROV_ENTITY

`prov:Entity`

**Example**

```ts
import { PROV_ENTITY } from "@beep/rdf/Vocab/Prov"

console.log(PROV_ENTITY)
```

**Signature**

```ts
declare const PROV_ENTITY: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L39)

Since v0.0.0

## PROV_USED

`prov:used`

**Example**

```ts
import { PROV_USED } from "@beep/rdf/Vocab/Prov"

console.log(PROV_USED)
```

**Signature**

```ts
declare const PROV_USED: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L99)

Since v0.0.0

## PROV_WAS_GENERATED_BY

`prov:wasGeneratedBy`

**Example**

```ts
import { PROV_WAS_GENERATED_BY } from "@beep/rdf/Vocab/Prov"

console.log(PROV_WAS_GENERATED_BY)
```

**Signature**

```ts
declare const PROV_WAS_GENERATED_BY: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Prov.ts#L84)

Since v0.0.0