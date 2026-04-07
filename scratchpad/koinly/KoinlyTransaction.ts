/**
 * Koinly transaction row schemas for the scratchpad CSV export.
 *
 * @module scratchpad/koinly/KoinlyTransaction
 * @since 0.0.0
 */

import { $ScratchId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import { CSV } from "@beep/schema/csv";
import { EvmAddress } from "@beep/schema/blockchain/EvmAddress";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  KoinlyBooleanText,
  KoinlyDecimal,
  KoinlyDeletedText,
  KoinlyId,
  KoinlyTransactionReference,
  KoinlyUtcTimestamp,
  KoinlyWalletId,
  OptionFromEmptyText,
} from "./KoinlyPrimitives.ts";
import {
  KoinlyCurrencyRef,
  KoinlyCurrencyRefText,
  KoinlyWalletRef,
  KoinlyWalletRefText,
  decodeKoinlyCurrencyRef,
  decodeKoinlyWalletRef,
} from "./KoinlyRefs.ts";

const $I = $ScratchId.create("koinly/KoinlyTransaction");

/**
 * Closed transaction type domain observed in the Koinly export.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTransactionType = LiteralKit(["deposit", "trade", "transfer", "withdrawal"] as const).pipe(
  $I.annoteSchema("KoinlyTransactionType", {
    description: "Closed transaction type domain observed in the Koinly export.",
  })
);

/**
 * Runtime type for {@link KoinlyTransactionType}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTransactionType = typeof KoinlyTransactionType.Type;

/**
 * Closed tag domain observed in the Koinly export.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTag = LiteralKit(
  ["cost", "dust", "liquidity_in", "liquidity_out", "reward", "swap"] as const
).pipe(
  $I.annoteSchema("KoinlyTag", {
    description: "Closed tag domain observed in the Koinly export.",
  })
);

/**
 * Runtime type for {@link KoinlyTag}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTag = typeof KoinlyTag.Type;

/**
 * Closed source domain observed in the Koinly export.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlySource = LiteralKit(["api", "auto", "csv"] as const).pipe(
  $I.annoteSchema("KoinlySource", {
    description: "Closed source domain observed in the Koinly export.",
  })
);

/**
 * Runtime type for {@link KoinlySource}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlySource = typeof KoinlySource.Type;

/**
 * Header-exact decoded CSV row for the Koinly transactions export.
 *
 * Each property name matches the original CSV header exactly so it can be used
 * directly with `@beep/schema/csv`.
 *
 * @category DomainModel
 * @since 0.0.0
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { KoinlyTransactionCsvRow } from "./KoinlyTransaction.ts"
 *
 * const row = S.decodeUnknownSync(KoinlyTransactionCsvRow)({
 *   "ID (read-only)": "770AF28689FFAB912F2353F051CE04DA",
 *   "Parent ID (read-only)": "",
 *   "Date (UTC)": "2022-01-11 04:36:39",
 *   "Type": "transfer",
 *   "Tag": "",
 *   "From Wallet (read-only)": "tbk-metamask-2;eth",
 *   "From Wallet ID": "563023FC99E3BB4080D567C64BAE69E9",
 *   "From Amount": "10.0",
 *   "From Currency": "USDC;3054",
 *   "To Wallet (read-only)": "Crypto.com;crypto_com",
 *   "To Wallet ID": "1C1E2D4CC882CE767F89E5C8EC66930A",
 *   "To Amount": "10.0",
 *   "To Currency": "USDC;3054",
 *   "Fee Amount": "0.0",
 *   "Fee Currency": "",
 *   "Net Worth Amount": "10.0",
 *   "Net Worth Currency": "USD;10",
 *   "Fee Worth Amount": "",
 *   "Fee Worth Currency": "",
 *   "Net Value (read-only)": "10.0",
 *   "Fee Value (read-only)": "0.0",
 *   "Value Currency (read-only)": "USD;10",
 *   "Deleted": "false",
 *   "From Source (read-only)": "api",
 *   "To Source (read-only)": "csv",
 *   "Negative Balances (read-only)": "false",
 *   "Missing Rates (read-only)": "false",
 *   "Missing Cost Basis (read-only)": "",
 *   "Synced To Accounting At (UTC read-only)": "",
 *   "TxSrc": "0x7f68038ff73d27b98d2da633d3e52d5ddcde3537",
 *   "TxDest": "",
 *   "TxHash": "54d24c25ad7746635be39d1b52f19ec1c8db6258cb427597b3402632d64aea2f",
 *   "Description": "USDC (AVAXC) Deposit",
 * })
 *
 * void row
 * ```
 */
