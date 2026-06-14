---
title: Xsd.ts
nav_order: 13
parent: "@beep/rdf"
---

## Xsd.ts overview

XSD vocabulary helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [XSD_NAMESPACE](#xsd_namespace)
- [models](#models)
  - [XSD_ANY_URI](#xsd_any_uri)
  - [XSD_BOOLEAN](#xsd_boolean)
  - [XSD_DOUBLE](#xsd_double)
  - [XSD_INTEGER](#xsd_integer)
  - [XSD_STRING](#xsd_string)
---

# configuration

## XSD_NAMESPACE

XSD namespace IRI.

**Example**

```ts
import { XSD_NAMESPACE } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_NAMESPACE)
```

**See**

- https://www.w3.org/2001/XMLSchema#

**Signature**

```ts
declare const XSD_NAMESPACE: "http://www.w3.org/2001/XMLSchema#"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L25)

Since v0.0.0

# models

## XSD_ANY_URI

`xsd:anyURI`

**Example**

```ts
import { XSD_ANY_URI } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_ANY_URI)
```

**Signature**

```ts
declare const XSD_ANY_URI: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L55)

Since v0.0.0

## XSD_BOOLEAN

`xsd:boolean`

**Example**

```ts
import { XSD_BOOLEAN } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_BOOLEAN)
```

**Signature**

```ts
declare const XSD_BOOLEAN: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L70)

Since v0.0.0

## XSD_DOUBLE

`xsd:double`

**Example**

```ts
import { XSD_DOUBLE } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_DOUBLE)
```

**Signature**

```ts
declare const XSD_DOUBLE: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L100)

Since v0.0.0

## XSD_INTEGER

`xsd:integer`

**Example**

```ts
import { XSD_INTEGER } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_INTEGER)
```

**Signature**

```ts
declare const XSD_INTEGER: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L85)

Since v0.0.0

## XSD_STRING

`xsd:string`

**Example**

```ts
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd"

console.log(XSD_STRING)
```

**Signature**

```ts
declare const XSD_STRING: NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Vocab/Xsd.ts#L40)

Since v0.0.0