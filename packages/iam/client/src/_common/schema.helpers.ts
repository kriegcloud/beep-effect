import * as O from "effect/Option";
import * as S from "effect/Schema";

// ============================================================================
// Better Auth Response Utilities
// ============================================================================

/**
 * Schema for Better Auth error responses
 */
export const BetterAuthErrorSchema = S.Struct({
  message: S.optional(S.String),
  code: S.optional(S.String),
  status: S.optional(S.Number),
});

export type BetterAuthErrorShape = S.Schema.Type<typeof BetterAuthErrorSchema>;

/**
 * Extracts an error message from a Better Auth error object.
 *
 * @param error - The error object from Better Auth response
 * @returns The error message string
 */
export const extractBetterAuthErrorMessage = (error: unknown): string => {
  const errorResult = S.decodeUnknownOption(BetterAuthErrorSchema)(error);
  return O.match(errorResult, {
    onNone: () => "Unknown API error",
    onSome: (err) => err.message ?? "API error",
  });
};

// ============================================================================
// Re-export existing annotation helper
// ============================================================================

// The withFormAnnotations helper is already well-designed
// Re-export from common.annotations.ts for convenience
export { withFormAnnotations } from "./common.annotations.ts";
