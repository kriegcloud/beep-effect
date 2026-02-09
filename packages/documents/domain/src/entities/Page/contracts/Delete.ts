import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import {PageNotFound} from "../Page.errors.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";
const $I = $DocumentsDomainId.create("entities/Page/contracts/Delete");

/**
 * Input payload for the `Page.Delete` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Delete rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Delete` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends PageNotFound {
}

/**
 * RPC contract definition for `Page.Delete`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Delete",
  {
    payload: Payload,
    success: S.Void,
    error: Error
  }
);