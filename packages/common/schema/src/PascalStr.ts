/**
 * A module containing effect schemas for PascalCase strings.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("PascalStr");

/**
 * Branded PascalCase string schema.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PascalCaseStr } from "@beep/schema"
 *
 * const value = S.decodeUnknownSync(PascalCaseStr)("WorkflowStatus")
 * console.log(value) // "WorkflowStatus"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const PascalCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$/, {
      message: "Must be PascalCase format",
    })
  ),
  S.brand("PascalCaseStr"),
  $I.annoteSchema("PascalCaseStr", {
    description: "A branded PascalCase string.",
  })
);

/**
 * Type for {@link PascalCaseStr}.
 *
 * @example
 * ```ts
 * import type { PascalCaseStr } from "@beep/schema"
 *
 * const name = "WorkflowStatus" as PascalCaseStr
 * console.log(name)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PascalCaseStr = typeof PascalCaseStr.Type;
