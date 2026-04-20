import { Database } from "bun:sqlite";
import {
  DrizzleEffectCache,
  DrizzleEffectLogger,
  type EffectDrizzleDatabase,
  make,
} from "@beep/shared-server/factories/effect-drizzle";
import { Table } from "@beep/shared-tables";
import type { EntityIdLike } from "@beep/shared-tables/table";
import { BunSqliteTestDriver, makeSqlTestLayer, TestDatabaseInfo } from "@beep/test-utils";
import { expect, layer } from "@effect/vitest";
import { eq } from "drizzle-orm";
import type { Cache, MutationOption } from "drizzle-orm/cache/core/cache";
import type { CacheConfig } from "drizzle-orm/cache/core/types";
import { text } from "drizzle-orm/sqlite-core";
import { Context, Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";

const TestUserId: EntityIdLike<"TestUserId", "users", "shared", number> = {
  _tag: "TestUserId",
  slice: "shared",
  tableName: "users",
};

const users = Table.make(TestUserId)({
  name: text("name").notNull(),
});

const schema = { users };

const sqlNowMillis = "(strftime('%s', 'now') * 1000) + (strftime('%f', 'now') - strftime('%S', 'now')) * 1000";

const createUsersTableSql = `
  create table users (
    id integer primary key autoincrement,
    created_at integer not null default (${sqlNowMillis}),
    updated_at integer not null default (${sqlNowMillis}),
    deleted_at integer,
    created_by text default 'app',
    updated_by text default 'app',
    deleted_by text,
    version integer not null default 1,
    source text,
    name text not null
  )
`;

class MemoryDrizzleCache implements Cache {
  private readonly entries = new Map<string, Array<unknown>>();
  private readonly entryTables = new Map<string, Array<string>>();

  readonly stats = {
    hits: 0,
    misses: 0,
    mutations: 0,
    puts: 0,
  };

  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.mutations = 0;
    this.stats.puts = 0;
  }

  strategy() {
    return "explicit" as const;
  }

  async get(
    key: string,
    _tables: string[],
    _isTag: boolean,
    _isAutoInvalidate?: boolean
  ): Promise<Array<unknown> | undefined> {
    const cached = this.entries.get(key);

    if (P.isUndefined(cached)) {
      this.stats.misses += 1;
      return undefined;
    }

    this.stats.hits += 1;
    return [...cached];
  }

  async put(key: string, response: unknown, tables: string[], _isTag: boolean, _config?: CacheConfig): Promise<void> {
    this.stats.puts += 1;

    if (A.isArray(response)) {
      this.entries.set(key, [...response]);
      this.entryTables.set(key, [...tables]);
    }
  }

  async onMutate(params: MutationOption): Promise<void> {
    this.stats.mutations += 1;

    const mutatedTables = normalizeTableNames(params.tables);

    for (const [key, tables] of this.entryTables.entries()) {
      if (tables.some((tableName) => mutatedTables.includes(tableName))) {
        this.entries.delete(key);
        this.entryTables.delete(key);
      }
    }
  }
}

class TestDrizzleResources extends Context.Service<
  TestDrizzleResources,
  {
    readonly cache: MemoryDrizzleCache;
    readonly db: EffectDrizzleDatabase<typeof schema>;
  }
>()("@beep/shared-server/test/EffectDrizzleResources") {}

const normalizeTableNames = (tables: MutationOption["tables"]): ReadonlyArray<string> => {
  if (P.isString(tables)) {
    return [tables];
  }

  return A.isArray(tables) ? A.filter(tables, P.isString) : [];
};

const migrateSchema = Effect.fn("EffectDrizzleE2E.migrateSchema")(function* () {
  const { db } = yield* TestDrizzleResources;

  yield* db.effect.run(createUsersTableSql);
});

