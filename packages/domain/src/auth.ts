import * as Context from "effect/Context";
import * as Schema from "effect/Schema";
import * as RpcMiddleware from "effect/unstable/rpc/RpcMiddleware";

export const UserId = Schema.String.pipe(
  Schema.check(Schema.isUUID(undefined)),
  Schema.brand("UserId"),
);
export type UserId = typeof UserId.Type;

export class CurrentUser extends Context.Service<CurrentUser, {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
}>()("CurrentUser") {}

export class AuthMiddleware extends RpcMiddleware.Service<AuthMiddleware, {
  provides: CurrentUser;
}>()(
  "AuthMiddleware",
  { error: Schema.Never, requiredForClient: false },
) {}
