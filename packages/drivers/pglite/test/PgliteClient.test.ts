import { PgliteClient, PgliteError, PgliteTestLayer } from "@beep/pglite";
import * as Pg from "@effect/sql-pg/PgClient";
import { describe, expect, it, layer } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as SqlClient from "effect/unstable/sql/SqlClient";

describe("PgliteError", () => {
  it("normalizes an unknown failure into the tagged driver error", () => {
    const error = PgliteError.fromUnknown("connect", new Error("boom"));

    expect(error).toBeInstanceOf(PgliteError);
    expect(error._tag).toBe("PgliteError");
    expect(error.operation).toBe("connect");
    expect(O.getOrNull(error.message)).toBe("boom");
  });
});

layer(PgliteTestLayer)("PgliteClient (in-memory)", (it) => {
  it.effect("executes PostgreSQL-dialect SQL through the generic SqlClient", () =>
    Effect.gen(function* () {
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();
      yield* sql`CREATE TABLE notes (id SERIAL PRIMARY KEY, body TEXT NOT NULL)`;
      yield* sql`INSERT INTO notes (body) VALUES ('hello'), ('world')`;
      const rows = yield* sql<{ readonly body: string }>`SELECT body FROM notes ORDER BY id`;

      expect(rows.map((row) => row.body)).toEqual(["hello", "world"]);
    })
  );

  it.effect("aliases the in-process client under the @effect/sql-pg PgClient tag", () =>
    Effect.gen(function* () {
      const pg = yield* Pg.PgClient;
      const pglite = yield* PgliteClient;

      // The tag-shim exposes the very same PgliteClient value under the PgClient
      // tag, which is what lets drizzle-orm/effect-postgres run in-process.
      expect(pg).toBe(pglite);
    })
  );
});
