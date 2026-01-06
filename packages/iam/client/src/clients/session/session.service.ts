import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SessionContractKit } from "./session.contracts";
import { sessionLayer } from "./session.implementations";

const $I = $IamClientId.create("clients/session/session.service");

export class SessionService extends Effect.Service<SessionService>()($I`SessionService`, {
  dependencies: [sessionLayer],
  accessors: true,
  effect: SessionContractKit.liftService(),
}) {
  static readonly Live = SessionService.Default.pipe(Layer.provide(sessionLayer));
}
