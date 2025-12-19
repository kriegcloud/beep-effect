import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { OidcContractKit } from "./oidc.contracts";
import { oidcLayer } from "./oidc.implementations";

export class OidcService extends Effect.Service<OidcService>()("@beep/iam-client/clients/oidc/OidcService", {
  dependencies: [oidcLayer],
  accessors: true,
  effect: OidcContractKit.liftService(),
}) {
  static readonly Live = OidcService.Default.pipe(Layer.provide(oidcLayer));
}
