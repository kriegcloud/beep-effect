/**
 * @fileoverview
 * Contract for updating an organization.
 *
 * @module @beep/iam-client/organization/crud/update/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Metadata, Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/update");

/**
 * Payload for updating an organization.
 *
 * @category Organization/CRUD/Update
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(SharedEntityIds.OrganizationId),
    data: S.Struct({
      name: S.optional(S.String),
      slug: S.optional(S.String),
      logo: S.optional(S.String),
      metadata: S.optional(Metadata),
    }),
  },
  formValuesAnnotation({
    organizationId: undefined,
    data: {
      name: undefined,
      slug: undefined,
      logo: undefined,
      metadata: undefined,
    },
  })
) {}

export const Success = Organization;

/**
 * Wrapper for Update organization handler.
 *
 * @category Organization/CRUD/Update
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Update", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
