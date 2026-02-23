/**
 * @fileoverview Passkey layer composition.
 *
 * Composes passkey handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/passkey/layer
 * @category Passkey
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { AddPasskey } from "./add-passkey";
import { DeletePasskey } from "./delete-passkey";
import { ListUserPasskeys } from "./list-user-passkeys";
import { UpdatePasskey } from "./update-passkey";

/**
 * Wrapper group combining all passkey handlers.
 *
 * Provides type-safe handler access and composition for passkey
 * operations including add, list, delete, and update.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/passkey"
 *
 * const handlers = Group.accessHandlers("AddPasskey", "ListUserPasskeys")
 * ```
 *
 * @category Passkey/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  AddPasskey.Wrapper,
  ListUserPasskeys.Wrapper,
  DeletePasskey.Wrapper,
  UpdatePasskey.Wrapper
);

/**
 * Effect Layer providing all passkey handler implementations.
 *
 * Composes passkey handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/passkey"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category Passkey/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  AddPasskey: AddPasskey.Handler,
  ListUserPasskeys: ListUserPasskeys.Handler,
  DeletePasskey: DeletePasskey.Handler,
  UpdatePasskey: UpdatePasskey.Handler,
});
