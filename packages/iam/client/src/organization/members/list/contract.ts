/**
 * @fileoverview
 * Contract for listing organization members.
 *
 * @module @beep/iam-client/organization/members/list/contract
 * @category Organization/Members
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { FullMember } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/members/list");

/**
 * Payload for listing members of an organization.
 *
 * @category Organization/Members/List
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
  },
  formValuesAnnotation({
    organizationId: undefined,
  })
) {}

/**
 * Returns members with embedded user data.
 */
export const Success = S.Array(FullMember).annotations(
  $I.annotations("Success", {
    description: "List of organization members with user data.",
  })
);

/**
 * Wrapper for List members handler.
 *
 * @category Organization/Members/List
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("List", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
