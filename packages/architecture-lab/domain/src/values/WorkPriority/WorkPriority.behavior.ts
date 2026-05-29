/**
 * WorkPriority pure behavior.
 *
 * @packageDocumentation
 * @category value-objects
 * @since 0.0.0
 */

import { Match } from "effect";
import { dual } from "effect/Function";
import { WorkPriority as WorkPrioritySchema } from "./WorkPriority.model.js";
import type { WorkPriority } from "./WorkPriority.model.js";

/**
 * Default priority for newly created WorkItems.
 *
 * @example
 * ```ts
 * import { defaultWorkPriority } from "@beep/architecture-lab-domain/values/WorkPriority"
 *
 * console.log(defaultWorkPriority)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const defaultWorkPriority: WorkPriority = WorkPrioritySchema.Enum.normal;

/**
 * Rank a priority from lowest to highest.
 *
 * @example
 * ```ts
 * import { rank } from "@beep/architecture-lab-domain/values/WorkPriority"
 *
 * console.log(rank)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const rank: (priority: WorkPriority) => number = Match.type<WorkPriority>().pipe(
  Match.when("low", () => 0),
  Match.when("normal", () => 1),
  Match.when("high", () => 2),
  Match.exhaustive
);

/**
 * Compare two priorities.
 *
 * @example
 * ```ts
 * import { compare } from "@beep/architecture-lab-domain/values/WorkPriority"
 *
 * console.log(compare)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const compare: {
  (left: WorkPriority, right: WorkPriority): number;
  (right: WorkPriority): (left: WorkPriority) => number;
} = dual(2, (left: WorkPriority, right: WorkPriority): number => rank(left) - rank(right));
