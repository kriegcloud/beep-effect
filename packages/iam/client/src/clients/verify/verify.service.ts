import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { VerifyContractKit } from "./verify.contracts";
import { verifyLayer } from "./verify.implementations";

const $I = $IamClientId.create("clients/verify/verify.service");

export class VerifyService extends Effect.Service<VerifyService>()($I`VerifyService`, {
  dependencies: [verifyLayer],
  accessors: true,
  effect: VerifyContractKit.liftService(),
}) {
  static readonly Live = VerifyService.Default.pipe(Layer.provide(verifyLayer));
}
