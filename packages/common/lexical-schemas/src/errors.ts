/**
 * Error types for Lexical schema validation.
 *
 * @example
 * ```typescript
 * import { LexicalSchemaValidationError } from "@beep/lexical-schemas/errors";
 * ```
 *
 * @category Errors
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $LexicalSchemasId.create("errors");

/**
 * Error thrown when Lexical editor state validation fails.
 *
 * @example
 * ```typescript
 * import { LexicalSchemaValidationError } from "@beep/lexical-schemas/errors";
 *
 * new LexicalSchemaValidationError({
 *   message: "Invalid node type",
 *   nodeType: "unknown",
 *   path: ["root", "children", "0"],
 * });
 * ```
 *
 * @category Errors
 * @since 0.1.0
 */
export class LexicalSchemaValidationError extends S.TaggedError<LexicalSchemaValidationError>()(
  "LexicalSchemaValidationError",
  {
    message: S.String,
    nodeType: S.optional(S.String),
    path: S.optional(S.Array(S.String)),
  },
  $I.annotations("LexicalSchemaValidationError", {
    description: "Error validating Lexical editor state schema",
    documentation:
      "Thrown when validation of Lexical editor state fails. Includes the validation error message, optional node type where the error occurred, and path to the invalid node within the editor state tree.",
    message: () => "Lexical schema validation failed",
    parseIssueTitle: () => "Schema validation error",
  })
) {}

/**
 * Namespace for LexicalSchemaValidationError types.
 *
 * @category Errors
 * @since 0.1.0
 */
export declare namespace LexicalSchemaValidationError {
  /**
   * Runtime type for LexicalSchemaValidationError.
   */
  export type Type = typeof LexicalSchemaValidationError.Type;
}

/**
 * Error thrown when an unknown node type is encountered.
 *
 * @example
 * ```typescript
 * import { UnknownNodeTypeError } from "@beep/lexical-schemas/errors";
 *
 * new UnknownNodeTypeError({
 *   message: "Unknown node type: custom-node",
 *   nodeType: "custom-node",
 * });
 * ```
 *
 * @category Errors
 * @since 0.1.0
 */
export class UnknownNodeTypeError extends S.TaggedError<UnknownNodeTypeError>()(
  "UnknownNodeTypeError",
  {
    message: S.String,
    nodeType: S.String,
  },
  $I.annotations("UnknownNodeTypeError", {
    description: "Error for unknown Lexical node types",
    documentation:
      "Thrown when an unknown node type is encountered during validation. This typically indicates that the editor state contains a custom node type that is not defined in the schema.",
    message: () => "Unknown Lexical node type encountered",
    parseIssueTitle: () => "Unknown node type error",
  })
) {}

/**
 * Namespace for UnknownNodeTypeError types.
 *
 * @category Errors
 * @since 0.1.0
 */
export declare namespace UnknownNodeTypeError {
  /**
   * Runtime type for UnknownNodeTypeError.
   */
  export type Type = typeof UnknownNodeTypeError.Type;
}
