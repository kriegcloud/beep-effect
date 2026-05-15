/**
 * Hero visual media for the OPIP home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import Image from "next/image";

/**
 * Optimized decorative hero poster.
 *
 * @example
 * ```tsx
 * import { HeroVideo } from "@beep/opip-web/components/HeroVideo"
 *
 * const hero = <HeroVideo poster="/opip/hero.jpg" src="/opip/hero.mp4" />
 * console.log(hero.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function HeroVideo({ poster }: { readonly poster: string; readonly src: string }) {
  return (
    <Image
      src={poster}
      alt=""
      fill
      quality={50}
      sizes="(min-width: 1024px) 46vw, 100vw"
      className="absolute inset-0 size-full object-cover opacity-70"
      aria-hidden="true"
    />
  );
}
