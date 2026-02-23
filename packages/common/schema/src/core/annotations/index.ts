/**
 * Aggregated annotation helpers for schema.
 *
 * Exposes default metadata symbols alongside example utilities.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Annotations } from "@beep/schema/core";
 *
 * const schema = S.String.annotations({ [Annotations.BSFieldName]: "email" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export * from "./default";
/**
 * Re-exports annotations used to seed default form values.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export * from "./default-form-values-annotations";
/**
 * Example annotation helpers for docs re-export.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export * from "./example-annotations";
