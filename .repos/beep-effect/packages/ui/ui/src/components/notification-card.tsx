"use client";

import { cn } from "@beep/ui-core/utils";
import { ArrowRightIcon, CheckIcon, ClockIcon, SpinnerGapIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export type NotificationStatus = "unread" | "read" | "archived";
export type ActionType = "redirect" | "api_call" | "workflow" | "modal";
export type ActionStyle = "primary" | "danger" | "default";

export interface NotificationAction {
  readonly id: string;
  readonly label: string;
  readonly type: ActionType;
  readonly style?: undefined | ActionStyle;
  readonly executed?: undefined | boolean;
}

export interface NotificationCardProps {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly status?: undefined | NotificationStatus;
  readonly createdAt?: undefined | Date | string;
  readonly actions?: undefined | NotificationAction[];
  readonly onMarkAsRead?: undefined | ((id: string) => void);
  readonly onAction?: undefined | ((notificationId: string, actionId: string, actionType: ActionType) => void);
  readonly loadingActionId?: undefined | string;
  readonly className?: undefined | string;
}

const formatDate = (date: Date | string): string => {
  const parsed = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const getActionIcon = (actionType: ActionType): ReactNode => {
  switch (actionType) {
    case "redirect":
      return <ArrowRightIcon size={12} weight="bold" />;
    case "api_call":
      return <CheckIcon size={12} weight="bold" />;
    case "workflow":
      return <ClockIcon size={12} weight="bold" />;
    case "modal":
      return <WarningCircleIcon size={12} weight="bold" />;
    default:
      return null;
  }
};

export function NotificationCard({
  id,
  title,
  body,
  status = "unread",
  createdAt,
  actions = [],
  onMarkAsRead,
  onAction,
  loadingActionId,
  className,
}: NotificationCardProps) {
  const isUnread = status === "unread";

  return (
    <div
      className={cn(
        "group relative w-full rounded-2xl transition-all",
        isUnread ? "bg-zinc-100 dark:bg-zinc-800/70" : "bg-zinc-50 dark:bg-zinc-800/30",
        className
      )}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  "text-[15px] font-semibold leading-tight",
                  isUnread ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-500"
                )}
              >
                {title}
              </h3>
              {isUnread && <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-500" />}
            </div>

            <p
              className={cn(
                "mb-0 text-[13px]",
                isUnread ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-400 dark:text-zinc-600"
              )}
            >
              {body}
            </p>
          </div>

          {isUnread && onMarkAsRead && (
            <button
              type="button"
              onClick={() => onMarkAsRead(id)}
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                "text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600",
                "dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              )}
              aria-label="Mark as read"
            >
              <CheckIcon size={16} weight="bold" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between">
          {actions.length > 0 && (
            <div className={cn("flex flex-wrap items-center gap-2", !isUnread && "opacity-60")}>
              {actions.map((action) => {
                const isLoading = loadingActionId === action.id;
                const isExecuted = action.executed ?? false;
                const showLoading = isLoading && action.type !== "modal";

                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={isLoading || isExecuted}
                    onClick={() => onAction?.(id, action.id, action.type)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-normal transition",
                      action.style === "primary"
                        ? "bg-sky-500/10 text-blue-600 hover:bg-sky-500/20 dark:text-blue-400 dark:hover:bg-sky-500/20"
                        : action.style === "danger"
                          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                          : "bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
                      showLoading && "opacity-50",
                      isExecuted && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {showLoading ? (
                      <SpinnerGapIcon size={12} className="animate-spin" />
                    ) : (
                      <>
                        <span>{action.label}</span>
                        {isExecuted ? <CheckIcon size={12} weight="bold" /> : getActionIcon(action.type)}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {createdAt && (
            <span className="inline-block text-[11px] text-zinc-400 dark:text-zinc-600">{formatDate(createdAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
