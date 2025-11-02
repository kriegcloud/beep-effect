import { TodoClient } from "@client/RpcClient.js";
import { Atom, Result } from "@effect-atom/atom-react";
import { filterAtom } from "../components/TodoFilter.js";

export const todosAtom = TodoClient.query("getTodos", void 0, {
  reactivityKeys: ["todos"],
});

export const filteredTodosAtom = Atom.make((get) => {
  const todosResult = get(todosAtom);
  const filter = get(filterAtom);

  return Result.map(todosResult, (todos) =>
    filter === "all"
      ? todos
      : filter === "completed"
        ? todos.filter((t) => t.completed)
        : todos.filter((t) => !t.completed)
  );
});
