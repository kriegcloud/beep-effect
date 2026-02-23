"use client";

import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { Layer, pipe } from "effect";
import * as Result from "@effect-atom/atom/Result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TodoVM, TodoVMLive, type TodoVM as TodoVMType } from "@/lib/features/todos/TodoVM";
import type { TodoItemVM } from "@/lib/features/todos/TodoItemVM";
import { useVM } from "@/app/runtime";
import * as Loadable from "@/lib/Loadable";


function TodoItemComponent({ item }: { item: TodoItemVM }) {
  const text = useAtomValue(item.text$);
  const completed = useAtomValue(item.completed$);
  const toggle = useAtomSet(item.toggle$);
  const remove = useAtomSet(item.remove$);

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
      <Checkbox checked={completed} onCheckedChange={() => toggle()} />
      <span className={`flex-1 ${completed ? "line-through text-gray-400" : ""}`}>
        {text}
      </span>
      <Button variant="destructive" size="sm" onClick={() => remove()}>
        Remove
      </Button>
    </div>
  );
}

function TodoListContent({ vm }: { vm: TodoVMType }) {
  const todosLoadable = useAtomValue(vm.todos$);
  const totalTodos = useAtomValue(vm.totalCount$)
  const newTodoText = useAtomValue(vm.newTodoText$);
  const statusDisplay = useAtomValue(vm.statusDisplay$);
  const completedCount = useAtomValue(vm.completedCount$);

  const updateText = useAtomSet(vm.updateNewTodoText$);
  const addTodo = useAtomSet(vm.addTodo$);
  const clearCompleted = useAtomSet(vm.clearCompleted$);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Todo List</CardTitle>
        <p className="text-sm text-gray-500">{statusDisplay}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new todo..."
            value={newTodoText}
            onChange={(e) => updateText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <Button onClick={() => addTodo()}>Add</Button>
        </div>

        {Loadable.match(todosLoadable, {
          onPending: () => (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <p className="ml-3 text-gray-500">Loading todos...</p>
            </div>
          ),
          onReady: (todos) => (
            <>
              <p>total {totalTodos} </p>
              <div className="space-y-2">
                {todos.map((item) => (
                  <TodoItemComponent key={item.id} item={item} />
                ))}
                {todos.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    No todos yet. Add one to get started!
                  </p>
                )}
              </div>
              {completedCount > 0 && (
                <Button variant="outline" onClick={() => clearCompleted()} className="w-full">
                  Clear Completed ({completedCount})
                </Button>
              )}
            </>
          ),
        })}
      </CardContent>
    </Card>
  );
}

const LoadingSpinner = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      <p className="ml-3 text-gray-500">Loading...</p>
    </CardContent>
  </Card>
);

const ErrorDisplay = ({ cause }: { cause: unknown }) => (
  <Card>
    <CardContent className="py-8">
      <p className="text-red-500">Error: {String(cause)}</p>
    </CardContent>
  </Card>
);

export function TodoList() {
  const vmResult = useVM(TodoVM, TodoVMLive);

  return pipe(
    vmResult,
    Result.match({
      onInitial: () => <LoadingSpinner />,
      onSuccess: ({ value: vm }) => <TodoListContent vm={vm} />,
      onFailure: ({ cause }) => <ErrorDisplay cause={cause} />,
    })
  );
}
