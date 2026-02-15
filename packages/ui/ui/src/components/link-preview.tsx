"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { cn } from "@beep/ui-core/utils";
import { ArrowSquareOutIcon, InfoIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface UrlMetadata {
  readonly title: null | string;
  readonly description: null | string;
  readonly favicon: null | string;
  readonly websiteName: null | string;
  readonly websiteImage: null | string;
  readonly url: string;
}

interface LinkPreviewProps {
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: undefined | string;
  readonly metadata?: undefined |  null | Partial<UrlMetadata>;
}

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const extractMetaTag = (html: string, name: string): null | string => {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

const toHostname = (value: string): null | string => {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

const canFetchMetadata = (href: string): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const target = new URL(href, window.location.href);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
};

const getFallbackMetadata = (href: string): UrlMetadata => {
  let origin = href;

  try {
    origin = new URL(href).origin;
  } catch {
    // fallback keeps href as-is
  }

  return {
    title: null,
    description: null,
    favicon: `${origin.replace(/\/$/, "")}/favicon.ico`,
    websiteName: toHostname(href),
    websiteImage: null,
    url: href,
  };
};

export function LinkPreview({ href, children, className, metadata }: LinkPreviewProps) {
  const elementRef = useRef<HTMLAnchorElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [validFavicon, setValidFavicon] = useState(true);
  const [validImage, setValidImage] = useState(true);
  const [fetchedMetadata, setFetchedMetadata] = useState<null | UrlMetadata>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const isValidUrl = href.length > 0 && isValidHttpUrl(href) && !isEmail(href) && !href.startsWith("mailto:");

  const shouldFetch = isValidUrl && canFetchMetadata(href);

  useEffect(() => {
    if (!isInView || !shouldFetch || fetchedMetadata) {
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(href, { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to fetch link metadata");
        }

        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const parsed = new URL(href);

        setFetchedMetadata({
          title: extractMetaTag(html, "og:title") ?? extractMetaTag(html, "twitter:title") ?? titleMatch?.[1] ?? null,
          description:
            extractMetaTag(html, "og:description") ??
            extractMetaTag(html, "twitter:description") ??
            extractMetaTag(html, "description") ??
            null,
          websiteImage: extractMetaTag(html, "og:image") ?? extractMetaTag(html, "twitter:image") ?? null,
          favicon:
            extractMetaTag(html, "icon") ?? extractMetaTag(html, "shortcut icon") ?? `${parsed.origin}/favicon.ico`,
          websiteName: extractMetaTag(html, "og:site_name") ?? parsed.hostname,
          url: href,
        });
      } catch {
        setError("Preview unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [fetchedMetadata, href, isInView, shouldFetch]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || href.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [href]);

  const resolvedMetadata = useMemo(() => {
    const base = fetchedMetadata ?? getFallbackMetadata(href);
    return {
      ...base,
      ...(metadata ?? {}),
    };
  }, [fetchedMetadata, href, metadata]);

  if (!href) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <a
          ref={elementRef}
          href={href}
          className={cn(
            "cursor-pointer rounded-sm bg-primary/20 px-1 text-sm font-medium text-primary transition-all hover:text-white hover:underline",
            className
          )}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      </TooltipTrigger>

      <TooltipContent className="max-w-[280px] border border-zinc-700 bg-zinc-900 p-3 text-white shadow-lg">
        {isLoading ? (
          <div className="flex justify-center p-5">
            <div className="size-5 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        ) : error || !isValidUrl ? (
          <div className="flex items-center gap-2 p-3 text-red-400">
            <InfoIcon size={16} weight="fill" />
            <span className="text-sm">{!isValidUrl ? "Invalid URL" : (error ?? "Failed to load preview")}</span>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            {resolvedMetadata.websiteImage && validImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  alt="Website preview"
                  className="h-full w-full rounded-lg object-cover"
                  src={resolvedMetadata.websiteImage}
                  onError={() => setValidImage(false)}
                />
              </div>
            )}

            {(resolvedMetadata.websiteName || (resolvedMetadata.favicon && validFavicon)) && (
              <div className="flex items-center gap-2">
                {resolvedMetadata.favicon && validFavicon ? (
                  <img
                    width={20}
                    height={20}
                    alt="Favicon"
                    className="size-5 rounded-full"
                    src={resolvedMetadata.favicon}
                    onError={() => setValidFavicon(false)}
                  />
                ) : (
                  <ArrowSquareOutIcon size={18} className="text-zinc-400" />
                )}

                {resolvedMetadata.websiteName && (
                  <div className="truncate text-sm font-semibold">{resolvedMetadata.websiteName}</div>
                )}
              </div>
            )}

            {resolvedMetadata.title && (
              <div className="truncate text-sm font-medium text-white">{resolvedMetadata.title}</div>
            )}

            {resolvedMetadata.description && (
              <div className="line-clamp-3 w-full text-xs text-gray-400">{resolvedMetadata.description}</div>
            )}

            <div className="truncate text-xs text-primary">{href.replace("https://", "").replace("http://", "")}</div>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
