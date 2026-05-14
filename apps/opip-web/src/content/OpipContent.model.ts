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
 * @category models
 * @since 0.0.0
 */
export type ReviewStatus = typeof ReviewStatus.Type;

/**
 * Review note attached to a public website claim.
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
 * @category decoders
 * @since 0.0.0
 */
export const decodeOpipSiteContentResult = S.decodeUnknownResult(OpipSiteContent);
