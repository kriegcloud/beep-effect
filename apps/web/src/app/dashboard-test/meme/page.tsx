"use client";
import { Atom, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import Button from "@mui/material/Button";
import { Effect, Layer } from "effect";
import { useState } from "react";

type Todo = { id: string; text: string; completed: boolean };

class TodoService extends Effect.Service<TodoService>()("TodoService", {
  accessors: true,
  scoped: Effect.gen(function* () {
    const todos: Map<string, Todo> = new Map();

    const create = Effect.fn(function* (text: string) {
      const id = crypto.randomUUID();
      const todo: Todo = { id, text, completed: false };
      todos.set(id, todo);
      return todo;
    });

    const list = Effect.gen(function* () {
      return Array.from(todos.values());
    });

    const toggle = (id: string) =>
      Effect.sync(() => {
        const todo = todos.get(id);
        if (todo) {
          todos.set(id, { ...todo, completed: !todo.completed });
        }
      });

    const deleteById = (id: string) =>
      Effect.sync(() => {
        todos.delete(id);
      });

    const getById = (id: string) => Effect.sync(() => todos.get(id));

    return { create, list, toggle, deleteById, getById } as const;
  }),
}) {}

const todoRuntime = Atom.runtime(Layer.mergeAll(TodoService.Default));

const todosAtom = todoRuntime.atom(TodoService.list).pipe(Atom.withReactivity(["todos"]));

const todoAtom = Atom.family((id: string) =>
  todoRuntime.atom(TodoService.getById(id)).pipe(Atom.withReactivity(["todos"]))
);

const createTodoAtom = todoRuntime.fn(
  Effect.fn(function* (text: string) {
    return yield* TodoService.create(text);
  }),
  { reactivityKeys: ["todos"] }
);

const toggleTodoAtom = todoRuntime.fn(
  Effect.fn(function* (id: string) {
    yield* TodoService.toggle(id);
  }),
  { reactivityKeys: ["todos"] }
);

const deleteTodoAtom = todoRuntime.fn(
  Effect.fn(function* (id: string) {
    yield* TodoService.deleteById(id);
  }),
  { reactivityKeys: ["todos"] }
);

function CreateTodo() {
  const [text, setText] = useState("");
  const createTodo = useAtomSet(createTodoAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await createTodo(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" />
      <button type="submit">Add</button>
    </form>
  );
}

function TodoList() {
  const todosResult = useAtomValue(todosAtom);

  return (
    <div>
      {Result.match(todosResult, {
        onInitial: () => <div>Loading...</div>,
        onSuccess: (success: { value: Todo[]; waiting: boolean }) => (
          <div>
            {success.value.map((todo: Todo) => (
              <TodoItem key={todo.id} id={todo.id} />
            ))}
          </div>
        ),
        onFailure: (failure) => <div>Error: {String(failure.cause)}</div>,
      })}
    </div>
  );
}

function TodoItem({ id }: { id: string }) {
  const todoResult = useAtomValue(todoAtom(id));
  const toggleTodo = useAtomSet(toggleTodoAtom);
  const deleteTodo = useAtomSet(deleteTodoAtom);

  return Result.match(todoResult, {
    onInitial: () => <div>Loading...</div>,
    onSuccess: (success: { value: Todo | undefined; waiting: boolean }) => {
      const todo = success.value;
      if (!todo) return null;

      return (
        <div>
          <Button onClick={() => toggleTodo(id)}>{todo.completed ? "✓" : "○"}</Button>
          <span>{todo.text}</span>
          <Button onClick={() => deleteTodo(id)}>Delete</Button>
        </div>
      );
    },
    onFailure: () => <div>Failed to load todo</div>,
  });
}

function TodoStats() {
  const todosResult = useAtomValue(todosAtom);

  const stats = Result.isSuccess(todosResult)
    ? {
        total: todosResult.value.length,
        completed: todosResult.value.filter((t: Todo) => t.completed).length,
        remaining: todosResult.value.filter((t: Todo) => !t.completed).length,
      }
    : { total: 0, completed: 0, remaining: 0 };

  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Done: {stats.completed}</div>
      <div>Left: {stats.remaining}</div>
    </div>
  );
}

export default function MemePage() {
  return (
    <div>
      <CreateTodo />
      <TodoList />
      <TodoStats />
    </div>
  );
}
