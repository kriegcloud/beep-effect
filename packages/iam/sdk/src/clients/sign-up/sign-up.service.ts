import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SignUpContractKit } from "./sign-up.contracts";
import { signUpLayer } from "./sign-up.implementations";

export class SignUpService extends Effect.Service<SignUpService>()("@beep/iam-sdk/clients/sign-up/SignUpService", {
  dependencies: [signUpLayer],
  accessors: true,
  effect: SignUpContractKit.liftService(),
}) {
  static readonly Live = SignUpService.Default.pipe(Layer.provide(signUpLayer));
}
