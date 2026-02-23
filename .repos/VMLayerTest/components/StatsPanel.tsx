"use client";

import { useAtomValue } from "@effect-atom/atom-react";
import { Layer, pipe } from "effect";
import * as Result from "@effect-atom/atom/Result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsVM, StatsVMLayer } from "@/lib/features/stats/StatsVM";
import { TodoVMLive } from "@/lib/features/todos/TodoVM";
import { HistoryVMLayer } from "@/lib/features/history/HistoryVM";
import { useVM } from "@/app/runtime";

const StatsVMLive = StatsVMLayer.pipe(
  Layer.provide(TodoVMLive),
  Layer.provide(HistoryVMLayer),
);

function StatItem({ label, value, suffix = "" }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function StatsPanelContent({ vm }: { vm: StatsVM }) {
  const total = useAtomValue(vm.totalTodos$);
  const completed = useAtomValue(vm.completedTodos$);
  const active = useAtomValue(vm.activeTodos$);
  const completionRate = useAtomValue(vm.completionRate$);
  const createdToday = useAtomValue(vm.todosCreatedToday$);
  const completedToday = useAtomValue(vm.todosCompletedToday$);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatItem label="Total" value={total} />
          <StatItem label="Active" value={active} />
          <StatItem label="Done" value={completed} />
        </div>

        <div className="border-t pt-3">
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Completion Rate</span>
              <span>{Math.round(completionRate * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${completionRate * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-500 mb-2">Today&apos;s Activity</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-semibold text-blue-700">{createdToday}</div>
              <div className="text-xs text-blue-600">Created</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-semibold text-green-700">{completedToday}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsPanel() {
  const vmResult = useVM(StatsVM, StatsVMLive);

  return pipe(
    vmResult,
    Result.match({
      onInitial: () => <Card className="h-full animate-pulse bg-gray-100" />,
      onSuccess: ({ value: vm }) => <StatsPanelContent vm={vm} />,
      onFailure: ({ cause }) => (
        <Card className="h-full">
          <CardContent className="text-red-500">Error: {String(cause)}</CardContent>
        </Card>
      ),
    })
  );
}
