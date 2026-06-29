import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as PgMigrator from "@effect/sql-pg/PgMigrator";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as NodePath from "node:path";
import { fileURLToPath } from "node:url";
import { PgLive } from "./pg-live.js";

const migrationsDirectory = NodePath.join(
  NodePath.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

const program = PgMigrator.run({
  loader: PgMigrator.fromFileSystem(migrationsDirectory),
}).pipe(
  Effect.tap((migrations) =>
    Console.log(
      migrations.length === 0
        ? "No pending migrations"
        : `Applied ${migrations.length} migration${migrations.length === 1 ? "" : "s"}: ${
          migrations.map(([id, name]) => `${id}_${name}`).join(", ")
        }`,
    )
  ),
  Effect.provide(Layer.mergeAll(PgLive, NodeServices.layer)),
);

BunRuntime.runMain(program);
