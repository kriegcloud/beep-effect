import { $CryptoTaxesId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CryptoTaxesId.create("Values/WalletType");

export const WalletType = LiteralKit(["exchange", "blockchain", "wallet", "other"]).pipe(
  $I.annoteSchema("WalletType", {
    description: "Represents the type of wallet in the crypto-taxes application.",
  })
);

export type WalletType = S.Schema.Type<typeof WalletType>;
