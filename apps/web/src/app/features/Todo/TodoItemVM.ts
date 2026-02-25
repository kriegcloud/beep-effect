import { $WebId } from "@beep/identity/packages";
import { ServiceMap } from "effect";
import type * as Atom from "effect/unstable/reactivity/Atom";

const $I = $WebId.create("app/features/Todo/TodoItemVM");

export interface TodoItemVM {
  readonly id: string;
  readonly text$: Atom.Atom<string>;
  readonly completed$: Atom.Atom<boolean>;
  readonly toggle$: Atom.AtomResultFn<void, void, never>;
  readonly remove$: Atom.AtomResultFn<void, void, never>;
}

export const TodoItemVM = ServiceMap.Service<TodoItemVM>($I`TodoItemVM`);
