"use client";

import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { Layer, pipe } from "effect";
import * as Result from "@effect-atom/atom/Result";
import * as KeyValueStore from "@effect/platform/KeyValueStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterVM, FilterVMLayer, type FilterType } from "@/lib/features/filter/FilterVM";
import { TodoVMLive } from "@/lib/features/todos/TodoVM";
import type { TodoItemVM } from "@/lib/features/todos/TodoItemVM";
import { useVM } from "@/app/runtime";
import * as Loadable from "@/lib/Loadable";

const FilterVMLive = FilterVMLayer.pipe(
  Layer.provide(TodoVMLive),
  Layer.provide(KeyValueStore.layerMemory)
);

const FilterButton = ({
  filter,
  current,
  onClick,
}: {
  filter: FilterType;
  current: FilterType;
  onClick: () => void;
}) => (
  <Button
    variant={current === filter ? "default" : "outline"}
    size="sm"
    onClick={onClick}
    className="capitalize"
  >
    {filter}
  </Button>
);

function TodoPreview({ item }: { item: TodoItemVM }) {
  const text = useAtomValue(item.text$);
  const completed = useAtomValue(item.completed$);

  return (
    <div className={`text-sm py-1 ${completed ? "line-through text-gray-400" : ""}`}>
      {text}
    </div>
  );
}

function FilterPanelContent({ vm }: { vm: FilterVM }) {
  const currentFilter = useAtomValue(vm.currentFilter$);
  const filteredTodosLoadable = useAtomValue(vm.filteredTodos$);
  const setFilter = useAtomSet(vm.setFilter$);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(["all", "active", "completed"] as const).map((filter) => (
            <FilterButton
              key={filter}
              filter={filter}
              current={currentFilter}
              onClick={() => setFilter(filter)}
            />
          ))}
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">
            Showing: {currentFilter}
          </p>
          {Loadable.match(filteredTodosLoadable, {
            onPending: () => (
              <p className="text-sm text-gray-400">Loading...</p>
            ),
            onReady: (todos) => (
              <div className="max-h-32 overflow-y-auto">
                {todos.length === 0 ? (
                  <p className="text-sm text-gray-400">No items</p>
                ) : (
                  todos.slice(0, 5).map((item) => (
                    <TodoPreview key={item.id} item={item} />
                  ))
                )}
                {todos.length > 5 && (
                  <p className="text-xs text-gray-400">
                    +{todos.length - 5} more
                  </p>
                )}
              </div>
            ),
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function FilterPanel() {
  const vmResult = useVM(FilterVM, FilterVMLive);

  return pipe(
    vmResult,
    Result.match({
      onInitial: () => <Card className="h-full animate-pulse bg-gray-100" />,
      onSuccess: ({ value: vm }) => <FilterPanelContent vm={vm} />,
      onFailure: ({ cause }) => (
        <Card className="h-full">
          <CardContent className="text-red-500">Error: {String(cause)}</CardContent>
        </Card>
      ),
    })
  );
}
