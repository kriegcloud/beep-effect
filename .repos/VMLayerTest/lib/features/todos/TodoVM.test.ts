import { describe, it, expect } from "vitest";
import { assert } from "chai";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import { TodoVM, TodoVMLive } from "./TodoVM";
import { Context, Effect, Layer } from "effect";
import * as Loadable from "@/lib/Loadable";

describe("TodoVM", () => {
  const makeVM = () => {
    const r = Registry.make();
    const vm = Layer.build(TodoVMLive).pipe(
      Effect.map((ctx) => Context.get(ctx, TodoVM)),
      Effect.scoped,
      Effect.provideService(Registry.AtomRegistry, r),
      Effect.runSync
    );
    // Mount fn atoms
    r.mount(vm.addTodo$);
    r.mount(vm.clearCompleted$);
    return { r, vm };
  };

  describe("initial state", () => {
    it("should start with totalCount of 0", () => {
      const { r, vm } = makeVM();
      const count = r.get(vm.totalCount$);
      expect(count).toBe(0);
    });

    it("should start with completedCount of 0", () => {
      const { r, vm } = makeVM();
      const count = r.get(vm.completedCount$);
      expect(count).toBe(0);
    });

    it("should start with activeCount of 0", () => {
      const { r, vm } = makeVM();
      const count = r.get(vm.activeCount$);
      expect(count).toBe(0);
    });

    it("should start with empty newTodoText", () => {
      const { r, vm } = makeVM();
      const text = r.get(vm.newTodoText$);
      expect(text).toBe("");
    });
  });

  describe("adding todos", () => {
    it("should add a todo", () => {
      const { r, vm } = makeVM();

      // Set new todo text
      r.set(vm.newTodoText$, "Buy milk");

      // Add the todo
      r.set(vm.addTodo$, undefined);

      // Check todos were added
      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(1);

      const firstTodo = todos.value[0];
      const text = r.get(firstTodo.text$);
      expect(text).toBe("Buy milk");

      const completed = r.get(firstTodo.completed$);
      expect(completed).toBe(false);
    });

    it("should not add empty todo", () => {
      const { r, vm } = makeVM();

      // Set empty text
      r.set(vm.newTodoText$, "");

      // Try to add
      r.set(vm.addTodo$, undefined);

      // Check no todos were added
      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(0);
    });

    it("should clear new todo text after adding", () => {
      const { r, vm } = makeVM();

      // Set new todo text
      r.set(vm.newTodoText$, "Buy milk");

      // Add the todo
      r.set(vm.addTodo$, undefined);

      // Check text was cleared
      const text = r.get(vm.newTodoText$);
      expect(text).toBe("");
    });

    it("should trim todo text", () => {
      const { r, vm } = makeVM();

      // Set todo text with leading/trailing spaces
      r.set(vm.newTodoText$, "  Buy milk  ");

      // Add the todo
      r.set(vm.addTodo$, undefined);

      // Check text was trimmed
      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      const text = r.get(todos.value[0].text$);
      expect(text).toBe("Buy milk");
    });

    it("should add a todo and verify count", () => {
      const { r, vm } = makeVM();

      // Add first todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      // Check todo exists
      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(1);

      const text1 = r.get(todos.value[0].text$);
      expect(text1).toBe("Buy milk");
    });
  });

  describe("todo operations", () => {
    it("should toggle todo completion", () => {
      const { r, vm } = makeVM();

      // Add a todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      const todo = todos.value[0];

      // Check initial state
      let completed = r.get(todo.completed$);
      expect(completed).toBe(false);

      // Mount and toggle
      r.mount(todo.toggle$);
      r.set(todo.toggle$, undefined);

      // Check toggled state
      completed = r.get(todo.completed$);
      expect(completed).toBe(true);

      // Toggle again
      r.set(todo.toggle$, undefined);

      // Check toggled back
      completed = r.get(todo.completed$);
      expect(completed).toBe(false);
    });

    it("should remove todo", () => {
      const { r, vm } = makeVM();

      // Add one todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      let todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(1);

      // Remove the todo
      const firstTodo = todos.value[0];
      r.mount(firstTodo.remove$);
      r.set(firstTodo.remove$, undefined);

      // Re-get todos after removal
      todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));

      // Should have 0 todos remaining
      expect(todos.value.length).toBe(0);
    });

    it("should clear completed todos", () => {
      const { r, vm } = makeVM();

      // Add one todo and complete it
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      let todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(1);

      // Toggle todo to completed
      const todo1 = todos.value[0];
      r.mount(todo1.toggle$);
      r.set(todo1.toggle$, undefined);

      // Verify it's completed
      const completed = r.get(todo1.completed$);
      expect(completed).toBe(true);

      // Clear completed
      r.set(vm.clearCompleted$, undefined);

      // Re-get todos after clearing
      todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(0);
    });
  });

  describe("computed counts", () => {
    it("should compute totalCount correctly", () => {
      const { r, vm } = makeVM();

      // Initially 0
      let count = r.get(vm.totalCount$);
      expect(count).toBe(0);

      // Add one todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      count = r.get(vm.totalCount$);
      expect(count).toBe(1);

      // Add another
      r.set(vm.newTodoText$, "Walk dog");
      r.set(vm.addTodo$, undefined);

      count = r.get(vm.totalCount$);
      expect(count).toBe(2);
    });

    it("should compute completedCount and activeCount correctly", () => {
      const { r, vm } = makeVM();

      // Add one todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      // Initially all active
      let completed = r.get(vm.completedCount$);
      let active = r.get(vm.activeCount$);
      expect(completed).toBe(0);
      expect(active).toBe(1);

      // Get todos and mount toggle function
      let todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      const todo1 = todos.value[0];
      r.mount(todo1.toggle$);

      // Toggle to completed
      r.set(todo1.toggle$, undefined);

      completed = r.get(vm.completedCount$);
      active = r.get(vm.activeCount$);
      expect(completed).toBe(1);
      expect(active).toBe(0);

      // Toggle back to active
      r.set(todo1.toggle$, undefined);

      completed = r.get(vm.completedCount$);
      active = r.get(vm.activeCount$);
      expect(completed).toBe(0);
      expect(active).toBe(1);
    });
  });

  describe("status display", () => {
    it("should update statusDisplay based on todo count", () => {
      const { r, vm } = makeVM();

      // Add first todo
      r.set(vm.newTodoText$, "Buy milk");
      r.set(vm.addTodo$, undefined);

      let status = r.get(vm.statusDisplay$);
      expect(status).toBe("1 todo");

      // Get todos and remove it
      let todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      const todo1 = todos.value[0];
      r.mount(todo1.remove$);
      r.set(todo1.remove$, undefined);

      status = r.get(vm.statusDisplay$);
      expect(status).toBe("No todos");
    });
  });

  describe("updateNewTodoText$", () => {
    it("should update newTodoText via writable atom", () => {
      const { r, vm } = makeVM();

      // Initial value
      let text = r.get(vm.newTodoText$);
      expect(text).toBe("");

      // Update via writable
      r.set(vm.updateNewTodoText$, "New text");

      // Check updated
      text = r.get(vm.newTodoText$);
      expect(text).toBe("New text");
    });
  });

  describe("todo order", () => {
    it("should maintain todo when adding", () => {
      const { r, vm } = makeVM();

      // Add a todo
      r.set(vm.newTodoText$, "First");
      r.set(vm.addTodo$, undefined);

      // Re-get todos to ensure we have the latest state
      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));
      expect(todos.value.length).toBe(1);

      const text1 = r.get(todos.value[0].text$);
      expect(text1).toBe("First");
    });
  });

  describe("todo ids", () => {
    it("should have string ids starting with 'todo-'", () => {
      const { r, vm } = makeVM();

      r.set(vm.newTodoText$, "Test");
      r.set(vm.addTodo$, undefined);

      const todos = r.get(vm.todos$);
      assert(Loadable.isReady(todos));

      const id = todos.value[0].id;
      expect(typeof id).toBe("string");
      assert(id.startsWith("todo-"));
    });
  });
});
