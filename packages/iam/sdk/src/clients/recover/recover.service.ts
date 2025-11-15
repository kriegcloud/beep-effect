import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { RecoverContractKit } from "./recover.contracts";
import { recoverLayer } from "./recover.implementations";

export class RecoverService extends Effect.Service<RecoverService>()("@beep/iam-sdk/clients/recover/RecoverService", {
  dependencies: [recoverLayer],
  accessors: true,
  effect: RecoverContractKit.liftService(),
}) {
  static readonly Live = RecoverService.Default.pipe(Layer.provide(recoverLayer));
}
