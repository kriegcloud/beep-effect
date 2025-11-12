import { PasskeyContractKit } from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { passkeyLayer } from "@beep/iam-sdk/clients/passkey/passkey.implementations";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class PasskeyService extends Effect.Service<PasskeyService>()(
  "@beep/iam-sdk/clients/passkey-v2/PasskeyService",
  {
    accessors: true,
    dependencies: [passkeyLayer],
    effect: PasskeyContractKit.liftService(),
  }
) {
  static readonly Live = this.Default.pipe(Layer.provide(passkeyLayer));
}
