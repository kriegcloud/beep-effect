/**
 * Hero visual media for the OIP home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import * as P from "effect/Predicate";
import * as Str from "effect/String";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Optional Network Information API surface used to skip the video on
 * data-saver or very slow connections.
 */
type SaveDataNavigator = Navigator & {
  readonly connection?: {
    readonly saveData?: boolean;
    readonly effectiveType?: string;
  };
};

/**
 * Decorative hero media: an optimized poster paints immediately for LCP, then
 * a muted, looping background video is fetched after first paint and crossfades
 * in. The fetch is deferred (`preload="none"` until idle) and skipped entirely
 * for users who prefer reduced motion or are on data-saver / 2g connections.
 *
 * @example
 * ```tsx
 * import { HeroVideo } from "@beep/oip-web/components/HeroVideo"
 *
 * const hero = (
 *   <HeroVideo
 *     poster="/oip/hero-vid-poster.jpg"
 *     mp4="/oip/hero-vid.mp4"
 *     webm="/oip/hero-vid.webm"
 *   />
 * )
 * console.log(hero.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function HeroVideo({
  poster,
  mp4,
  webm,
}: {
  readonly poster: string;
  readonly mp4: string;
  readonly webm?: string | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true) return;
    const connection = (navigator as SaveDataNavigator).connection;
    if (connection?.saveData === true) return;
    if (P.isString(connection?.effectiveType) && Str.includes("2g")(connection.effectiveType)) return;

    const start = () => {
      video.load();
      void video.play().catch(() => {});
    };

    let idleHandle: number | undefined;
    let timer: number | undefined;
    if (P.isFunction(window.requestIdleCallback)) {
      idleHandle = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timer = window.setTimeout(start, 200);
    }

    return () => {
      if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        quality={50}
        sizes="(min-width: 1024px) 46vw, 100vw"
        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
          playing ? "opacity-0" : "opacity-70"
        }`}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
          playing ? "opacity-70" : "opacity-0"
        }`}
      >
        {webm === undefined ? null : <source src={webm} type="video/webm" />}
        <source src={mp4} type="video/mp4" />
      </video>
    </>
  );
}
