import { SqliteClient, SqliteMigrator } from "@effect/sql-sqlite-bun";
import { Effect, Layer, FileSystem, Path } from "effect";
import { SqlClient} from "effect/unstable/sql";

export const SqliteLayer = (database: string) => SqliteMigrator.layer({
  loader: SqliteMigrator.fromRecord({
    "001_create_tables": Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      yield* sql`CREATE TABLE IF NOT EXISTS txn
                 (
                   id                   INTEGER PRIMARY KEY AUTOINCREMENT,
                   koinlyId             TEXT    NOT NULL,
                   parentId             INTEGER,
                   dateUtc              INTEGER NOT NULL,
                   type                 TEXT    NOT NULL,
                   tag                  TEXT,
                   fromWallet           TEXT,
                   fromWalletId         TEXT,
                   fromAmount           BIGINT,
                   fromCurrency         TEXT,
                   toWallet             TEXT,
                   toWalletId           TEXT,
                   toCurrency           TEXT,
                   toAmount             BIGINT
                                          feeAmount BIGINT,
                   feeCurrency          TEXT,
                   netWorthAmount       BIGINT,
                   netWorthCurrency     TEXT,
                   feeWorthAmount       BIGINT,
                   feeWorthCurrency     TEXT,
                   netValue             BIGINT,
                   feeValue             BIGINT,
                   valueCurrency        TEXT,
                   deleted              BOOLEAN DEFAULT FALSE,
                   fromSource           TEXT,
                   toSource             TEXT,
                   negativeBalances     BOOLEAN DEFAULT FALSE,
                   missingRates         BOOLEAN DEFAULT FALSE,
                   missingCostBasis     BOOLEAN DEFAULT FALSE,
                   syncedToAccountingAt INTEGER,
                   txSrc                TEXT,
                   txDest               TEXT,
                   txHash               TEXT    NOT NULL,
                   description          TEXT
                 )`

      yield* sql`CREATE INDEX IF NOT EXISTS idx_koinlyId ON txn (koinlyId)`
    })
  })
}).pipe(
  Layer.provideMerge(
      SqliteClient.layer({
        filename: database,
      }),
    ),
    Layer.provide(
      Layer.effectDiscard(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem
          const path = yield* Path.Path
          const directory = path.dirname(database)
          if (directory === ".") return
          yield* fs.makeDirectory(directory, { recursive: true })
        }),
      ),
    )
)

