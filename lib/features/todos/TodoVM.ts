import { Array, Clock, Context, DateTime, Effect, Layer, Option, PubSub, Schema, Stream, pipe } from "effect";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import * as KeyValueStore from "@effect/platform/KeyValueStore";
import { Todo } from "./Todo";
import type { TodoItemVM } from "./TodoItemVM";
import * as Loadable from "@/lib/Loadable";
import { TodoEventPubSub, type TodoEvent } from "../TodoEvent";

export interface TodoVM {
  readonly todos$: Atom.Atom<Loadable.Loadable<TodoItemVM[]>>;
  readonly newTodoText$: Atom.Writable<string>;
  readonly totalCount$: Atom.Atom<number>;
  readonly completedCount$: Atom.Atom<number>;
  readonly activeCount$: Atom.Atom<number>;
  readonly statusDisplay$: Atom.Atom<string>;
  readonly updateNewTodoText$: Atom.Writable<Option.Option<void>, string>;
  readonly addTodo$: Atom.AtomResultFn<void, void, never>;
  readonly clearCompleted$: Atom.AtomResultFn<void, void, never>;
}

export const TodoVM = Context.GenericTag<TodoVM>("TodoVM");

class TodoServices extends Context.Tag("TodoServices")<
  TodoServices,
  {
    readonly load: Effect.Effect<Todo[]>;
    readonly save: (todos: Todo[]) => Effect.Effect<void>;
  }
>() { }

const TodoServicesLive = Layer.effect(
  TodoServices,
  Effect.gen(function* () {
    const store = yield* KeyValueStore.KeyValueStore;
    const todoStore = store.forSchema(Schema.Array(Todo));
    return {
      load: pipe(
        todoStore.get("todos"),
        Effect.map(Option.getOrElse((): Todo[] => [])),
        Effect.map((todos) => [...todos]),
        Effect.catchAll(() => Effect.succeed([] as Todo[]))
      ),
      save: (todos) => pipe(
        todoStore.set("todos", todos),
        Effect.catchAll(() => Effect.void)
      ),
    };
  })
);

