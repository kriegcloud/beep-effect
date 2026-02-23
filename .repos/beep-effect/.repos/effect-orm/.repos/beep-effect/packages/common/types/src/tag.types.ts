/**
 * Template literal helpers for validating snake_case tags.
 *
 * @example
 * import type * as TagTypes from "@beep/types/tag.types";
 *
 * type EntityTag = TagTypes.SnakeTag<"user_profile">;
 * let example!: EntityTag;
 * void example;
 *
 * @category Types/Tags
 * @since 0.1.0
 */

import type { LowercaseLetter } from "@beep/types/characters";

/**
 * Validates snake_case tags composed of lowercase letters and underscores.
 *
 * @example
 * import type { SnakeTag } from "@beep/types/tag.types";
 *
 * type TenantTag = SnakeTag<"tenant_id">;
 * let example!: TenantTag;
 * void example;
 *
 * @category Types/Tags
 * @since 0.1.0
 */
export type SnakeTag<S extends string = string> = S extends `${LowercaseLetter}${infer R}`
  ? ValidateSnakeAfterLetter<R, S>
  : never;

/**
 * Convenience alias for `_` when building composite template literal tags.
 *
 * @example
 * import type { Underscore } from "@beep/types/tag.types";
 *
 * type Prefixed = `${Underscore}${"id" | "name"}`;
 * let example!: Prefixed;
 * void example;
 *
 * @category Types/Tags
 * @since 0.1.0
 */
export type Underscore = "_";

type ValidateSnakeAfterLetter<R extends string, Original extends string> = R extends ""
  ? Original
  : R extends `${LowercaseLetter}${infer Rest}`
    ? ValidateSnakeAfterLetter<Rest, Original>
    : R extends `${Underscore}${LowercaseLetter}${infer Rest}`
      ? ValidateSnakeAfterLetter<Rest, Original>
      : never;
