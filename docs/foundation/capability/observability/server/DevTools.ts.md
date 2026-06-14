---
title: DevTools.ts
nav_order: 13
parent: "@beep/observability"
---

## DevTools.ts overview

Server-side Effect devtools span publishing layers and filters.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerFilteredDevTools](#layerfiltereddevtools)
- [models](#models)
  - [DevToolsSpanFilter (type alias)](#devtoolsspanfilter-type-alias)
---

# layers

## layerFilteredDevTools

Mirror only selected spans to the Effect devtools websocket.

**Example**

```ts
```typescript
import { layerFilteredDevTools } from "@beep/observability/server"

const DevToolsLive = layerFilteredDevTools({
  shouldPublish: () => true,
  url: "ws://localhost:34437"
})
console.log(DevToolsLive)
```
```

**Signature**

```ts
declare const layerFilteredDevTools: (options: { readonly url: string; readonly shouldPublish: DevToolsSpanFilter; }) => Layer.Layer<never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/DevTools.ts#L90)

Since v0.0.0

# models

## DevToolsSpanFilter (type alias)

Predicate used to decide whether a span should be mirrored to Effect devtools.

**Example**

```ts
```typescript
import { Str } from "@beep/utils"
import type { DevToolsSpanFilter } from "@beep/observability/server"

const filter: DevToolsSpanFilter = (name) => Str.startsWith(name, "Http.")
console.log(filter("Http.server"))
```
```

**Signature**

```ts
type DevToolsSpanFilter = (name: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/DevTools.ts#L28)

Since v0.0.0