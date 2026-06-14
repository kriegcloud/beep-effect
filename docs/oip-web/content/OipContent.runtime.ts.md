---
title: OipContent.runtime.ts
nav_order: 14
parent: "@beep/oip-web"
---

## OipContent.runtime.ts overview

Runtime OIP content loading with Sanity fallback.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [getOipSiteContent](#getoipsitecontent)
  - [loadOipSiteContent](#loadoipsitecontent)
---

# utilities

## getOipSiteContent

Promise boundary for Next.js server components.

**Example**

```ts
import { getOipSiteContent } from "@beep/oip-web/content"

getOipSiteContent().then((content) => console.log(content.metadata.siteName))
```

**Signature**

```ts
declare const getOipSiteContent: () => Promise<OipSiteContent>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.runtime.ts#L190)

Since v0.0.0

## loadOipSiteContent

Loads OIP site content from Sanity when configured, falling back to the
checked-in launch content for local development, builds, and provider errors.

**Example**

```ts
import { Effect } from "effect"
import { loadOipSiteContent } from "@beep/oip-web/content"

Effect.runPromise(loadOipSiteContent)
```

**Signature**

```ts
declare const loadOipSiteContent: Effect.Effect<OipSiteContent, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.runtime.ts#L165)

Since v0.0.0