/**
 * @file Create-Slice Input Validation Schemas
 *
 * Defines Effect Schema validation for create-slice command inputs.
 * Provides type-safe validation for slice names, descriptions, and command options.
 *
 * Slice name rules:
 * - 3-50 characters
 * - Lowercase kebab-case only
 * - Must start with a letter
 * - Only letters, numbers, and hyphens allowed
 * - Cannot use reserved names (shared, common, runtime, ui, _internal)
 *
 * @module create-slice/schemas
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Reserved slice names that conflict with existing workspace structure.
 * These names cannot be used for new slices.
 */
const RESERVED_NAMES = ["shared", "common", "runtime", "ui", "_internal"] as const;

/**
 * Minimum allowed length for slice names.
 */
const MIN_NAME_LENGTH = 3;

/**
 * Maximum allowed length for slice names.
 */
const MAX_NAME_LENGTH = 50;

/**
 * Maximum allowed length for slice descriptions.
 */
const MAX_DESCRIPTION_LENGTH = 200;

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
 * Validates a slice name according to all rules.
 * Returns a descriptive error message if invalid, or undefined if valid.
 */
const validateSliceName = (name: string): string | undefined => {
  // Check length
  if (F.pipe(name, Str.length) < MIN_NAME_LENGTH) {
    return `Must be at least ${MIN_NAME_LENGTH} characters`;
  }
  if (F.pipe(name, Str.length) > MAX_NAME_LENGTH) {
    return `Must be at most ${MAX_NAME_LENGTH} characters`;
  }

  // Check starts with letter using slice instead of charAt (returns string, not Option)
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
 * Schema for validating slice names.
 *
 * Validates that a slice name:
 * - Is 3-50 characters long
 * - Starts with a lowercase letter
 * - Contains only lowercase letters, numbers, and hyphens (kebab-case)
 * - Is not a reserved name (shared, common, runtime, ui, _internal)
 *
 * @example
 * ```ts
 * import { SliceName } from "@beep/repo-cli/commands/create-slice/schemas"
 * import * as S from "effect/Schema"
 *
 * // Valid names
 * S.decodeSync(SliceName)("notifications")  // ok
 * S.decodeSync(SliceName)("user-profile")   // ok
 * S.decodeSync(SliceName)("billing-v2")     // ok
 *
 * // Invalid names
 * S.decodeSync(SliceName)("ab")             // too short
 * S.decodeSync(SliceName)("UserProfile")    // not kebab-case
 * S.decodeSync(SliceName)("shared")         // reserved
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const SliceName = S.String.pipe(
  S.filter(
    (name): name is string => {
      const error = validateSliceName(name);
      return error === undefined;
    },
    {
      message: (issue) => {
        const name = issue.actual as string;
        const error = validateSliceName(name);
        return error ?? "Invalid slice name";
      },
    }
  ),
  S.brand("SliceName")
);

/**
 * Branded type for validated slice names.
 *
 * @since 0.1.0
 * @category models
 */
export type SliceName = S.Schema.Type<typeof SliceName>;

/**
 * Schema for validating slice descriptions.
 *
 * Validates that a description:
 * - Is non-empty
 * - Is 200 characters or less
 *
 * @example
 * ```ts
 * import { SliceDescription } from "@beep/repo-cli/commands/create-slice/schemas"
 * import * as S from "effect/Schema"
 *
 * S.decodeSync(SliceDescription)("Handles user notifications and alerts")  // ok
 * S.decodeSync(SliceDescription)("")  // fails - empty
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export const SliceDescription = S.String.pipe(
  S.nonEmptyString({ message: () => "Description cannot be empty" }),
  S.maxLength(MAX_DESCRIPTION_LENGTH, {
    message: () => `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
  })
);

/**
 * Type for validated slice descriptions.
 *
 * @since 0.1.0
 * @category models
 */
export type SliceDescription = S.Schema.Type<typeof SliceDescription>;

/**
 * Input schema for the create-slice command.
 *
 * Combines validated slice name, description, and command options
 * into a single structured input type.
 *
 * @example
 * ```ts
 * import { CreateSliceInput } from "@beep/repo-cli/commands/create-slice/schemas"
 * import * as S from "effect/Schema"
 *
 * const input = new CreateSliceInput({
 *   sliceName: "notifications" as CreateSliceInput["sliceName"],
 *   sliceDescription: "Handles user notifications",
 *   dryRun: false,
 * })
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class CreateSliceInput extends S.Class<CreateSliceInput>("CreateSliceInput")({
  /** Validated slice name in kebab-case */
  sliceName: SliceName,
  /** Brief description of the slice's purpose */
  sliceDescription: SliceDescription,
  /** When true, preview changes without writing files */
  dryRun: S.Boolean,
}) {}
