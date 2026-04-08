import { $ScratchId } from "@beep/identity";
import { LiteralKit} from "@beep/schema";


const $I = $ScratchId.create("Shared");

export const CryptoNetwork = LiteralKit(
  [
    "ETH",
    "BNB",
    "AVALANCHE",
    "BTC"
  ]
).pipe(
  $I.annoteSchema("CryptoNetwork", {
    description: "Supported blockchain networks for crypto wallet operations."
  })
);

export type CryptoNetwork = typeof CryptoNetwork.Type;
