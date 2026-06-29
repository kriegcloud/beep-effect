import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";

export default Effect.gen(function*() {
  const sql = yield* SqlClient;

  yield* sql`
    CREATE TABLE chats (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     TEXT NOT NULL,
      title       TEXT NOT NULL,
      model       TEXT NOT NULL,
      messages    TEXT NOT NULL DEFAULT '[]',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  yield* sql`CREATE INDEX chats_user_id_idx ON chats (user_id)`;
});
