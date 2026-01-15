import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import type * as S from "effect/Schema";

/**
 * Internal annotation tuple type that avoids circular reference issues.
 * Uses `any` for Self to prevent TypeScript from trying to resolve
 * the class type before it's fully defined.
 *
 * Position 0: "to" schema annotations (the class type)
 * Position 1: transformation annotations (where AST.getAnnotation looks)
 * Position 2: "from" schema annotations (the encoded struct type)
 */
type FormAnnotationsTuple = readonly [
  S.Annotations.Schema<UnsafeTypes.UnsafeAny> | undefined,
  S.Annotations.Schema<UnsafeTypes.UnsafeAny> | undefined,
  undefined,
];

/**
 * Creates class annotations with default form values for the **Encoded** (input) type.
 *
 * The defaults are placed on the **transformation** annotations (position 1 in the tuple)
 * so they can be retrieved via `AST.getAnnotation` on the class schema's AST.
 *
 * Use this when defining S.Class schemas that will be used with forms. The defaults
 * should match the encoded/input type (plain strings, numbers, booleans) that HTML
 * form inputs produce, NOT the decoded type (Redacted, Option, Brand, etc.).
 *
 * @param classAnnotations - Schema annotations for the class (identifier, description, etc.)
 * @param defaults - Default values matching the struct's **Encoded** type (e.g., plain strings for Redacted fields)
 * @returns A tuple of annotations compatible with S.Class, with defaults on the transformation
 *
 * @example
 * ```ts
 * // For a schema with transformations:
 * class LoginForm extends S.Class<LoginForm>("LoginForm")({
 *   email: S.Redacted(Email),     // Type: Redacted<string>, Encoded: string
 *   password: S.Redacted(Password), // Type: Redacted<string>, Encoded: string
 *   rememberMe: S.Boolean,        // Type: boolean, Encoded: boolean
 * }, withFormAnnotations(
 *   { identifier: "LoginForm" },
 *   { email: "", password: "", rememberMe: false }  // Uses Encoded types
 * )) {}
 * ```
 */
export const withFormAnnotations = <Self, Encoded extends Record<string, unknown>>(
  classAnnotations: S.Annotations.Schema<Self> | undefined,
  defaults: Encoded
): FormAnnotationsTuple => [
  classAnnotations,
  // Position 1: transformation annotations - this is where AST.getAnnotation looks
  { [BS.DefaultFormValuesAnnotationId]: defaults },
  undefined,
];
