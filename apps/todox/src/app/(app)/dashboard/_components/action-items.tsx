"use client";

import { cn } from "@beep/todox/lib/utils";
import {
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Clock as ClockIcon,
  Warning as WarningIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import type * as React from "react";

import { WidgetCard } from "./widget-card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "done" | "in-progress" | "pending" | "overdue";

interface TaskItem {
  readonly id: string;
  readonly title: string;
  readonly assignee: string;
  readonly status: TaskStatus;
  readonly dueLabel: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const TASKS: ReadonlyArray<TaskItem> = [
  {
    id: "t1",
    title: "Finalize API contract for auth flow",
    assignee: "You",
    status: "in-progress",
    dueLabel: "Due today",
  },
  {
    id: "t2",
    title: "Review PR #127: billing integration",
    assignee: "You",
    status: "pending",
    dueLabel: "Due tomorrow",
  },
  {
    id: "t3",
    title: "Update onboarding docs",
    assignee: "Sarah C.",
    status: "done",
    dueLabel: "Completed",
  },
  {
    id: "t4",
    title: "Fix calendar sync issue",
    assignee: "James W.",
    status: "overdue",
    dueLabel: "Overdue by 2 days",
  },
  {
    id: "t5",
    title: "Prepare demo for stakeholder meeting",
    assignee: "You",
    status: "pending",
    dueLabel: "Due Friday",
  },
  {
    id: "t6",
    title: "Deploy staging environment",
    assignee: "Mia T.",
    status: "done",
    dueLabel: "Completed",
  },
];

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

interface StatusConfig {
  readonly icon: React.ComponentType<{
    readonly className?: string;
    readonly weight?: "bold" | "regular" | "light" | "thin" | "fill" | "duotone";
  }>;
  readonly iconClass: string;
  readonly labelClass: string;
}

const getStatusConfig: (status: TaskStatus) => StatusConfig = Match.type<TaskStatus>().pipe(
  Match.when("done", () => ({
    icon: CheckCircleIcon,
    iconClass: "text-chart-1",
    labelClass: "text-chart-1",
  })),
  Match.when("in-progress", () => ({
    icon: ClockIcon,
    iconClass: "text-primary",
    labelClass: "text-primary",
  })),
  Match.when("pending", () => ({
    icon: CircleIcon,
    iconClass: "text-muted-foreground",
    labelClass: "text-muted-foreground",
  })),
  Match.when("overdue", () => ({
    icon: WarningIcon,
    iconClass: "text-destructive",
    labelClass: "text-destructive",
  })),
  Match.exhaustive
);

// ---------------------------------------------------------------------------
// TaskRow
// ---------------------------------------------------------------------------

interface TaskRowProps {
  readonly item: TaskItem;
  readonly isLast: boolean;
}

function TaskRow({ item, isLast }: TaskRowProps) {
  const config = getStatusConfig(item.status);
  const Icon = config.icon;
  const isDone = item.status === "done";

  return (
    <div className={cn("flex items-start gap-3 py-2.5", !isLast && "border-b border-border/30")}>
      <div className="flex shrink-0 items-center pt-0.5">
        <Icon className={cn("size-5", config.iconClass)} weight={isDone ? "fill" : "duotone"} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-sm text-card-foreground", isDone && "line-through opacity-60")}>
          {item.title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.assignee}</span>
          <span className="text-muted-foreground/40">{"/"}</span>
          <span className={cn("text-xs", config.labelClass)}>{item.dueLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActionItems
// ---------------------------------------------------------------------------

export function ActionItems() {
  const lastIndex = A.length(TASKS) - 1;

  return (
    <WidgetCard title="Action Items" subtitle="Tasks requiring your attention">
      <div className="flex flex-col">
        {F.pipe(
          TASKS,
          A.map((item, index) => <TaskRow key={item.id} item={item} isLast={index === lastIndex} />)
        )}
      </div>
    </WidgetCard>
  );
}
