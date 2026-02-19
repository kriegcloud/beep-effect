import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SignOutContractKit } from "./sign-out.contracts";
import { signOutLayer } from "./sign-out.implementations";

export class SignOutService extends Effect.Service<SignOutService>()(
  "@beep/iam-client/clients/sign-out/SignOutService",
  {
    dependencies: [signOutLayer],
    accessors: true,
    effect: SignOutContractKit.liftService(),
  }
) {
  static readonly Live = SignOutService.Default.pipe(Layer.provide(signOutLayer));
}
