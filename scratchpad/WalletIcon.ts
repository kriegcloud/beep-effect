import { $ScratchId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $ScratchId.create("WalletIcon");

export const WalletIconURL = S.URLFromString.pipe(
  S.brand("WalletIconURL"),
  $I.annoteSchema("WalletIconURL", {
    description: "A URL to an icon representing a wallet.",
  })
);

export declare namespace WalletIconURL {
  export type Encoded = typeof WalletIconURL.Encoded;
}

export type WalletIconURL = typeof WalletIconURL.Type;

export class WalletIcon extends S.Class<WalletIcon>($I`WalletIcon`)(
  {
   original: WalletIconURL,
   medium: WalletIconURL,
    small: WalletIconURL
  },
  $I.annote("WalletIcon", {
    description: "A wallet icon with different sizes for display purposes.",
  })
) {}


