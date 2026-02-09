import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";
const $I = $DocumentsDomainId.create("entities/Page/contracts/Move");
import {PageCyclicNesting, PageNotFound} from "../Page.errors.ts";
/**
 * Input payload for the `Page.Move` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId,
    parentId: S.optionalWith(DocumentsEntityIds.PageId, { as: "Option"}),
    position: S.optionalWith(S.Number, { as: "Option"}),
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Move rpc",
  })
) {
}

/**
 * Successful response for the `Page.Move` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Move rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Move` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Union(
  PageNotFound,
  PageCyclicNesting
).annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Move rpc",
    documentation: "This should Never happen."
  })) {
}

/**
 * RPC contract definition for `Page.Move`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Move",
  {
    payload: Payload,
    success: Success,
    error: Error
  }
);