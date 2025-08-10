import { Identifier } from "@beep/shared/identity";

/**
 * Shared identifier builder for schema identities.
 *
 * Use as:
 * ```ts
 * const id = sid.shared.schema("Json");
 * // -> stable identity string like "@beep/Json"
 * ```
 *
 * Keeping identity strings stable helps with:
 * - Schema AST identity / caching
 * - Cross-package references
 * - Telemetry & error messages
 *
 * @since 0.1.0
 */
export const sid = Identifier.makeBuilder("@beep/", {
  shared: {
    schema: Identifier.IdSymbol,
  },
} as const);
