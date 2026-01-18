/**
 * @fileoverview
 * Contract for deleting an organization.
 *
 * @module @beep/iam-client/organization/crud/delete/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/crud/delete");

/**
 * Payload for deleting an organization.
 *
 * @category Organization/CRUD/Delete
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.String,
  },
  formValuesAnnotation({
    organizationId: "",
  })
) {}

/**
 * Success response for organization deletion.
 *
 * @category Organization/CRUD/Delete
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Result of organization deletion.",
  })
) {}

/**
 * Wrapper for Delete organization handler.
 *
 * @category Organization/CRUD/Delete
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Delete", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
