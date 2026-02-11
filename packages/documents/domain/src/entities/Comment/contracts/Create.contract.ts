/**
 * Create Comment contract.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module @beep/documents-domain/entities/Comment/contracts/Create.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Comment from "../Comment.model";
import { SerializedEditorStateEnvelope } from "../../../value-objects";
import * as CommentErrors from "../Comment.errors";
const $I = $DocumentsDomainId.create("entities/Comment/contracts/Create.contract");

/**
 * Input payload for `Comment.Create`.
 *
 * Note: `userId` is taken from auth context in handlers, not from the payload.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    discussionId: DocumentsEntityIds.DiscussionId,
    content: S.String,
    contentRich: S.optional(SerializedEditorStateEnvelope),
  },
  $I.annotations("Payload", {
    description: "Payload for the Create Comment contract.",
  })
) {}

/**
 * Success response for `Comment.Create`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Comment.Model.json
  },
  $I.annotations("Success", {
    description: "Success response for the Create Comment contract.",
  })
) {}

/**
 * Failure response for `Comment.Create`.
 *
 * @since 1.0.0
 * @category errors
 */
export const Failure = S.Union(
  CommentErrors.CommentTooLongError,
  CommentErrors.CommentPermissionDeniedError,
);

/**
 * @since 1.0.0
 * @category errors
 */
export type Failure = typeof Failure.Type;

/**
 * Tagged request contract for `Comment.Create`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Create",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Create Comment Request Contract.",
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
  static readonly Http = HttpApiEndpoint.post("Create", "/")
    .setPayload(Payload)
    .addError(CommentErrors.CommentTooLongError)
    .addError(CommentErrors.CommentPermissionDeniedError)
    .addSuccess(Success, { status: 201 });
}
