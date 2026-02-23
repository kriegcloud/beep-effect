import { describe, it, expect } from "vitest";
import { assert } from "chai";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import { StatsVM, StatsVMLayer } from "./StatsVM";
import { TodoVM, TodoVMLive } from "../todos/TodoVM";
import { HistoryVM, HistoryVMLayer } from "../history/HistoryVM";
import { Context, Effect, Layer } from "effect";
import * as Loadable from "@/lib/Loadable";

const BaseLayers = Layer.mergeAll(TodoVMLive, HistoryVMLayer);
const StatsVMWithDeps = StatsVMLayer.pipe(Layer.provideMerge(BaseLayers));

describe("StatsVM", () => {
  const makeVM = () => {
    const r = Registry.make();
    const ctx = Layer.build(StatsVMWithDeps).pipe(
      Effect.scoped,
      Effect.provideService(Registry.AtomRegistry, r),
      Effect.runSync
    );
    const statsVM = Context.get(ctx, StatsVM);
    const todoVM = Context.get(ctx, TodoVM);
    const historyVM = Context.get(ctx, HistoryVM);

    // Mount fn atoms
    r.mount(todoVM.addTodo$);
    r.mount(todoVM.clearCompleted$);
    r.mount(historyVM.recordEvent$);
    r.mount(historyVM.clearHistory$);

    return { r, statsVM, todoVM, historyVM };
  };

  // Helper to get fresh todos and mount their fn atoms
  const getTodos = (r: Registry.Registry, todoVM: TodoVM) => {
    const todos = Loadable.getOrElse(r.get(todoVM.todos$), () => []);
    todos.forEach(todo => {
      r.mount(todo.toggle$);
      r.mount(todo.remove$);
    });
    return todos;
  };

  describe("totalTodos", () => {
    it("should compute totalTodos from TodoVM (starts at 0)", () => {
      const { r, statsVM } = makeVM();
      expect(r.get(statsVM.totalTodos$)).toBe(0);
    });

    it("should update when todos are added", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Test todo");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.totalTodos$)).toBe(1);
    });

    it("should count multiple todos", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "First todo");
      r.set(todoVM.addTodo$, undefined);

      r.set(todoVM.newTodoText$, "Second todo");
      r.set(todoVM.addTodo$, undefined);

      r.set(todoVM.newTodoText$, "Third todo");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.totalTodos$)).toBe(3);
    });
  });

  describe("completedTodos", () => {
    it("should compute completedTodos from TodoVM", () => {
      const { r, statsVM } = makeVM();
      expect(r.get(statsVM.completedTodos$)).toBe(0);
    });

    it("should count completed todos", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.completedTodos$)).toBe(0);

      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);

      expect(r.get(statsVM.completedTodos$)).toBe(1);
    });

    it("should be zero after clearing completed", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);

      expect(r.get(statsVM.completedTodos$)).toBe(1);

      r.set(todoVM.clearCompleted$, undefined);

      expect(r.get(statsVM.completedTodos$)).toBe(0);
    });
  });

  describe("activeTodos", () => {
    it("should compute activeTodos from TodoVM", () => {
      const { r, statsVM } = makeVM();
      expect(r.get(statsVM.activeTodos$)).toBe(0);
    });

    it("should count active todos", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.activeTodos$)).toBe(1);
    });

    it("should decrease when todo is completed", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.activeTodos$)).toBe(1);

      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);

      expect(r.get(statsVM.activeTodos$)).toBe(0);
    });

    it("should increase when completed todo is uncompleted", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      const todos1 = getTodos(r, todoVM);
      r.set(todos1[0].toggle$, undefined);
      expect(r.get(statsVM.activeTodos$)).toBe(0);

      const todos2 = getTodos(r, todoVM);
      r.set(todos2[0].toggle$, undefined);
      expect(r.get(statsVM.activeTodos$)).toBe(1);
    });
  });

  describe("completionRate", () => {
    it("should be 0 when empty", () => {
      const { r, statsVM } = makeVM();
      expect(r.get(statsVM.completionRate$)).toBe(0);
    });

    it("should be 0 when no todos are completed", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      expect(r.get(statsVM.completionRate$)).toBe(0);
    });

    it("should be 0.5 when half done", () => {
      const { r, statsVM, todoVM } = makeVM();

      // Add first todo
      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      // Complete it
      const todos1 = getTodos(r, todoVM);
      r.set(todos1[0].toggle$, undefined);

      // Add second todo (will be active)
      r.set(todoVM.newTodoText$, "Todo 2");
      r.set(todoVM.addTodo$, undefined);

      // Now we have 2 todos, 1 completed, 1 active
      expect(r.get(statsVM.totalTodos$)).toBe(2);
      expect(r.get(statsVM.completedTodos$)).toBe(1);
      expect(r.get(statsVM.activeTodos$)).toBe(1);
      expect(r.get(statsVM.completionRate$)).toBe(0.5);
    });

    it("should be 1 when all done", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);

      expect(r.get(statsVM.completionRate$)).toBe(1);
    });

    it("should update correctly as completion changes", () => {
      const { r, statsVM, todoVM } = makeVM();

      // Add and complete first todo
      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);
      const todos1 = getTodos(r, todoVM);
      r.set(todos1[0].toggle$, undefined);

      // Add second todo (1/2 complete)
      r.set(todoVM.newTodoText$, "Todo 2");
      r.set(todoVM.addTodo$, undefined);
      expect(r.get(statsVM.completionRate$)).toBe(0.5);

      // Add third todo (1/3 complete)
      r.set(todoVM.newTodoText$, "Todo 3");
      r.set(todoVM.addTodo$, undefined);
      expect(r.get(statsVM.completionRate$)).toBeCloseTo(1/3, 5);
    });
  });

  describe("todosCreatedToday", () => {
    it("should compute todosCreatedToday from HistoryVM (record created events)", () => {
      const { r, statsVM, historyVM } = makeVM();

      expect(r.get(statsVM.todosCreatedToday$)).toBe(0);

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-1",
        todoText: "Test todo",
      });

      expect(r.get(statsVM.todosCreatedToday$)).toBe(1);
    });

    it("should count multiple created events", () => {
      const { r, statsVM, historyVM } = makeVM();

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-1",
        todoText: "First todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-2",
        todoText: "Second todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-3",
        todoText: "Third todo",
      });

      expect(r.get(statsVM.todosCreatedToday$)).toBe(3);
    });

    it("should not count non-created events", () => {
      const { r, statsVM, historyVM } = makeVM();

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-1",
        todoText: "Created todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "Created todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "deleted",
        todoId: "todo-2",
        todoText: "Deleted todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "edited",
        todoId: "todo-3",
        todoText: "Edited todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "uncompleted",
        todoId: "todo-4",
        todoText: "Uncompleted todo",
      });

      // Only the "created" event should count
      expect(r.get(statsVM.todosCreatedToday$)).toBe(1);
    });
  });

  describe("todosCompletedToday", () => {
    it("should compute todosCompletedToday from HistoryVM (record completed events)", () => {
      const { r, statsVM, historyVM } = makeVM();

      expect(r.get(statsVM.todosCompletedToday$)).toBe(0);

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "Test todo",
      });

      expect(r.get(statsVM.todosCompletedToday$)).toBe(1);
    });

    it("should count multiple completed events", () => {
      const { r, statsVM, historyVM } = makeVM();

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "First todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-2",
        todoText: "Second todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-3",
        todoText: "Third todo",
      });

      expect(r.get(statsVM.todosCompletedToday$)).toBe(3);
    });

    it("should not count non-completed events", () => {
      const { r, statsVM, historyVM } = makeVM();

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "Completed todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-2",
        todoText: "Created todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "uncompleted",
        todoId: "todo-1",
        todoText: "Uncompleted todo",
      });

      r.set(historyVM.recordEvent$, {
        type: "deleted",
        todoId: "todo-3",
        todoText: "Deleted todo",
      });

      // Only the "completed" event should count
      expect(r.get(statsVM.todosCompletedToday$)).toBe(1);
    });
  });

  describe("integration", () => {
    it("should track all stats together", () => {
      const { r, statsVM, todoVM, historyVM } = makeVM();

      // Initial state
      expect(r.get(statsVM.totalTodos$)).toBe(0);
      expect(r.get(statsVM.completedTodos$)).toBe(0);
      expect(r.get(statsVM.activeTodos$)).toBe(0);
      expect(r.get(statsVM.completionRate$)).toBe(0);
      expect(r.get(statsVM.todosCreatedToday$)).toBe(0);
      expect(r.get(statsVM.todosCompletedToday$)).toBe(0);

      // Add a todo and record creation
      r.set(todoVM.newTodoText$, "First todo");
      r.set(todoVM.addTodo$, undefined);
      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-1",
        todoText: "First todo",
      });

      expect(r.get(statsVM.totalTodos$)).toBe(1);
      expect(r.get(statsVM.completedTodos$)).toBe(0);
      expect(r.get(statsVM.activeTodos$)).toBe(1);
      expect(r.get(statsVM.completionRate$)).toBe(0);
      expect(r.get(statsVM.todosCreatedToday$)).toBe(1);
      expect(r.get(statsVM.todosCompletedToday$)).toBe(0);

      // Complete the todo
      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);
      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "First todo",
      });

      expect(r.get(statsVM.totalTodos$)).toBe(1);
      expect(r.get(statsVM.completedTodos$)).toBe(1);
      expect(r.get(statsVM.activeTodos$)).toBe(0);
      expect(r.get(statsVM.completionRate$)).toBe(1);
      expect(r.get(statsVM.todosCompletedToday$)).toBe(1);

      // Add another todo
      r.set(todoVM.newTodoText$, "Second todo");
      r.set(todoVM.addTodo$, undefined);
      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-2",
        todoText: "Second todo",
      });

      expect(r.get(statsVM.totalTodos$)).toBe(2);
      expect(r.get(statsVM.completedTodos$)).toBe(1);
      expect(r.get(statsVM.activeTodos$)).toBe(1);
      expect(r.get(statsVM.completionRate$)).toBe(0.5);
      expect(r.get(statsVM.todosCreatedToday$)).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("should handle clearing completed todos", () => {
      const { r, statsVM, todoVM } = makeVM();

      r.set(todoVM.newTodoText$, "Todo 1");
      r.set(todoVM.addTodo$, undefined);

      const todos = getTodos(r, todoVM);
      r.set(todos[0].toggle$, undefined);

      expect(r.get(statsVM.totalTodos$)).toBe(1);
      expect(r.get(statsVM.completedTodos$)).toBe(1);

      r.set(todoVM.clearCompleted$, undefined);

      expect(r.get(statsVM.totalTodos$)).toBe(0);
      expect(r.get(statsVM.completedTodos$)).toBe(0);
      expect(r.get(statsVM.activeTodos$)).toBe(0);
      expect(r.get(statsVM.completionRate$)).toBe(0);
    });

    it("should handle clearing history", () => {
      const { r, statsVM, historyVM } = makeVM();

      r.set(historyVM.recordEvent$, {
        type: "created",
        todoId: "todo-1",
        todoText: "Test",
      });

      r.set(historyVM.recordEvent$, {
        type: "completed",
        todoId: "todo-1",
        todoText: "Test",
      });

      expect(r.get(statsVM.todosCreatedToday$)).toBe(1);
      expect(r.get(statsVM.todosCompletedToday$)).toBe(1);

      r.set(historyVM.clearHistory$, undefined);

      expect(r.get(statsVM.todosCreatedToday$)).toBe(0);
      expect(r.get(statsVM.todosCompletedToday$)).toBe(0);
    });
  });
});
