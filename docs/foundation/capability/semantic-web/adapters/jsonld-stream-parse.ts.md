---
title: jsonld-stream-parse.ts
nav_order: 4
parent: "@beep/semantic-web"
---

## jsonld-stream-parse.ts overview

Local JSON-LD streaming parse adapter backing.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [JsonLdStreamParseServiceLive](#jsonldstreamparseservicelive)
---

# layers

## JsonLdStreamParseServiceLive

JSON-LD streaming parse service live layer.

**Example**

```ts
import { JsonLdStreamParseServiceLive } from "@beep/semantic-web/adapters/jsonld-stream-parse"

console.log(JsonLdStreamParseServiceLive)
```

**Signature**

```ts
declare const JsonLdStreamParseServiceLive: Layer.Layer<JsonLdStreamParseService, never, JsonLdDocumentService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/adapters/jsonld-stream-parse.ts#L100)

Since v0.0.0