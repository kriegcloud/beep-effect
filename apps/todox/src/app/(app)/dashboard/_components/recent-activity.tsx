"use client";

import { cn } from "@beep/todox/lib/utils";
import {
  CalendarCheck as CalendarCheckIcon,
  ChatCircle as ChatCircleIcon,
  FileText as FileTextIcon,
  FolderOpen as FolderOpenIcon,
  Link as LinkIcon,
  PencilSimple as PencilIcon,
  User as UserIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as React from "react";

import { WidgetCard } from "./widget-card";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface ActivityItem {
  readonly id: string;
  readonly icon: React.ComponentType<{
    readonly className?: string;
    readonly weight?: "bold" | "regular" | "light" | "thin" | "fill" | "duotone";
  }>;
  readonly description: string;
  readonly timestamp: string;
  readonly accentClass: string;
}

const ACTIVITIES: ReadonlyArray<ActivityItem> = [
  {
    id: "a1",
    icon: FileTextIcon,
    description: "New document created: Q1 Planning",
    timestamp: "2 min ago",
    accentClass: "text-primary bg-primary/10",
  },
  {
    id: "a2",
    icon: PencilIcon,
    description: "Edited project roadmap draft",
    timestamp: "18 min ago",
    accentClass: "text-chart-3 bg-chart-3/10",
  },
  {
    id: "a3",
    icon: UserIcon,
    description: "Sarah Chen joined the Design team",
    timestamp: "1 hr ago",
    accentClass: "text-chart-1 bg-chart-1/10",
  },
  {
    id: "a4",
    icon: ChatCircleIcon,
    description: "New comment on API integration spec",
    timestamp: "2 hr ago",
    accentClass: "text-chart-2 bg-chart-2/10",
  },
  {
    id: "a5",
    icon: FolderOpenIcon,
    description: "Shared folder: Marketing Assets",
    timestamp: "3 hr ago",
    accentClass: "text-chart-4 bg-chart-4/10",
  },
  {
    id: "a6",
    icon: CalendarCheckIcon,
    description: "Sprint retrospective marked complete",
    timestamp: "5 hr ago",
    accentClass: "text-chart-5 bg-chart-5/10",
  },
  {
    id: "a7",
    icon: LinkIcon,
    description: "External link added to knowledge base",
    timestamp: "Yesterday",
    accentClass: "text-muted-foreground bg-muted",
  },
];

// ---------------------------------------------------------------------------
// ActivityRow
// ---------------------------------------------------------------------------

interface ActivityRowProps {
  readonly item: ActivityItem;
  readonly isLast: boolean;
}

function ActivityRow({ item, isLast }: ActivityRowProps) {
  const Icon = item.icon;
  return (
    <div className={cn("flex items-start gap-3 py-2.5", !isLast && "border-b border-border/30")}>
      <div className={cn("flex shrink-0 items-center justify-center rounded-lg p-1.5", item.accentClass)}>
        <Icon className="size-4" weight="duotone" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm text-card-foreground">{item.description}</span>
        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecentActivity
// ---------------------------------------------------------------------------

export function RecentActivity() {
  const lastIndex = A.length(ACTIVITIES) - 1;

  return (
    <WidgetCard title="Recent Activity" subtitle="Latest updates across your workspace">
      <div className="flex flex-col">
        {F.pipe(
          ACTIVITIES,
          A.map((item, index) => <ActivityRow key={item.id} item={item} isLast={index === lastIndex} />)
        )}
      </div>
    </WidgetCard>
  );
}
