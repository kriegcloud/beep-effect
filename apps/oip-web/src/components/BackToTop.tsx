/**
 * Floating back-to-top control for the OIP public home page.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import { useCallback, useEffect, useState } from "react";

const REVEAL_OFFSET_PX = 560;

/**
 * Fixed bottom-right button that fades in once the visitor has scrolled past the
 * hero, then smooth-scrolls back to the top of the page when clicked.
 *
 * Visibility is driven by a passive scroll listener that flips local state once
 * the page has scrolled past `REVEAL_OFFSET_PX`, so the control stays hidden on
 * the first viewport. The scroll itself honours `prefers-reduced-motion`,
 * falling back to an instant jump for visitors who opt out of motion. Styling
 * mirrors the carousel chevrons: a soil-toned pill with a gold glyph that reads
 * on both the light paper and dark soil sections it floats over.
 *
 * @example
 * ```tsx
 * import { BackToTop } from "@beep/oip-web/components/BackToTop"
 *
 * const control = <BackToTop />
 * console.log(control.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > REVEAL_OFFSET_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, []);

  return (
    <button
      aria-label="Back to top"
      className={`group fixed bottom-6 right-6 z-40 inline-flex size-11 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--oip-gold)_55%,transparent)] bg-[color-mix(in_oklab,var(--oip-soil)_72%,black)] text-[var(--oip-gold)] shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:border-[var(--oip-gold)] hover:bg-[var(--oip-gold)] hover:text-[var(--oip-soil)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--oip-gold)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
      hidden={!visible}
      onClick={scrollToTop}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
