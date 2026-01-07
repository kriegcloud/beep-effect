import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SignOutContractKit } from "./sign-out.contracts";
import { signOutLayer } from "./sign-out.implementations";

const $I = $IamClientId.create("clients/sign-out/sign-out.service");

export class SignOutService extends Effect.Service<SignOutService>()($I`SignOutService`, {
  dependencies: [signOutLayer],
  accessors: true,
  effect: SignOutContractKit.liftService(),
}) {
  static readonly Live = SignOutService.Default.pipe(Layer.provide(signOutLayer));
}
