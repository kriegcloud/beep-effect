/**
 * Move Page contract.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/Move.contract
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
import * as Page from "../Page.model";

const $I = $WorkspacesDomainId.create("entities/Page/contracts/Move.contract");

/**
 * Input payload for `Page.Move`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: WorkspacesEntityIds.PageId,
    parentId: S.optionalWith(WorkspacesEntityIds.PageId, { as: "Option" }),
    position: S.optionalWith(S.Number, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "Payload for the Move Page contract.",
  })
) {}

/**
 * Success response for `Page.Move`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Page.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Move Page contract.",
  })
) {}

/**
 * Failure response for `Page.Move`.
 *
 * @since 1.0.0
 * @category errors
 */
export const Failure = S.Union(PageErrors.PageNotFound, PageErrors.PageCyclicNesting);

/**
 * @since 1.0.0
 * @category errors
 */
export type Failure = typeof Failure.Type;

/**
 * Tagged request contract for `Page.Move`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Move",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Move Page Request Contract.",
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
  static readonly Http = HttpApiEndpoint.post("Move", "/:id/move")
    .setPayload(Payload)
    .addError(PageErrors.PageNotFound)
    .addError(PageErrors.PageCyclicNesting)
    .addSuccess(Success);
}