const makeDrizzleResourcesLayer = () => {
  const cache = new MemoryDrizzleCache();
  const drizzleServices = Layer.merge(DrizzleEffectLogger.Default, DrizzleEffectCache.layerFromDrizzle(cache));

  return Layer.effect(TestDrizzleResources)(
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo;
      const client = yield* Effect.acquireRelease(
        Effect.sync(() => new Database(info.databasePath)),
        (client) =>
          Effect.sync(() => {
            client.close();
          })
      );
      const db = yield* make<typeof schema>({
        client,
        schema,
      }).pipe(Effect.provide(drizzleServices));

      return TestDrizzleResources.of({
        cache,
        db,
      });
    })
  );
};

const makeSuiteLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: BunSqliteTestDriver,
  });
  const drizzleResourcesLayer = makeDrizzleResourcesLayer().pipe(Layer.provide(sqlLayer));
  const infrastructureLayer = Layer.mergeAll(sqlLayer, drizzleResourcesLayer);
  const migrationLayer = Layer.effectDiscard(migrateSchema()).pipe(Layer.provide(infrastructureLayer));

  return Layer.mergeAll(infrastructureLayer, migrationLayer);
};

layer(makeSuiteLayer())("effect-drizzle Table.make E2E", (it) => {
  it.effect("persists shared default columns and update hooks through the Bun SQLite driver", () =>
    Effect.gen(function* () {
      const { db } = yield* TestDrizzleResources;

      yield* db.insert(users).values({ name: "Ada" });

      const initialRows = yield* db.select().from(users).orderBy(users.id);

      expect(initialRows).toHaveLength(1);
      const initialUser = initialRows[0];

      expect(initialUser).toBeDefined();

      if (P.isUndefined(initialUser)) {
        return;
      }

      expect(initialUser.id).toBe(1);
      expect(initialUser.name).toBe("Ada");
      expect(initialUser.createdBy).toBe("app");
      expect(initialUser.updatedBy).toBe("app");
      expect(initialUser.version).toBe(1);
      expect(initialUser.createdAt).toEqual(expect.any(Number));
      expect(initialUser.updatedAt).toEqual(expect.any(Number));

      yield* db.update(users).set({ name: "Ada Lovelace" }).where(eq(users.id, initialUser.id));

      const updatedRows = yield* db.select().from(users).where(eq(users.id, initialUser.id));

      expect(updatedRows).toHaveLength(1);
      const updatedUser = updatedRows[0];

      expect(updatedUser).toBeDefined();

      if (P.isUndefined(updatedUser)) {
        return;
      }

      expect(updatedUser.name).toBe("Ada Lovelace");
      expect(updatedUser.version).toBe(2);
      expect(updatedUser.updatedAt).toBeGreaterThanOrEqual(initialUser.updatedAt);
    })
  );
});

layer(makeSuiteLayer())("effect-drizzle cache E2E", (it) => {
  it.effect("hydrates cached selects, serves stale reads on cache hits, and invalidates through ORM mutations", () =>
    Effect.gen(function* () {
      const { cache, db } = yield* TestDrizzleResources;

      yield* db.insert(users).values({ name: "Grace" });
      cache.resetStats();

      const cachedQuery = db.select().from(users).orderBy(users.id).$withCache({ tag: "users" });

      const firstRows = yield* cachedQuery;

      expect(A.map(firstRows, (row) => row.name)).toEqual(["Grace"]);
      expect(cache.stats.misses).toBe(1);
      expect(cache.stats.puts).toBe(1);

      yield* db.effect.run("insert into users (name) values ('Bypass')");

      const staleRows = yield* cachedQuery;

      expect(A.map(staleRows, (row) => row.name)).toEqual(["Grace"]);
      expect(cache.stats.hits).toBe(1);

      yield* db.insert(users).values({ name: "Heidi" });

      const refreshedRows = yield* cachedQuery;

      expect(A.map(refreshedRows, (row) => row.name)).toEqual(["Grace", "Bypass", "Heidi"]);
      expect(cache.stats.mutations).toBe(1);
      expect(cache.stats.misses).toBe(2);
      expect(cache.stats.puts).toBe(2);
    })
  );
});
