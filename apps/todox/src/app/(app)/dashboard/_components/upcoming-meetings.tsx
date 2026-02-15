"use client";

import { cn } from "@beep/todox/lib/utils";
import {
  Calendar as CalendarIcon,
  Phone as PhoneIcon,
  UsersThree as UsersThreeIcon,
  VideoCamera as VideoCameraIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as React from "react";

import { WidgetCard } from "./widget-card";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface MeetingItem {
  readonly id: string;
  readonly title: string;
  readonly time: string;
  readonly duration: string;
  readonly participants: ReadonlyArray<string>;
  readonly icon: React.ComponentType<{
    readonly className?: string;
    readonly weight?: "bold" | "regular" | "light" | "thin" | "fill" | "duotone";
  }>;
  readonly accentClass: string;
}

const MEETINGS: ReadonlyArray<MeetingItem> = [
  {
    id: "m1",
    title: "Design Review",
    time: "10:00 AM",
    duration: "45 min",
    participants: ["Sarah C.", "James W.", "Mia T."],
    icon: VideoCameraIcon,
    accentClass: "text-primary bg-primary/10",
  },
  {
    id: "m2",
    title: "Sprint Planning",
    time: "1:30 PM",
    duration: "1 hr",
    participants: ["Full Team"],
    icon: UsersThreeIcon,
    accentClass: "text-chart-2 bg-chart-2/10",
  },
  {
    id: "m3",
    title: "Client Check-in",
    time: "3:00 PM",
    duration: "30 min",
    participants: ["Alex R.", "Client"],
    icon: PhoneIcon,
    accentClass: "text-chart-3 bg-chart-3/10",
  },
  {
    id: "m4",
    title: "Roadmap Sync",
    time: "Tomorrow, 9:00 AM",
    duration: "1 hr",
    participants: ["Eng Leads", "PM Team"],
    icon: CalendarIcon,
    accentClass: "text-chart-4 bg-chart-4/10",
  },
];

// ---------------------------------------------------------------------------
// ParticipantList
// ---------------------------------------------------------------------------

function ParticipantList({ participants }: { readonly participants: ReadonlyArray<string> }) {
  return <span className="text-xs text-muted-foreground">{F.pipe(participants, A.join(", "))}</span>;
}

// ---------------------------------------------------------------------------
// MeetingRow
// ---------------------------------------------------------------------------

interface MeetingRowProps {
  readonly item: MeetingItem;
  readonly isLast: boolean;
}

function MeetingRow({ item, isLast }: MeetingRowProps) {
  const Icon = item.icon;
  return (
    <div className={cn("flex items-start gap-3 py-2.5", !isLast && "border-b border-border/30")}>
      <div className={cn("flex shrink-0 items-center justify-center rounded-lg p-1.5", item.accentClass)}>
        <Icon className="size-4" weight="duotone" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-card-foreground">{item.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{item.duration}</span>
        </div>
        <span className="text-xs font-medium text-primary/80">{item.time}</span>
        <ParticipantList participants={item.participants} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UpcomingMeetings
// ---------------------------------------------------------------------------

export function UpcomingMeetings() {
  const lastIndex = A.length(MEETINGS) - 1;

  return (
    <WidgetCard title="Upcoming Meetings" subtitle="Today and tomorrow">
      <div className="flex flex-col">
        {F.pipe(
          MEETINGS,
          A.map((item, index) => <MeetingRow key={item.id} item={item} isLast={index === lastIndex} />)
        )}
      </div>
    </WidgetCard>
  );
}
