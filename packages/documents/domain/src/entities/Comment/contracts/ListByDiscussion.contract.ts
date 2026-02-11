/**
 * List Comments By Discussion contract.
 *
 * Cursor-paginated listing of comments for a given discussion.
 * The cursor is opaque to clients; server implementations encode
 * ordering state (e.g. timestamp + id) as needed.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Comment/contracts/ListByDiscussion.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Comment from "../Comment.model";

const $I = $DocumentsDomainId.create("entities/Comment/contracts/ListByDiscussion.contract");

/**
 * Input payload for `Comment.ListByDiscussion`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    discussionId: DocumentsEntityIds.DiscussionId,
    cursor: S.optional(S.String),
    limit: S.optionalWith(S.Number.pipe(S.int(), S.between(1, 100)), { default: () => 20 }),
  },
  $I.annotations("Payload", {
    description: "Payload for the ListByDiscussion Comment contract.",
  })
) {}

/**
 * Success response for `Comment.ListByDiscussion`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Comment.Model.json),
    nextCursor: BS.FieldOptionOmittable(S.String),
    hasMore: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Paginated list of comments for a discussion.",
  })
) {}

/**
 * Failure response for `Comment.ListByDiscussion`.
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
 * Tagged request contract for `Comment.ListByDiscussion`.
 *
 * This class is the schema source of truth:
 * - `Contract.Rpc` is used by `Comment.rpc.ts`
 * - `Contract.Http` is used by `Comment.http.ts`
 * - `Contract.Tool` is used by `Comment.tool.ts`
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "ListByDiscussion",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "ListByDiscussion Comment Request Contract.",
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
  static readonly Http = HttpApiEndpoint.get("ListByDiscussion", "/")
    .setPayload(Payload)
    .addSuccess(Success);
}
