/**
 * @fileoverview Core authentication layer composition.
 *
 * Composes core authentication handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/core/layer
 * @category Core
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { DeleteUser } from "./delete-user";
import { GetSession } from "./get-session";
import { LinkSocial } from "./link-social";
import { ListAccounts } from "./list-accounts";
import { RevokeOtherSessions } from "./revoke-other-sessions";
import { RevokeSession } from "./revoke-session";
import { RevokeSessions } from "./revoke-sessions";
import { SignOut } from "./sign-out";
import { UnlinkAccount } from "./unlink-account";
import { UpdateUser } from "./update-user";

/**
 * Wrapper group combining all core authentication handlers.
 *
 * Provides type-safe handler access and composition for core authentication
 * operations including session management, user updates, and account linking.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/core"
 *
 * const handlers = Group.accessHandlers("SignOut", "GetSession", "UpdateUser")
 * ```
 *
 * @category Core/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  SignOut.Wrapper,
  GetSession.Wrapper,
  UpdateUser.Wrapper,
  DeleteUser.Wrapper,
  RevokeSession.Wrapper,
  RevokeOtherSessions.Wrapper,
  RevokeSessions.Wrapper,
  LinkSocial.Wrapper,
  ListAccounts.Wrapper,
  UnlinkAccount.Wrapper
);

/**
 * Effect Layer providing all core authentication handler implementations.
 *
 * Composes core authentication handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/core"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category Core/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SignOut: SignOut.Handler,
  GetSession: GetSession.Handler,
  UpdateUser: UpdateUser.Handler,
  DeleteUser: DeleteUser.Handler,
  RevokeSession: RevokeSession.Handler,
  RevokeOtherSessions: RevokeOtherSessions.Handler,
  RevokeSessions: RevokeSessions.Handler,
  LinkSocial: LinkSocial.Handler,
  ListAccounts: ListAccounts.Handler,
  UnlinkAccount: UnlinkAccount.Handler,
});
