import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Effect from "effect/Effect";
import { PgLive } from "../pg-live.js";

const program = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* Effect.log("Dropping all tables...");

  yield* sql`DROP SCHEMA public CASCADE`;
  yield* sql`CREATE SCHEMA public`;

  yield* Effect.log("Database reset complete.");
}).pipe(Effect.provide([PgLive, NodeContext.layer]));

NodeRuntime.runMain(program);
