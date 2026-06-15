/**
 * YouTube iframe embed used by editor and streaming chat surfaces.
 *
 * @packageDocumentation \@beep/editor/youtube-embed
 * @since 0.0.0
 */
"use client";

import type { JSX } from "react";

const youtubeEmbedUrl = (videoID: string): string => `https://www.youtube-nocookie.com/embed/${videoID}`;

/**
 * Renders a privacy-enhanced YouTube iframe from a bare video id.
 *
 * @example
 * ```tsx
 * import { YouTubeEmbed } from "@beep/editor/youtube-embed"
 *
 * console.log(YouTubeEmbed.name) // "YouTubeEmbed"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function YouTubeEmbed({ videoID }: { readonly videoID: string }): JSX.Element {
  return (
    <div className="my-3 aspect-video w-full overflow-hidden rounded border bg-muted">
      <iframe
        className="h-full w-full"
        title="YouTube video"
        src={youtubeEmbedUrl(videoID)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
