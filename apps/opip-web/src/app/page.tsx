/**
 * Home route for the OPIP public website.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A, Str } from "@beep/utils";
import * as S from "effect/Schema";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { OpipHomePage } from "../components/OpipHomePage";
import { ContactSubmissionStatus } from "../contact";
import { getOpipSiteContent, makeJsonLdGraph } from "../content";

type HomeProps = {
  readonly searchParams?: Promise<Record<string, ReadonlyArray<string> | string | undefined>>;
};

const isContactSubmissionStatus = S.is(ContactSubmissionStatus);
const safeJsonScript = (value: unknown) => Str.replaceAll("<", "\\u003c")(JSON.stringify(value));

/**
 * Allows the search-param aware home route to block during the first render.
 *
 * @example
 * ```ts
 * import { unstable_instant } from "@beep/opip-web/app/page"
 *
 * console.log(unstable_instant)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const unstable_instant = false;

/**
 * Generates page metadata from runtime OPIP content.
 *
 * @example
 * ```ts
 * import { generateMetadata } from "@beep/opip-web/app/page"
 *
 * const metadata = await generateMetadata()
 * console.log(metadata.title)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function generateMetadata(): Promise<Metadata> {
  return connection()
    .then(() => getOpipSiteContent())
    .then((content) => ({
      title: content.metadata.title,
      description: content.metadata.description,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        type: "website",
        url: content.metadata.siteUrl,
        siteName: content.metadata.siteName,
        title: content.metadata.title,
        description: content.metadata.description,
        locale: "en_US",
        images: [
          {
            url: content.metadata.ogImage,
            width: 1200,
            height: 630,
            alt: "opip.law - patent counsel for the people who build the machines.",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: content.metadata.title,
        description: content.metadata.description,
        images: [content.metadata.ogImage],
      },
    }));
}

/**
 * Renders the OPIP public home page.
 *
 * @example
 * ```tsx
 * import Home from "@beep/opip-web/app/page"
 *
 * const page = await Home({})
 * console.log(page.type)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export default function Home({ searchParams }: HomeProps) {
  return connection()
    .then(() => Promise.all([searchParams, headers(), getOpipSiteContent()]))
    .then(([params, requestHeaders, content]) => {
      const nonce = requestHeaders.get("x-nonce") ?? undefined;
      const contactStatusValue = A.isArray(params?.contact) ? params.contact[0] : params?.contact;
      const contactStatus = isContactSubmissionStatus(contactStatusValue) ? contactStatusValue : undefined;

      return (
        <>
          <script
            id="opip-json-ld"
            nonce={nonce}
            suppressHydrationWarning
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated server-side and escaped before injection.
            dangerouslySetInnerHTML={{ __html: safeJsonScript(makeJsonLdGraph(content)) }}
          />
          <OpipHomePage contactStatus={contactStatus} content={content} />
        </>
      );
    });
}
