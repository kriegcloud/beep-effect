---
title: manifest.ts
nav_order: 4
parent: "@beep/oip-web"
---

## manifest.ts overview

Web app manifest for the oip web app shell.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [manifest](#manifest)
---

# constructors

## manifest

Returns the static web manifest for oip web.

**Example**

```ts
import manifest from "@beep/oip-web/app/manifest"

console.log(manifest().name)
```

**Signature**

```ts
declare const manifest: () => MetadataRoute.Manifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/manifest.ts#L23)

Since v0.0.0