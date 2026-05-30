"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { Str } from "@beep/utils";
import { ArrowSquareOutIcon, InfoIcon } from "@phosphor-icons/react";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, sanitizeAnchorHref } from "../lib/index.ts";
import type { ReactNode } from "react";

interface UrlMetadata {
  readonly description: null | string;
  readonly favicon: null | string;
  readonly title: null | string;
  readonly url: string;
  readonly websiteImage: null | string;
  readonly websiteName: null | string;
}

interface LinkPreviewProps {
  readonly children: ReactNode;
  readonly className?: undefined | string;
  readonly href: string;
  readonly metadata?: undefined | null | Partial<UrlMetadata>;
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
    const match = O.getOrUndefined(Str.match(pattern)(html));
    const matchValue = match?.[1];
    if (hasText(matchValue)) {
      return matchValue;
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
  const runtimeWindow = globalThis.window;

  if (P.isUndefined(runtimeWindow)) {
    return false;
  }

  try {
    const target = new URL(href, runtimeWindow.location.href);
    return target.origin === runtimeWindow.location.origin;
  } catch {
    return false;
  }
};

const hasText = (value: null | string | undefined): value is string => P.isString(value) && value.length > 0;

const fetchMetadataHtml = (href: string): Effect.Effect<O.Option<string>> =>
  Effect.tryPromise({
    try: () => window.fetch(href).then((response) => (response.ok ? response.text().then(O.some) : O.none<string>())),
    catch: () => undefined,
  }).pipe(Effect.orElseSucceed(O.none<string>));

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
    favicon: `${Str.replace(/\/$/, "")(origin)}/favicon.ico`,
    websiteName: toHostname(href),
    websiteImage: null,
    url: href,
  };
};

/**
 * Link preview component.
 *
 * @example
 * ```tsx
 * import { LinkPreview } from "@beep/ui/components/link-preview"
 *
 * console.log(LinkPreview)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function LinkPreview({ href, children, className, metadata }: LinkPreviewProps) {
  const elementRef = useRef<HTMLAnchorElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [validFavicon, setValidFavicon] = useState(true);
  const [validImage, setValidImage] = useState(true);
  const [fetchedMetadata, setFetchedMetadata] = useState<null | UrlMetadata>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const safeHref = sanitizeAnchorHref(href);

  const isValidUrl = href.length > 0 && isValidHttpUrl(href) && !isEmail(href) && !Str.startsWith(href, "mailto:");

  const shouldFetch = isValidUrl && canFetchMetadata(href);

  useEffect(() => {
    if (!isInView || !shouldFetch || fetchedMetadata !== null) {
      return;
    }

    let disposed = false;
    setIsLoading(true);
    setError(null);

    void Effect.runPromise(fetchMetadataHtml(href)).then((htmlOption) => {
      if (disposed) {
        return;
      }

      if (O.isNone(htmlOption)) {
        setError("Preview unavailable");
        setIsLoading(false);
        return;
      }

      const html = htmlOption.value;
      const titleMatch = O.getOrUndefined(Str.match(/<title[^>]*>([^<]+)<\/title>/i)(html));
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
      setIsLoading(false);
    });

    return () => {
      disposed = true;
    };
  }, [fetchedMetadata, href, isInView, shouldFetch]);

  useEffect(() => {
    const element = elementRef.current;
    if (element === null || href.length === 0) {
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

    return () => void observer.unobserve(element);
  }, [href]);

  const resolvedMetadata = useMemo(() => {
    const base = fetchedMetadata ?? getFallbackMetadata(href);
    return {
      ...base,
      ...metadata,
    };
  }, [fetchedMetadata, href, metadata]);

  const errorMessage = !isValidUrl ? "Invalid URL" : (error ?? "Failed to load preview");
  const favicon = validFavicon && hasText(resolvedMetadata.favicon) ? resolvedMetadata.favicon : undefined;
  const websiteImage = validImage && hasText(resolvedMetadata.websiteImage) ? resolvedMetadata.websiteImage : undefined;
  const websiteName = hasText(resolvedMetadata.websiteName) ? resolvedMetadata.websiteName : undefined;
  const title = hasText(resolvedMetadata.title) ? resolvedMetadata.title : undefined;
  const description = hasText(resolvedMetadata.description) ? resolvedMetadata.description : undefined;
  const hasSiteMeta = websiteName !== undefined || favicon !== undefined;

  if (href.length === 0) {
    return null;
  }

  let tooltipContent: ReactNode = (
    <div className="flex w-full flex-col gap-2">
      {websiteImage !== undefined && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            alt="Website preview"
            className="h-full w-full rounded-lg object-cover"
            src={websiteImage}
            onError={() => setValidImage(false)}
          />
        </div>
      )}

      {hasSiteMeta && (
        <div className="flex items-center gap-2">
          {favicon !== undefined ? (
            <img
              width={20}
              height={20}
              alt="Favicon"
              className="size-5 rounded-full"
              src={favicon}
              onError={() => setValidFavicon(false)}
            />
          ) : (
            <ArrowSquareOutIcon size={18} className="text-muted-foreground" />
          )}

          {websiteName !== undefined && <div className="truncate text-sm font-semibold">{websiteName}</div>}
        </div>
      )}

      {title !== undefined && <div className="truncate text-sm font-medium text-foreground">{title}</div>}

      {description !== undefined && (
        <div className="line-clamp-3 w-full text-xs text-muted-foreground">{description}</div>
      )}

      <div className="truncate text-xs text-primary">{pipe(href, Str.replace(/^https?:\/\//, ""))}</div>
    </div>
  );

  if (isLoading) {
    tooltipContent = (
      <div className="flex justify-center p-5">
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  } else if (error !== null || !isValidUrl) {
    tooltipContent = (
      <div className="flex items-center gap-2 p-3 text-destructive">
        <InfoIcon size={16} weight="fill" />
        <span className="text-sm">{errorMessage}</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            ref={elementRef}
            href={safeHref}
            className={cn(
              "cursor-pointer rounded-sm bg-primary/20 px-1 text-sm font-medium text-primary transition-all hover:text-white hover:underline",
              className
            )}
            rel="noopener noreferrer"
            target="_blank"
          >
            {children}
          </a>
        }
      />

      <TooltipContent className="max-w-[280px] border border-border bg-popover p-3 text-popover-foreground shadow-lg">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
}
