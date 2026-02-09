import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { PageNotFound } from "../Page.errors.ts";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Restore");

/**
 * Input payload for the `Page.Restore` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Restore rpc",
  })
) {}

/**
 * Successful response for the `Page.Restore` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Restore rpc",
  })
) {}

/**
 * Typed error channel for the `Page.Restore` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends PageNotFound {}

/**
 * RPC contract definition for `Page.Restore`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.Restore", {
  payload: Payload,
  success: Success,
  error: Error,
});
