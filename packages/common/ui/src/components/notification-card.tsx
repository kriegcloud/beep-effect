"use client";

import { $UiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { ArrowRightIcon, CheckIcon, ClockIcon, SpinnerGapIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { pipe, Tuple } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { cn } from "../lib/index.ts";

const $I = $UiId.create("components/notification-card");

const NotificationStatus = LiteralKit(["unread", "read", "archived"]).pipe(
  $I.annoteSchema("NotificationStatus", {
    description: "The status of a notification",
  })
);

export type NotificationStatus = typeof NotificationStatus.Type;

export const ActionType = LiteralKit(["redirect", "api_call", "workflow", "modal"]).pipe(
  $I.annoteSchema("ActionType", {
    description: "The type of action to perform",
  })
);

export type ActionType = typeof ActionType.Type;

export const ActionStyle = LiteralKit(["primary", "danger", "default"]).pipe(
  $I.annoteSchema("ActionStyle", {
    description: "The style of the action button",
  })
);
export type ActionStyle = typeof ActionStyle.Type;

export const NotificationAction = ActionType.mapMembers((members) => {
  const make = <T extends ActionType>(literal: S.Literal<T>) =>
    S.Struct({
      type: S.tag(literal.literal),
      executed: S.OptionFromOptionalKey(S.Boolean),
      id: S.String,
      label: S.String,
      style: S.OptionFromOptionalKey(ActionStyle),
    });
  return pipe(members, Tuple.evolve([make, make, make, make]));
}).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("NotificationAction", {
    description: "An action to perform on a notification",
  })
);

export type NotificationAction = typeof NotificationAction.Type;

export interface NotificationCardProps {
  readonly actions?: undefined | NotificationAction[];
  readonly body: string;
  readonly className?: undefined | string;
  readonly createdAt?: undefined | Date | string;
  readonly id: string;
  readonly loadingActionId?: undefined | string;
  readonly onAction?: undefined | ((notificationId: string, actionId: string, actionType: ActionType) => void);
  readonly onMarkAsRead?: undefined | ((id: string) => void);
  readonly status?: undefined | NotificationStatus;
  readonly title: string;
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
                    disabled={isLoading || isExecuted.pipe(O.getOrElse(() => false))}
                    onClick={() => onAction?.(id, action.id, action.type)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-normal transition",
                      O.match(action.style, {
                        onNone: () =>
                          "bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
                        onSome: (style) =>
                          style === "primary"
                            ? "bg-sky-500/10 text-blue-600 hover:bg-sky-500/20 dark:text-blue-400 dark:hover:bg-sky-500/20"
                            : style === "danger"
                              ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                              : "bg-zinc-200/50 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
                      }),
                      showLoading && "opacity-50",
                      isExecuted && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {showLoading ? (
                      <SpinnerGapIcon size={12} className="animate-spin" />
                    ) : (
                      <>
                        <span>{action.label}</span>
                        {isExecuted ? (
                          <CheckIcon size={12} weight="bold" />
                        ) : (
                          NotificationAction.match(action, {
                            redirect: () => <ArrowRightIcon size={12} weight="bold" />,
                            api_call: () => <CheckIcon size={12} weight="bold" />,
                            workflow: () => <ClockIcon size={12} weight="bold" />,
                            modal: () => <WarningCircleIcon size={12} weight="bold" />,
                          })
                        )}
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
