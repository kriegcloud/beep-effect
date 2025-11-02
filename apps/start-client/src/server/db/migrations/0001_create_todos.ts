import { SqlClient } from "@effect/sql";
import * as Effect from "effect/Effect";

/**
 * Initial migration: Create todos table
 *
 * Schema:
 * - id: Auto-incrementing primary key
 * - title: Todo text (required)
 * - completed: Boolean status (defaults to false)
 * - created_at: Timestamp (auto-set on insert)
 */
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // Create todos table
  yield* sql`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `;

  // Index for filtering by completion status
  yield* sql`
    CREATE INDEX IF NOT EXISTS idx_todos_completed
    ON todos(completed)
  `;

  // Index for ordering by creation date
  yield* sql`
    CREATE INDEX IF NOT EXISTS idx_todos_created_at
    ON todos(created_at DESC)
  `;
});
