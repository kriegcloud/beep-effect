import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";
import {NotFoundError} from "@beep/errors";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Archive");

/**
 * Input payload for the `Page.Archive` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Archive rpc",
  })
) {
}

/**
 * Successful response for the `Page.Archive` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Archive rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Archive` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends NotFoundError {
}

/**
 * RPC contract definition for `Page.Archive`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Archive",
  {
    payload: Payload,
    success: Success,
    error: Error
  }
);