---
title: OipContent.data.ts
nav_order: 12
parent: "@beep/oip-web"
---

## OipContent.data.ts overview

Launch content for the OIP public website.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [launchReviewGates](#launchreviewgates)
  - [oipSiteContent](#oipsitecontent)
---

# models

## launchReviewGates

Review gate statuses that must be closed before public launch.

**Example**

```ts
import { launchReviewGates } from "@beep/oip-web/content"

console.log(launchReviewGates.contact.status)
```

**Signature**

```ts
declare const launchReviewGates: { readonly clientLogos: { note: string; status: "needs_review"; }; readonly contact: ReviewGate; readonly matters: { note: string; status: "needs_review"; }; readonly metadata: { note: string; status: "approved"; }; readonly socials: { note: string; status: "approved"; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.data.ts#L397)

Since v0.0.0

## oipSiteContent

Decoded OIP launch content.

**Example**

```ts
import { oipSiteContent } from "@beep/oip-web/content"

console.log(oipSiteContent.metadata.siteName)
```

**Signature**

```ts
declare const oipSiteContent: OipSiteContent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.data.ts#L382)

Since v0.0.0