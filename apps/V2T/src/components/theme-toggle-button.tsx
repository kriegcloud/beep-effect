"use client";

import { Button } from "@beep/ui/components/button";
import { useThemeMode } from "@beep/ui/themes";

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
