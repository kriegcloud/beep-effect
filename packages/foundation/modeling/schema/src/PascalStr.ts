/**
 * A module containing effect schemas for PascalCase strings.
 *
 * @packageDocumentation
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
 * @category validation
 */
export const PascalCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$/, {
      message: "Must be PascalCase format",
    })
  )
)
  .annotate({
    toArbitrary: () => (fc) =>
      fc.stringMatching(/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$/).map((value) => value as NonEmptyTrimmedStr),
  })
  .pipe(
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
 * import * as S from "effect/Schema"
 * import type { PascalCaseStr } from "@beep/schema"
 * import { PascalCaseStr as PascalCaseStrSchema } from "@beep/schema"
 *
 * const name: PascalCaseStr = S.decodeUnknownSync(PascalCaseStrSchema)("WorkflowStatus")
 * console.log(name)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PascalCaseStr = typeof PascalCaseStr.Type;
