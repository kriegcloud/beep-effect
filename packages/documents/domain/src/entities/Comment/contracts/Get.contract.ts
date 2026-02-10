/**
 * Get Comment contract.
 *
 * This is a single-source-of-truth contract: it derives the RPC schema, HTTP endpoint,
 * and AI tool definition from the same Effect Schema request.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Comment/contracts/Get.contract
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

const $I = $DocumentsDomainId.create("entities/Comment/contracts/Get.contract");

/**
 * Input payload for `Comment.Get`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Comment Contract.",
  })
) {}

/**
 * Success response for `Comment.Get`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  Comment.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Get Comment Contract.",
  })
) {}

/**
 * Failure response for `Comment.Get`.
 *
 * @since 1.0.0
 * @category errors
 */
export class Failure extends CommentErrors.CommentNotFoundError.annotations(
  $I.annotationsHttp("Failure", {
    status: 404,
    description: "Comment not found error for the Get Comment Contract.",
  })
) {}

/**
 * Tagged request contract for `Comment.Get`.
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
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Comment Request Contract.",
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
  static readonly Endpoint = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(Failure)
    .addSuccess(Success);
}
