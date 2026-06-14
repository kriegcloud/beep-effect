---
title: Xml.ts
nav_order: 220
parent: "@beep/schema"
---

## Xml.ts overview

XML parsing and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [decodeXmlTextAs](#decodexmltextas)
- [validation](#validation)
  - [XmlTextToUnknown](#xmltexttounknown)
---

# utilities

## decodeXmlTextAs

Builds a decoder that parses XML text and then decodes the result through a
target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeXmlTextAs } from "@beep/schema/Xml"

const Doc = S.Struct({ root: S.Struct({ name: S.String }) })
const decodeDoc = decodeXmlTextAs(Doc)

const program = decodeDoc("<root><name>Beep</name></root>")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeXmlTextAs: <Schema extends S.Top>(schema: Schema) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Xml.ts#L121)

Since v0.0.0

# validation

## XmlTextToUnknown

Schema transformation that decodes XML text into an unknown parsed document
using `fast-xml-parser`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { XmlTextToUnknown } from "@beep/schema/Xml"

const program = S.decodeUnknownEffect(XmlTextToUnknown)("<root><name>Beep</name></root>")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const XmlTextToUnknown: AnnotatedSchema<S.decodeTo<S.Unknown, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Xml.ts#L85)

Since v0.0.0