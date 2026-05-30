/**
 * WorkPriority value-object model.
 *
 * @packageDocumentation
 * @category value-objects
 * @since 0.0.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $ArchitectureLabDomainId.create("values/WorkPriority/WorkPriority.model");

/**
 * Reusable WorkItem priority vocabulary.
 *
 * @example
 * ```ts
 * import { WorkPriority } from "@beep/architecture-lab-domain/values/WorkPriority"
 *
 * console.log(WorkPriority)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const WorkPriority = LiteralKit(["low", "normal", "high"]).pipe(
  $I.annoteSchema("WorkPriority", {
    title: "Work priority",
    description: "Reusable architecture lab value object for relative WorkItem priority.",
  })
);

/**
 * Runtime type for {@link WorkPriority}.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type WorkPriority = typeof WorkPriority.Type;
