/**
 * Aggregated annotation helpers for schema-v2.
 *
 * Exposes default metadata symbols alongside example utilities.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Annotations } from "@beep/schema-v2/core";
 *
 * const schema = S.String.annotations({ [Annotations.BSFieldName]: "email" });
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export * from "./default";
/**
 * Example annotation helpers for docs re-export.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export * from "./example-annotations";
