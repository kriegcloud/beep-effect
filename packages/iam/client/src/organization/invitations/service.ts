/**
 * @fileoverview
 * Organization invitations service composition.
 *
 * @module @beep/iam-client/organization/invitations/service
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Accept from "./accept/mod.ts";
import * as Cancel from "./cancel/mod.ts";
import * as Create from "./create/mod.ts";
import * as List from "./list/mod.ts";
import * as Reject from "./reject/mod.ts";

/**
 * Organization invitations service methods.
 *
 * @category Organization/Invitations
 * @since 0.1.0
 */
export const Accept_ = Accept.Handler;
export const Cancel_ = Cancel.Handler;
export const Create_ = Create.Handler;
export const List_ = List.Handler;
export const Reject_ = Reject.Handler;
