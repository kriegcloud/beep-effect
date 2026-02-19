/**
 * @fileoverview
 * Contract for listing organizations.
 *
 * @module @beep/iam-client/organization/crud/list/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/list");

/**
 * Payload for listing organizations (empty).
 *
 * @category Organization/CRUD/List
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({}) {}

/**
 * Success response - array of organizations.
 */
export const Success = S.Array(Organization).annotations(
  $I.annotations("Success", {
    description: "Array of organizations the user belongs to.",
  })
);

/**
 * Wrapper for List organizations handler.
 *
 * @category Organization/CRUD/List
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("List", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
