import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SignInContractKit } from "./sign-in.contracts";
import { signInLayer } from "./sign-in.implementations";

export class SignInService extends Effect.Service<SignInService>()("@beep/iam-client/clients/SignInService", {
  dependencies: [signInLayer],
  effect: SignInContractKit.liftService(),
  accessors: true,
}) {
  static readonly Live = SignInService.Default.pipe(Layer.provide(signInLayer));
}
