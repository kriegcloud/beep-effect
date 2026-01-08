"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/todox/components/ui/dropdown-menu";
import { BellIcon, CheckIcon, EnvelopeIcon, UserPlusIcon, WarningIcon } from "@phosphor-icons/react";

interface Notification {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly time: string;
  readonly read: boolean;
  readonly type: "message" | "alert" | "user" | "system";
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "New message from Sarah",
    description: "Hey, can you review the latest designs?",
    time: "2 min ago",
    read: false,
    type: "message",
  },
  {
    id: "2",
    title: "Project deadline approaching",
    description: "Q4 Report is due in 2 days",
    time: "1 hour ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "New team member joined",
    description: "Alex Johnson joined the Design team",
    time: "3 hours ago",
    read: true,
    type: "user",
  },
  {
    id: "4",
    title: "System update completed",
    description: "Version 2.4.0 has been deployed",
    time: "Yesterday",
    read: true,
    type: "system",
  },
];

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "message":
      return <EnvelopeIcon className="size-4" />;
    case "alert":
      return <WarningIcon className="size-4" />;
    case "user":
      return <UserPlusIcon className="size-4" />;
    default:
      return <BellIcon className="size-4" />;
  }
}

export function NotificationDropdown() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative flex items-center justify-center rounded-full p-2 ring-sidebar-ring hover:bg-accent hover:ring-2 focus-visible:ring-2 outline-none transition-all"
          >
            <BellIcon className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent className="w-80 rounded-lg" side="bottom" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">Notifications</span>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all as read
          </button>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <NotificationIcon type={notification.type} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
          <CheckIcon className="mr-2 size-4" />
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
