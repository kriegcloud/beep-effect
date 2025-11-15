import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { VerifyContractKit } from "./verify.contracts";
import { verifyLayer } from "./verify.implementations";

export class VerifyService extends Effect.Service<VerifyService>()("@beep/iam-sdk/clients/verify/VerifyService", {
  dependencies: [verifyLayer],
  accessors: true,
  effect: VerifyContractKit.liftService(),
}) {
  static readonly Live = VerifyService.Default.pipe(Layer.provide(verifyLayer));
}
