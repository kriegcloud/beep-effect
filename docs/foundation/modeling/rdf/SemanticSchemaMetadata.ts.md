---
title: SemanticSchemaMetadata.ts
nav_order: 5
parent: "@beep/rdf"
---

## SemanticSchemaMetadata.ts overview

Semantic schema metadata helpers for public `@beep/rdf` families.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SemanticRepresentation (class)](#semanticrepresentation-class)
  - [SemanticRepresentationKind](#semanticrepresentationkind)
  - [SemanticRepresentationKind (type alias)](#semanticrepresentationkind-type-alias)
  - [SemanticSchemaMetadata (class)](#semanticschemametadata-class)
  - [SemanticSchemaMetadataAnnotationPayload (type alias)](#semanticschemametadataannotationpayload-type-alias)
  - [SemanticSchemaMetadataKind](#semanticschemametadatakind)
  - [SemanticSchemaMetadataKind (type alias)](#semanticschemametadatakind-type-alias)
  - [SemanticSchemaSpecification (class)](#semanticschemaspecification-class)
  - [SemanticSchemaSpecificationDisposition](#semanticschemaspecificationdisposition)
  - [SemanticSchemaSpecificationDisposition (type alias)](#semanticschemaspecificationdisposition-type-alias)
  - [SemanticSchemaStatus](#semanticschemastatus)
  - [SemanticSchemaStatus (type alias)](#semanticschemastatus-type-alias)
- [utilities](#utilities)
  - [annotateSemanticSchema](#annotatesemanticschema)
  - [getSemanticSchemaMetadata](#getsemanticschemametadata)
  - [makeSemanticSchemaMetadata](#makesemanticschemametadata)
---

# models

## SemanticRepresentation (class)

Single representation note attached to semantic-web schemas.

**Example**

```ts
import { SemanticRepresentation } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticRepresentation)
```

**Signature**

```ts
declare class SemanticRepresentation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L221)

Since v0.0.0

## SemanticRepresentationKind

Representation label for semantic-web values.

**Example**

```ts
import { SemanticRepresentationKind } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticRepresentationKind)
```

**Signature**

```ts
declare const SemanticRepresentationKind: AnnotatedSchema<LiteralKit<readonly ["RDF/JS", "JSON-LD", "Turtle", "TriG", "RDF/XML", "JSON Schema"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L152)

Since v0.0.0

## SemanticRepresentationKind (type alias)

Type for `SemanticRepresentationKind`.

**Example**

```ts
import type { SemanticRepresentationKind } from "@beep/rdf/SemanticSchemaMetadata"

const acceptSemanticRepresentationKind = (value: SemanticRepresentationKind) => value
console.log(acceptSemanticRepresentationKind)
```

**Signature**

```ts
type SemanticRepresentationKind = typeof SemanticRepresentationKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L179)

Since v0.0.0

## SemanticSchemaMetadata (class)

Typed metadata payload stored in the `semanticSchemaMetadata` annotation key.

**Example**

```ts
import { SemanticSchemaMetadata } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticSchemaMetadata)
```

**Signature**

```ts
declare class SemanticSchemaMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L244)

Since v0.0.0

## SemanticSchemaMetadataAnnotationPayload (type alias)

Payload stored in the `semanticSchemaMetadata` annotation key.

**Example**

```ts
import type { SemanticSchemaMetadataAnnotationPayload } from "@beep/rdf/SemanticSchemaMetadata"

const acceptSemanticSchemaMetadataAnnotationPayload = (value: SemanticSchemaMetadataAnnotationPayload) => value
console.log(acceptSemanticSchemaMetadataAnnotationPayload)
```

**Signature**

```ts
type SemanticSchemaMetadataAnnotationPayload = SemanticSchemaMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L284)

Since v0.0.0

## SemanticSchemaMetadataKind

Closed v1 metadata kind domain for semantic-web schemas.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { SemanticSchemaMetadataKind } from "@beep/rdf/SemanticSchemaMetadata"

console.log(S.is(SemanticSchemaMetadataKind)("identifier")) // true
console.log(S.is(SemanticSchemaMetadataKind)("unknown")) // false
```
```

**Signature**

```ts
declare const SemanticSchemaMetadataKind: AnnotatedSchema<LiteralKit<readonly ["identifier", "vocabularyTerm", "ontologyConstruct", "rdfConstruct", "jsonldConstruct", "provenanceConstruct", "serviceContract", "adapterBoundary"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L38)

Since v0.0.0

## SemanticSchemaMetadataKind (type alias)

Type for `SemanticSchemaMetadataKind`.

**Example**

```ts
import type { SemanticSchemaMetadataKind } from "@beep/rdf/SemanticSchemaMetadata"

const acceptSemanticSchemaMetadataKind = (value: SemanticSchemaMetadataKind) => value
console.log(acceptSemanticSchemaMetadataKind)
```

**Signature**

```ts
type SemanticSchemaMetadataKind = typeof SemanticSchemaMetadataKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L67)

Since v0.0.0

## SemanticSchemaSpecification (class)

Single specification reference attached to public semantic-web schemas.

**Example**

```ts
import { SemanticSchemaSpecification } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticSchemaSpecification)
```

**Signature**

```ts
declare class SemanticSchemaSpecification
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L194)

Since v0.0.0

## SemanticSchemaSpecificationDisposition

Specification disposition attached to a semantic schema reference.

**Example**

```ts
import { SemanticSchemaSpecificationDisposition } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticSchemaSpecificationDisposition)
```

**Signature**

```ts
declare const SemanticSchemaSpecificationDisposition: AnnotatedSchema<LiteralKit<readonly ["normative", "informative"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L117)

Since v0.0.0

## SemanticSchemaSpecificationDisposition (type alias)

Type for `SemanticSchemaSpecificationDisposition`.

**Example**

```ts
import type { SemanticSchemaSpecificationDisposition } from "@beep/rdf/SemanticSchemaMetadata"

const acceptSemanticSchemaSpecificationDisposition = (value: SemanticSchemaSpecificationDisposition) => value
console.log(acceptSemanticSchemaSpecificationDisposition)
```

**Signature**

```ts
type SemanticSchemaSpecificationDisposition = typeof SemanticSchemaSpecificationDisposition.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L137)

Since v0.0.0

## SemanticSchemaStatus

Stability classification for semantic-web schema metadata.

**Example**

```ts
import { SemanticSchemaStatus } from "@beep/rdf/SemanticSchemaMetadata"

console.log(SemanticSchemaStatus)
```

**Signature**

```ts
declare const SemanticSchemaStatus: AnnotatedSchema<LiteralKit<readonly ["experimental", "stable", "deprecated"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L82)

Since v0.0.0

## SemanticSchemaStatus (type alias)

Type for `SemanticSchemaStatus`.

**Example**

```ts
import type { SemanticSchemaStatus } from "@beep/rdf/SemanticSchemaMetadata"

const acceptSemanticSchemaStatus = (value: SemanticSchemaStatus) => value
console.log(acceptSemanticSchemaStatus)
```

**Signature**

```ts
type SemanticSchemaStatus = typeof SemanticSchemaStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L102)

Since v0.0.0

# utilities

## annotateSemanticSchema

Attach validated semantic metadata to any Effect schema.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { annotateSemanticSchema } from "@beep/rdf/SemanticSchemaMetadata"

const MySchema = annotateSemanticSchema(S.String, {
  kind: "identifier",
  canonicalName: "ExampleIdentifier",
  overview: "Example semantic schema metadata.",
  status: "stable",
  specifications: [{ name: "Example Profile", disposition: "informative" }],
  equivalenceBasis: "String equality.",
})
console.log(MySchema)
```
```

**Signature**

```ts
declare const annotateSemanticSchema: { <Schema extends S.Top>(metadata: typeof SemanticSchemaMetadata.Encoded): (schema: Schema) => Schema["Rebuild"]; <Schema extends S.Top>(schema: Schema, metadata: typeof SemanticSchemaMetadata.Encoded): Schema["Rebuild"]; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L347)

Since v0.0.0

## getSemanticSchemaMetadata

Read semantic metadata from any Effect schema, if present.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { getSemanticSchemaMetadata } from "@beep/rdf/SemanticSchemaMetadata"

const metadata = getSemanticSchemaMetadata(S.String)
console.log(metadata) // undefined (no metadata attached)
```
```

**Signature**

```ts
declare const getSemanticSchemaMetadata: (schema: S.Top) => SemanticSchemaMetadataAnnotationPayload | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L430)

Since v0.0.0

## makeSemanticSchemaMetadata

Validate a metadata payload before attaching it to a public schema.

**Example**

```ts
```typescript
import { makeSemanticSchemaMetadata } from "@beep/rdf/SemanticSchemaMetadata"

const metadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "ExampleIdentifier",
  overview: "Example semantic schema metadata.",
  status: "stable",
  specifications: [{ name: "Example Profile", disposition: "informative" }],
  equivalenceBasis: "String equality.",
})
console.log(metadata.kind) // "identifier"
```
```

**Signature**

```ts
declare const makeSemanticSchemaMetadata: (metadata: typeof SemanticSchemaMetadata.Encoded) => SemanticSchemaMetadataAnnotationPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/SemanticSchemaMetadata.ts#L317)

Since v0.0.0