export class KoinlyTransactionCsvRow extends S.Class<KoinlyTransactionCsvRow>($I`KoinlyTransactionCsvRow`)(
  {
    "ID (read-only)": KoinlyId,
    "Parent ID (read-only)": OptionFromEmptyText(KoinlyId),
    "Date (UTC)": KoinlyUtcTimestamp,
    Type: KoinlyTransactionType,
    Tag: OptionFromEmptyText(KoinlyTag),
    "From Wallet (read-only)": OptionFromEmptyText(KoinlyWalletRefText),
    "From Wallet ID": OptionFromEmptyText(KoinlyWalletId),
    "From Amount": KoinlyDecimal,
    "From Currency": OptionFromEmptyText(KoinlyCurrencyRefText),
    "To Wallet (read-only)": OptionFromEmptyText(KoinlyWalletRefText),
    "To Wallet ID": OptionFromEmptyText(KoinlyWalletId),
    "To Amount": KoinlyDecimal,
    "To Currency": OptionFromEmptyText(KoinlyCurrencyRefText),
    "Fee Amount": KoinlyDecimal,
    "Fee Currency": OptionFromEmptyText(KoinlyCurrencyRefText),
    "Net Worth Amount": OptionFromEmptyText(KoinlyDecimal),
    "Net Worth Currency": OptionFromEmptyText(KoinlyCurrencyRefText),
    "Fee Worth Amount": OptionFromEmptyText(KoinlyDecimal),
    "Fee Worth Currency": OptionFromEmptyText(KoinlyCurrencyRefText),
    "Net Value (read-only)": KoinlyDecimal,
    "Fee Value (read-only)": KoinlyDecimal,
    "Value Currency (read-only)": KoinlyCurrencyRefText,
    Deleted: KoinlyDeletedText,
    "From Source (read-only)": OptionFromEmptyText(KoinlySource),
    "To Source (read-only)": OptionFromEmptyText(KoinlySource),
    "Negative Balances (read-only)": KoinlyBooleanText,
    "Missing Rates (read-only)": KoinlyBooleanText,
    "Missing Cost Basis (read-only)": OptionFromEmptyText(KoinlyDecimal),
    "Synced To Accounting At (UTC read-only)": OptionFromEmptyText(KoinlyUtcTimestamp),
    TxSrc: OptionFromEmptyText(EvmAddress),
    TxDest: OptionFromEmptyText(EvmAddress),
    TxHash: OptionFromEmptyText(KoinlyTransactionReference),
    Description: OptionFromEmptyText(NonEmptyTrimmedStr),
  },
  $I.annote("KoinlyTransactionCsvRow", {
    description: "Header-exact decoded CSV row for the Koinly transactions export.",
  })
) {}

