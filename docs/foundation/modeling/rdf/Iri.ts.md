---
title: Iri.ts
nav_order: 2
parent: "@beep/rdf"
---

## Iri.ts overview

RFC 3987 IRI schemas and validation helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AbsoluteIRI (type alias)](#absoluteiri-type-alias)
  - [IRI (type alias)](#iri-type-alias)
  - [IRIReference (type alias)](#irireference-type-alias)
  - [RelativeIRIReference (type alias)](#relativeirireference-type-alias)
- [validation](#validation)
  - [AbsoluteIRI](#absoluteiri)
  - [IRI](#iri)
  - [IRIReference](#irireference)
  - [RelativeIRIReference](#relativeirireference)
---

# models

## AbsoluteIRI (type alias)

RFC 3987 `absolute-IRI` syntax without a fragment component.

**Example**

```ts
import type { AbsoluteIRI } from "@beep/rdf/Iri"

const acceptAbsoluteIRI = (value: AbsoluteIRI) => value
console.log(acceptAbsoluteIRI)
```

**Signature**

```ts
type AbsoluteIRI = typeof AbsoluteIRI.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L996)

Since v0.0.0

## IRI (type alias)

RFC 3987 `IRI` syntax.

**Example**

```ts
import type { IRI } from "@beep/rdf/Iri"

const acceptIRI = (value: IRI) => value
console.log(acceptIRI)
```

**Signature**

```ts
type IRI = typeof IRI.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L1038)

Since v0.0.0

## IRIReference (type alias)

RFC 3987 `IRI-reference` syntax, including absolute and relative forms.

**Example**

```ts
import type { IRIReference } from "@beep/rdf/Iri"

const acceptIRIReference = (value: IRIReference) => value
console.log(acceptIRIReference)
```

**Signature**

```ts
type IRIReference = typeof IRIReference.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L912)

Since v0.0.0

## RelativeIRIReference (type alias)

RFC 3987 `irelative-ref` syntax.

**Example**

```ts
import type { RelativeIRIReference } from "@beep/rdf/Iri"

const acceptRelativeIRIReference = (value: RelativeIRIReference) => value
console.log(acceptRelativeIRIReference)
```

**Signature**

```ts
type RelativeIRIReference = typeof RelativeIRIReference.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L954)

Since v0.0.0

# validation

## AbsoluteIRI

RFC 3987 `absolute-IRI` schema without a fragment component.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { AbsoluteIRI } from "@beep/rdf"

const decoded = S.decodeUnknownSync(AbsoluteIRI)("https://example.org")
console.log(decoded) // "https://example.org"
```
```

**Signature**

```ts
declare const AbsoluteIRI: AnnotatedSchema<S.brand<S.String, "AbsoluteIRI">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L971)

Since v0.0.0

## IRI

RFC 3987 `IRI` schema.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { IRI } from "@beep/rdf"

const decoded = S.decodeUnknownSync(IRI)("https://example.org/page#section")
console.log(decoded) // "https://example.org/page#section"
```
```

**Signature**

```ts
declare const IRI: AnnotatedSchema<S.brand<S.String, "IRI">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L1013)

Since v0.0.0

## IRIReference

RFC 3987 `IRI-reference` schema, including absolute and relative forms.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { IRIReference } from "@beep/rdf"

const decoded = S.decodeUnknownSync(IRIReference)("https://example.org/resource")
console.log(decoded) // "https://example.org/resource"
```
```

**Signature**

```ts
declare const IRIReference: AnnotatedSchema<S.brand<S.String, "IRIReference">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L887)

Since v0.0.0

## RelativeIRIReference

RFC 3987 `irelative-ref` schema.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { RelativeIRIReference } from "@beep/rdf"

const decoded = S.decodeUnknownSync(RelativeIRIReference)("/path/to/resource")
console.log(decoded) // "/path/to/resource"
```
```

**Signature**

```ts
declare const RelativeIRIReference: AnnotatedSchema<S.brand<S.String, "RelativeIRIReference">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Iri.ts#L929)

Since v0.0.0