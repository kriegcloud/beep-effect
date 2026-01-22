/**
 * @fileoverview
 * Anonymous layer composition.
 *
 * @module @beep/iam-client/anonymous/layer
 * @category Anonymous
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as DeleteUser from "./delete-user/mod.ts";

/**
 * Anonymous wrapper group.
 *
 * @category Anonymous
 * @since 0.1.0
 */
export const AnonymousGroup = Wrap.WrapperGroup.make(DeleteUser.Contract.Wrapper);

/**
 * Anonymous layer with implemented handlers.
 *
 * @category Anonymous
 * @since 0.1.0
 */
export const layer = AnonymousGroup.toLayer({
	DeleteAnonymousUser: DeleteUser.Handler,
});
