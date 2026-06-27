import { ModelFamily } from "@app/domain/ai-models";
import * as Chat from "@app/domain/api/chat-rpc";
import * as Schema from "effect/Schema";
import { Model } from "effect/unstable/schema";

export class ChatModel extends Model.Class<ChatModel>("ChatModel")({
  id: Model.GeneratedByDb(Chat.ChatId),
  userId: Schema.String,
  title: Schema.NonEmptyString,
  model: ModelFamily,
  messages: Model.JsonFromString(Schema.Array(Chat.Message)),
  activeRunId: Schema.NullOr(Chat.RunId),
  createdAt: Model.DateTimeInsert,
  updatedAt: Model.DateTimeUpdate,
}) {}
