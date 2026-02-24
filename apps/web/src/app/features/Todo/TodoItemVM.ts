import * as ServiceMap from "effect/ServiceMap";
import type * as Atom from "effect/unstable/reactivity/Atom";

export interface TodoItemVM {
  readonly id: string;
  readonly text$: Atom.Atom<string>;
  readonly completed$: Atom.Atom<boolean>;
  readonly toggle$: Atom.AtomResultFn<void, void, never>;
  readonly remove$: Atom.AtomResultFn<void, void, never>;
}

export const TodoItemVM = ServiceMap.Service<TodoItemVM>("TodoItemVM");
