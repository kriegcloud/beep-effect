/**
 * WorkPriority pure behavior.
 *
 * @packageDocumentation
 * @category value-objects
 * @since 0.1.0
 */

import { Match } from "effect";
import { dual } from "effect/Function";
import type { WorkPriority } from "./WorkPriority.model.js";
import { WorkPriority as WorkPrioritySchema } from "./WorkPriority.model.js";

/**
 * Default priority for newly created WorkItems.
 *
 * @category value-objects
 * @since 0.1.0
 */
export const defaultWorkPriority: WorkPriority = WorkPrioritySchema.Enum.normal;

/**
 * Rank a priority from lowest to highest.
 *
 * @category value-objects
 * @since 0.1.0
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
 * @category value-objects
 * @since 0.1.0
 */
export const compare: {
  (left: WorkPriority, right: WorkPriority): number;
  (right: WorkPriority): (left: WorkPriority) => number;
} = dual(2, (left: WorkPriority, right: WorkPriority): number => rank(left) - rank(right));
