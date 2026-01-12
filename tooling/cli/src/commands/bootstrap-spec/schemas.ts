/**
 * @file Bootstrap-Spec Input Validation Schemas
 *
 * Defines Effect Schema validation for bootstrap-spec command inputs.
 * Provides type-safe validation for spec names, descriptions, complexity levels,
 * and command options.
 *
 * Spec name rules:
 * - 3-50 characters
 * - Lowercase kebab-case only
 * - Must start with a letter
 * - Only letters, numbers, and hyphens allowed
 *
 * @module bootstrap-spec/schemas
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Minimum allowed length for spec names.
 */
const MIN_NAME_LENGTH = 3;

/**
 * Maximum allowed length for spec names.
 */
const MAX_NAME_LENGTH = 50;

/**
 * Maximum allowed length for spec descriptions.
 */
const MAX_DESCRIPTION_LENGTH = 200;

/**
 * Reserved spec names that conflict with existing structure.
 */
const RESERVED_NAMES = ["agents", "ai-friendliness-audit", "templates", "outputs"] as const;

// -----------------------------------------------------------------------------
// Validation Helpers
// -----------------------------------------------------------------------------

/**
 * Checks if a string is a valid kebab-case identifier starting with a letter.
 * Only lowercase letters, numbers, and hyphens are allowed.
 */
const isValidKebabCase = (value: string): boolean => /^[a-z][a-z0-9-]*$/.test(value);

/**
 * Checks if a name is reserved.
 */
const isReservedName = (value: string): boolean =>
  F.pipe(
    RESERVED_NAMES as readonly string[],
    A.some((reserved) => reserved === value)
  );

/**
 * Validates a spec name according to all rules.
 * Returns a descriptive error message if invalid, or undefined if valid.
 */
const validateSpecName = (name: string): string | undefined => {
  // Check length
  if (F.pipe(name, Str.length) < MIN_NAME_LENGTH) {
    return `Must be at least ${MIN_NAME_LENGTH} characters`;
  }
  if (F.pipe(name, Str.length) > MAX_NAME_LENGTH) {
    return `Must be at most ${MAX_NAME_LENGTH} characters`;
  }

  // Check starts with letter using slice
  const firstChar = F.pipe(name, Str.slice(0, 1));
  if (!/^[a-z]$/.test(firstChar)) {
    return "Must start with a lowercase letter";
  }

  // Check valid characters (kebab-case)
  if (!isValidKebabCase(name)) {
    return "Must be lowercase kebab-case (only letters, numbers, and hyphens)";
  }

  // Check not reserved
  if (isReservedName(name)) {
    return `"${name}" is a reserved name`;
  }

  return undefined;
};

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------

/**
 * Schema for validating spec names.
 *
 * Validates that a spec name:
 * - Is 3-50 characters long
 * - Starts with a lowercase letter
 * - Contains only lowercase letters, numbers, and hyphens (kebab-case)
 * - Is not a reserved name
 *
 * @example
 * ```ts
 * import { SpecName } from "@beep/repo-cli/commands/bootstrap-spec/schemas"
 * import * as S from "effect/Schema"
 *
 * // Valid names
 * S.decodeSync(SpecName)("my-feature")  // ok
 * S.decodeSync(SpecName)("api-redesign") // ok
 *
 * // Invalid names
 * S.decodeSync(SpecName)("ab")            // too short
 * S.decodeSync(SpecName)("MyFeature")     // not kebab-case
 * S.decodeSync(SpecName)("agents")        // reserved
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const SpecName = S.String.pipe(
  S.filter(
    (name): name is string => {
      const error = validateSpecName(name);
      return error === undefined;
    },
    {
      message: (issue) => {
        const name = issue.actual as string;
        const error = validateSpecName(name);
        return error ?? "Invalid spec name";
      },
    }
  ),
  S.brand("SpecName")
);

/**
 * Branded type for validated spec names.
 *
 * @since 0.1.0
 * @category models
 */
export type SpecName = S.Schema.Type<typeof SpecName>;

/**
 * Schema for validating spec descriptions.
 *
 * Validates that a description:
 * - Is non-empty
 * - Is 200 characters or less
 *
 * @example
 * ```ts
 * import { SpecDescription } from "@beep/repo-cli/commands/bootstrap-spec/schemas"
 * import * as S from "effect/Schema"
 *
 * S.decodeSync(SpecDescription)("Implements user authentication flow")  // ok
 * S.decodeSync(SpecDescription)("")  // fails - empty
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const SpecDescription = S.String.pipe(
  S.nonEmptyString({ message: () => "Description cannot be empty" }),
  S.maxLength(MAX_DESCRIPTION_LENGTH, {
    message: () => `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
  })
);

/**
 * Type for validated spec descriptions.
 *
 * @since 0.1.0
 * @category models
 */
export type SpecDescription = S.Schema.Type<typeof SpecDescription>;

/**
 * Schema for spec complexity levels.
 *
 * - `simple`: README + REFLECTION_LOG only
 * - `medium`: Adds QUICK_START + outputs/
 * - `complex`: Full structure with orchestration, templates, handoffs
 *
 * @since 0.1.0
 * @category schemas
 */
export const SpecComplexity = S.Literal("simple", "medium", "complex");

/**
 * Type for spec complexity levels.
 *
 * @since 0.1.0
 * @category models
 */
export type SpecComplexity = S.Schema.Type<typeof SpecComplexity>;

/**
 * Input schema for the bootstrap-spec command.
 *
 * Combines validated spec name, description, complexity, and command options
 * into a single structured input type.
 *
 * @example
 * ```ts
 * import { BootstrapSpecInput } from "@beep/repo-cli/commands/bootstrap-spec/schemas"
 *
 * const input = new BootstrapSpecInput({
 *   specName: "my-feature" as BootstrapSpecInput["specName"],
 *   specDescription: "Implements new feature",
 *   complexity: "medium",
 *   dryRun: false,
 * })
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class BootstrapSpecInput extends S.Class<BootstrapSpecInput>("BootstrapSpecInput")({
  /** Validated spec name in kebab-case */
  specName: SpecName,
  /** Brief description of the spec's purpose */
  specDescription: SpecDescription,
  /** Optional purpose statement for README */
  purpose: S.optionalWith(S.String, { default: () => "" }),
  /** Optional problem statement for README */
  problemStatement: S.optionalWith(S.String, { default: () => "" }),
  /** Optional scope definition for README */
  scope: S.optionalWith(S.String, { default: () => "" }),
  /** Complexity level determining file structure */
  complexity: S.optionalWith(SpecComplexity, { default: () => "medium" as const }),
  /** When true, preview changes without writing files */
  dryRun: S.optionalWith(S.Boolean, { default: () => false }),
}) {}
