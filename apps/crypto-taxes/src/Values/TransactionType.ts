import { $CryptoTaxesId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CryptoTaxesId.create("Values/TransactionType");

export const TransactionType = LiteralKit(["deposit", "trade", "withdrawal"]).pipe(
  $I.annoteSchema("TransactionType", {
    description: "Represents the type of transaction in the crypto-taxes application.",
  })
);

export type TransactionType = S.Schema.Type<typeof TransactionType>;
