import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { ComponentProps } from "react";

type AppThemeInitScriptProps = ComponentProps<typeof InitColorSchemeScript>;

/**
 * Initializes MUI color-scheme classes before client hydration.
 *
 * @since 0.0.0
 * @category components
 */
export function AppThemeInitScript(props: AppThemeInitScriptProps) {
  return <InitColorSchemeScript {...props} />;
}
