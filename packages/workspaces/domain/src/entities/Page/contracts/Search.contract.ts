/**
 * Search Pages contract.
 *
 * Cursor-paginated search of pages within an organization.
 * The cursor is opaque to clients; server implementations encode
 * ordering state (e.g. timestamp + id) as needed.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/Search.contract
 * @since 1.0.0
 * @category contracts
 */

import { $WorkspacesDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { PageType } from "@beep/workspaces-domain/value-objects";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model";

const $I = $WorkspacesDomainId.create("entities/Page/contracts/Search.contract");

/**
 * Input payload for `Page.Search`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    type: S.optionalWith(PageType, { as: "Option" }),
    includeArchived: S.optionalWith(S.BooleanFromString, { as: "Option" }),
    cursor: S.optionalWith(S.String, { as: "Option" }),
    limit: S.optionalWith(S.NumberFromString.pipe(S.int(), S.positive()), { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Search Page contract.",
  })
) {}

/**
 * Success response for `Page.Search`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Page.Model.json),
    nextCursor: S.optionalWith(S.String, { as: "Option" }),
    hasMore: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated search results for pages.",
  })
) {}

/**
 * Failure response for `Page.Search`.
 *
 * @since 1.0.0
 * @category errors
 */
export const Failure = S.Never;

/**
 * @since 1.0.0
 * @category errors
 */
export type Failure = typeof Failure.Type;

/**
 * Tagged request contract for `Page.Search`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Search",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Search Page Request Contract.",
  })
) {
  /**
   * RPC schema derived from the contract.
   *
   * @since 1.0.0
   * @category rpcs
   */
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);

  /**
   * AI tool derived from the contract.
   *
   * @since 1.0.0
   * @category ai
   */
  static readonly Tool = Tool.fromTaggedRequest(Contract);

  /**
   * HTTP endpoint derived from the contract (documentation-first).
   *
   * @since 1.0.0
   * @category http
   */
  static readonly Http = HttpApiEndpoint.get("Search", "/search").setPayload(Payload).addSuccess(Success);
}
