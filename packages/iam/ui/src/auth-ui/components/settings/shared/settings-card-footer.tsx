"use client";

import { CardDescription, CardFooter } from "@beep/ui/components/card";
import { Skeleton } from "@beep/ui/components/skeleton";
import { cn } from "@beep/ui-core/utils";
import type { ReactNode } from "react";
import { SettingsActionButton } from "./settings-action-button";
import type { SettingsCardClassNames } from "./settings-card-types";

export interface SettingsCardFooterProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  actionLabel?: ReactNode;
  disabled?: boolean;
  instructions?: ReactNode;
  isPending?: boolean;
  isSubmitting?: boolean;
  optimistic?: boolean;
  variant?: "default" | "destructive";
  action?: () => Promise<unknown> | unknown;
}

export function SettingsCardFooter({
  className,
  classNames,
  actionLabel,
  disabled,
  instructions,
  isPending,
  isSubmitting,
  variant,
  action,
}: SettingsCardFooterProps) {
  return (
    <CardFooter
      className={cn(
        "flex flex-col justify-between gap-4 rounded-b-xl md:flex-row",
        (actionLabel || instructions) && "!py-4 border-t",
        variant === "destructive" ? "border-destructive/30 bg-destructive/15" : "bg-sidebar",
        className,
        classNames?.footer
      )}
    >
      {isPending ? (
        <>
          {instructions && (
            <Skeleton className={cn("my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56", classNames?.skeleton)} />
          )}

          {actionLabel && <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />}
        </>
      ) : (
        <>
          {instructions && (
            <CardDescription
              className={cn(
                "text-center text-muted-foreground text-xs md:text-start md:text-sm",
                classNames?.instructions
              )}
            >
              {instructions}
            </CardDescription>
          )}

          {actionLabel && (
            <SettingsActionButton
              classNames={classNames}
              actionLabel={actionLabel}
              disabled={disabled}
              isSubmitting={isSubmitting}
              variant={variant}
              onClick={action}
            />
          )}
        </>
      )}
    </CardFooter>
  );
}
