/**
 * based on event types from codex-rs/exec/src/exec_events.rs
 *
 * @module @beep/ai-sdk/codex/events
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ThreadItem } from "./items.ts";
import { Usage } from "./shared.ts";

const $I = $AiSdkId.create("codex/events");

/**
 * Fatal error emitted by the stream.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ThreadError extends S.Class<ThreadError>($I`ThreadError`)(
  {
    message: S.String,
  },
  $I.annote("ThreadError", {
    description: "Fatal error emitted by the stream.",
  })
) {}

/**
 * Emitted when a new thread is started as the first event.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ThreadStartedEvent extends S.Class<ThreadStartedEvent>($I`ThreadStartedEvent`)(
  {
    type: S.tag("thread.started"),
    /** The identifier of the new thread. Can be used to resume the thread later. */
    thread_id: S.String.annotateKey({
      description: "The identifier of the new thread. Can be used to resume the thread later.",
    }),
  },
  $I.annote("ThreadStartedEvent", {
    description: "Emitted when a new thread is started as the first event.",
  })
) {}

/**
 * Emitted when a turn is started by sending a new prompt to the model.A turn encompasses all events that happen while the agent is processing the prompt.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TurnStartedEvent extends S.Class<TurnStartedEvent>($I`TurnStartedEvent`)(
  {
    type: S.tag("turn.started"),
  },
  $I.annote("TurnStartedEvent", {
    description:
      "Emitted when a turn is started by sending a new prompt to the model.A turn encompasses all events that happen while the agent is processing the prompt.",
  })
) {}

/**
 * Emitted when a turn is completed. Typically right after the assistant's response.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TurnCompletedEvent extends S.Class<TurnCompletedEvent>($I`TurnCompletedEvent`)(
  {
    type: S.tag("turn.completed"),
    usage: Usage,
  },
  $I.annote("TurnCompletedEvent", {
    description: "Emitted when a turn is completed. Typically right after the assistant's response.",
  })
) {}

/**
 * Indicates that a turn failed with an error.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TurnFailedEvent extends S.Class<TurnFailedEvent>($I`TurnFailedEvent`)(
  {
    type: S.tag("turn.failed"),
    error: ThreadError,
  },
  $I.annote("TurnFailedEvent", {
    description: "Indicates that a turn failed with an error.",
  })
) {}

/**
 * Emitted when a new item is added to the thread. Typically the item is initially "in progress".
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ItemStartedEvent extends S.Class<ItemStartedEvent>($I`ItemStartedEvent`)(
  {
    type: S.tag("item.started"),
    item: ThreadItem,
  },
  $I.annote("ItemStartedEvent", {
    description: "Emitted when a new item is added to the thread. Typically" + ' the item is initially "in progress".',
  })
) {}

/**
 * Emitted when an item is updated.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ItemUpdatedEvent extends S.Class<ItemUpdatedEvent>($I`ItemUpdatedEvent`)(
  {
    type: S.tag("item.updated"),
    item: ThreadItem,
  },
  $I.annote("ItemUpdatedEvent", {
    description: "Emitted when an item is updated.",
  })
) {}

/**
 * Signals that an item has reached a terminal state—either success or failure.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ItemCompletedEvent extends S.Class<ItemCompletedEvent>($I`ItemCompletedEvent`)(
  {
    type: S.tag("item.completed"),
    item: ThreadItem,
  },
  $I.annote("ItemCompletedEvent", {
    description: "Signals that an item has reached a terminal state—either success or failure.",
  })
) {}

/**
 * Represents an unrecoverable error emitted directly by the event stream.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ThreadErrorEvent extends S.Class<ThreadErrorEvent>($I`ThreadErrorEvent`)(
  {
    type: S.tag("error"),
    message: S.String,
  },
  $I.annote("ThreadErrorEvent", {
    description: "Represents an unrecoverable error emitted directly by the event stream.",
  })
) {}

/**
 * Top-level JSONL events emitted by codex exec.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ThreadEvent = S.Union([
  ThreadStartedEvent,
  TurnStartedEvent,
  TurnCompletedEvent,
  TurnFailedEvent,
  ItemStartedEvent,
  ItemUpdatedEvent,
  ItemCompletedEvent,
  ThreadErrorEvent,
]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("ThreadEvent", {
    description: "Top-level JSONL events emitted by codex exec.",
  })
);

/**
 * Type of {@link ThreadEvent} {@inheritDoc ThreadEvent}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ThreadEvent = typeof ThreadEvent.Type;
