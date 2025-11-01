"use client";

import { Button } from "@beep/ui/components/button";
import { cn } from "@beep/ui-core/utils";
// import { useFormState } from "react-hook-form"
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { SettingsCardClassNames } from "./settings-card-types";

interface SettingsActionButtonProps extends ComponentProps<typeof Button> {
  classNames?: SettingsCardClassNames;
  actionLabel: ReactNode;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export function SettingsActionButton({
  classNames,
  actionLabel,
  disabled,
  isSubmitting,
  variant,
  onClick,
  ...props
}: SettingsActionButtonProps) {
  if (!onClick) {
    const { state } = useForm();
    isSubmitting = state.isSubmitting;
  }

  return (
    <Button
      className={cn(
        "md:ms-auto",
        classNames?.button,
        variant === "default" && classNames?.primaryButton,
        variant === "destructive" && classNames?.destructiveButton
      )}
      disabled={isSubmitting || disabled}
      size="sm"
      type={onClick ? "button" : "submit"}
      variant={variant}
      onClick={onClick}
      {...props}
    >
      {isSubmitting && <Loader2 className="animate-spin" />}
      {actionLabel}
    </Button>
  );
}
