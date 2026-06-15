---
title: OipSeo.ts
nav_order: 15
parent: "@beep/oip-web"
---

## OipSeo.ts overview

SEO, AEO, and machine-readable content helpers for OIP.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [makeJsonLdGraph](#makejsonldgraph)
  - [makeLlmsText](#makellmstext)
  - [oipTwitterHandle](#oiptwitterhandle)
---

# utilities

## makeJsonLdGraph

Builds conservative JSON-LD graph data for the OIP website.

**Example**

```ts
import { makeJsonLdGraph, oipSiteContent } from "@beep/oip-web/content"

const graph = makeJsonLdGraph(oipSiteContent)
console.log(graph["@context"])
```

**Signature**

```ts
declare const makeJsonLdGraph: (content: OipSiteContent) => { "@context": string; "@graph": Array<{ "@id": string; "@type": string; familyName: string; givenName: string; jobTitle: string; knowsAbout: Array<string>; name: string; sameAs: Array<string>; url: string; description?: undefined; inLanguage?: undefined; publisher?: undefined; } | { serviceType: Array<string>; url: string; sameAs?: ReadonlyArray<string> | undefined; "@id": string; "@type": string; areaServed: Array<{ "@type": string; name: string; }>; description: string; founder: { "@id": string; }; name: string; familyName?: undefined; givenName?: undefined; jobTitle?: undefined; knowsAbout?: undefined; inLanguage?: undefined; publisher?: undefined; } | { "@id": string; "@type": string; description: string; inLanguage: string; name: string; publisher: { "@id": string; }; url: string; familyName?: undefined; givenName?: undefined; jobTitle?: undefined; knowsAbout?: undefined; sameAs?: undefined; }>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipSeo.ts#L36)

Since v0.0.0

## makeLlmsText

Builds `llms.txt` content from reviewed OIP site content.

**Example**

```ts
import { makeLlmsText, oipSiteContent } from "@beep/oip-web/content"

const text = makeLlmsText(oipSiteContent)
console.log(text.includes("# OIP - Oppold IP Law"))
```

**Signature**

```ts
declare const makeLlmsText: (content: OipSiteContent) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipSeo.ts#L115)

Since v0.0.0

## oipTwitterHandle

Derives the firm's X/Twitter handle (e.g. `@opiplaw`) from the social links,
for use in Next.js `twitter` metadata. Returns `undefined` when no X profile
is present.

**Example**

```ts
import { oipSiteContent, oipTwitterHandle } from "@beep/oip-web/content"

console.log(oipTwitterHandle(oipSiteContent))
```

**Signature**

```ts
declare const oipTwitterHandle: (content: OipSiteContent) => string | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipSeo.ts#L92)

Since v0.0.0