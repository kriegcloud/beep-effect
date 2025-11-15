import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TwoFactorContractKit } from "./two-factor.contracts";
import { twoFactorLayer } from "./two-factor.implementations";

export class TwoFactorService extends Effect.Service<TwoFactorService>()(
  "@beep/iam-sdk/clients/two-factor/TwoFactorService",
  {
    dependencies: [twoFactorLayer],
    accessors: true,
    effect: TwoFactorContractKit.liftService(),
  }
) {
  static readonly Live = TwoFactorService.Default.pipe(Layer.provide(twoFactorLayer));
}
