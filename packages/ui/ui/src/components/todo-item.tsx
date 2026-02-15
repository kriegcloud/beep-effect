"use client";

import { cn } from "@beep/ui-core/utils";
import { ArrowRightIcon, CalendarIcon, CheckIcon, InfoIcon, WarningCircleIcon } from "@phosphor-icons/react";

export type TodoPriority = "high" | "medium" | "low" | "none";

export interface TodoLabel {
  readonly id: string;
  readonly name: string;
  readonly color?: undefined |  string;
}

export interface TodoSubtask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export interface TodoProject {
  readonly id: string;
  readonly name: string;
  readonly color?: undefined |  string;
}

export interface TodoItemProps {
  readonly id: string;
  readonly title: string;
  readonly description?: undefined |  string;
  readonly completed: boolean;
  readonly priority: TodoPriority;
  readonly dueDate?: undefined |  Date | string;
  readonly labels?: undefined |  TodoLabel[];
  readonly subtasks?: undefined |  TodoSubtask[];
  readonly project?: undefined |  TodoProject;
  readonly onToggleComplete?: undefined |  ((id: string, completed: boolean) => void);
  readonly onClick?: undefined |  ((id: string) => void);
  readonly isSelected?: undefined |  boolean;
  readonly className?: undefined |  string;
}

const priorityConfig = {
  high: {
    textColor: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/10 dark:bg-red-400/10",
    borderColor: "border-red-500",
  },
  medium: {
    textColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 dark:bg-yellow-400/10",
    borderColor: "border-yellow-500",
  },
  low: {
    textColor: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-sky-500/10 dark:bg-sky-400/10",
    borderColor: "border-blue-500",
  },
  none: {
    textColor: "text-zinc-500 dark:text-zinc-500",
    bgColor: "bg-zinc-500/10 dark:bg-zinc-500/10",
    borderColor: "border-zinc-400 dark:border-zinc-500",
  },
} as const;

const formatDate = (date: Date | string): string => {
  const parsed = new Date(date);
  const now = new Date();
  const diff = parsed.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days < 7) return `In ${days} days`;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function TodoItem({
  id,
  title,
  description,
  completed,
  priority,
  dueDate,
  labels = [],
  subtasks = [],
  project,
  onToggleComplete,
  onClick,
  isSelected = false,
  className,
}: TodoItemProps) {
  const priorityStyle = priorityConfig[priority];

  const isOverdue = dueDate && new Date(dueDate) < new Date() && !completed;
  const isToday =
    dueDate &&
    !completed &&
    (() => {
      const parsed = new Date(dueDate);
      const now = new Date();
      return (
        parsed.getFullYear() === now.getFullYear() &&
        parsed.getMonth() === now.getMonth() &&
        parsed.getDate() === now.getDate()
      );
    })();

  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group pointer-events-auto mb-0 w-full cursor-pointer rounded-lg p-4 pl-5 text-left transition-all",
        isSelected ? "bg-sky-500/5 ring-2 ring-blue-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
        completed && "opacity-50",
        className
      )}
      onClick={() => onClick?.(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(id);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete?.(id, !completed);
          }}
          className={cn(
            "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
            completed
              ? "border-zinc-400 bg-zinc-400 dark:border-zinc-500 dark:bg-zinc-500"
              : `${priorityStyle.borderColor} border-dashed bg-transparent`
          )}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {completed && <CheckIcon size={12} className="text-white" weight="bold" />}
        </button>

        <div className="min-w-0 flex-1">
          <div>
            <h4
              className={cn(
                "text-base font-medium text-zinc-900 dark:text-zinc-100",
                completed && "line-through text-zinc-500 dark:text-zinc-500"
              )}
            >
              {title}
            </h4>
            {description && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{description}</p>}
          </div>

          {(priority !== "none" || dueDate || labels.length > 0 || project || subtasks.length > 0) && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {dueDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
                    isToday
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : isOverdue
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  <CalendarIcon size={12} />
                  {formatDate(dueDate)}
                </span>
              )}

              {project && (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  style={project.color ? { color: project.color } : undefined}
                >
                  <InfoIcon size={12} />
                  {project.name}
                </span>
              )}

              {labels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  style={label.color ? { color: label.color } : undefined}
                >
                  <InfoIcon size={12} />
                  {label.name}
                </span>
              ))}

              {priority !== "none" && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
                    priorityStyle.bgColor,
                    priorityStyle.textColor
                  )}
                >
                  <WarningCircleIcon size={12} />
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
              )}

              {subtasks.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <CheckIcon size={12} />
                  {completedSubtasks}/{subtasks.length} subtasks
                </span>
              )}
            </div>
          )}
        </div>

        <ArrowRightIcon size={16} />
      </div>
    </div>
  );
}
