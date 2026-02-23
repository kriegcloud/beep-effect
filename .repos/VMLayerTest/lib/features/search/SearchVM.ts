import { Context, Effect, Layer, Option, pipe } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import type { TodoItemVM } from "../todos/TodoItemVM";
import { TodoVM } from "../todos/TodoVM";
import * as Loadable from "@/lib/Loadable";

export interface SearchVM {
  readonly query$: Atom.Writable<string>;
  readonly results$: Atom.Atom<Loadable.Loadable<TodoItemVM[]>>;
  readonly isSearching$: Atom.Atom<boolean>;
  readonly resultCount$: Atom.Atom<number>;
  readonly setQuery$: Atom.Writable<Option.Option<void>, string>;
  readonly clearSearch$: Atom.AtomResultFn<void, void, never>;
}

export const SearchVM = Context.GenericTag<SearchVM>("SearchVM");

export const SearchVMLayer = Layer.effect(
  SearchVM,
  Effect.gen(function* () {
    const todoVM = yield* TodoVM;

    const query$ = Atom.make("");

    const results$ = Atom.make((get) => {
      const query = get(query$);
      const todosLoadable = get(todoVM.todos$);

      return Loadable.map(todosLoadable, (items) => {
        if (query.length === 0) return items;
        const lowerQuery = query.toLowerCase();
        return items.filter((item) => get(item.text$).toLowerCase().includes(lowerQuery));
      });
    });

    const isSearching$ = pipe(query$, Atom.map((q) => q.length > 0));

    const resultCount$ = pipe(
      results$,
      Atom.map(Loadable.match({ onPending: () => 0, onReady: (r) => r.length }))
    );

    const setQuery$ = Atom.fnSync<void, string>((newQuery, get) => {
      get.set(query$, newQuery);
    });

    const clearSearch$ = Atom.fn((_: void, get) =>
      Effect.sync(() => get.set(query$, ""))
    );

    return SearchVM.of({
      query$,
      results$,
      isSearching$,
      resultCount$,
      setQuery$,
      clearSearch$,
    });
  })
);
