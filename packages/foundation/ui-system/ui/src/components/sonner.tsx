"use client";

import { CheckCircleIcon, InfoIcon, SpinnerIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type React from "react";
import type { ToasterProps } from "sonner";

/**
 * Toaster component.
 *
 * @example
 * ```tsx
 * import { Toaster } from "@beep/ui/components/sonner"
 *
 * console.log(Toaster)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "dark" | "light" | "system"}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <WarningIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // Rich-color toasts derive from the theme's semantic tokens (each carries light/dark
          // variants) so success/error/warning/info adapt with the active color scheme instead of
          // pinning light-mode hex values. Backgrounds are a subtle tint of the semantic color over
          // the popover surface; text uses the matching readable `*-text` token.
          "--success-bg": "color-mix(in oklch, var(--success) 16%, var(--popover))",
          "--success-text": "var(--success-text)",
          "--error-bg": "color-mix(in oklch, var(--destructive) 16%, var(--popover))",
          "--error-text": "var(--destructive-text)",
          "--warning-bg": "color-mix(in oklch, var(--warning) 16%, var(--popover))",
          "--warning-text": "var(--warning-text)",
          "--info-bg": "color-mix(in oklch, var(--info) 16%, var(--popover))",
          "--info-text": "var(--info-text)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          description: "text-popover-foreground!",
        },
      }}
      {...props}
    />
  );
};

/**
 * @category components
 * @since 0.0.0
 */
export { Toaster };
