---
title: OipRedirects.ts
nav_order: 7
parent: "@beep/oip-web"
---

## OipRedirects.ts overview

OIP redirect configuration exports.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [oipRedirects](#oipredirects)
---

# configuration

## oipRedirects

Returns the canonical OIP redirect table for legacy OPIP compatibility.

**Example**

```ts
import { oipRedirects } from "@beep/oip-web/config/OipRedirects"

const redirects = oipRedirects()
console.log(redirects.length)
```

**Signature**

```ts
declare const oipRedirects: () => Array<Redirect>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/config/OipRedirects.ts#L24)

Since v0.0.0