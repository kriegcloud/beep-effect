/**
 * WorkItem value objects.
 *
 * @packageDocumentation
 * @category value-objects
 * @since 0.1.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ArchitectureLabDomainId.create("aggregates/WorkItem/WorkItem.values");

/**
 * Architecture lab WorkItem identity.
 *
 * @category value-objects
 * @since 0.1.0
 */
export const WorkItemId = S.String.pipe(
  S.brand("ArchitectureLabWorkItemId"),
  $I.annoteSchema("WorkItemId", {
    identifier: "WorkItemId",
    title: "WorkItem ID",
    description: "Stable identifier for the canonical architecture lab WorkItem aggregate.",
  })
);

/**
 * Architecture lab WorkItem identity type.
 *
 * @category value-objects
 * @since 0.1.0
 */
export type WorkItemId = S.Schema.Type<typeof WorkItemId>;

/**
 * Architecture lab WorkItem title.
 *
 * @category value-objects
 * @since 0.1.0
 */
export const WorkItemTitle = S.String.pipe(
  $I.annoteSchema("WorkItemTitle", {
    identifier: "WorkItemTitle",
    title: "WorkItem title",
    description: "Human-readable WorkItem title.",
  })
);

/**
 * Architecture lab WorkItem title type.
 *
 * @category value-objects
 * @since 0.1.0
 */
export type WorkItemTitle = S.Schema.Type<typeof WorkItemTitle>;

/**
 * Architecture lab WorkItem lifecycle values.
 *
 * @category value-objects
 * @since 0.1.0
 */
export const WorkItemStatus = LiteralKit(["open", "assigned", "completed", "archived"] as const).pipe(
  $I.annoteSchema("WorkItemStatus", {
    title: "WorkItem status",
    description: "Canonical lifecycle status for the architecture lab WorkItem aggregate.",
  })
);

/**
 * Architecture lab WorkItem lifecycle value.
 *
 * @category value-objects
 * @since 0.1.0
 */
export type WorkItemStatus = typeof WorkItemStatus.Type;
