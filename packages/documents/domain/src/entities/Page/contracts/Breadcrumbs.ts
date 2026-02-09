import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import {Breadcrumb} from "../Page.values";
import {PageNotFound} from "../Page.errors.ts";
import {DocumentsEntityIds} from "@beep/shared-domain";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Breadcrumbs");

/**
 * Input payload for the `Page.Breadcrumbs` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId
  },
  $I.annotations("Payload", {
    description: "Payload for the Page.Breadcrumbs rpc",
  })
) {
}

/**
 * Successful response for the `Page.Breadcrumbs` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends Breadcrumb.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "Success response for the Page.Breadcrumbs rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Breadcrumbs` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends PageNotFound.annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Breadcrumbs rpc",
  })) {
}

/**
 * RPC contract definition for `Page.Breadcrumbs`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Breadcrumbs",
  {
    payload: Payload,
    success: Success,
    error: Error,
    stream: true,
  }
);