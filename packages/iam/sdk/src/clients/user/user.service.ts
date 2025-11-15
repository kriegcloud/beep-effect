import { UserContractKit } from "@beep/iam-sdk/clients/user/user.contracts";
import { userLayer } from "@beep/iam-sdk/clients/user/user.implementations";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class UserService extends Effect.Service<UserService>()("@beep/iam-sdk/clients/user/UserService", {
  dependencies: [userLayer],
  accessors: true,
  effect: UserContractKit.liftService(),
}) {
  static readonly Live = UserService.Default.pipe(Layer.provide(userLayer));
}
