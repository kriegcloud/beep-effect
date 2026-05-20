/**
 * Launch content for the OIP public website.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Result } from "effect";
import { decodeOipSiteContentResult, type OipSiteContent, ReviewStatus } from "./OipContent.model.ts";

const needsReview = (note: string) => ({
  note,
  status: ReviewStatus.Enum.needs_review,
});

const approved = (note: string) => ({
  note,
  status: ReviewStatus.Enum.approved,
});

const rawOipSiteContent = {
  metadata: {
    siteUrl: "https://oip.law",
    siteName: "OIP - Oppold IP Law",
    title: "Patent counsel for the people who build the machines | Thomas J. Oppold",
    description:
      "Patent counsel for agricultural equipment and the people who build the machines. Patent prosecution, litigation, IPR, trademark, and licensing - Iowa and Minnesota Bars, USPTO registered.",
    linkedInUrl: "https://www.linkedin.com/in/thomas-oppold-b92939/",
    ogImage: "/oip/oip-og.png",
  },
  nav: [
    { href: "#about", label: "About" },
    { href: "#practice", label: "Practice" },
    { href: "#matters", label: "Matters" },
    { href: "#press", label: "Press" },
    { href: "#contact", label: "Contact" },
  ],
  hero: {
    citation: "175 F.3d 1356 (Fed. Cir. 1999) (en banc)",
    headline: "Thirty years between a planter row and an en banc panel.",
    lede: "Patent counsel for the people who build the machines.",
    primaryCta: { href: "#contact", label: "Open an engagement" },
    secondaryCta: { href: "#matters", label: "Recent matters" },
    portrait: {
      src: "/oip/hero/portrait.png",
      alt: "Thomas J. Oppold",
      width: 700,
      height: 1245,
      credit: "Portrait - Thomas J. Oppold",
    },
    video: {
      src: "/oip/hero-vid.mp4",
      alt: "",
      credit: "OIP launch media",
    },
    videoPoster: {
      src: "/oip/hero-vid-poster.jpg",
      alt: "",
      credit: "OIP launch media",
    },
  },
  about: [
    {
      id: "farm",
      kicker: "Lincoln County, SD - 1971 to present",
      title: "The farm",
      image: {
        src: "/oip/about/farm.jpg",
        alt: "A Midwest cornfield rising into a clear summer sky.",
        width: 1200,
        height: 800,
        credit: "USDA - public domain",
      },
      body: "Tom grew up on a working farm in Springdale Township, Lincoln County, South Dakota. The first thing farm machinery teaches is that agriculture becomes engineering at the moment weather meets a row unit, a broken part, and a deadline.",
    },
    {
      id: "engineering",
      kicker: "Pitt-Des Moines - 1989 to 1993",
      title: "The engineering",
      image: {
        src: "/oip/about/engineering.jpg",
        alt: "A welder working over structural steel under industrial light.",
        width: 1200,
        height: 800,
        credit: "U.S. Navy - public domain",
      },
      body: "Before law school, Tom studied agricultural engineering at SDSU and worked in structural steel fabrication. Tolerance, in the physical world, is the gap between specification and construction. Patent disputes often live in that same gap.",
    },
    {
      id: "law",
      kicker: "Iowa and Minnesota Bars - 1997 to present",
      title: "The law",
      image: {
        src: "/oip/about/tom-portrait.png",
        alt: "Portrait of Thomas J. Oppold.",
        width: 645,
        height: 505,
        credit: "Portrait - Thomas J. Oppold",
      },
      body: "Tom reads claims the way an engineer reads drawings: looking for what is load-bearing and what is decoration. A planter row, a steel detail, a claim limitation: each is a small unit of intent doing more work than it appears to.",
    },
  ],
  practices: [
    {
      id: "prosecution",
      title: "Patent Prosecution",
      body: "Drafting and shepherding US utility and design applications through the USPTO, with deep experience in agricultural equipment, electromechanical systems, row-unit electronics, and equipment-control architecture.",
    },
    {
      id: "litigation",
      title: "Patent Litigation and Appeals",
      body: "District court infringement and validity work, Federal Circuit briefing, and appellate posture built into the record from the start.",
    },
    {
      id: "ipr",
      title: "IPR and Reexamination",
      body: "PTAB inter partes review and ex parte reexamination for petitioners and patent owners, especially in mechanical and agricultural technology centers.",
    },
    {
      id: "trademark",
      title: "Trademark and Trade Dress",
      body: "Clearance, prosecution, opposition, and trade-dress strategy for marks and product identity that need to survive field use as well as registration.",
    },
    {
      id: "licensing",
      title: "Licensing and Tech Transfer",
      body: "License drafting and negotiation around field-of-use, sublicensing, royalty stacking, patented hardware, and technology transfer between OEMs and integrators.",
    },
  ],
  matters: [
    {
      id: "midwest-karavan",
      eyebrow: "1999 - Federal Circuit en banc",
      caption: "Appellate - trade dress",
      title: "Midwest Industries v. Karavan Trailers",
      body: "Argued the Federal Circuit appeal for Midwest Industries. The en banc court confirmed that Federal Circuit law governs patent-preemption analysis for state-law trade-dress claims around watercraft-trailer winch-post designs.",
      citation: "175 F.3d 1356 (Fed. Cir. 1999) (en banc)",
      source: {
        href: "https://www.courtlistener.com/c/F.3d/175/1356/",
        label: "Read the opinion at CourtListener",
      },
      figure: {
        src: "/oip/matter-figs/midwest-karavan.png",
        alt: "Patent figure showing a personal watercraft trailer with arcuate winch posts.",
        width: 900,
        height: 600,
        credit: "U.S. Patent 5,518,261",
      },
      review: needsReview("Public docket citation exists; final matter framing needs Tom review before launch."),
    },
    {
      id: "gramm-deere",
      eyebrow: "2014 to 2026 - district court, PTAB, Federal Circuit",
      caption: "Litigation - PTAB - appellate",
      title: "Gramm / Headsight v. Deere and Company",
      body: "A long-running patent dispute involving combine header-height control, with work spanning trial, inter partes review, retrial, and Federal Circuit appeal.",
      citation: "N.D. Ind. 3:14-cv-00575 - S.D. Iowa 3:22-cv-00010 - CAFC 24-1598",
      source: {
        href: "https://www.courtlistener.com/?type=r&q=%22Headsight%22+%22Deere%22+%22header+height%22",
        label: "View the dockets at CourtListener",
      },
      figure: {
        src: "/oip/matter-figs/gramm-deere.png",
        alt: "Patent figure showing combine harvester header-height control modules.",
        width: 900,
        height: 600,
        credit: "U.S. Patent 6,202,395",
      },
      review: needsReview("Public docket citation exists; final matter framing needs Tom review before launch."),
    },
    {
      id: "precision-planting",
      eyebrow: "1999 to present - USPTO",
      caption: "Prosecution portfolio",
      title: "Precision Planting prosecution portfolio",
      body: "Long-running prosecution work around planting equipment, seed metering, downforce control, trench closers, and row-unit control architecture.",
      source: {
        href: "https://patents.google.com/?assignee=Precision+Planting",
        label: "Browse the assignee portfolio at Google Patents",
      },
      figure: {
        src: "/oip/matter-figs/precision-planting.png",
        alt: "Patent figure showing an air-seeder row-unit assembly.",
        width: 900,
        height: 600,
        credit: "U.S. Patent 10,925,203",
      },
      review: needsReview("Client relationship and attorney-of-record framing require confirmation before launch."),
    },
  ],
  clients: [
    {
      id: "precision-planting",
      aspectRatio: "660/128",
      logo: { src: "/oip/clients/precision-planting.svg", alt: "Precision Planting", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "headsight",
      aspectRatio: "258/86",
      logo: { src: "/oip/clients/headsight.png", alt: "Headsight", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "genesis-attachments",
      aspectRatio: "242/52",
      logo: { src: "/oip/clients/genesis-attachments.svg", alt: "Genesis Attachments", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "superior-industries",
      aspectRatio: "200/71",
      logo: { src: "/oip/clients/superior-industries.svg", alt: "Superior Industries", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "skyline-displays",
      aspectRatio: "5000/2140",
      logo: { src: "/oip/clients/skyline-displays.png", alt: "Skyline Displays", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "par-aide",
      aspectRatio: "200/209",
      logo: { src: "/oip/clients/par-aide.png", alt: "Par Aide", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "cray",
      aspectRatio: "513/60",
      logo: { src: "/oip/clients/cray.svg", alt: "Cray", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "kingdom-ag-concepts",
      aspectRatio: "176/62",
      logo: { src: "/oip/clients/kingdom-ag-concepts.png", alt: "Kingdom Ag Concepts", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "eastpoint-sports",
      aspectRatio: "508/144",
      logo: { src: "/oip/clients/eastpoint-sports.png", alt: "EastPoint Sports", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
    {
      id: "bioenergy-life",
      aspectRatio: "300/124",
      logo: { src: "/oip/clients/bioenergy-life.png", alt: "Bioenergy Life Science", credit: "Client mark" },
      review: needsReview("Confirm permission or publication comfort before launch."),
    },
  ],
  press: [
    {
      date: "2015-09-05",
      dateLabel: "September 5, 2015",
      publication: "Twin Cities Business",
      headline: "A Sea Change in Patent Law",
      body: "Quoted on the America Invents Act's effects on small inventors, PTAB inter partes review, and trade-secret strategy after Alice.",
      source: {
        href: "https://tcbmag.com/a-sea-change-in-patent-law/",
        label: "Read at Twin Cities Business",
      },
    },
    {
      date: "2014-12-15",
      dateLabel: "December 15, 2014",
      publication: "Minnesota Lawyer",
      headline: "Larkin Hoffman firm profile",
      body: "Identified as Chair of the firm's Intellectual Property and Technology Practice Group.",
      source: {
        href: "https://minnlawyer.com/2014/12/15/larkin-hoffman/",
        label: "Read at Minnesota Lawyer",
      },
    },
    {
      date: "2018-12-10",
      dateLabel: "December 10, 2018",
      publication: "REJournals",
      headline: "Larkin Hoffman adds to board of directors",
      body: "Reporting on election to the firm's Board of Directors.",
      source: {
        href: "https://rejournals.com/minneapolis-larkin-hoffman-adds-to-board-of-directors/",
        label: "Read at REJournals",
      },
    },
  ],
  contact: {
    email: "toppold@oip.law",
    title: "Open an engagement.",
    lede: "New matters by direct introduction. A line about the technology, the posture, and any conflicts you can name is the right opening.",
    notice: [
      "Thomas J. Oppold is licensed to practice law in Iowa and Minnesota and registered to practice before the United States Patent and Trademark Office.",
      "Information on this site is for general informational purposes only and is not legal advice.",
      "Sending an email does not create an attorney-client relationship; an engagement begins only on countersignature of a written engagement letter following a conflicts check.",
      "Past results do not guarantee future outcomes.",
    ],
    review: needsReview("Confirm contact email, jurisdictions, and notice text before launch."),
  },
} satisfies typeof OipSiteContent.Encoded;

/**
 * Decoded OIP launch content.
 *
 * @example
 * ```ts
 * import { oipSiteContent } from "@beep/oip-web/content"
 *
 * console.log(oipSiteContent.metadata.siteName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const oipSiteContent = Result.getOrThrow(decodeOipSiteContentResult(rawOipSiteContent));

/**
 * Review gate statuses that must be closed before public launch.
 *
 * @example
 * ```ts
 * import { launchReviewGates } from "@beep/oip-web/content"
 *
 * console.log(launchReviewGates.contact.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const launchReviewGates = {
  clientLogos: needsReview("Every client mark needs permission or publication comfort before launch."),
  contact: oipSiteContent.contact.review,
  matters: needsReview("Named matters need final public framing review before launch."),
  metadata: approved("SEO and JSON-LD content mirrors the launch draft and is safe to validate technically."),
} as const;