export const TodoVMLive = Layer.effect(
  TodoVM,
  Effect.gen(function* () {
    yield* Effect.log("Built TodoItemVM")
    const registry = yield* Registry.AtomRegistry;
    const services = yield* TodoServices;
    const eventPubSub = yield* TodoEventPubSub;

    const todosState$ = Atom.make<Loadable.Loadable<Todo[]>>(Loadable.pending());
    const newTodoText$ = Atom.make("");

    const makeTodoItemVM = Atom.family((todo: Todo): TodoItemVM => {
      const text$ = pipe(
        todosState$,
        Atom.map(Loadable.match({
          onPending: () => todo.text,
          onReady: (todos) => todos.find((t) => t.id === todo.id)?.text ?? todo.text,
        }))
      );

      const completed$ = pipe(
        todosState$,
        Atom.map(Loadable.match({
          onPending: () => todo.completed,
          onReady: (todos) => todos.find((t) => t.id === todo.id)?.completed ?? todo.completed,
        }))
      );

      const toggle$ = Atom.fn(() =>
        Effect.gen(function* () {
          const reg = yield* Registry.AtomRegistry;
          const current = reg.get(todosState$);
          const currentTodo = Loadable.match(current, {
            onPending: () => todo,
            onReady: (todos) => todos.find((t) => t.id === todo.id) ?? todo,
          });
          const wasCompleted = currentTodo.completed;
          reg.set(todosState$, Loadable.map(current, Array.map((t) =>
            t.id === todo.id ? { ...t, completed: !t.completed } : t
          )));
          yield* PubSub.publish(eventPubSub, {
            type: wasCompleted ? "uncompleted" : "completed",
            todoId: todo.id,
            todoText: currentTodo.text,
          });
        })
      );

      const remove$ = Atom.fn(() =>
        Effect.gen(function* () {
          const reg = yield* Registry.AtomRegistry;
          const current = reg.get(todosState$);
          const currentTodo = Loadable.match(current, {
            onPending: () => todo,
            onReady: (todos) => todos.find((t) => t.id === todo.id) ?? todo,
          });
          reg.set(todosState$, Loadable.map(current, Array.filter((t) => t.id !== todo.id)));
          yield* PubSub.publish(eventPubSub, {
            type: "deleted",
            todoId: todo.id,
            todoText: currentTodo.text,
          });
        })
      );

      return { id: todo.id, text$, completed$, toggle$, remove$ };
    });

    const todos$ = pipe(
      todosState$,
      Atom.map(Loadable.map(Array.map(makeTodoItemVM)))
    );

    const totalCount$ = pipe(
      todosState$,
      Atom.map(Loadable.match({ onPending: () => 0, onReady: (t) => t.length }))
    );

    const completedCount$ = pipe(
      todosState$,
      Atom.map(Loadable.match({ onPending: () => 0, onReady: (t) => t.filter((x) => x.completed).length }))
    );

    const activeCount$ = pipe(
      todosState$,
      Atom.map(Loadable.match({ onPending: () => 0, onReady: (t) => t.filter((x) => !x.completed).length }))
    );

    const statusDisplay$ = pipe(
      todosState$,
      Atom.map(Loadable.match({
        onPending: (since) => `Loading since ${DateTime.formatIso(since)}`,
        onReady: (t) => t.length === 0 ? "No todos" : t.length === 1 ? "1 todo" : `${t.length} todos`,
      }))
    );

    const updateNewTodoText$ = Atom.writable(
      () => Option.none<void>(),
      (ctx, text: string) => ctx.set(newTodoText$, text)
    );

    const addTodo$ = Atom.fn(() =>
      Effect.gen(function* () {
        const text = yield* Atom.get(newTodoText$);
        if (text.length === 0) return;

        const timestamp = yield* Clock.currentTimeMillis;
        const newTodo: Todo = { id: `todo-${timestamp}`, text: text.trim(), completed: false };

        const current = registry.get(todosState$);
        registry.set(todosState$, Loadable.map(current, (todos) => [...todos, newTodo]));
        registry.set(newTodoText$, "");
        yield* PubSub.publish(eventPubSub, {
          type: "created",
          todoId: newTodo.id,
          todoText: newTodo.text,
        });
      })
    );

    const clearCompleted$ = Atom.fn(() =>
      Effect.gen(function* () {
        const reg = yield* Registry.AtomRegistry;
        const current = reg.get(todosState$);
        const completedTodos = Loadable.match(current, {
          onPending: () => [] as Todo[],
          onReady: (todos) => todos.filter((t) => t.completed),
        });
        reg.set(todosState$, Loadable.map(current, Array.filter((t) => !t.completed)));
        yield* PubSub.publishAll(eventPubSub, completedTodos.map((todo) => ({
          type: "deleted" as const,
          todoId: todo.id,
          todoText: todo.text,
        })));
      })
    );

    yield* Effect.forkScoped(
      Effect.gen(function* () {
        const loaded = yield* services.load;
        registry.set(todosState$, Loadable.ready(loaded));
      })
    );

    yield* Effect.forkScoped(
      pipe(
        Registry.toStream(registry, todosState$),
        Stream.filterMap(Loadable.toOption),
        Stream.tap((todos) => services.save(todos)),
        Stream.runDrain
      )
    );

    yield* Effect.forkScoped(
      pipe(
        Registry.toStream(registry, totalCount$),
        Stream.tap((todos) => Effect.log(todos)),
        Stream.runDrain
      )
    );

    return {
      todos$,
      newTodoText$,
      totalCount$,
      completedCount$,
      activeCount$,
      statusDisplay$,
      updateNewTodoText$,
      addTodo$,
      clearCompleted$,
    };
  })
).pipe(Layer.provide(TodoServicesLive), Layer.provide(KeyValueStore.layerMemory));
