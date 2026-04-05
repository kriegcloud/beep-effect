import { resolveThemeMode, ThemeMode } from "@beep/ui/themes";
import { describe, expect, it } from "vitest";

describe("@beep/ui themes", () => {
  describe("resolveThemeMode", () => {
    it("preserves explicit light and dark modes", () => {
      expect(resolveThemeMode(ThemeMode.Enum.dark, ThemeMode.Enum.light)).toBe(ThemeMode.Enum.dark);
      expect(resolveThemeMode(ThemeMode.Enum.light, ThemeMode.Enum.dark)).toBe(ThemeMode.Enum.light);
    });

    it("resolves system mode from the detected system preference", () => {
      expect(resolveThemeMode(ThemeMode.Enum.system, ThemeMode.Enum.dark)).toBe(ThemeMode.Enum.dark);
      expect(resolveThemeMode(ThemeMode.Enum.system, ThemeMode.Enum.light)).toBe(ThemeMode.Enum.light);
    });
  });
});
