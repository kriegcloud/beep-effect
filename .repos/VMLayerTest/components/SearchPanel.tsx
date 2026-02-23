"use client";

import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { Layer, pipe } from "effect";
import * as Result from "@effect-atom/atom/Result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchVM, SearchVMLayer } from "@/lib/features/search/SearchVM";
import { TodoVMLive } from "@/lib/features/todos/TodoVM";
import type { TodoItemVM } from "@/lib/features/todos/TodoItemVM";
import { useVM } from "@/app/runtime";
import * as Loadable from "@/lib/Loadable";

const SearchVMLive = SearchVMLayer.pipe(
  Layer.provide(TodoVMLive),
);

function SearchResult({ item }: { item: TodoItemVM }) {
  const text = useAtomValue(item.text$);
  const completed = useAtomValue(item.completed$);

  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-sm flex-1 ${completed ? "line-through text-gray-400" : ""}`}>
        {text}
      </span>
      {completed && (
        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
          done
        </span>
      )}
    </div>
  );
}

function SearchPanelContent({ vm }: { vm: SearchVM }) {
  const query = useAtomValue(vm.query$);
  const resultsLoadable = useAtomValue(vm.results$);
  const isSearching = useAtomValue(vm.isSearching$);
  const resultCount = useAtomValue(vm.resultCount$);
  const setQuery = useAtomSet(vm.setQuery$);
  const clearSearch = useAtomSet(vm.clearSearch$);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Search todos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-sm"
          />
          {isSearching && (
            <Button variant="ghost" size="sm" onClick={() => clearSearch()}>
              Clear
            </Button>
          )}
        </div>

        {isSearching && (
          <p className="text-xs text-gray-500">
            Found {resultCount} result{resultCount !== 1 ? "s" : ""}
          </p>
        )}

        {Loadable.match(resultsLoadable, {
          onPending: () => (
            <p className="text-sm text-gray-400">Loading...</p>
          ),
          onReady: (results) =>
            isSearching && (
              <div className="border-t pt-2 max-h-40 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-sm text-gray-400">No matches</p>
                ) : (
                  results.map((item) => (
                    <SearchResult key={item.id} item={item} />
                  ))
                )}
              </div>
            ),
        })}
      </CardContent>
    </Card>
  );
}

export function SearchPanel() {
  const vmResult = useVM(SearchVM, SearchVMLive);

  return pipe(
    vmResult,
    Result.match({
      onInitial: () => <Card className="h-full animate-pulse bg-gray-100" />,
      onSuccess: ({ value: vm }) => <SearchPanelContent vm={vm} />,
      onFailure: ({ cause }) => (
        <Card className="h-full">
          <CardContent className="text-red-500">Error: {String(cause)}</CardContent>
        </Card>
      ),
    })
  );
}
