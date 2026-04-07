/**
 * Koinly-focused SQLite scratchpad persistence layer.
 *
 * @module scratchpad/Sqlite
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { FilePath, TaggedErrorClass } from "@beep/schema";
import { PosInt } from "@beep/schema/Int";
import { EvmAddress } from "@beep/schema/blockchain/EvmAddress";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as SqliteClient from "@effect/sql-sqlite-bun/SqliteClient";
import * as SqliteMigrator from "@effect/sql-sqlite-bun/SqliteMigrator";
import { BigDecimal, DateTime, Effect, FileSystem, Layer, Path, ServiceMap, pipe } from "effect";
import { dual } from "effect/Function";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import {
  KoinlyDecimal,
  KoinlyId,
  KoinlyTransactionReference,
  KoinlyWalletId,
} from "./koinly/KoinlyPrimitives.ts";
import {
  KoinlySource,
  KoinlyTag,
  KoinlyTransaction,
  KoinlyTransactionType,
} from "./koinly/KoinlyTransaction.ts";
import {
  KoinlyCurrencyRef,
  KoinlyCurrencySymbol,
  KoinlyWalletName,
  KoinlyWalletRef,
  KoinlyWalletSlug,
} from "./koinly/KoinlyRefs.ts";

const $I = $ScratchId.create("Sqlite");

/**
 * Configuration for the scratchpad Koinly SQLite database.
 *
 * @category Configuration
 * @since 0.0.0
 * @example
 * ```ts
 * import { KoinlySqliteConfig } from "./Sqlite.ts"
 *
 * const config = new KoinlySqliteConfig({
 *   filename: "/tmp/koinly.sqlite",
 * })
 *
 * void config
 * ```
 */
export class KoinlySqliteConfig extends S.Class<KoinlySqliteConfig>($I`KoinlySqliteConfig`)(
  {
    filename: FilePath,
  },
  $I.annote("KoinlySqliteConfig", {
    description: "Configuration for the scratchpad Koinly SQLite database.",
  })
) {}

/**
 * Typed error for the scratchpad Koinly SQLite boundary.
 *
 * @category Errors
 * @since 0.0.0
 */
export class KoinlySqliteError extends TaggedErrorClass<KoinlySqliteError>($I`KoinlySqliteError`)(
  "KoinlySqliteError",
  {
    cause: S.DefectWithStack,
    message: S.String,
  },
  $I.annote("KoinlySqliteError", {
    description: "Typed error for the scratchpad Koinly SQLite boundary.",
  })
) {
  /**
   * Construct a `KoinlySqliteError` from a cause and a user-facing message.
   *
   * @since 0.0.0
   */
  static readonly make: {
    (cause: unknown, message: string): KoinlySqliteError;
    (message: string): (cause: unknown) => KoinlySqliteError;
  } = dual(2, (cause: unknown, message: string): KoinlySqliteError => new KoinlySqliteError({ cause, message }));
}

