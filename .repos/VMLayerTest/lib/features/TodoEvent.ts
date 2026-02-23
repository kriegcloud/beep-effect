import { Context, Effect, PubSub } from "effect";
import type { HistoryEventType } from "./history/HistoryVM";

export interface TodoEvent {
  readonly type: HistoryEventType;
  readonly todoId: string;
  readonly todoText: string;
  readonly details?: string;
}

export class TodoEventPubSub extends Context.Reference<TodoEventPubSub>()(
  "TodoEventPubSub",
  { defaultValue: () => Effect.runSync(PubSub.sliding<TodoEvent>(16)) }
) {}