/**
 * Normalized Koinly transaction model for downstream scratchpad use.
 *
 * This preserves every CSV column while renaming fields and splitting compound
 * wallet/currency text into structured references.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class KoinlyTransaction extends S.Class<KoinlyTransaction>($I`KoinlyTransaction`)(
  {
    koinlyId: KoinlyId,
    parentId: S.OptionFromNullOr(KoinlyId),
    dateUtc: KoinlyUtcTimestamp,
    type: KoinlyTransactionType,
    tag: S.OptionFromNullOr(KoinlyTag),
    fromWallet: S.OptionFromNullOr(KoinlyWalletRef),
    fromWalletId: S.OptionFromNullOr(KoinlyWalletId),
    fromAmount: KoinlyDecimal,
    fromCurrency: S.OptionFromNullOr(KoinlyCurrencyRef),
    toWallet: S.OptionFromNullOr(KoinlyWalletRef),
    toWalletId: S.OptionFromNullOr(KoinlyWalletId),
    toAmount: KoinlyDecimal,
    toCurrency: S.OptionFromNullOr(KoinlyCurrencyRef),
    feeAmount: KoinlyDecimal,
    feeCurrency: S.OptionFromNullOr(KoinlyCurrencyRef),
    netWorthAmount: S.OptionFromNullOr(KoinlyDecimal),
    netWorthCurrency: S.OptionFromNullOr(KoinlyCurrencyRef),
    feeWorthAmount: S.OptionFromNullOr(KoinlyDecimal),
    feeWorthCurrency: S.OptionFromNullOr(KoinlyCurrencyRef),
    netValue: KoinlyDecimal,
    feeValue: KoinlyDecimal,
    valueCurrency: KoinlyCurrencyRef,
    deleted: S.Boolean,
    fromSource: S.OptionFromNullOr(KoinlySource),
    toSource: S.OptionFromNullOr(KoinlySource),
    negativeBalances: S.Boolean,
    missingRates: S.Boolean,
    missingCostBasis: S.OptionFromNullOr(KoinlyDecimal),
    syncedToAccountingAt: S.OptionFromNullOr(KoinlyUtcTimestamp),
    txSrc: S.OptionFromNullOr(EvmAddress),
    txDest: S.OptionFromNullOr(EvmAddress),
    txHash: S.OptionFromNullOr(KoinlyTransactionReference),
    description: S.OptionFromNullOr(NonEmptyTrimmedStr),
  },
  $I.annote("KoinlyTransaction", {
    description: "Normalized Koinly transaction preserving every CSV column with structured wallet and currency references.",
  })
) {}

const decodeOptionalWalletRef = (value: O.Option<KoinlyWalletRefText>) =>
  pipe(
    value,
    O.match({
      onNone: () => Effect.succeed(O.none<KoinlyWalletRef>()),
      onSome: (walletRef) => decodeKoinlyWalletRef(walletRef).pipe(Effect.map(O.some)),
    })
  );

const decodeOptionalCurrencyRef = (value: O.Option<KoinlyCurrencyRefText>) =>
  pipe(
    value,
    O.match({
      onNone: () => Effect.succeed(O.none<KoinlyCurrencyRef>()),
      onSome: (currencyRef) => decodeKoinlyCurrencyRef(currencyRef).pipe(Effect.map(O.some)),
    })
  );

/**
 * Convert one decoded CSV row into the normalized Koinly transaction model.
 *
 * @category Validation
 * @since 0.0.0
 */
export const toKoinlyTransaction = Effect.fn("KoinlyTransaction.toKoinlyTransaction")(function* (
  row: KoinlyTransactionCsvRow
) {
  const fromWallet = yield* decodeOptionalWalletRef(row["From Wallet (read-only)"]);
  const fromCurrency = yield* decodeOptionalCurrencyRef(row["From Currency"]);
  const toWallet = yield* decodeOptionalWalletRef(row["To Wallet (read-only)"]);
  const toCurrency = yield* decodeOptionalCurrencyRef(row["To Currency"]);
  const feeCurrency = yield* decodeOptionalCurrencyRef(row["Fee Currency"]);
  const netWorthCurrency = yield* decodeOptionalCurrencyRef(row["Net Worth Currency"]);
  const feeWorthCurrency = yield* decodeOptionalCurrencyRef(row["Fee Worth Currency"]);
  const valueCurrency = yield* decodeKoinlyCurrencyRef(row["Value Currency (read-only)"]);

  return new KoinlyTransaction({
    koinlyId: row["ID (read-only)"],
    parentId: row["Parent ID (read-only)"],
    dateUtc: row["Date (UTC)"],
    type: row.Type,
    tag: row.Tag,
    fromWallet,
    fromWalletId: row["From Wallet ID"],
    fromAmount: row["From Amount"],
    fromCurrency,
    toWallet,
    toWalletId: row["To Wallet ID"],
    toAmount: row["To Amount"],
    toCurrency,
    feeAmount: row["Fee Amount"],
    feeCurrency,
    netWorthAmount: row["Net Worth Amount"],
    netWorthCurrency,
    feeWorthAmount: row["Fee Worth Amount"],
    feeWorthCurrency,
    netValue: row["Net Value (read-only)"],
    feeValue: row["Fee Value (read-only)"],
    valueCurrency,
    deleted: row.Deleted,
    fromSource: row["From Source (read-only)"],
    toSource: row["To Source (read-only)"],
    negativeBalances: row["Negative Balances (read-only)"],
    missingRates: row["Missing Rates (read-only)"],
    missingCostBasis: row["Missing Cost Basis (read-only)"],
    syncedToAccountingAt: row["Synced To Accounting At (UTC read-only)"],
    txSrc: row.TxSrc,
    txDest: row.TxDest,
    txHash: row.TxHash,
    description: row.Description,
  });
});

