/**
 * Breadcrumbs Page contract (streaming).
 *
 * Streams breadcrumb ancestry for a given page.
 * RPC-only -- no HTTP endpoint or AI tool.
 *
 * Export contract (keep stable across entities):
 * - `Payload`, `Success`, `Failure`, `Contract`
 *
 * @module documents-domain/entities/Page/contracts/Breadcrumbs.contract
 * @since 1.0.0
 * @category contracts
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcSchema from "@effect/rpc/RpcSchema";
import * as S from "effect/Schema";
import * as PageErrors from "../Page.errors";
import { Breadcrumb } from "../Page.values";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Breadcrumbs.contract");

/**
 * Input payload for `Page.Breadcrumbs`.
 *
 * @since 1.0.0
 * @category models
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Breadcrumbs Page contract.",
  })
) {}

/**
 * Success response for `Page.Breadcrumbs`.
 *
 * @since 1.0.0
 * @category DTO
 */
export const Success = RpcSchema.Stream({
  success: Breadcrumb,
  failure: S.Never,
});

/**
 * @since 1.0.0
 * @category DTO
 */
export type Success = S.Schema.Type<typeof Success>;

/**
 * Failure response for `Page.Breadcrumbs`.
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
 * Tagged request contract for `Page.Breadcrumbs`.
 *
 * RPC-only contract -- no HTTP endpoint or AI tool.
 *
 * @since 1.0.0
 * @category contracts
 */
export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Breadcrumbs",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotations("Contract", {
    description: "Breadcrumbs Page Request Contract.",
  })
) {
  /**
   * RPC schema derived from the contract.
   *
   * @since 1.0.0
   * @category rpcs
   */
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
}
