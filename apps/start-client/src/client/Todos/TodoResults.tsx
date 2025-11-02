import { AddTodoForm } from "@client/components/AddTodoForm.js";
import { TodoFilter } from "@client/components/TodoFilter.js";
import { TodoList } from "@client/components/TodoList.js";
import { TodoStats } from "@client/components/TodoStats.js";
import { TodoClient } from "@client/RpcClient.js";
import { filteredTodosAtom, todosAtom } from "@client/Todos/atoms.js";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type { TodoId } from "@shared/types/TodoId.js";

export function TodoResults() {
  const todos = useAtomValue(filteredTodosAtom);

  const addTodo = useAtomSet(TodoClient.mutation("addTodo"));
  const toggleTodo = useAtomSet(TodoClient.mutation("toggleTodo"));
  const deleteTodo = useAtomSet(TodoClient.mutation("deleteTodo"));
  const handleAddTodo = (title: string) => {
    addTodo({
      payload: title,
      reactivityKeys: ["todos"],
    });
  };

  const handleToggleTodo = (id: TodoId) => {
    toggleTodo({
      payload: id,
      reactivityKeys: ["todos"],
    });
  };

  const handleDeleteTodo = (id: TodoId) => {
    deleteTodo({
      payload: id,
      reactivityKeys: ["todos"],
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-neutral-100">Todo App</h1>
          <TodoStats todos={useAtomValue(todosAtom)} />
        </div>
        <AddTodoForm onAdd={handleAddTodo} />
        <TodoFilter />
        <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
      </div>
    </div>
  );
}
