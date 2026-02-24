/**
 * @fileoverview
 * Contract for creating a new organization.
 *
 * @module @beep/iam-client/organization/crud/create/contract
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import { Metadata, Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/create");

/**
 * Payload for creating a new organization.
 *
 * @category Organization/CRUD/Create
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.String,
    slug: S.String,
    logo: S.optional(S.String),
    metadata: S.optional(Metadata),
    isPersonal: S.optionalWith(S.Boolean, {
      default: () => false,
      exact: true,
    }),
  },
  formValuesAnnotation({
    name: "",
    slug: "",
    logo: undefined,
    metadata: undefined,
    isPersonal: false,
  })
) {}

export const Success = Organization;

/**
 * Wrapper for Create organization handler.
 *
 * @category Organization/CRUD/Create
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Create", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
