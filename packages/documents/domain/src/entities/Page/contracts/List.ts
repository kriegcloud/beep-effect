import { PageType } from "@beep/documents-domain/value-objects";
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/List");

/**
 * Input payload for the `Page.List` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    type: S.optionalWith(PageType, { as: "Option" }),
    search: S.optionalWith(S.String, { as: "Option" }),
    cursor: S.optionalWith(DocumentsEntityIds.PageId, { as: "Option" }),
    limit: S.optionalWith(BS.PosInt, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.List rpc",
  })
) {}

/**
 * Successful response for the `Page.List` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.List rpc",
  })
) {}

/**
 * Typed error channel for the `Page.List` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Never.annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.List rpc",
    documentation: "This should Never happen.",
  })
) {}

/**
 * RPC contract definition for `Page.List`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.List", {
  payload: Payload,
  success: Success,
  error: Error,
});
