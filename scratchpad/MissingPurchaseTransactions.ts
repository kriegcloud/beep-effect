import { $ScratchId } from "@beep/identity";
import { PosInt } from "@beep/schema/Int";
import { NonEmptyTrimmedStr } from "@beep/schema/String";
import {
  CryptoWalletAddressRedacted,
} from "@beep/schema/blockchain/CryptoWalletAddress";
import { EvmAddress } from "@beep/schema/blockchain/EvmAddress";
import * as S from "effect/Schema";
import {
  KoinlyDecimal,
  KoinlyId,
  KoinlyTransactionReferenceRedacted,
  KoinlyWalletId,
} from "./koinly/KoinlyPrimitives.ts";
import {
  KoinlyCurrencySymbol,
  KoinlyWalletName,
} from "./koinly/KoinlyRefs.ts";

const $I = $ScratchId.create("MissingPurchaseTransactions");

export class MissingPurchaseTransactionCurrency extends S.Class<MissingPurchaseTransactionCurrency>(
  $I`MissingPurchaseTransactionCurrency`
)(
  {
    id: PosInt,
    type: NonEmptyTrimmedStr,
    symbol: KoinlyCurrencySymbol,
    name: NonEmptyTrimmedStr,
    fiat: S.Boolean,
    crypto: S.Boolean,
    nft: S.Boolean,
    token_address: S.OptionFromNullOr(EvmAddress),
  },
  $I.annote("MissingPurchaseTransactionCurrency", {
    description: "Curated currency fields kept from the missing-purchase Koinly export.",
  })
) {}

export class MissingPurchaseTransactionWallet extends S.Class<MissingPurchaseTransactionWallet>(
  $I`MissingPurchaseTransactionWallet`
)(
  {
    id: KoinlyWalletId,
    name: KoinlyWalletName,
    display_address: CryptoWalletAddressRedacted,
  },
  $I.annote("MissingPurchaseTransactionWallet", {
    description: "Curated wallet fields kept from the missing-purchase Koinly export.",
  })
) {}

export class MissingPurchaseTransactionLeg extends S.Class<MissingPurchaseTransactionLeg>($I`MissingPurchaseTransactionLeg`)(
  {
    amount: KoinlyDecimal,
    currency: MissingPurchaseTransactionCurrency,
    wallet: MissingPurchaseTransactionWallet,
    cost_basis: KoinlyDecimal,
    ledger_id: KoinlyId,
    source: NonEmptyTrimmedStr,
  },
  $I.annote("MissingPurchaseTransactionLeg", {
    description: "Curated Koinly transaction leg kept from the missing-purchase export.",
  })
) {}

export class MissingPurchaseNegativeBalances extends S.Class<MissingPurchaseNegativeBalances>(
  $I`MissingPurchaseNegativeBalances`
)(
  {
    balance: KoinlyDecimal,
    amount: KoinlyDecimal,
    value: KoinlyDecimal,
    symbol: KoinlyCurrencySymbol,
    ledger_id: KoinlyId,
  },
  $I.annote("MissingPurchaseNegativeBalances", {
    description: "Negative-balance metadata kept from the missing-purchase Koinly export.",
  })
) {}

export class MissingPurchaseTransaction extends S.Class<MissingPurchaseTransaction>($I`MissingPurchaseTransaction`)(
  {
    id: KoinlyId,
    type: NonEmptyTrimmedStr,
    from: S.OptionFromNullOr(MissingPurchaseTransactionLeg),
    to: S.OptionFromNullOr(MissingPurchaseTransactionLeg),
    net_value: KoinlyDecimal,
    fee_value: KoinlyDecimal,
    date: S.DateTimeUtcFromString,
    label: S.OptionFromNullOr(NonEmptyTrimmedStr),
    description: S.OptionFromNullOr(NonEmptyTrimmedStr),
    synced: S.Boolean,
    manual: S.Boolean,
    txhash: S.OptionFromNullOr(KoinlyTransactionReferenceRedacted),
    txsrc: S.OptionFromNullOr(CryptoWalletAddressRedacted),
    txdest: S.OptionFromNullOr(CryptoWalletAddressRedacted),
    contract_address: S.OptionFromNullOr(EvmAddress),
    negative_balances: S.OptionFromNullOr(MissingPurchaseNegativeBalances),
    missing_rates: S.Boolean,
    missing_cost_basis: S.OptionFromNullOr(KoinlyDecimal),
    from_source: S.OptionFromNullOr(NonEmptyTrimmedStr),
    to_source: S.OptionFromNullOr(NonEmptyTrimmedStr),
    parent_transaction_id: S.OptionFromNullOr(KoinlyId),
    has_children: S.Boolean,
    reviewed_at: S.OptionFromNullOr(S.DateTimeUtcFromString),
  },
  $I.annote("MissingPurchaseTransaction", {
    description: "Curated transaction fields kept from the missing-purchase Koinly export.",
  })
) {}

export class MissingPurchaseTransactionsMeta extends S.Class<MissingPurchaseTransactionsMeta>(
  $I`MissingPurchaseTransactionsMeta`
)(
  {
    page: PosInt,
  },
  $I.annote("MissingPurchaseTransactionsMeta", {
    description: "Pagination metadata kept from the missing-purchase Koinly export.",
  })
) {}

export class MissingPurchaseTransactions extends S.Class<MissingPurchaseTransactions>($I`MissingPurchaseTransactions`)(
  {
    transactions: S.Array(MissingPurchaseTransaction),
    meta: MissingPurchaseTransactionsMeta,
  },
  $I.annote("MissingPurchaseTransactions", {
    description: "Curated missing-purchase transaction export decoded from the scratchpad secret JSON.",
  })
) {}

export const MissingPurchaseTransactionsJson = S.fromJsonString(MissingPurchaseTransactions).pipe(
  $I.annoteSchema("MissingPurchaseTransactionsJson", {
    description: "JSON-string boundary schema for the missing-purchase transaction export.",
  })
);

export const decodeMissingPurchaseTransactionsJson = S.decodeUnknownEffect(MissingPurchaseTransactionsJson);
