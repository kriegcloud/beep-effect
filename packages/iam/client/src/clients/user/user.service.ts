import { UserContractKit } from "@beep/iam-client/clients/user/user.contracts";
import { userLayer } from "@beep/iam-client/clients/user/user.implementations";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const $I = $IamClientId.create("clients/user/user.service");

export class UserService extends Effect.Service<UserService>()($I`UserService`, {
  dependencies: [userLayer],
  accessors: true,
  effect: UserContractKit.liftService(),
}) {
  static readonly Live = UserService.Default.pipe(Layer.provide(userLayer));
}
