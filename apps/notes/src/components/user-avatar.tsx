import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { cn } from "@beep/notes/lib/utils";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/notes/registry/ui/avatar";
import type * as React from "react";
import type { DeepNullable } from "ts-essentials";

import { Skeleton } from "./ui/skeleton";

export interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  avatarClassName?: undefined | string;
  isCurrent?: undefined | boolean;
  loading?: undefined | boolean;
  user?:
    | undefined
    | DeepNullable<{
        profileImageUrl?: undefined | string;
        username?: undefined | string;
      }>;
}

export function UserAvatar({
  avatarClassName,
  className,
  isCurrent,
  loading,
  size,
  user = {},
  variant,
  ...props
}: UserAvatarProps) {
  const currentUser = useCurrentUser();
  const mounted = useMounted();

  loading = loading || currentUser.isLoading || !mounted;

  if (isCurrent) {
    user = {
      ...currentUser,
      ...user,
    };
  }

  const src = user.profileImageUrl;

  const label = user.username ? `Avatar for ${user.username}` : "Avatar";

  return (
    <Avatar key={src} size={size} variant={variant} className={avatarClassName} {...props}>
      {loading || !src ? (
        <AvatarFallback variant={variant}>
          <Skeleton className="size-full bg-muted" />
        </AvatarFallback>
      ) : (
        <AvatarImage
          className={cn("", className)}
          alt={label}
          draggable={false}
          referrerPolicy="no-referrer"
          src={src}
        />
      )}
    </Avatar>
  );
}
