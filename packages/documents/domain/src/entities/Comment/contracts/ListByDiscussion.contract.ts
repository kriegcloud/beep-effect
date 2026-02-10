/**
 * List Comments By Discussion contract.
 *
 * This is a single-source-of-truth contract: it derives the RPC schema, HTTP endpoint,
 * and AI tool definition from the same Effect Schema request.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Comment/contracts/ListByDiscussion.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
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
export const Success = S.Array(Comment.Model.json).annotations(
  $I.annotations("Success", {
    description: "Success response for the ListByDiscussion Comment contract.",
  })
);

/**
 * `Success` TypeScript type for `Comment.ListByDiscussion`.
 *
 * @since 1.0.0
 * @category DTO
 */
export type Success = S.Schema.Type<typeof Success>;

/**
 * Failure response for `Comment.ListByDiscussion`.
 *
 * @since 1.0.0
 * @category errors
 */
export class Failure extends S.Never.annotations(
  $I.annotations("Failure", {
    description: "No typed failure for the ListByDiscussion Comment contract.",
  })
) {}

/**
 * Tagged request contract for `Comment.ListByDiscussion`.
 *
 * This class is the schema source of truth:
 * - `Contract.Rpc` is used by `Comment.rpc.ts`
 * - `Contract.Endpoint` is used by `Comment.http.ts`
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
  static readonly Endpoint = HttpApiEndpoint.get("ListByDiscussion", "/")
    .setPayload(Payload)
    .addSuccess(Success);
}
