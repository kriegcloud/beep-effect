/**
 * Deterministic lost-update race for Drizzle read-modify-write adapters.
 *
 * Fibers cannot force the interleaving on a single PGlite session (each
 * adapter call runs its read and write back to back), so this decorates the
 * `PgClient` instead: the next `UPDATE` against `table` first commits a
 * competing `row_version` bump on the same row, as if another writer landed
 * between the adapter's read and its write.
 */
import { makeDrizzle, NativePgClient } from "@beep/postgres";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as MutableRef from "effect/MutableRef";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

// The Statement accessors drizzle's effect-postgres session executes.
const executingKeys = HashSet.make("raw", "values", "withoutTransform");

const isExecutingKey = (key: PropertyKey): boolean => P.isString(key) && HashSet.has(executingKeys, key);

/**
 * Build a Drizzle database whose next UPDATE against `table` loses a race to a
 * competing write on row `id`.
 */
export const drizzleWithCompetingWrite = Effect.fnUntraced(function* (table: string, id: number) {
  const client = yield* NativePgClient.PgClient;
  const armed = MutableRef.make(true);
  const updatePrefix = `update "${table}"`;
  const competingWrite = client.unsafe(`update "${table}" set "row_version" = "row_version" + 1 where "id" = $1`, [
    id,
  ]).raw;

  const decorated = new Proxy(client, {
    get(target, key, receiver) {
      if (key !== "unsafe") {
        return Reflect.get(target, key, receiver);
      }
      return (sql: string, params?: ReadonlyArray<unknown>) => {
        const statement = target.unsafe(sql, params);
        if (!MutableRef.get(armed) || !Str.startsWith(updatePrefix)(Str.toLowerCase(sql))) {
          return statement;
        }
        MutableRef.set(armed, false);
        return new Proxy(statement, {
          get(inner, innerKey, innerReceiver) {
            const value = Reflect.get(inner, innerKey, innerReceiver);
            // Every executing accessor yields the same `Effect<rows, SqlError>` shape as `raw`.
            return isExecutingKey(innerKey) ? Effect.andThen(competingWrite, value as typeof competingWrite) : value;
          },
        });
      };
    },
  });

  return yield* makeDrizzle().pipe(Effect.provideService(NativePgClient.PgClient, decorated));
});
