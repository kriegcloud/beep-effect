"use client";

import { TodoList } from "@/components/TodoList";
import { FilterPanel } from "@/components/FilterPanel";
import { SearchPanel } from "@/components/SearchPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import { RegistryProvider } from "@effect-atom/atom-react";

export default function Home() {
  return (
    <RegistryProvider>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Effect Atom VM Pattern Demo</h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <TodoList />
          </div>
          <div>
            <StatsPanel />
          </div>
          <div>
            <SearchPanel />
          </div>
          <div>
            <FilterPanel />
          </div>
          <div>
            <HistoryPanel />
          </div>
        </div>
      </div>
    </RegistryProvider>
  );
}
