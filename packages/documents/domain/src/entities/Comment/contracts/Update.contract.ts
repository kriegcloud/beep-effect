/**
 * Update Comment contract.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Comment/contracts/Update.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CommentErrors from "../Comment.errors";
import * as Comment from "../Comment.model";

const $I = $DocumentsDomainId.create("entities/Comment/contracts/Update.contract");

/**
 * Input payload for `Comment.Update`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.CommentId,
    content: S.optional(S.String),
    contentRich: S.optional(S.Unknown),
  },
  $I.annotations("Payload", {
    description: "Payload for the Update Comment contract.",
  })
) {}

/**
 * Success response for `Comment.Update`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  Comment.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Update Comment contract.",
  })
) {}

/**
 * Failure response for `Comment.Update`.
 *
 * @since 1.0.0
 * @category errors
 */
export class Failure extends CommentErrors.CommentNotFoundError.annotations(
  $I.annotationsHttp("Failure", {
    status: 404,
    description: "Comment not found error for the Update Comment contract.",
  })
) {}

/**
 * Tagged request contract for `Comment.Update`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Update",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Update Comment Request Contract.",
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
  static readonly Endpoint = HttpApiEndpoint.patch("Update", "/:id")
    .setPayload(Payload)
    .addError(Failure)
    .addSuccess(Success);
}
