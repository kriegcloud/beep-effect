/**
 * Schema-first content contracts for the OIP public website.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OipWebId } from "@beep/identity/packages";
import { EmailString, LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $OipWebId.create("content/OipContent.model");

/**
 * Review state for public claims that need launch approval.
 *
 * @example
 * ```ts
 * import { ReviewStatus } from "@beep/oip-web/content"
 *
 * const status = ReviewStatus.Enum.needs_review
 * console.log(status)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReviewStatus = LiteralKit(["approved", "needs_review"]).pipe(
  $I.annoteSchema("ReviewStatus", {
    description: "Review state for public OIP website claims.",
  })
);

/**
 * Runtime type for {@link ReviewStatus}.
 *
 * @example
 * ```ts
 * import type { ReviewStatus } from "@beep/oip-web/content"
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
 * import { ReviewGate } from "@beep/oip-web/content"
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
 * import { ExternalLink } from "@beep/oip-web/content"
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
    description: "External link displayed by the public OIP website.",
  })
) {}

/**
 * Social platform the OIP firm maintains a public profile on.
 *
 * @example
 * ```ts
 * import { SocialPlatform } from "@beep/oip-web/content"
 *
 * const platform = SocialPlatform.Enum.instagram
 * console.log(platform)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SocialPlatform = LiteralKit([
  "instagram",
  "x",
  "linkedin",
  "youtube",
  "threads",
  "tiktok",
  "reddit",
  "discord",
  "pinterest",
]).pipe(
  $I.annoteSchema("SocialPlatform", {
    description: "Social platform the OIP firm maintains a public profile on.",
  })
);

/**
 * Runtime type for {@link SocialPlatform}.
 *
 * @example
 * ```ts
 * import type { SocialPlatform } from "@beep/oip-web/content"
 *
 * const platform: SocialPlatform = "instagram"
 * console.log(platform)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SocialPlatform = typeof SocialPlatform.Type;

/**
 * Public social media profile link for the OIP firm.
 *
 * @example
 * ```ts
 * import { SocialLink } from "@beep/oip-web/content"
 *
 * const link = new SocialLink({
 *   href: "https://www.instagram.com/oip.law/",
 *   label: "OIP on Instagram",
 *   platform: "instagram"
 * })
 *
 * console.log(link.active)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SocialLink extends S.Class<SocialLink>($I`SocialLink`)(
  {
    href: S.String,
    label: S.String,
    platform: SocialPlatform,
    active: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
  },
  $I.annote("SocialLink", {
    description: "Public social media profile link for the OIP firm.",
  })
) {}

/**
 * Runtime asset reference served from the OIP app public folder.
 *
 * @example
 * ```ts
 * import { SiteAsset } from "@beep/oip-web/content"
 *
 * const asset = new SiteAsset({
 *   alt: "Patent drawing",
 *   src: "/oip/patent.png"
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
    height: S.optionalKey(S.Finite),
    src: S.String,
    width: S.optionalKey(S.Finite),
  },
  $I.annote("SiteAsset", {
    description: "Runtime asset reference served by the OIP website.",
  })
) {}

/**
 * Top-level metadata used by Next.js and JSON-LD generation.
 *
 * @example
 * ```ts
 * import { SiteMetadataContent } from "@beep/oip-web/content"
 *
 * const metadata = new SiteMetadataContent({
 *   description: "Patent counsel.",
 *   linkedInUrl: "https://linkedin.com/company/example",
 *   ogImage: "/oip/og.png",
 *   siteName: "OIP - Oppold IP Law",
 *   siteUrl: "https://oip.law",
 *   title: "oip.law"
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
 * import { NavItem } from "@beep/oip-web/content"
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
    description: "Anchor navigation item for the OIP home page.",
  })
) {}

/**
 * A single rotating hero background clip: a poster still plus its background video.
 *
 * @example
 * ```ts
 * import { HeroClip, SiteAsset } from "@beep/oip-web/content"
 *
 * const clip = new HeroClip({
 *   poster: new SiteAsset({ alt: "", src: "/oip/hero-vid-poster.jpg" }),
 *   video: new SiteAsset({ alt: "", src: "/oip/hero-vid.mp4" })
 * })
 *
 * console.log(clip.video.src)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// fallow-ignore-next-line unused-export
export class HeroClip extends S.Class<HeroClip>($I`HeroClip`)(
  {
    poster: SiteAsset,
    video: SiteAsset,
  },
  $I.annote("HeroClip", {
    description: "A single rotating hero background clip for the OIP home page.",
  })
) {}

/**
 * Hero opening claim and rotating background media.
 *
 * @example
 * ```ts
 * import { HeroClip, HeroContent, NavItem, SiteAsset } from "@beep/oip-web/content"
 *
 * const link = new NavItem({ href: "#contact", label: "Contact" })
 * const asset = new SiteAsset({ alt: "Hero", src: "/oip/hero.jpg" })
 * const hero = new HeroContent({
 *   headline: "Patent counsel.",
 *   lede: "For builders.",
 *   portrait: asset,
 *   primaryCta: link,
 *   secondaryCta: link,
 *   clips: [new HeroClip({ poster: asset, video: asset })]
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
    headline: S.String,
    lede: S.String,
    primaryCta: NavItem,
    secondaryCta: NavItem,
    portrait: SiteAsset,
    clips: S.NonEmptyArray(HeroClip),
  },
  $I.annote("HeroContent", {
    description: "Hero opening claim and rotating background media for the OIP home page.",
  })
) {}

/**
 * Biographical bridge panel.
 *
 * @example
 * ```ts
 * import { AboutPanel, SiteAsset } from "@beep/oip-web/content"
 *
 * const panel = new AboutPanel({
 *   body: "Trial and prosecution experience.",
 *   id: "law",
 *   image: new SiteAsset({ alt: "Portrait", src: "/oip/portrait.png" }),
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
    title: S.String,
  },
  $I.annote("AboutPanel", {
    description: "Biographical bridge panel for the OIP home page.",
  })
) {}

/**
 * Practice-area summary.
 *
 * @example
 * ```ts
 * import { PracticeArea } from "@beep/oip-web/content"
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
    description: "Practice-area summary for the OIP home page.",
  })
) {}

/**
 * Selected matter summary.
 *
 * @example
 * ```ts
 * import { ExternalLink, MatterItem, ReviewGate, SiteAsset } from "@beep/oip-web/content"
 *
 * const matter = new MatterItem({
 *   body: "Representative public matter.",
 *   caption: "Litigation",
 *   eyebrow: "1999",
 *   figure: new SiteAsset({ alt: "Patent drawing", src: "/oip/patent.png" }),
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
    description: "Selected matter summary for the OIP home page.",
  })
) {}

/**
 * Client logo reference.
 *
 * @example
 * ```ts
 * import { ClientLogo, ReviewGate, SiteAsset } from "@beep/oip-web/content"
 *
 * const client = new ClientLogo({
 *   aspectRatio: "4 / 1",
 *   id: "client",
 *   logo: new SiteAsset({ alt: "Client", src: "/oip/client.svg" }),
 *   review: new ReviewGate({ note: "Approved.", status: "approved" }),
 *   website: "https://example.com"
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
    website: S.optionalKey(S.String),
  },
  $I.annote("ClientLogo", {
    description: "Client logo reference for the OIP home page.",
  })
) {}

/**
 * Press item summary.
 *
 * @example
 * ```ts
 * import { ExternalLink, PressItem } from "@beep/oip-web/content"
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
    description: "Press item summary for the OIP home page.",
  })
) {}

/**
 * Public contact and legal notice content.
 *
 * @example
 * ```ts
 * import { ContactContent, ReviewGate } from "@beep/oip-web/content"
 *
 * const contact = new ContactContent({
 *   email: "hello@example.com",
 *   lede: "Reach out.",
 *   notice: ["No attorney-client relationship is formed by this website."],
 *   officePhone: "+16125550100",
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
    email: EmailString,
    lede: S.String,
    notice: S.Array(S.String),
    officePhone: S.NonEmptyString,
    review: ReviewGate,
    title: S.String,
  },
  $I.annote("ContactContent", {
    description: "Public contact and legal notice content for the OIP home page.",
  })
) {}

/**
 * Complete content contract for the OIP public site.
 *
 * @example
 * ```ts
 * import { OipSiteContent, oipSiteContent } from "@beep/oip-web/content"
 *
 * const content = new OipSiteContent(oipSiteContent)
 * console.log(content.metadata.siteName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipSiteContent extends S.Class<OipSiteContent>($I`OipSiteContent`)(
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
    socials: S.Array(SocialLink).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultKey(Effect.succeed([]))
    ),
  },
  $I.annote("OipSiteContent", {
    description: "Complete content contract for the OIP public site.",
  })
) {
  static readonly decodeUnknownResult = S.decodeUnknownResult(this);
  static readonly decodeUnknownEffect = S.decodeUnknownEffect(this);
}

/**
 * Decodes unknown input into {@link OipSiteContent}.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { decodeOipSiteContentResult, oipSiteContent } from "@beep/oip-web/content"
 *
 * const result = decodeOipSiteContentResult(oipSiteContent)
 * console.log(Result.isSuccess(result))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const decodeOipSiteContentResult = OipSiteContent.decodeUnknownResult;

/**
 * Decodes unknown input into {@link OipSiteContent} in an Effect workflow.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeOipSiteContent, oipSiteContent } from "@beep/oip-web/content"
 *
 * const program = decodeOipSiteContent(oipSiteContent)
 * Effect.runPromise(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const decodeOipSiteContent = OipSiteContent.decodeUnknownEffect;
