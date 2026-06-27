import * as PgClient from "@effect/sql-pg/PgClient";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import * as Pg from "pg";

export const pgConfig = {
  transformQueryNames: Str.camelToSnake,
  transformResultNames: Str.snakeToCamel,
  transformJson: true,
  types: {
    getTypeParser: (oid: number, format?: string) => {
      if (oid === 1114 || oid === 1184) {
        return (val: string) => val;
      }
      return Pg.types.getTypeParser(oid, format as any);
    },
  },
} as const;

export const PgLive = Layer.unwrap(
  Effect.gen(function*() {
    const databaseUrl = yield* Config.redacted("DATABASE_URL");
    return PgClient.layer({
      url: databaseUrl,
      ...pgConfig,
    });
  }),
).pipe(Layer.orDie);
