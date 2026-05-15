/**
 * OPIP light and dark mode toggle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Static OPIP light/dark theme toggle. The root layout attaches the tiny
 * behavior script so the page does not need React hydration for theme switching.
 *
 * @example
 * ```tsx
 * import { ThemeModeToggle } from "@beep/opip-web/components/ThemeModeToggle"
 *
 * const toggle = <ThemeModeToggle />
 * console.log(toggle.type)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ThemeModeToggle() {
  return (
    <button
      aria-label="Switch to dark mode"
      aria-pressed="false"
      className="group/theme inline-flex h-9 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--opip-on-soil)_24%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_72%,transparent)] px-2 text-sm font-medium text-[var(--opip-on-soil)] shadow-none transition-colors hover:bg-[color-mix(in_oklab,var(--opip-on-soil)_14%,transparent)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--opip-gold)]"
      data-opip-theme-toggle=""
      data-theme-mode="light"
      suppressHydrationWarning
      type="button"
    >
      <span
        aria-hidden
        className="relative block h-5 w-9 overflow-hidden rounded-full border border-[color-mix(in_oklab,var(--opip-on-soil)_28%,transparent)] bg-[color-mix(in_oklab,var(--opip-on-soil)_12%,transparent)]"
        suppressHydrationWarning
      >
        <span className="absolute left-0.5 top-1/2 size-4 -translate-y-1/2 rounded-full bg-[var(--opip-gold)] transition-transform group-data-[theme-mode=dark]/theme:translate-x-4" />
      </span>
    </button>
  );
}
