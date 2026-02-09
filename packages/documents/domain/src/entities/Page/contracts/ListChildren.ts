import { PageType } from "@beep/documents-domain/value-objects";
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/ListChildren");

/**
 * Input payload for the `Page.ListChildren` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    parentId: DocumentsEntityIds.PageId,
    type: S.optionalWith(PageType, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.ListChildren rpc",
  })
) {}

/**
 * Successful response for the `Page.ListChildren` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.ListChildren rpc",
  })
) {}

/**
 * Typed error channel for the `Page.ListChildren` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Never.annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.ListChildren rpc",
    documentation: "This should Never happen.",
  })
) {}

/**
 * RPC contract definition for `Page.ListChildren`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.ListChildren", {
  payload: Payload,
  success: Success,
  error: Error,
});