class KoinlyTransactionRow extends S.Class<KoinlyTransactionRow>($I`KoinlyTransactionRow`)(
  {
    koinly_id: KoinlyId,
    parent_koinly_id: S.OptionFromNullOr(KoinlyId),
    date_utc: S.DateTimeUtcFromMillis,
    type: KoinlyTransactionType,
    tag: S.OptionFromNullOr(KoinlyTag),
    from_wallet_name: S.OptionFromNullOr(KoinlyWalletName),
    from_wallet_slug: S.OptionFromNullOr(KoinlyWalletSlug),
    from_wallet_id: S.OptionFromNullOr(KoinlyWalletId),
    from_amount: KoinlyDecimal,
    from_currency_symbol: S.OptionFromNullOr(KoinlyCurrencySymbol),
    from_currency_koinly_id: S.OptionFromNullOr(PosInt),
    to_wallet_name: S.OptionFromNullOr(KoinlyWalletName),
    to_wallet_slug: S.OptionFromNullOr(KoinlyWalletSlug),
    to_wallet_id: S.OptionFromNullOr(KoinlyWalletId),
    to_amount: KoinlyDecimal,
    to_currency_symbol: S.OptionFromNullOr(KoinlyCurrencySymbol),
    to_currency_koinly_id: S.OptionFromNullOr(PosInt),
    fee_amount: KoinlyDecimal,
    fee_currency_symbol: S.OptionFromNullOr(KoinlyCurrencySymbol),
    fee_currency_koinly_id: S.OptionFromNullOr(PosInt),
    net_worth_amount: S.OptionFromNullOr(KoinlyDecimal),
    net_worth_currency_symbol: S.OptionFromNullOr(KoinlyCurrencySymbol),
    net_worth_currency_koinly_id: S.OptionFromNullOr(PosInt),
    fee_worth_amount: S.OptionFromNullOr(KoinlyDecimal),
    fee_worth_currency_symbol: S.OptionFromNullOr(KoinlyCurrencySymbol),
    fee_worth_currency_koinly_id: S.OptionFromNullOr(PosInt),
    net_value: KoinlyDecimal,
    fee_value: KoinlyDecimal,
    value_currency_symbol: KoinlyCurrencySymbol,
    value_currency_koinly_id: PosInt,
    deleted: S.BooleanFromBit,
    from_source: S.OptionFromNullOr(KoinlySource),
    to_source: S.OptionFromNullOr(KoinlySource),
    negative_balances: S.BooleanFromBit,
    missing_rates: S.BooleanFromBit,
    missing_cost_basis: S.OptionFromNullOr(KoinlyDecimal),
    synced_to_accounting_at: S.OptionFromNullOr(S.DateTimeUtcFromMillis),
    tx_src: S.OptionFromNullOr(EvmAddress),
    tx_dest: S.OptionFromNullOr(EvmAddress),
    tx_hash: S.OptionFromNullOr(KoinlyTransactionReference),
    description: S.OptionFromNullOr(NonEmptyTrimmedStr),
  },
  $I.annote("KoinlyTransactionRow", {
    description: "SQLite row shape for normalized Koinly transactions.",
  })
) {}

const decodeKoinlyTransactionRow = S.decodeUnknownEffect(KoinlyTransactionRow);

const toNullable = <A>(value: O.Option<A>): A | null => O.getOrNull(value);

const decimalText = (value: KoinlyTransaction["fromAmount"]): string => BigDecimal.format(value);

const decimalOptionText = (value: O.Option<KoinlyTransaction["fromAmount"]>): string | null =>
  pipe(
    value,
    O.match({
      onNone: () => null,
      onSome: decimalText,
    })
  );

const walletName = (value: O.Option<KoinlyWalletRef>): string | null =>
  pipe(
    value,
    O.match({
      onNone: () => null,
      onSome: ({ name }) => name,
    })
  );

const walletSlug = (value: O.Option<KoinlyWalletRef>): string | null =>
  pipe(
    value,
    O.match({
      onNone: () => null,
      onSome: ({ slug }) => slug,
    })
  );

const currencySymbol = (value: O.Option<KoinlyCurrencyRef>): string | null =>
  pipe(
    value,
    O.match({
      onNone: () => null,
      onSome: ({ symbol }) => symbol,
    })
  );

const currencyId = (value: O.Option<KoinlyCurrencyRef>): number | null =>
  pipe(
    value,
    O.match({
      onNone: () => null,
      onSome: ({ koinlyId }) => koinlyId,
    })
  );

const decodeOptionalWalletRef = Effect.fn("KoinlySqlite.decodeOptionalWalletRef")(function* (
  name: O.Option<KoinlyWalletName>,
  slug: O.Option<KoinlyWalletSlug>
) {
  if (O.isSome(name) && O.isSome(slug)) {
    const walletRef = new KoinlyWalletRef({
      name: name.value,
      slug: slug.value,
    });

    return O.some(walletRef);
  }

  return O.none<KoinlyWalletRef>();
});

const decodeOptionalCurrencyRef = Effect.fn("KoinlySqlite.decodeOptionalCurrencyRef")(function* (
  symbol: O.Option<KoinlyCurrencySymbol>,
  koinlyId: O.Option<PosInt>
) {
  if (O.isSome(symbol) && O.isSome(koinlyId)) {
    const currencyRef = new KoinlyCurrencyRef({
      symbol: symbol.value,
      koinlyId: koinlyId.value,
    });

    return O.some(currencyRef);
  }

  return O.none<KoinlyCurrencyRef>();
});

