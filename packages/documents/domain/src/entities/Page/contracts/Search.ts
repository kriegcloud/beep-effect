import { PageType } from "@beep/documents-domain/value-objects";
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Search");

/**
 * Input payload for the `Page.Search` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    type: S.optionalWith(PageType, { as: "Option" }),
    includeArchived: S.optionalWith(S.Boolean, { as: "Option" }),
    limit: S.optionalWith(BS.PosInt, { as: "Option" }),
    offset: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Search rpc",
  })
) {}

/**
 * Successful response for the `Page.Search` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Search rpc",
  })
) {}

/**
 * Typed error channel for the `Page.Search` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Never.annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Search rpc",
    documentation: "This should Never happen.",
  })
) {}

/**
 * RPC contract definition for `Page.Search`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.Search", {
  payload: Payload,
  success: Success,
  error: Error,
  stream: true,
});
