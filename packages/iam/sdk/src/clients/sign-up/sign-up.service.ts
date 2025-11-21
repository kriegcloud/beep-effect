import { SignUpContractKit, signUpLayer } from "@beep/iam-sdk";
import { SignUpClientId } from "@beep/iam-sdk/clients/_internal";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class SignUpService extends Effect.Service<SignUpService>()(
  SignUpClientId.compose("sign-up.service/SignUpService").identifier,
  {
    dependencies: [signUpLayer],
    effect: SignUpContractKit.liftService(),
    accessors: true,
  }
) {
  static readonly Live = SignUpService.Default.pipe(Layer.provide(signUpLayer));
}
