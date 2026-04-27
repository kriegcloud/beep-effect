/**
 * A module containing effect schemas for kebab-case strings.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("KebabStr");

/**
 * Branded kebab-case string schema with a lowercase leading letter.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { KebabCaseStr } from "@beep/schema"
 *
 * const value = S.decodeUnknownSync(KebabCaseStr)("my-role-2")
 * console.log(value) // "my-role-2"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const KebabCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, {
      message: "Must be KebabCase format",
    })
  ),
  S.brand("KebabCaseStr"),
  $I.annoteSchema("KebabCaseStr", {
    description: "A branded kebab-case string.",
  })
);

/**
 * Type for {@link KebabCaseStr}.
 *
 * @example
 * ```ts
 * import type { KebabCaseStr } from "@beep/schema"
 *
 * const role = "command-handler" as KebabCaseStr
 * console.log(role)
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type KebabCaseStr = typeof KebabCaseStr.Type;
