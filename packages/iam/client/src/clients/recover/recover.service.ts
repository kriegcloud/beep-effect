import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { RecoverContractKit } from "./recover.contracts";
import { recoverLayer } from "./recover.implementations";

const $I = $IamClientId.create("clients/recover/recover.service");

export class RecoverService extends Effect.Service<RecoverService>()($I`RecoverService`, {
  dependencies: [recoverLayer],
  accessors: true,
  effect: RecoverContractKit.liftService(),
}) {
  static readonly Live = RecoverService.Default.pipe(Layer.provide(recoverLayer));
}
