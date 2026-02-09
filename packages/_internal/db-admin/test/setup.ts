import { beforeAll } from "bun:test";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { PgTest } from "./container";

// Warm the Postgres testcontainer once for the whole Bun test run.
// Individual test files still build layers via `layer(PgTest, ...)`, but this
// avoids paying container startup and migration costs per file.
beforeAll(async () => {
  await Effect.runPromise(Layer.build(PgTest).pipe(Effect.scoped));
});
