---
title: Uri.ts
nav_order: 6
parent: "@beep/rdf"
---

## Uri.ts overview

RFC 3986-oriented URI schemas and normalization helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AbsoluteURI](#absoluteuri)
  - [AbsoluteURI (type alias)](#absoluteuri-type-alias)
  - [RelativeURIReference](#relativeurireference)
  - [RelativeURIReference (type alias)](#relativeurireference-type-alias)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [URIReference](#urireference)
  - [URIReference (type alias)](#urireference-type-alias)
- [utilities](#utilities)
  - [areUrisEquivalent](#areurisequivalent)
  - [normalizeUriReference](#normalizeurireference)
  - [resolveUriReference](#resolveurireference)
---

# models

## AbsoluteURI

RFC 3986 `absolute-URI` schema without a fragment component.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { AbsoluteURI } from "@beep/rdf/Uri"

const decoded = S.decodeUnknownSync(AbsoluteURI)("https://example.com")
console.log(decoded) // "https://example.com"
```
```

**Signature**

```ts
declare const AbsoluteURI: AnnotatedSchema<S.brand<S.String, "AbsoluteURI">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L283)

Since v0.0.0

## AbsoluteURI (type alias)

Type for `AbsoluteURI`.

**Example**

```ts
import type { AbsoluteURI } from "@beep/rdf/Uri"

const acceptAbsoluteURI = (value: AbsoluteURI) => value
console.log(acceptAbsoluteURI)
```

**Signature**

```ts
type AbsoluteURI = typeof AbsoluteURI.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L305)

Since v0.0.0

## RelativeURIReference

RFC 3986 `relative-ref` schema.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { RelativeURIReference } from "@beep/rdf/Uri"

const decoded = S.decodeUnknownSync(RelativeURIReference)("/path/to/resource")
console.log(decoded) // "/path/to/resource"
```
```

**Signature**

```ts
declare const RelativeURIReference: AnnotatedSchema<S.brand<S.String, "RelativeURIReference">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L244)

Since v0.0.0

## RelativeURIReference (type alias)

Type for `RelativeURIReference`.

**Example**

```ts
import type { RelativeURIReference } from "@beep/rdf/Uri"

const acceptRelativeURIReference = (value: RelativeURIReference) => value
console.log(acceptRelativeURIReference)
```

**Signature**

```ts
type RelativeURIReference = typeof RelativeURIReference.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L266)

Since v0.0.0

## URI

RFC 3986 `URI` schema.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { URI } from "@beep/rdf/Uri"

const decoded = S.decodeUnknownSync(URI)("https://example.com/page#anchor")
console.log(decoded) // "https://example.com/page#anchor"
```
```

**Signature**

```ts
declare const URI: AnnotatedSchema<S.brand<S.String, "URI">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L322)

Since v0.0.0

## URI (type alias)

Type for `URI`.

**Example**

```ts
import type { URI } from "@beep/rdf/Uri"

const acceptURI = (value: URI) => value
console.log(acceptURI)
```

**Signature**

```ts
type URI = typeof URI.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L344)

Since v0.0.0

## URIReference

RFC 3986 `URI-reference` schema, including absolute and relative forms.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { URIReference } from "@beep/rdf/Uri"

const decoded = S.decodeUnknownSync(URIReference)("https://example.com/path")
console.log(decoded) // "https://example.com/path"
```
```

**Signature**

```ts
declare const URIReference: AnnotatedSchema<S.brand<S.String, "URIReference">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L205)

Since v0.0.0

## URIReference (type alias)

Type for `URIReference`.

**Example**

```ts
import type { URIReference } from "@beep/rdf/Uri"

const acceptURIReference = (value: URIReference) => value
console.log(acceptURIReference)
```

**Signature**

```ts
type URIReference = typeof URIReference.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L227)

Since v0.0.0

# utilities

## areUrisEquivalent

Compare two URI values using URI-family normalization rules.

**Example**

```ts
```typescript
import { areUrisEquivalent } from "@beep/rdf/Uri"

const same = areUrisEquivalent("HTTP://Example.COM/", "http://example.com/")
console.log(same) // true
```
```

**Signature**

```ts
declare const areUrisEquivalent: { (right: URIReference | string): (left: URIReference | string) => boolean; (left: URIReference | string, right: URIReference | string): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L406)

Since v0.0.0

## normalizeUriReference

Normalize a URI or URI reference for transport-oriented comparisons.

**Example**

```ts
```typescript
import { normalizeUriReference } from "@beep/rdf/Uri"

const normalized = normalizeUriReference("HTTP://Example.COM:80/Path")
console.log(normalized) // "http://example.com/Path"
```
```

**Signature**

```ts
declare const normalizeUriReference: (value: URIReference | string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L362)

Since v0.0.0

## resolveUriReference

Resolve a URI reference against an absolute base URI.

**Example**

```ts
```typescript
import { resolveUriReference } from "@beep/rdf/Uri"

const resolved = resolveUriReference("https://example.com/a/b", "../c")
console.log(resolved) // "https://example.com/c"
```
```

**Signature**

```ts
declare const resolveUriReference: { (reference: URIReference | string): (base: AbsoluteURI | string) => string; (base: AbsoluteURI | string, reference: URIReference | string): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Uri.ts#L382)

Since v0.0.0