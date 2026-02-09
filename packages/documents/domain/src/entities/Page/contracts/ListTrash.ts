import { $DocumentsDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/ListTrash");

/**
 * Input payload for the `Page.ListTrash` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    search: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.ListTrash rpc",
  })
) {}

/**
 * Successful response for the `Page.ListTrash` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.ListTrash rpc",
  })
) {}

/**
 * Typed error channel for the `Page.ListTrash` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Never.annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.ListTrash rpc",
    documentation: "This should Never happen.",
  })
) {}

/**
 * RPC contract definition for `Page.ListTrash`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.ListTrash", {
  payload: Payload,
  success: Success,
  error: Error,
});
