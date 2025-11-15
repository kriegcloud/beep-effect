import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { OAuthContractKit } from "./oauth.contracts";
import { oAuthLayer } from "./oauth.implementations";

export class OAuthService extends Effect.Service<OAuthService>()("@beep/iam-sdk/clients/oauth/OAuthService", {
  accessors: true,
  dependencies: [oAuthLayer],
  effect: OAuthContractKit.liftService(),
}) {
  static readonly Live = OAuthService.Default.pipe(Layer.provide(oAuthLayer));
}
