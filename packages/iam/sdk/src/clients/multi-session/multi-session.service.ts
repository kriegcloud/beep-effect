import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { MultiSessionContractKit } from "./multi-session.contracts";
import { multiSessionLayer } from "./multi-session.implementations";

export class MultiSessionService extends Effect.Service<MultiSessionService>()(
  "@beep/iam-sdk/clients/multi-session/MultiSessionService",
  {
    accessors: true,
    dependencies: [multiSessionLayer],
    effect: MultiSessionContractKit.liftService(),
  }
) {
  static readonly Live = MultiSessionService.Default.pipe(Layer.provide(multiSessionLayer));
}
