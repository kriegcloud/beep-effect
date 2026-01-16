import { $IamClientId } from "@beep/identity/packages";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/schema.helpers");
// ============================================================================
// Better Auth Response Utilities
// ============================================================================

/**
 * Schema for Better Auth error responses
 */
export class BetterAuthErrorSchema extends S.Class<BetterAuthErrorSchema>($I`BetterAuthErrorSchema`)(
  {
    message: S.optional(S.String),
    code: S.optional(S.String),
    status: S.optional(S.Number),
  },
  $I.annotations("BetterAuthError", {
    description: "An error from the BetterAuth library",
  })
) {}

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
