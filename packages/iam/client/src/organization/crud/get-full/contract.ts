/**
 * @fileoverview
 * Contract for getting full organization details.
 *
 * @module @beep/iam-client/organization/crud/get-full/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { FullOrganization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/get-full");

/**
 * Payload for getting full organization details.
 *
 * @category Organization/CRUD/GetFull
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.optional(
      S.Struct({
        organizationId: S.optional(SharedEntityIds.OrganizationId),
      })
    ),
  },
  formValuesAnnotation({
    query: undefined,
  })
) {}

export const Success = FullOrganization;

/**
 * Wrapper for GetFull organization handler.
 *
 * @category Organization/CRUD/GetFull
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetFull", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
