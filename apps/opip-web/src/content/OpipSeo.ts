/**
 * SEO, AEO, and machine-readable content helpers for OPIP.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { OpipSiteContent } from "./OpipContent.model.ts";

/**
 * Builds conservative JSON-LD graph data for the OPIP website.
 *
 * @example
 * ```ts
 * import { makeJsonLdGraph, opipSiteContent } from "@beep/opip-web/content"
 *
 * const graph = makeJsonLdGraph(opipSiteContent)
 * console.log(graph["@context"])
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeJsonLdGraph = (content: OpipSiteContent) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${content.metadata.siteUrl}/#person`,
      "@type": "Person",
      familyName: "Oppold",
      givenName: "Thomas",
      jobTitle: "Patent Attorney",
      knowsAbout: content.practices.map((practice) => practice.title),
      name: "Thomas J. Oppold",
      sameAs: [content.metadata.linkedInUrl],
      url: content.metadata.siteUrl,
    },
    {
      "@id": `${content.metadata.siteUrl}/#legal-service`,
      "@type": "LegalService",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Iowa" },
        { "@type": "AdministrativeArea", name: "Minnesota" },
        { "@type": "Country", name: "United States" },
      ],
      description: content.metadata.description,
      founder: { "@id": `${content.metadata.siteUrl}/#person` },
      name: content.metadata.siteName,
      serviceType: content.practices.map((practice) => practice.title),
      url: content.metadata.siteUrl,
    },
    {
      "@id": `${content.metadata.siteUrl}/#website`,
      "@type": "WebSite",
      description: content.metadata.description,
      inLanguage: "en-US",
      name: content.metadata.siteName,
      publisher: { "@id": `${content.metadata.siteUrl}/#legal-service` },
      url: content.metadata.siteUrl,
    },
  ],
});

/**
 * Builds `llms.txt` content from reviewed OPIP site content.
 *
 * @example
 * ```ts
 * import { makeLlmsText, opipSiteContent } from "@beep/opip-web/content"
 *
 * const text = makeLlmsText(opipSiteContent)
 * console.log(text.includes("# opip.law"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const makeLlmsText = (content: OpipSiteContent): string => {
  const practiceLines = content.practices.map((practice) => `- ${practice.title}: ${practice.body}`);
  const matterLines = content.matters.map(
    (matter) => `- [${matter.title}](${matter.source.href}): ${matter.source.label}`
  );
  const pressLines = content.press.map(
    (item) => `- [${item.headline}](${item.source.href}) (${item.publication}): ${item.source.label}`
  );
  const noticeLines = content.contact.notice.map((notice) => `- ${notice}`);

  return [
    "# opip.law",
    "",
    "> Patent counsel for the people who build the machines.",
    "",
    "## Site",
    "",
    `- Canonical URL: [${content.metadata.siteUrl}](${content.metadata.siteUrl})`,
    `- Contact: [${content.contact.email}](mailto:${content.contact.email})`,
    `- Description: ${content.metadata.description}`,
    "",
    "## Practice Areas",
    "",
    ...practiceLines,
    "",
    "## Public Matter Sources",
    "",
    ...matterLines,
    "",
    "## Press Sources",
    "",
    ...pressLines,
    "",
    "## Legal Notices",
    "",
    ...noticeLines,
    "",
    "## Review Status",
    "",
    "- Client logos, selected matters, contact details, credentials, and legal notice text remain review-gated before public launch approval.",
  ].join("\n");
};
