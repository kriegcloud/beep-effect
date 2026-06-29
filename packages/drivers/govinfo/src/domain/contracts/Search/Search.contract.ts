/**
 * The Search contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { HttpStatus2XX, HttpStatus4XX, HttpStatus5XX } from "@beep/schema/HttpStatus";
import * as S from "effect/Schema";
import { HttpApiSchema } from "effect/unstable/httpapi";
import { SearchBody } from "../..//values/index.ts";
import { SearchResponse } from "../../values/SearchResponse/index.ts";

const $I = $GovinfoId.create("domain/contracts/Search/Search.contract");

/**
 * TODO
 *
 * @example
 * ```ts
 * import { Payload } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(Payload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Payload extends SearchBody.extend<Payload>($I`Payload`)(
  {},
  $I.annote("Payload", {
    description: "",
  })
) {}

/**
 * TODO
 *
 * @example
 * ```ts
 * import { Success } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(Success)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Success extends SearchResponse.extend<Success>($I`Success`)(
  {},
  $I.annote("Success", {
    description: "",
    status: HttpStatus2XX.From.Enum.Ok,
  })
) {}

/**
 * Bad-request failure returned by the GovInfo search endpoint.
 *
 * @example
 * ```ts
 * import { FailureBadRequest } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(FailureBadRequest)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FailureBadRequest extends TaggedErrorClass<FailureBadRequest>($I`FailureBadRequest`)(
  "FailureBadRequest",
  {
    cause: S.OptionFromOptionalKey(S.Defect()),
    status: S.tag(HttpStatus4XX.From.Enum.BadRequest),
  },
  $I.annote("FailureBadRequest", {
    description: "",
  })
) {}

/**
 * Not-found failure returned by the GovInfo search endpoint.
 *
 * @example
 * ```ts
 * import { FailureNotFound } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(FailureNotFound)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FailureNotFound extends TaggedErrorClass<FailureNotFound>($I`FailureNotFound`)(
  "FailureNotFound",
  {
    cause: S.OptionFromOptionalKey(S.Defect()),
    status: S.tag(HttpStatus4XX.From.Enum.NotFound),
  },
  $I.annote("FailureNotFound", {
    description: "",
  })
) {}

/**
 * Internal-server-error failure returned by the GovInfo search endpoint.
 *
 * @example
 * ```ts
 * import { FailureInternalServerError } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(FailureInternalServerError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FailureInternalServerError extends TaggedErrorClass<FailureInternalServerError>(
  $I`FailureInternalServerError`
)(
  "FailureInternalServerError",
  {
    cause: S.OptionFromOptionalKey(S.Defect()),
    status: S.tag(HttpStatus5XX.From.Enum.InternalServerError),
  },
  $I.annote("FailureInternalServerError", {
    description: "",
  })
) {}

/**
 * Tagged union of GovInfo search endpoint failures.
 *
 * @example
 * ```ts
 * import { Failure } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * console.log(Failure.ast)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const Failure = S.Union([
  FailureBadRequest.pipe(HttpApiSchema.status(400)),
  FailureNotFound.pipe(HttpApiSchema.status(404)),
  FailureInternalServerError.pipe(HttpApiSchema.status(500)),
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Failure", {
    description: "",
  })
);

/**
 * Type for {@link Failure}.
 *
 * @example
 * ```ts
 * import type { Failure } from "@beep/govinfo/domain/contracts/Search/Search.contract"
 *
 * const tag: Failure["_tag"] = "FailureBadRequest"
 * console.log(tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type Failure = typeof Failure.Type;

/**
 * Companion namespace for {@link Failure}.
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace Failure {
  /**
   * Encoded type for {@link Failure}.
   *
   * @example
   * ```ts
   * import type { Failure } from "@beep/govinfo/domain/contracts/Search/Search.contract"
   *
   * const tag: Failure.Encoded["_tag"] = "FailureBadRequest"
   * console.log(tag)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  export type Encoded = typeof Failure.Encoded;
}
