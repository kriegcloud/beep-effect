/**
 * Client-side hero video behavior for the OPIP home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import * as P from "effect/Predicate";
import { useEffect, useRef } from "react";

/**
 * Muted looping hero video that respects reduced-motion preferences.
 *
 * @category components
 * @since 0.0.0
 */
export function HeroVideo({ poster, src }: { readonly poster: string; readonly src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    const reducedMotion = P.isFunction(window.matchMedia)
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    if (reducedMotion) {
      video.pause();
      return;
    }

    if (navigator.userAgent.includes("jsdom")) return;

    const playPromise = video.play() as Promise<void> | undefined;
    if (playPromise !== undefined) {
      void playPromise.catch(() => undefined);
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 size-full object-cover opacity-70"
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
