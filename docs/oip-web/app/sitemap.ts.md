---
title: sitemap.ts
nav_order: 6
parent: "@beep/oip-web"
---

## sitemap.ts overview

Sitemap for oip.law.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [sitemap](#sitemap)
---

# constructors

## sitemap

Returns the OIP sitemap.

**Example**

```ts
import sitemap from "@beep/oip-web/app/sitemap"

console.log(sitemap()[0]?.url)
```

**Signature**

```ts
declare const sitemap: () => MetadataRoute.Sitemap
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/sitemap.ts#L24)

Since v0.0.0