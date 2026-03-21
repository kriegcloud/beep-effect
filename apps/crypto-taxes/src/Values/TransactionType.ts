import { $CryptoTaxesId } from "@beep/identity";
import type * as S from "effect/Schema";
import { LiteralKit } from "@beep/schema";

const $I = $CryptoTaxesId.create("Values/TransactionType");

export const TransactionType = LiteralKit(
  [
    "deposit",
    "trade",
    "withdrawal"
  ]
).pipe(
  $I.annoteSchema("TransactionType", {
    description: "Represents the type of transaction in the crypto-taxes application."
  })
)

export type TransactionType = S.Schema.Type<typeof TransactionType>;
