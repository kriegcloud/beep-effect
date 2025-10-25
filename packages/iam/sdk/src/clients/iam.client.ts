import { IamImplementations } from "@beep/iam-sdk/clients/implementations";
import * as Effect from "effect/Effect";

export class IamClientService extends Effect.Service<IamClientService>()("IamClientService", {
  dependencies: [],
  effect: Effect.succeed(IamImplementations),
}) {}