const transactionRowToModel = Effect.fn("KoinlySqlite.transactionRowToModel")(function* (row: KoinlyTransactionRow) {
  const fromWallet = yield* decodeOptionalWalletRef(row.from_wallet_name, row.from_wallet_slug);
  const fromCurrency = yield* decodeOptionalCurrencyRef(row.from_currency_symbol, row.from_currency_koinly_id);
  const toWallet = yield* decodeOptionalWalletRef(row.to_wallet_name, row.to_wallet_slug);
  const toCurrency = yield* decodeOptionalCurrencyRef(row.to_currency_symbol, row.to_currency_koinly_id);
  const feeCurrency = yield* decodeOptionalCurrencyRef(row.fee_currency_symbol, row.fee_currency_koinly_id);
  const netWorthCurrency = yield* decodeOptionalCurrencyRef(
    row.net_worth_currency_symbol,
    row.net_worth_currency_koinly_id
  );
  const feeWorthCurrency = yield* decodeOptionalCurrencyRef(
    row.fee_worth_currency_symbol,
    row.fee_worth_currency_koinly_id
  );
  const valueCurrency = new KoinlyCurrencyRef({
    symbol: row.value_currency_symbol,
    koinlyId: row.value_currency_koinly_id,
  });

  return new KoinlyTransaction({
    koinlyId: row.koinly_id,
    parentId: row.parent_koinly_id,
    dateUtc: row.date_utc,
    type: row.type,
    tag: row.tag,
    fromWallet,
    fromWalletId: row.from_wallet_id,
    fromAmount: row.from_amount,
    fromCurrency,
    toWallet,
    toWalletId: row.to_wallet_id,
    toAmount: row.to_amount,
    toCurrency,
    feeAmount: row.fee_amount,
    feeCurrency,
    netWorthAmount: row.net_worth_amount,
    netWorthCurrency,
    feeWorthAmount: row.fee_worth_amount,
    feeWorthCurrency,
    netValue: row.net_value,
    feeValue: row.fee_value,
    valueCurrency,
    deleted: row.deleted,
    fromSource: row.from_source,
    toSource: row.to_source,
    negativeBalances: row.negative_balances,
    missingRates: row.missing_rates,
    missingCostBasis: row.missing_cost_basis,
    syncedToAccountingAt: row.synced_to_accounting_at,
    txSrc: row.tx_src,
    txDest: row.tx_dest,
    txHash: row.tx_hash,
    description: row.description,
  });
});

/**
 * Service contract for Koinly transaction persistence in scratchpad SQLite.
 *
 * @category PortContract
 * @since 0.0.0
 */
export interface KoinlySqliteShape {
  readonly getTransactionByKoinlyId: (koinlyId: KoinlyId) => Effect.Effect<O.Option<KoinlyTransaction>, KoinlySqliteError>;
  readonly importTransactions: (transactions: ReadonlyArray<KoinlyTransaction>) => Effect.Effect<number, KoinlySqliteError>;
  readonly listTransactionsByParentId: (
    parentId: KoinlyId
  ) => Effect.Effect<ReadonlyArray<KoinlyTransaction>, KoinlySqliteError>;
  readonly listTransactionsByTxHash: (
    txHash: KoinlyTransactionReference
  ) => Effect.Effect<ReadonlyArray<KoinlyTransaction>, KoinlySqliteError>;
  readonly listTransactionsWithMissingCostBasis: Effect.Effect<ReadonlyArray<KoinlyTransaction>, KoinlySqliteError>;
  readonly listTransactionsWithMissingRates: Effect.Effect<ReadonlyArray<KoinlyTransaction>, KoinlySqliteError>;
  readonly listTransactionsWithNegativeBalances: Effect.Effect<ReadonlyArray<KoinlyTransaction>, KoinlySqliteError>;
}

