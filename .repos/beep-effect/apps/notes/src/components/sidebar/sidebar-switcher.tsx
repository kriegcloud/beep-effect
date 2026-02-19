"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { useLogoutMutation } from "@beep/notes/components/auth/useLogoutMutation";
import { Avatar, AvatarImage } from "@beep/notes/registry/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/notes/registry/ui/dropdown-menu";
import { Spinner } from "@beep/notes/registry/ui/spinner";

import { useAuthGuard } from "../auth/useAuthGuard";
import { pushModal } from "../modals";
import { Icons } from "../ui/icons";
import { Skeleton } from "../ui/skeleton";

export function SidebarSwitcher() {
  const user = useCurrentUser();
  const logout = useLogoutMutation();
  const authGuard = useAuthGuard();

  if (!user.id) {
    return (
      <div
        className="group mx-2 my-1.5 flex min-h-[32px] items-center gap-2 rounded-md px-2 py-1 pr-0.5 text-sm font-medium text-subtle-foreground hover:bg-primary/[.04]"
        onClick={() => {
          authGuard(() => pushModal("Login"));
        }}
        role="button"
      >
        <div className="px-0.5">
          {user.isLoading ? (
            <Skeleton className="size-4 rounded-sm" />
          ) : (
            <Icons.user variant="muted" className="size-4" />
          )}
        </div>
        {user.isLoading ? <Skeleton className="h-4 w-3/5" /> : "Sign in"}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="group mx-2 my-1.5 flex min-h-[32px] cursor-pointer items-center gap-2 rounded-md px-2 py-1 pr-0.5 text-sm font-medium hover:bg-primary/[.04]"
          onClick={() => {
            pushModal("Login");
          }}
          role="button"
        >
          <Avatar className="size-6">
            <AvatarImage alt={user.firstName ?? ""} src={user.profileImageUrl ?? ""} />
          </Avatar>

          <span className="line-clamp-1 text-start font-medium select-none">{user.firstName}&apos;s Todox</span>
          <Icons.chevronDown className="text-muted-foreground/80" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-fit" align="start" alignOffset={11}>
        <div className="flex space-x-2 p-3">
          <Avatar className="size-9">
            <AvatarImage alt={user.firstName!} src={user.profileImageUrl!} />
          </Avatar>

          <div className="flex flex-col items-start justify-center space-y-1 text-start">
            <p className="line-clamp-1 text-sm font-medium">{user.firstName}</p>
            <p className="text-xs leading-none font-medium text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="mx-1 my-1.5 text-xs font-medium text-muted-foreground"
          onClick={(e) => {
            e.preventDefault();

            logout.mutate();
          }}
        >
          {logout.isPending ? <Spinner /> : <Icons.logout />}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
