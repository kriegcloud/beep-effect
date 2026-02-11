/**
 * Archive Page contract.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/Archive.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as PageErrors from "../Page.errors";
import * as Page from "../Page.model";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Archive.contract");

/**
 * Input payload for `Page.Archive`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Archive Page contract.",
  })
) {}

/**
 * Success response for `Page.Archive`.
 *
 * @since 1.0.0
 * @category DTO
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Page.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Archive Page contract.",
  })
) {}

/**
 * Failure response for `Page.Archive`.
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
 * Tagged request contract for `Page.Archive`.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Archive",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Archive Page Request Contract.",
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
  static readonly Http = HttpApiEndpoint.post("Archive", "/:id/archive")
    .setPayload(Payload)
    .addError(PageErrors.PageNotFound)
    .addSuccess(Success);
}
