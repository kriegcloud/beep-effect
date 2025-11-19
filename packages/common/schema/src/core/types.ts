/**
 * Shared type aliases that power schema tagged unions and struct defaults.
 *
 * These helpers centralize property signatures so downstream modules reuse the same inference surface.
 *
 * @example
 * import type { OptionalWithDefault } from "@beep/schema/core/types";
 *
 * type WithTag = OptionalWithDefault<"Example">;
 *
 * @category Core/Types
 * @since 0.1.0
 */
import type * as S from "effect/Schema";

/**
 * Property signature helper that keeps `_tag`-style discriminators optional in the encoded type while retaining defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import type { OptionalWithDefault } from "@beep/schema/core/types";
 *
 * type Tagged = S.Struct<{
 *   readonly _tag: OptionalWithDefault<"Person">;
 * }>;
 *
 * @category Core/Types
 * @since 0.1.0
 */
export type OptionalWithDefault<Value> = S.PropertySignature<
  ":",
  Exclude<Value, undefined>,
  never,
  "?:",
  Value | undefined,
  true,
  never
>;