/**
 * Service tag for the scratchpad Koinly SQLite repository.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class KoinlySqlite extends ServiceMap.Service<KoinlySqlite, KoinlySqliteShape>()($I`KoinlySqlite`) {
  /**
   * Live Bun-backed layer for the Koinly SQLite repository.
   *
   * @since 0.0.0
   */
  static readonly layer = (config: KoinlySqliteConfig) => {
    const sqliteLayer = makeSqliteClientLayer(config);
    const preparedSqliteLayer = Layer.merge(
      sqliteLayer,
      SqliteMigrator.layer({
        loader: SqliteMigrator.fromRecord({
          "001_koinly_transactions": Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;
            const transactionsTable = sql("koinly_transactions");

            yield* sql`PRAGMA busy_timeout = 5000`;
            yield* sql`
              CREATE TABLE IF NOT EXISTS ${transactionsTable} (
                koinly_id TEXT PRIMARY KEY,
                parent_koinly_id TEXT,
                date_utc INTEGER NOT NULL,
                type TEXT NOT NULL,
                tag TEXT,
                from_wallet_name TEXT,
                from_wallet_slug TEXT,
                from_wallet_id TEXT,
                from_amount TEXT NOT NULL,
                from_currency_symbol TEXT,
                from_currency_koinly_id INTEGER,
                to_wallet_name TEXT,
                to_wallet_slug TEXT,
                to_wallet_id TEXT,
                to_amount TEXT NOT NULL,
                to_currency_symbol TEXT,
                to_currency_koinly_id INTEGER,
                fee_amount TEXT NOT NULL,
                fee_currency_symbol TEXT,
                fee_currency_koinly_id INTEGER,
                net_worth_amount TEXT,
                net_worth_currency_symbol TEXT,
                net_worth_currency_koinly_id INTEGER,
                fee_worth_amount TEXT,
                fee_worth_currency_symbol TEXT,
                fee_worth_currency_koinly_id INTEGER,
                net_value TEXT NOT NULL,
                fee_value TEXT NOT NULL,
                value_currency_symbol TEXT NOT NULL,
                value_currency_koinly_id INTEGER NOT NULL,
                deleted INTEGER NOT NULL DEFAULT 0,
                from_source TEXT,
                to_source TEXT,
                negative_balances INTEGER NOT NULL DEFAULT 0,
                missing_rates INTEGER NOT NULL DEFAULT 0,
                missing_cost_basis TEXT,
                synced_to_accounting_at INTEGER,
                tx_src TEXT,
                tx_dest TEXT,
                tx_hash TEXT,
                description TEXT
              )
            `;
            yield* sql`
              CREATE INDEX IF NOT EXISTS koinly_transactions_by_parent_koinly_id
              ON ${transactionsTable} (parent_koinly_id)
            `;
            yield* sql`
              CREATE INDEX IF NOT EXISTS koinly_transactions_by_tx_hash
              ON ${transactionsTable} (tx_hash)
            `;
            yield* sql`
              CREATE INDEX IF NOT EXISTS koinly_transactions_by_negative_balances
              ON ${transactionsTable} (negative_balances)
            `;
            yield* sql`
              CREATE INDEX IF NOT EXISTS koinly_transactions_by_missing_rates
              ON ${transactionsTable} (missing_rates)
            `;
            yield* sql`
              CREATE INDEX IF NOT EXISTS koinly_transactions_by_missing_cost_basis
              ON ${transactionsTable} (missing_cost_basis)
            `;
          }),
        }),
      }).pipe(Layer.provide(sqliteLayer))
    );

    return Layer.effect(
      KoinlySqlite,
      makeKoinlySqlite().pipe(
        Effect.withSpan("KoinlySqlite.make"),
        Effect.annotateLogs({ component: "koinly-sqlite" })
      )
    ).pipe(Layer.provide(preparedSqliteLayer));
  };
}

const makeSqliteClientLayer = (config: KoinlySqliteConfig) => {
  const fileSystemLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);

  return Layer.unwrap(
    Effect.gen(function* () {
      const fileSystemContext = yield* Layer.build(fileSystemLayer);

      return yield* Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const directory = path.dirname(config.filename);

        yield* fs.makeDirectory(directory, { recursive: true });

        return SqliteClient.layer({
          create: true,
          filename: config.filename,
        });
      }).pipe(Effect.provide(fileSystemContext));
    })
  );
};

