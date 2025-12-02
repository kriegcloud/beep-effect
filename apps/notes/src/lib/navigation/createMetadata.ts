import { siteConfig } from "@beep/notes/config";
import { routes } from "@beep/notes/lib/navigation/routes";
import { images } from "@beep/notes/lib/storage/images";
import { merge } from "@beep/utils/data/record.utils";
import type { Metadata } from "next";

type MetadataGenerator = {
  readonly description?: undefined | string;
  readonly generateImage?: undefined | boolean;
  readonly image?: undefined | string;
  readonly path?: undefined | string;
  readonly title?: undefined | string;
  readonly titlePrefix?: undefined | string;
} & Omit<Metadata, "description" | "title">;

export const createMetadata = ({
  description = siteConfig.description,
  generateImage,
  image = images.og,
  path,
  title = siteConfig.name,
  titlePrefix = ` | ${siteConfig.name}`,
  ...props
}: MetadataGenerator): Metadata => {
  const parsedTitle = title === siteConfig.name ? title : title + titlePrefix;

  const defaultMetadata = {
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: parsedTitle,
    },
    applicationName: siteConfig.name,
    authors: [siteConfig.author],
    creator: siteConfig.author.name,
    description,
    formatDetection: {
      telephone: false,
    },
    icons: {
      apple: "/apple-touch-icon.png",
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
    },
    keywords: siteConfig.keywords,
    manifest: "/site.webmanifest",
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      description,
      locale: "en_US",
      // siteName: siteConfig.name,
      title: parsedTitle,
      type: "website",
      url: new URL(path ?? routes.home(), siteConfig.url).toString(),
    },
    publisher: siteConfig.publisher,
    // themeColor: [
    //   { media: '(prefers-color-scheme: light)', color: 'white' },
    //   { media: '(prefers-color-scheme: dark)', color: 'black' },
    robots: {
      follow: true,
      googleBot: {
        follow: false,
        index: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
        noimageindex: true,
      },
      index: true,
      nocache: true,
    },
    title: parsedTitle,
    twitter: {
      card: "summary_large_image",
      creator: siteConfig.links.x,
      description,
      title: parsedTitle,
    },
  } satisfies Metadata;

  const metadata = merge(defaultMetadata, props);

  if (!generateImage && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
    metadata.twitter.images = [
      {
        alt: title,
        height: 630,
        url: image,
        width: 1200,
      },
    ];
  }

  return metadata;
};
