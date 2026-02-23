"use client";

import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { pipe } from "effect";
import * as Result from "@effect-atom/atom/Result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoryVM, HistoryVMLayer, type HistoryEvent } from "@/lib/features/history/HistoryVM";
import { useVM } from "@/app/runtime";

const eventIcons: Record<HistoryEvent["type"], string> = {
  created: "+",
  completed: "v",
  uncompleted: "o",
  deleted: "x",
  edited: "~",
};

const eventColors: Record<HistoryEvent["type"], string> = {
  created: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  uncompleted: "bg-yellow-100 text-yellow-700",
  deleted: "bg-red-100 text-red-700",
  edited: "bg-purple-100 text-purple-700",
};

function EventItem({ event }: { event: HistoryEvent }) {
  const time = new Date(event.timestamp).toLocaleTimeString();

  return (
    <div className="flex items-start gap-2 py-1.5 border-b last:border-0">
      <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-mono ${eventColors[event.type]}`}>
        {eventIcons[event.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{event.todoText}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}

function HistoryPanelContent({ vm }: { vm: HistoryVM }) {
  const recentEvents = useAtomValue(vm.recentEvents$);
  const eventCount = useAtomValue(vm.eventCount$);
  const clearHistory = useAtomSet(vm.clearHistory$);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">History</CardTitle>
          {eventCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clearHistory()}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-2">
          {eventCount} event{eventCount !== 1 ? "s" : ""} recorded
        </p>

        <div className="max-h-48 overflow-y-auto">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No activity yet
            </p>
          ) : (
            [...recentEvents].reverse().map((event) => (
              <EventItem key={event.id} event={event} />
            ))
          )}
        </div>

        <div className="border-t mt-3 pt-3">
          <p className="text-xs text-gray-500">Legend</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {(Object.keys(eventIcons) as Array<HistoryEvent["type"]>).map((type) => (
              <span
                key={type}
                className={`text-xs px-1.5 py-0.5 rounded ${eventColors[type]}`}
              >
                {eventIcons[type]} {type}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistoryPanel() {
  const vmResult = useVM(HistoryVM, HistoryVMLayer);

  return pipe(
    vmResult,
    Result.match({
      onInitial: () => <Card className="h-full animate-pulse bg-gray-100" />,
      onSuccess: ({ value: vm }) => <HistoryPanelContent vm={vm} />,
      onFailure: ({ cause }) => (
        <Card className="h-full">
          <CardContent className="text-red-500">Error: {String(cause)}</CardContent>
        </Card>
      ),
    })
  );
}
