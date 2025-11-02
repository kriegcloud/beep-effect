import { describe, expect, test } from "bun:test";
import { BunContext } from "@effect/platform-bun";
import { SqliteClient } from "@effect/sql-sqlite-bun";
// biome-ignore lint/suspicious/noShadowRestrictedNames: But I really, really want to.
import { Effect, Layer, String } from "effect";
import { TodoService } from "./TodoService.js";

/**
 * Shared test suite for TodoService implementations.
 * Tests both in-memory and SQLite backends with the same test cases.
 *
 * This demonstrates Effect's layered architecture - we can test the same
 * service interface with different backing implementations by swapping layers.
 *
 * Run with: bun test
 */
function testTodoService(name: string, getLayer: () => Layer.Layer<TodoService, never, never>) {
  const layer = getLayer();

  describe(`TodoService (${name})`, () => {
    test("should start with empty todos", async () => {
      const program = Effect.gen(function* () {
        const todos = yield* TodoService.getTodos();

        expect(todos).toEqual([]);
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });

    test("should add a todo", async () => {
      const program = Effect.gen(function* () {
        const todo = yield* TodoService.addTodo("Buy milk");

        expect(todo.title).toBe("Buy milk");
        expect(todo.completed).toBe(false);
        expect(typeof todo.id).toBe("number");
        expect(todo.createdAt).toBeDefined();
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });

    test("should get all todos", async () => {
      const program = Effect.gen(function* () {
        yield* TodoService.addTodo("First todo");
        yield* TodoService.addTodo("Second todo");

        const todos = yield* TodoService.getTodos();

        expect(todos.length).toBe(2);
        expect(todos[0]!.title).toBe("Second todo"); // Newest first
        expect(todos[1]!.title).toBe("First todo");
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });

    test("should toggle todo completion", async () => {
      const program = Effect.gen(function* () {
        const todo = yield* TodoService.addTodo("Test todo");

        expect(todo.completed).toBe(false);

        const toggled = yield* TodoService.toggleTodo(todo.id);
        expect(toggled.completed).toBe(true);
        expect(toggled.id).toBe(todo.id);

        const toggledAgain = yield* TodoService.toggleTodo(todo.id);
        expect(toggledAgain.completed).toBe(false);
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });

    test("should delete a todo", async () => {
      const program = Effect.gen(function* () {
        const todo = yield* TodoService.addTodo("Delete me");

        const deletedId = yield* TodoService.deleteTodo(todo.id);
        expect(deletedId).toBe(todo.id);

        const todos = yield* TodoService.getTodos();
        expect(todos.length).toBe(0);
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });

    test("should maintain todo order (newest first)", async () => {
      const program = Effect.gen(function* () {
        const first = yield* TodoService.addTodo("First");
        const second = yield* TodoService.addTodo("Second");
        const third = yield* TodoService.addTodo("Third");

        const todos = yield* TodoService.getTodos();

        expect(todos[0]!.id).toBe(third.id);
        expect(todos[1]!.id).toBe(second.id);
        expect(todos[2]!.id).toBe(first.id);
      }).pipe(Effect.provide(layer));

      await Effect.runPromise(program);
    });
  });
}

// Test SQLite implementation with all required dependencies
// Create a fresh layer for each test to ensure test isolation
testTodoService("SQLite", () =>
  TodoService.Default.pipe(
    Layer.provide(
      SqliteClient.layer({
        filename: ":memory:", // Each test gets a fresh in-memory database
        transformQueryNames: String.camelToSnake,
        transformResultNames: String.snakeToCamel,
      })
    ),
    Layer.provide(BunContext.layer),
    Layer.orDie // Convert errors to defects for testing
  )
);

// Test in-memory implementation
testTodoService("InMemory", () => TodoService.TestLayer);
