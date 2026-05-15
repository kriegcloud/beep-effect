/**
 * Schema-first content contracts for the OPIP public website.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpipWebId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $OpipWebId.create("content/OpipContent.model");

/**
 * Review state for public claims that need launch approval.
 *
 * @example
 * ```ts
 * import { ReviewStatus } from "@beep/opip-web/content"
 *
 * const status = ReviewStatus.Enum.needs_review
 * console.log(status)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReviewStatus = LiteralKit(["approved", "needs_review"] as const).annotate(
  $I.annote("ReviewStatus", {
    description: "Review state for public OPIP website claims.",
  })
);

/**
 * Runtime type for {@link ReviewStatus}.
 *
 * @example
 * ```ts
 * import type { ReviewStatus } from "@beep/opip-web/content"
 *
 * const status: ReviewStatus = "approved"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReviewStatus = typeof ReviewStatus.Type;

/**
 * Review note attached to a public website claim.
 *
 * @example
 * ```ts
 * import { ReviewGate } from "@beep/opip-web/content"
 *
 * const gate = new ReviewGate({
 *   note: "Launch approved.",
 *   status: "approved"
 * })
 *
 * console.log(gate.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ReviewGate extends S.Class<ReviewGate>($I`ReviewGate`)(
  {
    status: ReviewStatus,
    note: S.String,
  },
  $I.annote("ReviewGate", {
    description: "Review note attached to a public website claim.",
  })
) {}

/**
 * External link displayed by the public site.
 *
 * @example
 * ```ts
 * import { ExternalLink } from "@beep/opip-web/content"
 *
 * const link = new ExternalLink({
 *   href: "https://example.com",
 *   label: "Source"
 * })
 *
 * console.log(link.href)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExternalLink extends S.Class<ExternalLink>($I`ExternalLink`)(
  {
    href: S.String,
    label: S.String,
  },
  $I.annote("ExternalLink", {
    description: "External link displayed by the public OPIP website.",
  })
) {}

/**
 * Runtime asset reference served from the OPIP app public folder.
 *
 * @example
 * ```ts
 * import { SiteAsset } from "@beep/opip-web/content"
 *
 * const asset = new SiteAsset({
 *   alt: "Patent drawing",
 *   src: "/opip/patent.png"
 * })
 *
 * console.log(asset.src)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SiteAsset extends S.Class<SiteAsset>($I`SiteAsset`)(
  {
    alt: S.String,
    credit: S.optionalKey(S.String),
    height: S.optionalKey(S.Number),
    src: S.String,
    width: S.optionalKey(S.Number),
  },
  $I.annote("SiteAsset", {
    description: "Runtime asset reference served by the OPIP website.",
  })
) {}

/**
 * Top-level metadata used by Next.js and JSON-LD generation.
 *
 * @example
 * ```ts
 * import { SiteMetadataContent } from "@beep/opip-web/content"
 *
 * const metadata = new SiteMetadataContent({
 *   description: "Patent counsel.",
 *   linkedInUrl: "https://linkedin.com/company/example",
 *   ogImage: "/opip/og.png",
 *   siteName: "opip.law",
 *   siteUrl: "https://opip.law",
 *   title: "opip.law"
 * })
 *
 * console.log(metadata.title)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SiteMetadataContent extends S.Class<SiteMetadataContent>($I`SiteMetadataContent`)(
  {
    description: S.String,
    linkedInUrl: S.String,
    ogImage: S.String,
    siteName: S.String,
    siteUrl: S.String,
    title: S.String,
  },
  $I.annote("SiteMetadataContent", {
    description: "Top-level metadata used by Next.js and JSON-LD generation.",
  })
) {}

/**
 * Anchor navigation item.
 *
 * @example
 * ```ts
 * import { NavItem } from "@beep/opip-web/content"
 *
 * const item = new NavItem({ href: "#contact", label: "Contact" })
 * console.log(item.label)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NavItem extends S.Class<NavItem>($I`NavItem`)(
  {
    href: S.String,
    label: S.String,
  },
  $I.annote("NavItem", {
    description: "Anchor navigation item for the OPIP home page.",
  })
) {}

/**
 * Hero citation and opening claim.
 *
 * @example
 * ```ts
 * import { HeroContent, NavItem, SiteAsset } from "@beep/opip-web/content"
 *
 * const link = new NavItem({ href: "#contact", label: "Contact" })
 * const asset = new SiteAsset({ alt: "Hero", src: "/opip/hero.jpg" })
 * const hero = new HeroContent({
 *   citation: "175 F.3d 1356",
 *   headline: "Patent counsel.",
 *   lede: "For builders.",
 *   portrait: asset,
 *   primaryCta: link,
 *   secondaryCta: link,
 *   video: asset,
 *   videoPoster: asset
 * })
 *
 * console.log(hero.headline)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HeroContent extends S.Class<HeroContent>($I`HeroContent`)(
  {
    citation: S.String,
    headline: S.String,
    lede: S.String,
    primaryCta: NavItem,
    secondaryCta: NavItem,
    portrait: SiteAsset,
    video: SiteAsset,
    videoPoster: SiteAsset,
  },
  $I.annote("HeroContent", {
    description: "Hero citation and opening claim for the OPIP home page.",
  })
) {}

/**
 * Biographical bridge panel.
 *
 * @example
 * ```ts
 * import { AboutPanel, SiteAsset } from "@beep/opip-web/content"
 *
 * const panel = new AboutPanel({
 *   body: "Trial and prosecution experience.",
 *   id: "law",
 *   image: new SiteAsset({ alt: "Portrait", src: "/opip/portrait.png" }),
 *   kicker: "Law",
 *   title: "Patent practice"
 * })
 *
 * console.log(panel.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AboutPanel extends S.Class<AboutPanel>($I`AboutPanel`)(
  {
    body: S.String,
    id: S.String,
    image: SiteAsset,
    kicker: S.String,
    title: S.String,
  },
  $I.annote("AboutPanel", {
    description: "Biographical bridge panel for the OPIP home page.",
  })
) {}

/**
 * Practice-area summary.
 *
 * @example
 * ```ts
 * import { PracticeArea } from "@beep/opip-web/content"
 *
 * const practice = new PracticeArea({
 *   body: "Patent prosecution and litigation.",
 *   id: "01",
 *   title: "Patents"
 * })
 *
 * console.log(practice.title)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PracticeArea extends S.Class<PracticeArea>($I`PracticeArea`)(
  {
    body: S.String,
    id: S.String,
    title: S.String,
  },
  $I.annote("PracticeArea", {
    description: "Practice-area summary for the OPIP home page.",
  })
) {}

/**
 * Selected matter summary.
 *
 * @example
 * ```ts
 * import { ExternalLink, MatterItem, ReviewGate, SiteAsset } from "@beep/opip-web/content"
 *
 * const matter = new MatterItem({
 *   body: "Representative public matter.",
 *   caption: "Litigation",
 *   eyebrow: "1999",
 *   figure: new SiteAsset({ alt: "Patent drawing", src: "/opip/patent.png" }),
 *   id: "matter",
 *   review: new ReviewGate({ note: "Approved.", status: "approved" }),
 *   source: new ExternalLink({ href: "https://example.com", label: "Read" }),
 *   title: "Matter"
 * })
 *
 * console.log(matter.title)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MatterItem extends S.Class<MatterItem>($I`MatterItem`)(
  {
    body: S.String,
    caption: S.String,
    citation: S.optionalKey(S.String),
    eyebrow: S.String,
    figure: SiteAsset,
    id: S.String,
    review: ReviewGate,
    source: ExternalLink,
    title: S.String,
  },
  $I.annote("MatterItem", {
    description: "Selected matter summary for the OPIP home page.",
  })
) {}

/**
 * Client logo reference.
 *
 * @example
 * ```ts
 * import { ClientLogo, ReviewGate, SiteAsset } from "@beep/opip-web/content"
 *
 * const client = new ClientLogo({
 *   aspectRatio: "4 / 1",
 *   id: "client",
 *   logo: new SiteAsset({ alt: "Client", src: "/opip/client.svg" }),
 *   review: new ReviewGate({ note: "Approved.", status: "approved" })
 * })
 *
 * console.log(client.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ClientLogo extends S.Class<ClientLogo>($I`ClientLogo`)(
  {
    aspectRatio: S.String,
    id: S.String,
    logo: SiteAsset,
    review: ReviewGate,
  },
  $I.annote("ClientLogo", {
    description: "Client logo reference for the OPIP home page.",
  })
) {}

/**
 * Press item summary.
 *
 * @example
 * ```ts
 * import { ExternalLink, PressItem } from "@beep/opip-web/content"
 *
 * const press = new PressItem({
 *   body: "Coverage summary.",
 *   date: "2026-05-14",
 *   dateLabel: "May 14, 2026",
 *   headline: "Patent coverage",
 *   publication: "Publication",
 *   source: new ExternalLink({ href: "https://example.com", label: "Read" })
 * })
 *
 * console.log(press.publication)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PressItem extends S.Class<PressItem>($I`PressItem`)(
  {
    body: S.String,
    date: S.String,
    dateLabel: S.String,
    headline: S.String,
    publication: S.String,
    source: ExternalLink,
  },
  $I.annote("PressItem", {
    description: "Press item summary for the OPIP home page.",
  })
) {}

/**
 * Public contact and legal notice content.
 *
 * @example
 * ```ts
 * import { ContactContent, ReviewGate } from "@beep/opip-web/content"
 *
 * const contact = new ContactContent({
 *   email: "hello@example.com",
 *   lede: "Reach out.",
 *   notice: ["No attorney-client relationship is formed by this website."],
 *   review: new ReviewGate({ note: "Approved.", status: "approved" }),
 *   title: "Contact"
 * })
 *
 * console.log(contact.email)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContactContent extends S.Class<ContactContent>($I`ContactContent`)(
  {
    email: S.String,
    lede: S.String,
    notice: S.Array(S.String),
    review: ReviewGate,
    title: S.String,
  },
  $I.annote("ContactContent", {
    description: "Public contact and legal notice content for the OPIP home page.",
  })
) {}

/**
 * Complete content contract for the OPIP public site.
 *
 * @example
 * ```ts
 * import { OpipSiteContent, opipSiteContent } from "@beep/opip-web/content"
 *
 * const content = new OpipSiteContent(opipSiteContent)
 * console.log(content.metadata.siteName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipSiteContent extends S.Class<OpipSiteContent>($I`OpipSiteContent`)(
  {
    about: S.Array(AboutPanel),
    clients: S.Array(ClientLogo),
    contact: ContactContent,
    hero: HeroContent,
    matters: S.Array(MatterItem),
    metadata: SiteMetadataContent,
    nav: S.Array(NavItem),
    practices: S.Array(PracticeArea),
    press: S.Array(PressItem),
  },
  $I.annote("OpipSiteContent", {
    description: "Complete content contract for the OPIP public site.",
  })
) {}

/**
 * Decodes unknown input into {@link OpipSiteContent}.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { decodeOpipSiteContentResult, opipSiteContent } from "@beep/opip-web/content"
 *
 * const result = decodeOpipSiteContentResult(opipSiteContent)
 * console.log(Result.isSuccess(result))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const decodeOpipSiteContentResult = S.decodeUnknownResult(OpipSiteContent);

/**
 * Decodes unknown input into {@link OpipSiteContent} in an Effect workflow.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeOpipSiteContent, opipSiteContent } from "@beep/opip-web/content"
 *
 * const program = decodeOpipSiteContent(opipSiteContent)
 * Effect.runPromise(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const decodeOpipSiteContent = S.decodeUnknownEffect(OpipSiteContent);
