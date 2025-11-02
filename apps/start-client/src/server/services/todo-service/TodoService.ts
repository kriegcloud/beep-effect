import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import { SqlClient } from "@effect/sql";
import type { SqlError } from "@effect/sql/SqlError";
import { DbLayer } from "@server/db/client.js";
import { MigrationsLayer, MigrationsLive } from "@server/db/migrations.js";
import { Todo, TodoFromDb } from "@shared/types/Todo.js";
import type { TodoId } from "@shared/types/TodoId.js";
import { TodoNotFoundError, TodoValidationError, UnknownTodoServiceError } from "@shared/types/TodoServiceError.js";
import { DateTime, Effect, Layer, Option, Schema } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

/**
 * Helper to handle SQL errors and convert them to UnknownTodoServiceError.
 */
const handleSqlError = <A, E>(effect: Effect.Effect<A, SqlError>): Effect.Effect<A, UnknownTodoServiceError> =>
  effect.pipe(
    Effect.catchTag("SqlError", (error) =>
      UnknownTodoServiceError.make({
        message: (error as { message?: string }).message ?? "Database operation failed",
      })
    )
  );

/**
 * Helper to decode database rows into validated TodoFromDb array.
 */
const decodeTodoRows = (rows: unknown): Effect.Effect<readonly Todo[], TodoValidationError> =>
  Schema.decodeUnknown(Schema.Array(TodoFromDb))(rows).pipe(
    Effect.mapError((error) =>
      TodoValidationError.make({
        message: String(error.message ?? "Validation failed"),
      })
    )
  );

/**
 * SQLite-backed Todo service using Effect SQL.
 *
 * This service provides CRUD operations for todos with type-safe SQL queries,
 * automatic schema validation, and proper error handling. All operations return
 * typed Effect values that can be composed and managed by Effect's runtime.
 *
 * **Features:**
 * - Type-safe SQL queries with tagged templates
 * - Automatic schema validation and transformation (database rows → domain models)
 * - Proper error handling with typed errors ({@link TodoNotFoundError}, {@link TodoValidationError}, {@link UnknownTodoServiceError})
 * - Idiomatic Effect.gen patterns for readable async code
 *
 * **Available Layers:**
 * - `TodoService.Default` - Provides a SQLite implementation for production use.
 *   Requires {@link MigrationsLayer} and {@link BunFileSystem.layer} dependencies.
 *   Data is persisted to a SQLite database file.
 *
 * - `TodoService.TestLayer` - Provides an in-memory implementation for testing.
 *   Uses a simple array-based storage that's created fresh for each test, ensuring
 *   test isolation without database setup overhead. Perfect for unit testing.
 */
export class TodoService extends Effect.Service<TodoService>()("TodoService", {
  accessors: true,
  dependencies: [DbLayer, MigrationsLive],
  scoped: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    return {
      /**
       * Get all todos ordered by creation date (newest first).
       * Secondary sort by ID DESC to ensure consistent ordering when timestamps are equal.
       */
      getTodos: () =>
        sql<Todo>`SELECT * FROM todos ORDER BY created_at DESC, id DESC`.pipe(
          handleSqlError,
          Effect.flatMap(decodeTodoRows)
        ),

      /**
       * Create a new todo with the given title.
       * Returns the created todo with ID and timestamp.
       */
      addTodo: (title: string) =>
        Effect.gen(function* () {
          const decoded =
            yield* sql<Todo>`INSERT INTO todos ${sql.insert({ title, completed: false })} RETURNING *`.pipe(
              handleSqlError,
              Effect.flatMap(decodeTodoRows)
            );

          if (!decoded[0]) {
            return yield* UnknownTodoServiceError.make({ message: "Failed to create todo" });
          }

          return decoded[0];
        }),

      /**
       * Toggle the completion status of a todo by ID.
       * Fails with TodoNotFoundError if the todo doesn't exist.
       */
      toggleTodo: (id: TodoId) =>
        Effect.gen(function* () {
          const decoded =
            yield* sql<Todo>`UPDATE todos SET completed = NOT completed WHERE id = ${id} RETURNING *`.pipe(
              handleSqlError,
              Effect.flatMap(decodeTodoRows)
            );

          const result = Option.fromNullable(decoded[0]);

          return yield* Option.match(result, {
            onNone: () => TodoNotFoundError.make({ id }),
            onSome: Effect.succeed,
          });
        }),

      /**
       * Delete a todo by ID.
       * Returns the deleted ID, or fails with TodoNotFoundError if not found.
       */
      deleteTodo: (id: TodoId) =>
        Effect.gen(function* () {
          // First check if the todo exists
          const existing = yield* handleSqlError(sql<Todo>`SELECT * FROM todos WHERE id = ${id}`);

          if (existing.length === 0) {
            return yield* TodoNotFoundError.make({ id });
          }

          // Delete the todo
          yield* handleSqlError(sql`DELETE FROM todos WHERE id = ${id}`);

          return id;
        }),
    } as const;
  }),
}) {
  /**
   * Test layer that provides an in-memory implementation for testing.
   * Uses a simple array-based storage that's created fresh for each test, ensuring
   * test isolation without database setup overhead. Perfect for unit testing.
   */
  static readonly TestLayer = Layer.effect(
    TodoService,
    Effect.sync(() => {
      let idCounter = 0;
      const todos: Todo[] = [];

      const addTodo = (title: string) =>
        Effect.sync(() => {
          const newTodo = Todo.make({
            id: idCounter++ as TodoId,
            title,
            completed: false,
            createdAt: DateTime.unsafeMake(new Date().toISOString()),
          });
          todos.push(newTodo);
          return newTodo;
        });

      const getTodos = () =>
        Effect.sync(() => {
          // Return todos in reverse order (newest first) to match SQL implementation
          return [...todos].reverse() as readonly Todo[];
        });

      const toggleTodo = (id: TodoId) =>
        Effect.gen(function* () {
          const todoOptionIndex = F.pipe(
            todos,
            A.findFirstIndex((t) => t.id === id)
          );
          if (O.isNone(todoOptionIndex)) {
            return yield* TodoNotFoundError.make({ id });
          }

          const todo = O.getOrThrow(O.fromNullable(todos[todoOptionIndex.value]));
          const updatedTodo = Todo.make({
            id: todo.id,
            title: todo.title,
            completed: !todo.completed,
            createdAt: todo.createdAt,
          });
          todos[todoOptionIndex.value] = updatedTodo;
          return updatedTodo;
        });

      const deleteTodo = (id: TodoId) =>
        Effect.gen(function* () {
          const index = todos.findIndex((t) => t.id === id);
          if (index === -1) {
            return yield* TodoNotFoundError.make({ id });
          }
          todos.splice(index, 1);
          return id;
        });

      return TodoService.make({
        addTodo,
        getTodos,
        toggleTodo,
        deleteTodo,
      });
    })
  );
}
