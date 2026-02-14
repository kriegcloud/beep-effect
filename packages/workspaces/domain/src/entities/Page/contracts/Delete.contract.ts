/**
 * Delete Page contract.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/Delete.contract
 * @since 1.0.0
 * @category contracts
 */
import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as PageErrors from "../Page.errors";

const $I = $WorkspacesDomainId.create("entities/Page/contracts/Delete.contract");

/**
 * Input payload for `Page.Delete`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.PageId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Page contract.",
  })
) {}

/**
 * Success response for `Page.Delete`.
 *
 * @since 1.0.0
 * @category DTO
 */
export const Success = S.Void;

/**
 * @since 1.0.0
 * @category DTO
 */
export type Success = typeof Success.Type;

/**
 * Failure response for `Page.Delete`.
 *
 * @since 1.0.0
 * @category errors
 */
export const Failure = PageErrors.PageNotFound;

/**
 * @since 1.0.0
 * @category errors
 */
export type Failure = typeof Failure.Type;

/**
 * Tagged request contract for `Page.Delete`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Page Request Contract.",
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
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(PageErrors.PageNotFound)
    .addSuccess(Success, { status: 204 });
}
