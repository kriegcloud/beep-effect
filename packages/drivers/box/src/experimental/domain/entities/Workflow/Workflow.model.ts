/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Workflow/Workflow.model");

/**
 *
 * @example
 * ```ts
 * import { Workflow } from "@beep/box/experimental/domain/entities/Workflow/Workflow.model";
 *
 * console.log(Workflow.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Workflow extends S.Class<Workflow>($I`Workflow`)(
  {},
  $I.annote("Workflow", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Workflow}
 *
 * @since 0.0.0
 */
export declare namespace Workflow {
  /**
   * Companion encoded type for {@link Workflow}.
   *
   * @example
   * ```ts
   * import type { Workflow } from "@beep/box/experimental/domain/entities/Workflow/Workflow.model";
   *
   * const useEncoded = (_value: Workflow.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Workflow.Encoded;
}

/**
 * Companion runtime type for {@link Workflow}.
 *
 * @example
 * ```ts
 * import type { Workflow } from "@beep/box/experimental/domain/entities/Workflow/Workflow.model";
 *
 * const useValue = (_value: Workflow) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Workflow = typeof Workflow.Type;
