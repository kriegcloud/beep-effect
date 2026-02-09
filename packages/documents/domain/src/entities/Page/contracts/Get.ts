import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";
import {PageNotFound, PagePermissionDenied} from "../Page.errors.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";
const $I = $DocumentsDomainId.create("entities/Page/contracts/Get");

/**
 * Input payload for the `Page.Get` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Get rpc",
  })
) {
}

/**
 * Successful response for the `Page.Get` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Get rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Get` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Union(
  PageNotFound,
  PagePermissionDenied
).annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Get rpc",
  })) {
}

/**
 * RPC contract definition for `Page.Get`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Get",
  {
    payload: Payload,
    success: Success,
    error: Error
  }
);