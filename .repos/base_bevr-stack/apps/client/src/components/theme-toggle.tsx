import { useLayoutEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const handleThemeToggle = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };
  return (
    <Card className="absolute right-4 top-4" size="sm">
      <CardContent className="gap-2 flex items-center justify-between">
        <label htmlFor="theme-toggle">Theme</label>
        <Switch
          id="theme-toggle"
          checked={isDark}
          onCheckedChange={handleThemeToggle}
        />
      </CardContent>
    </Card>
  );
};
