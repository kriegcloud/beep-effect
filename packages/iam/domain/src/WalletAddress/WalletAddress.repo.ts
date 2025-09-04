import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./WalletAddress.model";

export class WalletAddressRepo extends Effect.Service<WalletAddressRepo>()("WalletAddressRepo", {
  effect: M.makeRepository(Model, {
    tableName: "wallet_address",
    idColumn: "id",
    spanPrefix: "WalletAddressRepo",
  }),
}) {}
