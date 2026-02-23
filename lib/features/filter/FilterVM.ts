import { Context, Effect, Layer, Option } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import type { TodoItemVM } from "../todos/TodoItemVM";
import { TodoVM } from "../todos/TodoVM";
import * as Loadable from "@/lib/Loadable";

export type FilterType = "all" | "active" | "completed";

export interface FilterVM {
  readonly currentFilter$: Atom.Writable<FilterType>;
  readonly filteredTodos$: Atom.Atom<Loadable.Loadable<TodoItemVM[]>>;
  readonly setFilter$: Atom.Writable<Option.Option<void>, FilterType>;
}

export const FilterVM = Context.GenericTag<FilterVM>("FilterVM");

export const FilterVMLayer = Layer.effect(
  FilterVM,
  Effect.gen(function* () {
    const todoVM = yield* TodoVM;

    const currentFilter$ = Atom.make<FilterType>("all");

    const filteredTodos$ = Atom.make((get) => {
      const filter = get(currentFilter$);
      const todosLoadable = get(todoVM.todos$);

      return Loadable.map(todosLoadable, (todos) => {
        if (filter === "all") return todos;
        if (filter === "active") return todos.filter((todo) => !get(todo.completed$));
        return todos.filter((todo) => get(todo.completed$));
      });
    });

    const setFilter$ = Atom.fnSync<void, FilterType>((filterType, get) => {
      get.set(currentFilter$, filterType);
    });

    return FilterVM.of({
      currentFilter$,
      filteredTodos$,
      setFilter$,
    });
  })
);
