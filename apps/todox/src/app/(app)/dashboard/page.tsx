"use client";

import { Squares as SquaresIcon } from "@phosphor-icons/react";

import { ActionItems } from "./_components/action-items";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingMeetings } from "./_components/upcoming-meetings";

export default function DashboardPage() {
  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      {/* Page header */}
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-2">
        <SquaresIcon className="size-5 text-primary" weight="duotone" />
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Widget grid */}
      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <RecentActivity />
        <UpcomingMeetings />
        <ActionItems />
      </div>
    </div>
  );
}
