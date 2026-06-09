/**
 * Hero visual media for the OIP home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import { useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { Atom } from "effect/unstable/reactivity";
import Image from "next/image";

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

type HeroVideoState = {
  readonly element: HTMLVideoElement | null;
  readonly playing: boolean;
};

const emptyHeroVideoState: HeroVideoState = {
  element: null,
  playing: false,
};

const heroVideoKey = (poster: string, mp4: string, webm: string | undefined): string =>
  `${poster}::${mp4}::${webm ?? ""}`;

const heroVideoStateAtom = Atom.family((_key: string) => Atom.make<HeroVideoState>(emptyHeroVideoState));

const heroVideoElementAtom = Atom.family((key: string) =>
  Atom.writable(
    (get) => get(heroVideoStateAtom(key)).element,
    (ctx, element: HTMLVideoElement | null) => {
      const state = ctx.get(heroVideoStateAtom(key));
      ctx.set(heroVideoStateAtom(key), {
        element,
        playing: element === null ? false : state.playing,
      });
    }
  )
);

const heroVideoPlayingAtom = Atom.family((key: string) =>
  Atom.writable(
    (get) => get(heroVideoStateAtom(key)).playing,
    (ctx, playing: boolean) => {
      const state = ctx.get(heroVideoStateAtom(key));
      ctx.set(heroVideoStateAtom(key), { ...state, playing });
    }
  )
);

const shouldSkipHeroVideo = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true) {
    return true;
  }

  const connection = (window.navigator as SaveDataNavigator).connection;

  return (
    connection?.saveData === true ||
    (P.isString(connection?.effectiveType) && Str.includes("2g")(connection.effectiveType))
  );
};

const scheduleHeroVideoStart = (video: HTMLVideoElement): (() => void) => {
  const start = () => {
    video.load();
    void video.play().catch(() => undefined);
  };

  if (P.isFunction(window.requestIdleCallback)) {
    const idleHandle = window.requestIdleCallback(start, { timeout: 2000 });
    return () => window.cancelIdleCallback?.(idleHandle);
  }

  const timer = window.setTimeout(start, 200);
  return () => window.clearTimeout(timer);
};

const heroVideoAutoplayAtom = Atom.family((key: string) =>
  Atom.make((get) => {
    let cancelScheduledStart: (() => void) | undefined;

    const scheduleStart = (video: HTMLVideoElement | null) => {
      cancelScheduledStart?.();
      cancelScheduledStart = undefined;

      if (video === null || shouldSkipHeroVideo()) {
        return;
      }

      cancelScheduledStart = scheduleHeroVideoStart(video);
    };

    get.subscribe(heroVideoElementAtom(key), scheduleStart, { immediate: true });
    get.addFinalizer(() => cancelScheduledStart?.());
  })
);

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
  const key = heroVideoKey(poster, mp4, webm);
  const playing = useAtomValue(heroVideoPlayingAtom(key));
  const setPlaying = useAtomSet(heroVideoPlayingAtom(key));
  const setVideoElement = useAtomSet(heroVideoElementAtom(key));
  useAtomMount(heroVideoAutoplayAtom(key));

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
        ref={setVideoElement}
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
