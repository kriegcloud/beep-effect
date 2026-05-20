/**
 * Hero visual media for the OIP home page.
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
 * import { HeroVideo } from "@beep/oip-web/components/HeroVideo"
 *
 * const hero = <HeroVideo poster="/oip/hero.jpg" />
 * console.log(hero.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function HeroVideo({ poster }: { readonly poster: string }) {
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
