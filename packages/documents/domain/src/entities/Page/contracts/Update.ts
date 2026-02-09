import { $DocumentsDomainId } from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import { PageLocked, PageNotFound } from "../Page.errors.ts";
import * as Page from "../Page.model.ts";

const $I = $DocumentsDomainId.create("entities/Page/contracts/Update");

/**
 * Input payload for the `Page.Update` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  Page.Model.update,
  $I.annotations("Payload", {
    description: "Payload for the Page.Update rpc",
  })
) {}

/**
 * Successful response for the `Page.Update` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Update rpc",
  })
) {}

/**
 * Typed error channel for the `Page.Update` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Union(PageNotFound, PageLocked).annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Update rpc",
    documentation: "This should Never happen.",
  })
) {}
export declare namespace Error {
  export type Type = typeof Error.Type;
  export type Encoded = typeof Error.Encoded;
}
/**
 * RPC contract definition for `Page.Update`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make("Page.Update", {
  payload: Payload,
  success: Success,
  error: Error,
});