/**
 * Schema for the full Koinly CSV document decoded into header-exact row values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTransactionsCsv = CSV(KoinlyTransactionCsvRow).pipe(
  $I.annoteSchema("KoinlyTransactionsCsv", {
    description: "CSV document schema for the Koinly transactions export decoded into header-exact rows.",
  })
);

/**
 * Runtime type for {@link KoinlyTransactionsCsv}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTransactionsCsv = typeof KoinlyTransactionsCsv.Type;

/**
 * Array schema for normalized Koinly transactions.
 *
 * @category Validation
 * @since 0.0.0
 */
export const KoinlyTransactions = S.Array(KoinlyTransaction).pipe(
  $I.annoteSchema("KoinlyTransactions", {
    description: "Array schema for normalized Koinly transactions.",
  })
);

/**
 * Runtime type for {@link KoinlyTransactions}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type KoinlyTransactions = typeof KoinlyTransactions.Type;

/**
 * Decode a Koinly CSV document into normalized transactions.
 *
 * @category Validation
 * @since 0.0.0
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeKoinlyTransactionsCsv } from "./KoinlyTransaction.ts"
 *
 * const program = decodeKoinlyTransactionsCsv(
 *   "ID (read-only),Parent ID (read-only),Date (UTC),Type,Tag,From Wallet (read-only),From Wallet ID,From Amount,From Currency,To Wallet (read-only),To Wallet ID,To Amount,To Currency,Fee Amount,Fee Currency,Net Worth Amount,Net Worth Currency,Fee Worth Amount,Fee Worth Currency,Net Value (read-only),Fee Value (read-only),Value Currency (read-only),Deleted,From Source (read-only),To Source (read-only),Negative Balances (read-only),Missing Rates (read-only),Missing Cost Basis (read-only),Synced To Accounting At (UTC read-only),TxSrc,TxDest,TxHash,Description\\n770AF28689FFAB912F2353F051CE04DA,,2022-01-11 04:36:39,transfer,,tbk-metamask-2;eth,563023FC99E3BB4080D567C64BAE69E9,10.0,USDC;3054,Crypto.com;crypto_com,1C1E2D4CC882CE767F89E5C8EC66930A,10.0,USDC;3054,0.0,,10.0,USD;10,,,10.0,0.0,USD;10,false,api,csv,false,false,,,0x7f68038ff73d27b98d2da633d3e52d5ddcde3537,,54d24c25ad7746635be39d1b52f19ec1c8db6258cb427597b3402632d64aea2f,USDC (AVAXC) Deposit"
 * )
 *
 * void program
 * ```
 */
export const decodeKoinlyTransactionsCsv = Effect.fn("KoinlyTransaction.decodeKoinlyTransactionsCsv")(function* (
  input: string
) {
  const rows = yield* S.decodeUnknownEffect(KoinlyTransactionsCsv)(input);

  return yield* Effect.forEach(rows, toKoinlyTransaction);
});
