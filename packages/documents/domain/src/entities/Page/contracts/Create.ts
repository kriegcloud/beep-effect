import {$DocumentsDomainId} from "@beep/identity/packages";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as Page from "../Page.model.ts";
import {PageNotFound, PageLocked} from "../Page.errors.ts";
const $I = $DocumentsDomainId.create("entities/Page/contracts/Create");

/**
 * Input payload for the `Page.Create` RPC.
 *
 * @category models
 * @since 1.0.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  Page.Model.insert,
  $I.annotations("Payload", {
    description: "Payload for the Page.Create rpc",
  })
) {
}

/**
 * Successful response for the `Page.Create` RPC.
 *
 * @category DTO
 * @since 1.0.0
 */
export class Success extends S.Class<Success>($I`Success`)(
Page.Model.json,
  $I.annotations("Success", {
    description: "Success response for the Page.Create rpc",
  })
) {
}

/**
 * Typed error channel for the `Page.Create` RPC.
 *
 * @category errors
 * @since 1.0.0
 */
export class Error extends S.Union(PageNotFound, PageLocked).annotations(
  $I.annotations("Error", {
    description: "Error response for the Page.Create rpc",
    documentation: "This should Never happen."
  })) {
}

export declare namespace Error {
  export type Type = typeof Error.Type;
  export type Encoded = typeof Error.Encoded;
}

/**
 * RPC contract definition for `Page.Create`.
 *
 * @category contracts
 * @since 1.0.0
 */
export const Contract = Rpc.make(
  "Page.Create",
  {
    payload: Payload,
    success: Success,
    error: Error
  }
);