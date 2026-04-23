/**
 * A module containing effect schemas for snake_case strings.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("SnakeStr");

/**
 * Branded snake_case string schema.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SnakeCaseStr } from "@beep/schema"
 *
 * const value = S.decodeUnknownSync(SnakeCaseStr)("workflow_status_2")
 * console.log(value) // "workflow_status_2"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const SnakeCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/, {
      message: "Must be SnakeCase format",
    })
  ),
  S.brand("SnakeCaseStr"),
  $I.annoteSchema("SnakeCaseStr", {
    description: "A branded snake_case string.",
  })
);

/**
 * Type for {@link SnakeCaseStr}. {@inheritDoc SnakeCaseStr}
 *
 * @example
 * ```ts
 * import type { SnakeCaseStr } from "@beep/schema"
 *
 * const key = "workflow_status" as SnakeCaseStr
 * console.log(key)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SnakeCaseStr = typeof SnakeCaseStr.Type;
