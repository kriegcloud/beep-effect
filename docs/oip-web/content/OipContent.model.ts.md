---
title: OipContent.model.ts
nav_order: 13
parent: "@beep/oip-web"
---

## OipContent.model.ts overview

Schema-first content contracts for the OIP public website.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AboutPanel (class)](#aboutpanel-class)
  - [ClientLogo (class)](#clientlogo-class)
  - [ContactContent (class)](#contactcontent-class)
  - [ExternalLink (class)](#externallink-class)
  - [HeroContent (class)](#herocontent-class)
  - [MatterItem (class)](#matteritem-class)
  - [NavItem (class)](#navitem-class)
  - [OipSiteContent (class)](#oipsitecontent-class)
  - [PracticeArea (class)](#practicearea-class)
  - [PressItem (class)](#pressitem-class)
  - [ReviewGate (class)](#reviewgate-class)
  - [ReviewStatus (type alias)](#reviewstatus-type-alias)
  - [SiteAsset (class)](#siteasset-class)
  - [SiteMetadataContent (class)](#sitemetadatacontent-class)
  - [SocialLink (class)](#sociallink-class)
  - [SocialPlatform (type alias)](#socialplatform-type-alias)
- [schemas](#schemas)
  - [ReviewStatus](#reviewstatus)
  - [SocialPlatform](#socialplatform)
- [utilities](#utilities)
  - [decodeOipSiteContent](#decodeoipsitecontent)
  - [decodeOipSiteContentResult](#decodeoipsitecontentresult)
---

# models

## AboutPanel (class)

Biographical bridge panel.

**Example**

```ts
import { AboutPanel, SiteAsset } from "@beep/oip-web/content"

const panel = new AboutPanel({
  body: "Trial and prosecution experience.",
  id: "law",
  image: new SiteAsset({ alt: "Portrait", src: "/oip/portrait.png" }),
  kicker: "Law",
  title: "Patent practice"
})

console.log(panel.id)
```

**Signature**

```ts
declare class AboutPanel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L341)

Since v0.0.0

## ClientLogo (class)

Client logo reference.

**Example**

```ts
import { ClientLogo, ReviewGate, SiteAsset } from "@beep/oip-web/content"

const client = new ClientLogo({
  aspectRatio: "4 / 1",
  id: "client",
  logo: new SiteAsset({ alt: "Client", src: "/oip/client.svg" }),
  review: new ReviewGate({ note: "Approved.", status: "approved" }),
  website: "https://example.com"
})

console.log(client.id)
```

**Signature**

```ts
declare class ClientLogo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L446)

Since v0.0.0

## ContactContent (class)

Public contact and legal notice content.

**Example**

```ts
import { ContactContent, ReviewGate } from "@beep/oip-web/content"

const contact = new ContactContent({
  email: "hello@example.com",
  lede: "Reach out.",
  notice: ["No attorney-client relationship is formed by this website."],
  review: new ReviewGate({ note: "Approved.", status: "approved" }),
  title: "Contact"
})

console.log(contact.email)
```

**Signature**

```ts
declare class ContactContent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L516)

Since v0.0.0

## ExternalLink (class)

External link displayed by the public site.

**Example**

```ts
import { ExternalLink } from "@beep/oip-web/content"

const link = new ExternalLink({
  href: "https://example.com",
  label: "Source"
})

console.log(link.href)
```

**Signature**

```ts
declare class ExternalLink
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L97)

Since v0.0.0

## HeroContent (class)

Hero citation and opening claim.

**Example**

```ts
import { HeroContent, NavItem, SiteAsset } from "@beep/oip-web/content"

const link = new NavItem({ href: "#contact", label: "Contact" })
const asset = new SiteAsset({ alt: "Hero", src: "/oip/hero.jpg" })
const hero = new HeroContent({
  citation: "175 F.3d 1356",
  headline: "Patent counsel.",
  lede: "For builders.",
  portrait: asset,
  primaryCta: link,
  secondaryCta: link,
  video: asset,
  videoPoster: asset
})

console.log(hero.headline)
```

**Signature**

```ts
declare class HeroContent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L304)

Since v0.0.0

## MatterItem (class)

Selected matter summary.

**Example**

```ts
import { ExternalLink, MatterItem, ReviewGate, SiteAsset } from "@beep/oip-web/content"

const matter = new MatterItem({
  body: "Representative public matter.",
  caption: "Litigation",
  eyebrow: "1999",
  figure: new SiteAsset({ alt: "Patent drawing", src: "/oip/patent.png" }),
  id: "matter",
  review: new ReviewGate({ note: "Approved.", status: "approved" }),
  source: new ExternalLink({ href: "https://example.com", label: "Read" }),
  title: "Matter"
})

console.log(matter.title)
```

**Signature**

```ts
declare class MatterItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L408)

Since v0.0.0

## NavItem (class)

Anchor navigation item.

**Example**

```ts
import { NavItem } from "@beep/oip-web/content"

const item = new NavItem({ href: "#contact", label: "Contact" })
console.log(item.label)
```

**Signature**

```ts
declare class NavItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L268)

Since v0.0.0

## OipSiteContent (class)

Complete content contract for the OIP public site.

**Example**

```ts
import { OipSiteContent, oipSiteContent } from "@beep/oip-web/content"

const content = new OipSiteContent(oipSiteContent)
console.log(content.metadata.siteName)
```

**Signature**

```ts
declare class OipSiteContent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L543)

Since v0.0.0

## PracticeArea (class)

Practice-area summary.

**Example**

```ts
import { PracticeArea } from "@beep/oip-web/content"

const practice = new PracticeArea({
  body: "Patent prosecution and litigation.",
  id: "01",
  title: "Patents"
})

console.log(practice.title)
```

**Signature**

```ts
declare class PracticeArea
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L373)

Since v0.0.0

## PressItem (class)

Press item summary.

**Example**

```ts
import { ExternalLink, PressItem } from "@beep/oip-web/content"

const press = new PressItem({
  body: "Coverage summary.",
  date: "2026-05-14",
  dateLabel: "May 14, 2026",
  headline: "Patent coverage",
  publication: "Publication",
  source: new ExternalLink({ href: "https://example.com", label: "Read" })
})

console.log(press.publication)
```

**Signature**

```ts
declare class PressItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L481)

Since v0.0.0

## ReviewGate (class)

Review note attached to a public website claim.

**Example**

```ts
import { ReviewGate } from "@beep/oip-web/content"

const gate = new ReviewGate({
  note: "Launch approved.",
  status: "approved"
})

console.log(gate.status)
```

**Signature**

```ts
declare class ReviewGate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L69)

Since v0.0.0

## ReviewStatus (type alias)

Runtime type for `ReviewStatus`.

**Example**

```ts
import type { ReviewStatus } from "@beep/oip-web/content"

const status: ReviewStatus = "approved"
console.log(status)
```

**Signature**

```ts
type ReviewStatus = typeof ReviewStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L49)

Since v0.0.0

## SiteAsset (class)

Runtime asset reference served from the OIP app public folder.

**Example**

```ts
import { SiteAsset } from "@beep/oip-web/content"

const asset = new SiteAsset({
  alt: "Patent drawing",
  src: "/oip/patent.png"
})

console.log(asset.src)
```

**Signature**

```ts
declare class SiteAsset
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L205)

Since v0.0.0

## SiteMetadataContent (class)

Top-level metadata used by Next.js and JSON-LD generation.

**Example**

```ts
import { SiteMetadataContent } from "@beep/oip-web/content"

const metadata = new SiteMetadataContent({
  description: "Patent counsel.",
  linkedInUrl: "https://linkedin.com/company/example",
  ogImage: "/oip/og.png",
  siteName: "OIP - Oppold IP Law",
  siteUrl: "https://oip.law",
  title: "oip.law"
})

console.log(metadata.title)
```

**Signature**

```ts
declare class SiteMetadataContent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L240)

Since v0.0.0

## SocialLink (class)

Public social media profile link for the OIP firm.

**Example**

```ts
import { SocialLink } from "@beep/oip-web/content"

const link = new SocialLink({
  href: "https://www.instagram.com/oip.law/",
  label: "OIP on Instagram",
  platform: "instagram"
})

console.log(link.active)
```

**Signature**

```ts
declare class SocialLink
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L172)

Since v0.0.0

## SocialPlatform (type alias)

Runtime type for `SocialPlatform`.

**Example**

```ts
import type { SocialPlatform } from "@beep/oip-web/content"

const platform: SocialPlatform = "instagram"
console.log(platform)
```

**Signature**

```ts
type SocialPlatform = typeof SocialPlatform.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L151)

Since v0.0.0

# schemas

## ReviewStatus

Review state for public claims that need launch approval.

**Example**

```ts
import { ReviewStatus } from "@beep/oip-web/content"

const status = ReviewStatus.Enum.needs_review
console.log(status)
```

**Signature**

```ts
declare const ReviewStatus: AnnotatedSchema<LiteralKit<readonly ["approved", "needs_review"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L29)

Since v0.0.0

## SocialPlatform

Social platform the OIP firm maintains a public profile on.

**Example**

```ts
import { SocialPlatform } from "@beep/oip-web/content"

const platform = SocialPlatform.Enum.instagram
console.log(platform)
```

**Signature**

```ts
declare const SocialPlatform: AnnotatedSchema<LiteralKit<readonly ["instagram", "x", "linkedin", "youtube", "threads", "tiktok", "reddit", "discord", "pinterest"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L121)

Since v0.0.0

# utilities

## decodeOipSiteContent

Decodes unknown input into `OipSiteContent` in an Effect workflow.

**Example**

```ts
import { Effect } from "effect"
import { decodeOipSiteContent, oipSiteContent } from "@beep/oip-web/content"

const program = decodeOipSiteContent(oipSiteContent)
Effect.runPromise(program)
```

**Signature**

```ts
declare const decodeOipSiteContent: (input: unknown, options?: ParseOptions) => Effect.Effect<OipSiteContent, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L596)

Since v0.0.0

## decodeOipSiteContentResult

Decodes unknown input into `OipSiteContent`.

**Example**

```ts
import { Result } from "effect"
import { decodeOipSiteContentResult, oipSiteContent } from "@beep/oip-web/content"

const result = decodeOipSiteContentResult(oipSiteContent)
console.log(Result.isSuccess(result))
```

**Signature**

```ts
declare const decodeOipSiteContentResult: (input: unknown, options?: ParseOptions) => Result<OipSiteContent, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/content/OipContent.model.ts#L579)

Since v0.0.0