import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";
import {PageNotFound} from "../Page.errors.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";
const $I = $DocumentsDomainId.create("entities/Page/contracts/Publish");

/**
 * Input payload for the `Page.Publish` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Publish rpc",
  })
) {
}

/**
 * Successful response for the `Page.Publish` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Publish rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Publish` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends PageNotFound {
}

/**
 * RPC contract definition for `Page.Publish`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Publish",
  {
    payload: Payload,
    success: Success,
    error: Error
  }
);