import * as HttpApiError from "@effect/platform/HttpApiError";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as Context from "effect/Context";
import * as Schema from "effect/Schema";

export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  {
    readonly userId: UserId;
  }
>() {}

export class CurrentUserRpcMiddleware extends RpcMiddleware.Tag<CurrentUserRpcMiddleware>()(
  "CurrentUserRpcMiddleware",
  {
    failure: HttpApiError.Unauthorized,
    provides: CurrentUser,
  },
) {}
