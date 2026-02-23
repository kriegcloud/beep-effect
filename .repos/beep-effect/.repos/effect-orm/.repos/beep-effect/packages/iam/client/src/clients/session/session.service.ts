import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SessionContractKit } from "./session.contracts";
import { sessionLayer } from "./session.implementations";

export class SessionService extends Effect.Service<SessionService>()(
  "@beep/iam-client/clients/session/SessionService",
  {
    dependencies: [sessionLayer],
    accessors: true,
    effect: SessionContractKit.liftService(),
  }
) {
  static readonly Live = SessionService.Default.pipe(Layer.provide(sessionLayer));
}
