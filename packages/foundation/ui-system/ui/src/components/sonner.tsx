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
          "--success-bg": "#ecfdf3",
          "--success-text": "#047857",
          "--error-bg": "#fff0f0",
          "--error-text": "#b91c1c",
          "--warning-bg": "#fffcf0",
          "--warning-text": "#b45309",
          "--info-bg": "#f0f8ff",
          "--info-text": "#0369a1",
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
