import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SignInContractKit } from "./sign-in.contracts";
import { signInLayer } from "./sign-in.implementations";

const $I = $IamClientId.create("clients/sign-in/sign-in.service");

export class SignInService extends Effect.Service<SignInService>()($I`SignInService`, {
  dependencies: [signInLayer],
  effect: SignInContractKit.liftService(),
  accessors: true,
}) {
  static readonly Live = SignInService.Default.pipe(Layer.provide(signInLayer));
}
