import * as Effect from "effect/Effect";
import { SqlClient } from "effect/unstable/sql/SqlClient";

export default Effect.gen(function*() {
  const sql = yield* SqlClient;

  yield* sql`
    ALTER TABLE chats
    ADD COLUMN active_run_id UUID NULL
  `;

  yield* sql`CREATE INDEX chats_active_run_id_idx ON chats (active_run_id)`;
});
