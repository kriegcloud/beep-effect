/**
 * @fileoverview
 * Contract for setting the active organization.
 *
 * @module @beep/iam-client/organization/crud/set-active/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/set-active");

/**
 * Payload for setting the active organization.
 *
 * @category Organization/CRUD/SetActive
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
 * Success response - the newly active organization, or null if setting failed.
 */
export const Success = S.NullOr(Organization).annotations(
  $I.annotations("Success", {
    description: "The newly active organization, or null if setting failed.",
  })
);

/**
 * Wrapper for SetActive organization handler.
 *
 * @category Organization/CRUD/SetActive
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SetActive", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
