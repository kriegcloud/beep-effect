/**
 * Workspace turn aggregate entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, UnknownRecord } from "@beep/schema";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as EpistemicIdentity from "@beep/shared-domain/identity/Epistemic";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/Turn/Turn.model");

/**
 * Message item in a turn aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export class MessageItem extends S.Class<MessageItem>($I`MessageItem`)(
  {
    itemType: S.tag("message"),
    messageId: WorkspaceIdentity.MessageId,
  },
  $I.annote("MessageItem", {
    description: "Ordered turn item referencing persisted md-aligned message content.",
  })
) {}

/**
 * Tool call item in a turn aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export class ToolCallItem extends S.Class<ToolCallItem>($I`ToolCallItem`)(
  {
    itemType: S.tag("tool_call"),
    name: S.NonEmptyString,
    payload: UnknownRecord,
    toolCallId: S.NonEmptyString,
  },
  $I.annote("ToolCallItem", {
    description: "Ordered turn item recording a tool invocation request.",
  })
) {}

/**
 * Tool result item in a turn aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export class ToolResultItem extends S.Class<ToolResultItem>($I`ToolResultItem`)(
  {
    itemType: S.tag("tool_result"),
    payload: UnknownRecord,
    toolCallId: S.NonEmptyString,
  },
  $I.annote("ToolResultItem", {
    description: "Ordered turn item recording the result of a tool invocation.",
  })
) {}

/**
 * Artifact reference item in a turn aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export class ArtifactRefItem extends S.Class<ArtifactRefItem>($I`ArtifactRefItem`)(
  {
    artifactId: WorkspaceIdentity.EmailArtifactId,
    itemType: S.tag("artifact_ref"),
  },
  $I.annote("ArtifactRefItem", {
    description: "Ordered turn item referencing a workspace artifact.",
  })
) {}

/**
 * Activity reference item in a turn aggregate.
 *
 * @category models
 * @since 0.0.0
 */
export class ActivityItem extends S.Class<ActivityItem>($I`ActivityItem`)(
  {
    activityId: EpistemicIdentity.ActivityId,
    itemType: S.tag("activity"),
  },
  $I.annote("ActivityItem", {
    description: "Ordered turn item linking runtime provenance activity.",
  })
) {}

const TurnItemTag = LiteralKit(["message", "tool_call", "tool_result", "artifact_ref", "activity"]);

/**
 * Ordered typed item held by a turn aggregate.
 *
 * @example
 * ```ts
 * import { TurnItem } from "@beep/workspace-domain/entities/Turn"
 * import * as S from "effect/Schema"
 *
 * const item = S.decodeUnknownSync(TurnItem)({
 *   itemType: "tool_call",
 *   name: "search",
 *   payload: {},
 *   toolCallId: "tool-call-1",
 * })
 * console.log(item.itemType)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurnItem = TurnItemTag.mapMembers(
  Tuple.evolve([() => MessageItem, () => ToolCallItem, () => ToolResultItem, () => ArtifactRefItem, () => ActivityItem])
)
  .pipe(S.toTaggedUnion("itemType"))
  .annotate(
    $I.annote("TurnItem", {
      description: "Ordered typed item held by a turn aggregate.",
    })
  );

/**
 * Runtime type for {@link TurnItem}.
 *
 * @category models
 * @since 0.0.0
 */
export type TurnItem = typeof TurnItem.Type;

/**
 * Ordered turn item list.
 *
 * @category schemas
 * @since 0.0.0
 */
export const TurnItems = S.Array(TurnItem).pipe(
  $I.annoteSchema("TurnItems", {
    description: "Ordered list of typed items held by a turn aggregate.",
  })
);

/**
 * Runtime type for {@link TurnItems}.
 *
 * @category models
 * @since 0.0.0
 */
export type TurnItems = typeof TurnItems.Type;

/**
 * Workspace turn aggregate with parent-turn lineage for branching.
 *
 * @example
 * ```ts
 * import { Turn } from "@beep/workspace-domain"
 *
 * console.log(Turn.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Turn extends BaseEntity.Class<Turn>($I`Turn`)(
  WorkspaceIdentity.TurnId,
  {
    fields: {
      items: TurnItems,
      parentTurnId: S.OptionFromNullOr(WorkspaceIdentity.TurnId),
      threadId: WorkspaceIdentity.ThreadId,
      turnIndex: NonNegativeInt,
    },
    persisted: {
      items: EntitySchema.persist.jsonb({
        columnName: "items",
      }),
      parentTurnId: EntitySchema.persist.entityId({
        columnName: "parent_turn_id",
        indexHints: [EntitySchema.IndexHint.btree],
      }),
      threadId: EntitySchema.persist.entityId({
        columnName: "thread_id",
        indexHints: [EntitySchema.IndexHint.btree, EntitySchema.IndexHint.lookup],
      }),
      turnIndex: EntitySchema.persist.int({
        columnName: "turn_index",
        indexHints: [EntitySchema.IndexHint.btree],
      }),
    },
  },
  $I.annote("Turn", {
    description: "Workspace turn aggregate with parent-turn lineage for branching.",
  })
) {}
