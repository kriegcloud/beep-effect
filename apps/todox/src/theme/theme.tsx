"use client";

// Re-export theme utilities from @beep/ui-core
export { baseTheme, createTheme } from "@beep/ui-core/theme/create-theme";
export { themeConfig } from "@beep/ui-core/theme";

// App-specific customizations (kept for potential future use)
export { colors } from "./colors";
export { shadows } from "./shadows";
export { typography, typographyTheme } from "./typography";
