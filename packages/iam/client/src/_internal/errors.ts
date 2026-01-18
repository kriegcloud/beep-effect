import { $IamClientId } from "@beep/identity/packages";
import { BetterAuthError as _BetterAuthError } from "@better-auth/core/error";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/errors");

export class BetterAuthError extends S.instanceOf(_BetterAuthError).annotations(
  $I.annotations("BetterAuthError", {
    description: "An error from the BetterAuth library",
  })
) {}

export declare namespace BetterAuthError {
  export type Type = typeof BetterAuthError.Type;
}

export class UnknownIamError extends S.TaggedError<UnknownIamError>($I`UnknownIamError`)("UnknownIamError", {
  cause: S.Defect,
}) {
  override get message() {
    return "An unknown error occurred";
  }
}

export class IamBetterAuthError extends S.TaggedError<IamBetterAuthError>($I`IamError`)(
  "IamError",
  {
    cause: BetterAuthError,
    message: S.String,
  },
  $I.annotations("IamError", {
    description: "An error from the IAM client",
  })
) {}

export class IamError extends S.Union(IamBetterAuthError, UnknownIamError) {
  static readonly fromUnknown = (error: unknown): IamError.Type => {
    if (S.is(BetterAuthError)(error)) {
      return new IamBetterAuthError({
        cause: error,
        message: error.message,
      });
    }
    return new UnknownIamError({
      cause: error,
    });
  };
}

export declare namespace IamError {
  export type Type = typeof IamError.Type;
}

// ============================================================================
// Data.TaggedError-Based Errors (for yieldable errors in generators)
// ============================================================================

/**
 * Error thrown when Better Auth returns an error in its response.
 *
 * This error type uses Data.TaggedError which allows it to be
 * yielded directly in Effect generators without Effect.fail().
 *
 * @example
 * ```ts
 * // Can be yielded directly in generators
 * if (response.error !== null) {
 *   yield* new BetterAuthResponseError({
 *     message: response.error.message ?? "API error",
 *     code: response.error.code,
 *   });
 * }
 *
 * // Selective recovery with catchTag
 * effect.pipe(
 *   Effect.catchTag("BetterAuthResponseError", (e) =>
 *     Effect.succeed(handleApiError(e))
 *   )
 * );
 * ```
 */
export class BetterAuthResponseError extends Data.TaggedError("BetterAuthResponseError")<{
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
}> {}
