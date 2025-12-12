import * as S from "effect/Schema";

/**
 * Authentication error with optional context.
 *
 * Used for all authentication operation failures including
 * sign-up, sign-in, session, and password reset errors.
 *
 * @since 1.0.0
 * @category Errors
 *
 * @example
 * ```ts
 * new AuthError({
 *   message: "Failed to sign in",
 *   context: { email: "user@example.com" }
 * })
 * ```
 */
export class AuthError extends S.TaggedError<AuthError>()("AuthError", {
  message: S.String,
  context: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {}
