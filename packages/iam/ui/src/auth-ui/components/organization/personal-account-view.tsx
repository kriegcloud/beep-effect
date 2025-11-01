"use client";

import { Skeleton } from "@beep/ui/components/skeleton";
import { cn } from "@beep/ui-core/utils";
import { useContext, useMemo } from "react";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { UserAvatar } from "../user-avatar";
import type { UserViewProps } from "../user-view";

/**
 * Displays user information with avatar and details in a compact view for personal accounts
 *
 * Renders a user's profile information with appropriate fallbacks:
 * - Shows avatar alongside user name and "Personal Account" subtitle when available
 * - Shows loading skeletons when isPending is true
 * - Falls back to generic "User" text when neither name nor email is available
 * - Always shows "Personal Account" as subtitle for default and lg sizes
 * - Supports customization through classNames prop
 */
export function PersonalAccountView({
  className,
  classNames,
  isPending,
  size,
  user,
  localization: propLocalization,
}: UserViewProps) {
  const { localization: contextLocalization } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...propLocalization }),
    [contextLocalization, propLocalization]
  );

  return (
    <div className={cn("flex items-center gap-2", className, classNames?.base)}>
      <UserAvatar
        className={cn(size !== "sm" && "my-0.5")}
        classNames={classNames?.avatar}
        isPending={isPending}
        localization={localization}
        size={size}
        user={user}
      />

      <div className={cn("grid flex-1 text-left leading-tight", classNames?.content)}>
        {isPending ? (
          <>
            <Skeleton
              className={cn(
                "max-w-full",
                size === "lg" ? "h-4.5 w-32" : "h-3.5 w-24",
                classNames?.title,
                classNames?.skeleton
              )}
            />

            {size !== "sm" && (
              <Skeleton
                className={cn(
                  "mt-1.5 max-w-full",
                  size === "lg" ? "h-3.5 w-40" : "h-3 w-32",
                  classNames?.subtitle,
                  classNames?.skeleton
                )}
              />
            )}
          </>
        ) : (
          <>
            <span className={cn("truncate font-semibold", size === "lg" ? "text-base" : "text-sm", classNames?.title)}>
              {user?.displayName ||
                user?.name ||
                user?.fullName ||
                user?.firstName ||
                user?.displayUsername ||
                user?.username ||
                user?.email ||
                localization?.USER}
            </span>

            {size !== "sm" && (
              <span className={cn("truncate opacity-70", size === "lg" ? "text-sm" : "text-xs", classNames?.subtitle)}>
                {localization?.PERSONAL_ACCOUNT}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
