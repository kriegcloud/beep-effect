/**
 * List Children Pages contract.
 *
 * Cursor-paginated listing of child pages for a given parent page.
 * The cursor is opaque to clients; server implementations encode
 * ordering state (e.g. timestamp + id) as needed.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/ListChildren.contract
 * @since 1.0.0
 * @category contracts
 */
import { PageType } from "@beep/documents-domain/value-objects";
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model";

const $I = $DocumentsDomainId.create("entities/Page/contracts/ListChildren.contract");

/**
 * Input payload for `Page.ListChildren`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    parentId: DocumentsEntityIds.PageId,
    type: S.optionalWith(PageType, { as: "Option" }),
    cursor: S.optionalWith(S.String, { as: "Option" }),
    limit: S.optionalWith(BS.PosInt, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the ListChildren Page contract.",
  })
) {}

/**
 * Success response for `Page.ListChildren`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Page.Model.json),
    nextCursor: BS.FieldOptionOmittable(S.String),
    hasMore: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated list of child pages for a parent page.",
  })
) {}

/**
 * Failure response for `Page.ListChildren`.
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
 * Tagged request contract for `Page.ListChildren`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListChildren",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListChildren Page Request Contract.",
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
  static readonly Http = HttpApiEndpoint.get("ListChildren", "/children")
    .setPayload(Payload)
    .addSuccess(Success);
}
