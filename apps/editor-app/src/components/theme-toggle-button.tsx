/**
 * Theme mode toggle button for the editor app.
 *
 * @module
 * @since 0.0.0
 */
"use client";

import { Button } from "@beep/ui/components/button";
import { useThemeMode } from "@beep/ui/themes";

/**
 * Render the editor app theme mode toggle.
 *
 * @example
 * ```tsx
 * import { ThemeToggleButton } from "@beep/editor-app/components/theme-toggle-button"
 *
 * const Toolbar = () => <ThemeToggleButton />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ThemeToggleButton() {
  const { resolvedMode, toggleMode } = useThemeMode();
  const nextMode = resolvedMode === "dark" ? "light" : "dark";

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
      onClick={toggleMode}
    >
      {nextMode === "dark" ? "Use dark mode" : "Use light mode"}
    </Button>
  );
}
