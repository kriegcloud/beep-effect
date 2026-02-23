"use client";

import { cn } from "@beep/ui-core/utils";
import { CheckIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export type EventStatus = "idle" | "loading" | "completed";
export type EventVariant = "display" | "action";

export interface CalendarEventCardProps {
  readonly eventColor: string;
  readonly status?: undefined | EventStatus;
  readonly label?: undefined | string;
  readonly children: ReactNode;
  readonly variant?: undefined | EventVariant;
  readonly buttonColor?: undefined | "primary" | "danger";
  readonly completedLabel?: undefined | string;
  readonly onAction?: undefined | (() => void);
  readonly isDotted?: undefined | boolean;
  readonly opacity?: undefined | number;
  readonly className?: undefined | string;
}

export function CalendarEventCard({
  eventColor,
  status = "idle",
  label,
  children,
  variant = "display",
  buttonColor = "primary",
  completedLabel = "Completed",
  onAction,
  isDotted = false,
  opacity = 1,
  className,
}: CalendarEventCardProps) {
  const hasAction = variant === "action" && onAction;
  const finalOpacity = status === "completed" ? 0.5 : opacity;

  const buttonColorClasses = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  } as const;

  return (
    <div
      className={cn(
        "relative flex gap-2 rounded-lg p-3 pl-5 pr-2 transition-colors",
        hasAction ? "items-end" : "items-start",
        isDotted && "border-2 border-dashed",
        className
      )}
      style={{
        ...(isDotted
          ? {
              borderColor: `${eventColor}80`,
              backgroundColor: `${eventColor}10`,
            }
          : {
              backgroundColor: `${eventColor}20`,
            }),
        opacity: finalOpacity,
      }}
    >
      <div className="absolute left-1 top-0 flex h-full items-center">
        <div className="h-[80%] w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: eventColor }} />
      </div>

      <div className="min-w-0 flex-1">
        {label && (
          <div
            className={cn(
              "mb-1 text-xs font-medium",
              isDotted ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-500"
            )}
          >
            {label}
          </div>
        )}
        {children}
      </div>

      {hasAction && (
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            buttonColorClasses[buttonColor]
          )}
          disabled={status === "completed"}
          onClick={onAction}
        >
          {status === "loading" ? (
            <>
              <SpinnerGapIcon size={16} className="animate-spin" />
              Confirm
            </>
          ) : status === "completed" ? (
            <>
              <CheckIcon size={16} />
              {completedLabel}
            </>
          ) : (
            "Confirm"
          )}
        </button>
      )}
    </div>
  );
}

export interface EventTitleProps {
  readonly children: ReactNode;
  readonly className?: undefined | string;
}

export function EventTitle({ children, className }: EventTitleProps) {
  return <h3 className={cn("font-medium text-zinc-900 dark:text-zinc-100", className)}>{children}</h3>;
}

export interface EventTimeProps {
  readonly startTime: string;
  readonly endTime?: undefined | string;
  readonly className?: undefined | string;
}

export function EventTime({ startTime, endTime, className }: EventTimeProps) {
  return (
    <p className={cn("text-sm text-zinc-600 dark:text-zinc-400", className)}>
      {startTime}
      {endTime ? ` - ${endTime}` : ""}
    </p>
  );
}

export interface EventLocationProps {
  readonly children: ReactNode;
  readonly className?: undefined | string;
}

export function EventLocation({ children, className }: EventLocationProps) {
  return <p className={cn("text-xs text-zinc-500 dark:text-zinc-500", className)}>{children}</p>;
}
