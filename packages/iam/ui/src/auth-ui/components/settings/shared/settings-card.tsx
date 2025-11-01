"use client";

import { Card } from "@beep/ui/components/card";

import { cn } from "@beep/ui-core/utils";
import type { ComponentProps, ReactNode } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { SettingsCardFooter } from "./settings-card-footer";
import { SettingsCardHeader } from "./settings-card-header";
import type { SettingsCardClassNames } from "./settings-card-types";

export type { SettingsCardClassNames };

export interface SettingsCardProps extends Omit<ComponentProps<typeof Card>, "title"> {
  children?: ReactNode;
  className?: string;
  classNames?: SettingsCardClassNames;
  title?: ReactNode;
  description?: ReactNode;
  instructions?: ReactNode;
  actionLabel?: ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  isPending?: boolean;
  optimistic?: boolean;
  variant?: "default" | "destructive";
  localization?: AuthLocalization;
  action?: () => Promise<unknown> | unknown;
}

export function SettingsCard({
  children,
  className,
  classNames,
  title,
  description,
  instructions,
  actionLabel,
  disabled,
  isPending,
  isSubmitting,
  optimistic,
  variant,
  action,
  ...props
}: SettingsCardProps) {
  return (
    <Card
      className={cn(
        "w-full pb-0 text-start",
        variant === "destructive" && "border-destructive/40",
        className,
        classNames?.base
      )}
      {...props}
    >
      <SettingsCardHeader classNames={classNames} description={description} isPending={isPending} title={title} />

      {children}

      <SettingsCardFooter
        classNames={classNames}
        actionLabel={actionLabel}
        disabled={disabled}
        isPending={isPending}
        isSubmitting={isSubmitting}
        instructions={instructions}
        optimistic={optimistic}
        variant={variant}
        action={action}
      />
    </Card>
  );
}
