/**
 * Box driver error models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import { CauseTaggedError } from "@beep/schema";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $BoxId.create("Box.errors");

/**
 * Additional context supplied by Box API error payloads.
 *
 * @category errors
 * @since 0.0.0
 */
export class BoxErrorContextInfo extends S.Class<BoxErrorContextInfo>($I`BoxErrorContextInfo`)(
  {
    message: S.String,
  },
  $I.annote("BoxErrorContextInfo", {
    description: "additional context information for Box errors",
  })
) {}

/**
 * Typed Box driver error.
 *
 * @category errors
 * @since 0.0.0
 */
export class BoxError extends CauseTaggedError<BoxError>($I`BoxError`)(
  "BoxError",
  {
    type: S.String,
    status: S.Number,
    code: S.String,
    context_info: BoxErrorContextInfo,
    help_url: S.URLFromString,
    request_id: S.String,
  },
  $I.annote("BoxError", {
    description: "technical failure emitted by Box.",
  })
) {
  static readonly newCause: {
    (cause: unknown, extra: Omit<BoxError, "cause">): BoxError;
    (cause: unknown): (extra: Omit<BoxError, "cause">) => BoxError;
  } = dual(
    2,
    (cause: unknown, extra: Omit<BoxError, "cause">): BoxError =>
      BoxError.make({
        cause,
        ...extra,
      })
  );
}
