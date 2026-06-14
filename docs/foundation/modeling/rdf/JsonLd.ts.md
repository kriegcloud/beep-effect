---
title: JsonLd.ts
nav_order: 3
parent: "@beep/rdf"
---

## JsonLd.ts overview

JSON-LD value families and normalized document shapes.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [JsonLdBlankNodeIdentifier](#jsonldblanknodeidentifier)
  - [JsonLdBlankNodeIdentifier (type alias)](#jsonldblanknodeidentifier-type-alias)
  - [JsonLdContext (class)](#jsonldcontext-class)
  - [JsonLdDocument (class)](#jsonlddocument-class)
  - [JsonLdFrame (class)](#jsonldframe-class)
  - [JsonLdKeyword](#jsonldkeyword)
  - [JsonLdKeyword (type alias)](#jsonldkeyword-type-alias)
  - [JsonLdLiteralValue (class)](#jsonldliteralvalue-class)
  - [JsonLdNodeIdentifier](#jsonldnodeidentifier)
  - [JsonLdNodeIdentifier (type alias)](#jsonldnodeidentifier-type-alias)
  - [JsonLdNodeObject (class)](#jsonldnodeobject-class)
  - [JsonLdPropertyValue](#jsonldpropertyvalue)
  - [JsonLdPropertyValue (type alias)](#jsonldpropertyvalue-type-alias)
  - [JsonLdReferenceValue (class)](#jsonldreferencevalue-class)
  - [JsonLdTermDefinition (class)](#jsonldtermdefinition-class)
---

# models

## JsonLdBlankNodeIdentifier

JSON-LD blank-node identifier used by the bounded document model.

**Example**

```ts
import { JsonLdBlankNodeIdentifier } from "@beep/rdf/JsonLd"

console.log(JsonLdBlankNodeIdentifier)
```

**Signature**

```ts
declare const JsonLdBlankNodeIdentifier: AnnotatedSchema<S.brand<S.String, "JsonLdBlankNodeIdentifier">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L168)

Since v0.0.0

## JsonLdBlankNodeIdentifier (type alias)

Type for `JsonLdBlankNodeIdentifier`.

**Example**

```ts
import type { JsonLdBlankNodeIdentifier } from "@beep/rdf/JsonLd"

const acceptJsonLdBlankNodeIdentifier = (value: JsonLdBlankNodeIdentifier) => value
console.log(acceptJsonLdBlankNodeIdentifier)
```

**Signature**

```ts
type JsonLdBlankNodeIdentifier = typeof JsonLdBlankNodeIdentifier.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L199)

Since v0.0.0

## JsonLdContext (class)

Normalized JSON-LD context model with bounded base, vocab, and term bindings.

**Example**

```ts
import { JsonLdContext } from "@beep/rdf/JsonLd"

console.log(JsonLdContext)
```

**Signature**

```ts
declare class JsonLdContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L134)

Since v0.0.0

## JsonLdDocument (class)

Bounded JSON-LD document model with normalized context and graph content.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { JsonLdDocument } from "@beep/rdf/JsonLd"

const doc = S.decodeUnknownSync(JsonLdDocument)({ "@graph": [] })
console.log(doc["@graph"].length) // 0
```
```

**Signature**

```ts
declare class JsonLdDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L395)

Since v0.0.0

## JsonLdFrame (class)

Bounded JSON-LD frame model.

**Example**

```ts
import { JsonLdFrame } from "@beep/rdf/JsonLd"

console.log(JsonLdFrame)
```

**Signature**

```ts
declare class JsonLdFrame
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L429)

Since v0.0.0

## JsonLdKeyword

JSON-LD keyword surface used by the bounded v1 model.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { JsonLdKeyword } from "@beep/rdf/JsonLd"

console.log(S.is(JsonLdKeyword)("@context")) // true
console.log(S.is(JsonLdKeyword)("@invalid")) // false
```
```

**Signature**

```ts
declare const JsonLdKeyword: AnnotatedSchema<LiteralKit<readonly ["@base", "@context", "@graph", "@id", "@language", "@type", "@value", "@vocab"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L54)

Since v0.0.0

## JsonLdKeyword (type alias)

Type for `JsonLdKeyword`.

**Example**

```ts
import type { JsonLdKeyword } from "@beep/rdf/JsonLd"

const acceptJsonLdKeyword = (value: JsonLdKeyword) => value
console.log(acceptJsonLdKeyword)
```

**Signature**

```ts
type JsonLdKeyword = typeof JsonLdKeyword.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L83)

Since v0.0.0

## JsonLdLiteralValue (class)

JSON-LD literal value object.

**Example**

```ts
import { JsonLdLiteralValue } from "@beep/rdf/JsonLd"

console.log(JsonLdLiteralValue)
```

**Signature**

```ts
declare class JsonLdLiteralValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L291)

Since v0.0.0

## JsonLdNodeIdentifier

JSON-LD node identifier used by the bounded document model.

**Example**

```ts
import { JsonLdNodeIdentifier } from "@beep/rdf/JsonLd"

console.log(JsonLdNodeIdentifier)
```

**Signature**

```ts
declare const JsonLdNodeIdentifier: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.brand<S.String, "IRIReference">>, AnnotatedSchema<S.brand<S.String, "JsonLdBlankNodeIdentifier">>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L214)

Since v0.0.0

## JsonLdNodeIdentifier (type alias)

Type for `JsonLdNodeIdentifier`.

**Example**

```ts
import type { JsonLdNodeIdentifier } from "@beep/rdf/JsonLd"

const acceptJsonLdNodeIdentifier = (value: JsonLdNodeIdentifier) => value
console.log(acceptJsonLdNodeIdentifier)
```

**Signature**

```ts
type JsonLdNodeIdentifier = typeof JsonLdNodeIdentifier.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L244)

Since v0.0.0

## JsonLdNodeObject (class)

JSON-LD node object used by bounded document and framing helpers.

**Example**

```ts
import { JsonLdNodeObject } from "@beep/rdf/JsonLd"

console.log(JsonLdNodeObject)
```

**Signature**

```ts
declare class JsonLdNodeObject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L359)

Since v0.0.0

## JsonLdPropertyValue

JSON-LD property value union used by bounded node objects.

**Example**

```ts
import { JsonLdPropertyValue } from "@beep/rdf/JsonLd"

console.log(JsonLdPropertyValue)
```

**Signature**

```ts
declare const JsonLdPropertyValue: AnnotatedSchema<S.Union<readonly [typeof JsonLdReferenceValue, typeof JsonLdLiteralValue]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L324)

Since v0.0.0

## JsonLdPropertyValue (type alias)

Type for `JsonLdPropertyValue`.

**Example**

```ts
import type { JsonLdPropertyValue } from "@beep/rdf/JsonLd"

const acceptJsonLdPropertyValue = (value: JsonLdPropertyValue) => value
console.log(acceptJsonLdPropertyValue)
```

**Signature**

```ts
type JsonLdPropertyValue = typeof JsonLdPropertyValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L344)

Since v0.0.0

## JsonLdReferenceValue (class)

JSON-LD node reference value.

**Example**

```ts
import { JsonLdReferenceValue } from "@beep/rdf/JsonLd"

console.log(JsonLdReferenceValue)
```

**Signature**

```ts
declare class JsonLdReferenceValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L259)

Since v0.0.0

## JsonLdTermDefinition (class)

Normalized JSON-LD term definition used by the bounded context model.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { JsonLdTermDefinition } from "@beep/rdf/JsonLd"

const term = S.decodeUnknownSync(JsonLdTermDefinition)({

})
console.log(term["@id"]) // "https://schema.org/name"
```
```

**Signature**

```ts
declare class JsonLdTermDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/JsonLd.ts#L102)

Since v0.0.0