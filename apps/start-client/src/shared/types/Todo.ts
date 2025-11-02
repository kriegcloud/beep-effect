import * as F from "effect/Function";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";
import { TodoIdSchema } from "./TodoId.js";

/**
 * Database representation of a Todo.
 * SQLite stores:
 * - booleans as integers (0 or 1)
 * - timestamps as strings in format "YYYY-MM-DD HH:MM:SS"
 */
const TodoDb = Schema.Struct({
  id: Schema.Number, // SQLite uses INTEGER for auto-increment
  title: Schema.String,
  completed: Schema.Number, // SQLite stores boolean as 0 or 1
  createdAt: Schema.String, // SQLite CURRENT_TIMESTAMP returns string
});

/**
 * Domain model for a Todo item.
 * Uses DateTimeUtc for ISO string representation in the app.
 */
export class Todo extends Schema.Class<Todo>("Todo")({
  id: TodoIdSchema,
  title: Schema.String,
  completed: Schema.Boolean,
  createdAt: Schema.DateTimeUtc,
}) {}

/**
 * Transforms between database and domain representations.
 * - DB: SQLite's native types (number for boolean, string for timestamp)
 * - Domain: Proper types (boolean, ISO string timestamp)
 */
export const TodoFromDb = Schema.transform(TodoDb, Todo, {
  strict: true,
  decode: (db) => ({
    id: db.id as any, // Will be branded by TodoIdSchema
    title: db.title,
    completed: db.completed !== 0, // Convert SQLite 0/1 to boolean
    createdAt: new Date(db.createdAt.replace(" ", "T") + "Z").toISOString(), // Convert SQLite datetime string to ISO
  }),
  encode: (todo) => ({
    id: todo.id as number, // Remove brand for database
    title: todo.title,
    completed: todo.completed ? 1 : 0, // Convert boolean to SQLite 0/1
    createdAt: F.pipe(
      new Date(todo.createdAt).toISOString(),
      Str.replace("T", " "),
      Str.replace("Z", ""),
      Str.split("."),
      (s) => s[0]
    ), // Convert ISO to SQLite format
  }),
});

/**
 * Input schema for creating a new Todo.
 */
export class CreateTodoInput extends Schema.Class<CreateTodoInput>("CreateTodoInput")({
  title: Schema.String,
}) {}
