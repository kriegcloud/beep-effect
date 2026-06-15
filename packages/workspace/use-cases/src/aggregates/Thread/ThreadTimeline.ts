/**
 * Thread timeline read model.
 *
 * @packageDocumentation
 * @category read-models
 * @since 0.0.0
 */

import { $WorkspaceUseCasesId } from "@beep/identity/packages";
import { Document } from "@beep/md/Md.model";
import { NonNegativeInt } from "@beep/schema";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { MessageRole } from "@beep/workspace-domain/entities/Message";
import * as S from "effect/Schema";

const $I = $WorkspaceUseCasesId.create("aggregates/Thread/ThreadTimeline");

/**
 * Timeline item projecting a turn's message reference to resolved content.
 *
 * @category read-models
 * @since 0.0.0
 */
export class TimelineMessageItem extends S.Class<TimelineMessageItem>($I`TimelineMessageItem`)(
  {
    kind: S.tag("message"),
    role: MessageRole,
    content: Document,
  },
  $I.annote("TimelineMessageItem", {
    description: "Timeline item resolving a turn message reference to its role and md-aligned content.",
  })
) {}

/**
 * Timeline item placeholder for a tool-call turn item.
 *
 * @category read-models
 * @since 0.0.0
 */
export class TimelineToolCallItem extends S.Class<TimelineToolCallItem>($I`TimelineToolCallItem`)(
  {
    kind: S.tag("tool_call"),
    name: S.NonEmptyString,
  },
  $I.annote("TimelineToolCallItem", {
    description: "Timeline item placeholder summarizing a turn tool-call request by name.",
  })
) {}

/**
 * Resolved timeline item for a turn.
 *
 * @example
 * ```ts
 * import { TimelineItem } from "@beep/workspace-use-cases/aggregates/Thread"
 *
 * console.log(TimelineItem)
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export const TimelineItem = S.Union([TimelineMessageItem, TimelineToolCallItem]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("TimelineItem", {
    description: "Resolved timeline item for a turn.",
  })
);

/**
 * Runtime type for {@link TimelineItem}.
 *
 * @category read-models
 * @since 0.0.0
 */
export type TimelineItem = typeof TimelineItem.Type;

/**
 * Projected turn within a thread timeline.
 *
 * @example
 * ```ts
 * import { TimelineTurn } from "@beep/workspace-use-cases/aggregates/Thread"
 *
 * console.log(TimelineTurn)
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export class TimelineTurn extends S.Class<TimelineTurn>($I`TimelineTurn`)(
  {
    turnId: WorkspaceIdentity.TurnId,
    turnIndex: NonNegativeInt,
    parentTurnId: S.OptionFromNullOr(WorkspaceIdentity.TurnId),
    items: S.Array(TimelineItem),
    costMicros: S.Finite,
  },
  $I.annote("TimelineTurn", {
    description: "Projected turn within a thread timeline, ordered by turn index, with placeholder cost rollup.",
  })
) {}

/**
 * Read model projecting a thread's ordered turns and resolved items.
 *
 * @example
 * ```ts
 * import { ThreadTimeline } from "@beep/workspace-use-cases/aggregates/Thread"
 *
 * console.log(ThreadTimeline)
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export class ThreadTimeline extends S.Class<ThreadTimeline>($I`ThreadTimeline`)(
  {
    threadId: WorkspaceIdentity.ThreadId,
    turns: S.Array(TimelineTurn),
  },
  $I.annote("ThreadTimeline", {
    description: "Read model projecting a thread's ordered turns and resolved timeline items.",
  })
) {}
