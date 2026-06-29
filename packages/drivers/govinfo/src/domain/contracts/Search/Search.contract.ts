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

export type Failure = typeof Failure.Type;

export declare namespace Failure {
  export type Encoded = typeof Failure.Encoded;
}