const makeKoinlySqlite = Effect.fn("KoinlySqlite.makeKoinlySqlite")(function* () {
  const sql = yield* SqlClient.SqlClient;
  const transactionsTable = sql("koinly_transactions");
  const toSqliteError = KoinlySqliteError.make;

  const decodeRows = Effect.fn("KoinlySqlite.decodeRows")(function* (
    rows: ReadonlyArray<unknown>,
    message: string
  ) {
    return yield* Effect.forEach(rows, (row) =>
      decodeKoinlyTransactionRow(row).pipe(
        Effect.flatMap(transactionRowToModel),
        Effect.mapError(toSqliteError(message))
      )
    );
  });

  const getTransactionByKoinlyId: KoinlySqliteShape["getTransactionByKoinlyId"] = Effect.fn(
    "KoinlySqlite.getTransactionByKoinlyId"
  )(function* (koinlyId: KoinlyId) {
    yield* Effect.annotateCurrentSpan({ koinly_id: koinlyId });

    const rows = yield* sql<KoinlyTransactionRow>`
      SELECT *
      FROM ${transactionsTable}
      WHERE koinly_id = ${koinlyId}
      LIMIT 1
    `.pipe(Effect.mapError(toSqliteError(`Failed to load transaction "${koinlyId}".`)));

    return yield* pipe(
      rows,
      A.head,
      O.match({
        onNone: () => Effect.succeed(O.none<KoinlyTransaction>()),
        onSome: (row) =>
          decodeKoinlyTransactionRow(row).pipe(
            Effect.flatMap(transactionRowToModel),
            Effect.map(O.some),
            Effect.mapError(toSqliteError(`Failed to decode transaction "${koinlyId}".`))
          ),
      })
    );
  });

  const listTransactionsByParentId: KoinlySqliteShape["listTransactionsByParentId"] = Effect.fn(
    "KoinlySqlite.listTransactionsByParentId"
  )(function* (parentId: KoinlyId) {
    yield* Effect.annotateCurrentSpan({ parent_koinly_id: parentId });

    const rows = yield* sql<KoinlyTransactionRow>`
      SELECT *
      FROM ${transactionsTable}
      WHERE parent_koinly_id = ${parentId}
      ORDER BY date_utc ASC, koinly_id ASC
    `.pipe(Effect.mapError(toSqliteError(`Failed to list transactions for parent "${parentId}".`)));

    return yield* decodeRows(rows, `Failed to decode transactions for parent "${parentId}".`);
  });

  const listTransactionsByTxHash: KoinlySqliteShape["listTransactionsByTxHash"] = Effect.fn(
    "KoinlySqlite.listTransactionsByTxHash"
  )(function* (txHash: KoinlyTransactionReference) {
    yield* Effect.annotateCurrentSpan({ tx_hash: txHash });

    const rows = yield* sql<KoinlyTransactionRow>`
      SELECT *
      FROM ${transactionsTable}
      WHERE tx_hash = ${txHash}
      ORDER BY date_utc ASC, koinly_id ASC
    `.pipe(Effect.mapError(toSqliteError(`Failed to list transactions for tx hash "${txHash}".`)));

    return yield* decodeRows(rows, `Failed to decode transactions for tx hash "${txHash}".`);
  });

  const listTransactionsWithMissingCostBasis: KoinlySqliteShape["listTransactionsWithMissingCostBasis"] = sql<
    KoinlyTransactionRow
  >`
    SELECT *
    FROM ${transactionsTable}
    WHERE missing_cost_basis IS NOT NULL
    ORDER BY date_utc ASC, koinly_id ASC
  `.pipe(
    Effect.flatMap((rows) => decodeRows(rows, "Failed to decode transactions with missing cost basis.")),
    Effect.mapError(toSqliteError("Failed to list transactions with missing cost basis.")),
    Effect.annotateLogs({ component: "koinly-sqlite" }),
    Effect.withSpan("KoinlySqlite.listTransactionsWithMissingCostBasis")
  );

  const listTransactionsWithMissingRates: KoinlySqliteShape["listTransactionsWithMissingRates"] = sql<
    KoinlyTransactionRow
  >`
    SELECT *
    FROM ${transactionsTable}
    WHERE missing_rates = 1
    ORDER BY date_utc ASC, koinly_id ASC
  `.pipe(
    Effect.flatMap((rows) => decodeRows(rows, "Failed to decode transactions with missing rates.")),
    Effect.mapError(toSqliteError("Failed to list transactions with missing rates.")),
    Effect.annotateLogs({ component: "koinly-sqlite" }),
    Effect.withSpan("KoinlySqlite.listTransactionsWithMissingRates")
  );

  const listTransactionsWithNegativeBalances: KoinlySqliteShape["listTransactionsWithNegativeBalances"] = sql<
    KoinlyTransactionRow
  >`
    SELECT *
    FROM ${transactionsTable}
    WHERE negative_balances = 1
    ORDER BY date_utc ASC, koinly_id ASC
  `.pipe(
    Effect.flatMap((rows) => decodeRows(rows, "Failed to decode transactions with negative balances.")),
    Effect.mapError(toSqliteError("Failed to list transactions with negative balances.")),
    Effect.annotateLogs({ component: "koinly-sqlite" }),
    Effect.withSpan("KoinlySqlite.listTransactionsWithNegativeBalances")
  );

  const importTransactions: KoinlySqliteShape["importTransactions"] = Effect.fn("KoinlySqlite.importTransactions")(
    function* (transactions: ReadonlyArray<KoinlyTransaction>) {
      yield* Effect.annotateCurrentSpan({ transaction_count: transactions.length });

      if (A.isReadonlyArrayEmpty(transactions)) {
        return 0;
      }

      yield* sql
        .withTransaction(
          Effect.forEach(transactions, (transaction: KoinlyTransaction) =>
            sql`
              INSERT INTO ${transactionsTable} (
                koinly_id,
                parent_koinly_id,
                date_utc,
                type,
                tag,
                from_wallet_name,
                from_wallet_slug,
                from_wallet_id,
                from_amount,
                from_currency_symbol,
                from_currency_koinly_id,
                to_wallet_name,
                to_wallet_slug,
                to_wallet_id,
                to_amount,
                to_currency_symbol,
                to_currency_koinly_id,
                fee_amount,
                fee_currency_symbol,
                fee_currency_koinly_id,
                net_worth_amount,
                net_worth_currency_symbol,
                net_worth_currency_koinly_id,
                fee_worth_amount,
                fee_worth_currency_symbol,
                fee_worth_currency_koinly_id,
                net_value,
                fee_value,
                value_currency_symbol,
                value_currency_koinly_id,
                deleted,
                from_source,
                to_source,
                negative_balances,
                missing_rates,
                missing_cost_basis,
                synced_to_accounting_at,
                tx_src,
                tx_dest,
                tx_hash,
                description
              ) VALUES (
                ${transaction.koinlyId},
                ${toNullable(transaction.parentId)},
                ${DateTime.toEpochMillis(transaction.dateUtc)},
                ${transaction.type},
                ${toNullable(transaction.tag)},
                ${walletName(transaction.fromWallet)},
                ${walletSlug(transaction.fromWallet)},
                ${toNullable(transaction.fromWalletId)},
                ${decimalText(transaction.fromAmount)},
                ${currencySymbol(transaction.fromCurrency)},
                ${currencyId(transaction.fromCurrency)},
                ${walletName(transaction.toWallet)},
                ${walletSlug(transaction.toWallet)},
                ${toNullable(transaction.toWalletId)},
                ${decimalText(transaction.toAmount)},
                ${currencySymbol(transaction.toCurrency)},
                ${currencyId(transaction.toCurrency)},
                ${decimalText(transaction.feeAmount)},
                ${currencySymbol(transaction.feeCurrency)},
                ${currencyId(transaction.feeCurrency)},
                ${decimalOptionText(transaction.netWorthAmount)},
                ${currencySymbol(transaction.netWorthCurrency)},
                ${currencyId(transaction.netWorthCurrency)},
                ${decimalOptionText(transaction.feeWorthAmount)},
                ${currencySymbol(transaction.feeWorthCurrency)},
                ${currencyId(transaction.feeWorthCurrency)},
                ${decimalText(transaction.netValue)},
                ${decimalText(transaction.feeValue)},
                ${transaction.valueCurrency.symbol},
                ${transaction.valueCurrency.koinlyId},
                ${transaction.deleted ? 1 : 0},
                ${toNullable(transaction.fromSource)},
                ${toNullable(transaction.toSource)},
                ${transaction.negativeBalances ? 1 : 0},
                ${transaction.missingRates ? 1 : 0},
                ${decimalOptionText(transaction.missingCostBasis)},
                ${pipe(
                  transaction.syncedToAccountingAt,
                  O.match({
                    onNone: () => null,
                    onSome: DateTime.toEpochMillis,
                  })
                )},
                ${toNullable(transaction.txSrc)},
                ${toNullable(transaction.txDest)},
                ${toNullable(transaction.txHash)},
                ${toNullable(transaction.description)}
              )
              ON CONFLICT(koinly_id) DO UPDATE SET
                parent_koinly_id = excluded.parent_koinly_id,
                date_utc = excluded.date_utc,
                type = excluded.type,
                tag = excluded.tag,
                from_wallet_name = excluded.from_wallet_name,
                from_wallet_slug = excluded.from_wallet_slug,
                from_wallet_id = excluded.from_wallet_id,
                from_amount = excluded.from_amount,
                from_currency_symbol = excluded.from_currency_symbol,
                from_currency_koinly_id = excluded.from_currency_koinly_id,
                to_wallet_name = excluded.to_wallet_name,
                to_wallet_slug = excluded.to_wallet_slug,
                to_wallet_id = excluded.to_wallet_id,
                to_amount = excluded.to_amount,
                to_currency_symbol = excluded.to_currency_symbol,
                to_currency_koinly_id = excluded.to_currency_koinly_id,
                fee_amount = excluded.fee_amount,
                fee_currency_symbol = excluded.fee_currency_symbol,
                fee_currency_koinly_id = excluded.fee_currency_koinly_id,
                net_worth_amount = excluded.net_worth_amount,
                net_worth_currency_symbol = excluded.net_worth_currency_symbol,
                net_worth_currency_koinly_id = excluded.net_worth_currency_koinly_id,
                fee_worth_amount = excluded.fee_worth_amount,
                fee_worth_currency_symbol = excluded.fee_worth_currency_symbol,
                fee_worth_currency_koinly_id = excluded.fee_worth_currency_koinly_id,
                net_value = excluded.net_value,
                fee_value = excluded.fee_value,
                value_currency_symbol = excluded.value_currency_symbol,
                value_currency_koinly_id = excluded.value_currency_koinly_id,
                deleted = excluded.deleted,
                from_source = excluded.from_source,
                to_source = excluded.to_source,
                negative_balances = excluded.negative_balances,
                missing_rates = excluded.missing_rates,
                missing_cost_basis = excluded.missing_cost_basis,
                synced_to_accounting_at = excluded.synced_to_accounting_at,
                tx_src = excluded.tx_src,
                tx_dest = excluded.tx_dest,
                tx_hash = excluded.tx_hash,
                description = excluded.description
            `.pipe(
              Effect.mapError(toSqliteError(`Failed to upsert transaction "${transaction.koinlyId}".`))
            )
          )
        )
        .pipe(Effect.mapError(toSqliteError("Failed to import Koinly transactions.")));

      yield* Effect.logInfo({
        imported: transactions.length,
        message: "koinly transactions imported",
      }).pipe(Effect.annotateLogs({ component: "koinly-sqlite" }));

      return transactions.length;
    }
  );

  return KoinlySqlite.of({
    getTransactionByKoinlyId,
    importTransactions,
    listTransactionsByParentId,
    listTransactionsByTxHash,
    listTransactionsWithMissingCostBasis,
    listTransactionsWithMissingRates,
    listTransactionsWithNegativeBalances,
  });
});
