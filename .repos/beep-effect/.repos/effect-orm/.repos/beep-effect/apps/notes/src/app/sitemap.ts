import { siteConfig } from "@beep/notes/config";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
      url: siteConfig.url,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${siteConfig.url}login`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
      url: `${siteConfig.url}signup`,
    },
    {
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 0.8,
      url: `${siteConfig.url}pricing`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.2,
      url: `${siteConfig.url}privacy`,
    },
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.2,
      url: `${siteConfig.url}terms`,
    },
  ];
}
