import {
	ChannelId,
	ExternalMessageId,
	ExternalThreadId,
	MessageId,
	SyncChannelLinkId,
	SyncMessageLinkId,
} from "@hazel/schema"
import { Schema } from "effect"
import { ChatSyncReceiptSource } from "./chat-sync-event-receipt-model"
import * as M from "./utils"
import { JsonDate } from "./utils"

export class Model extends M.Class<Model>("ChatSyncMessageLink")({
	id: M.Generated(SyncMessageLinkId),
	channelLinkId: SyncChannelLinkId,
	hazelMessageId: MessageId,
	externalMessageId: ExternalMessageId,
	source: ChatSyncReceiptSource,
	rootHazelMessageId: Schema.NullOr(MessageId),
	rootExternalMessageId: Schema.NullOr(ExternalMessageId),
	hazelThreadChannelId: Schema.NullOr(ChannelId),
	externalThreadId: Schema.NullOr(ExternalThreadId),
	lastSyncedAt: M.Generated(JsonDate),
	createdAt: M.Generated(JsonDate),
	updatedAt: M.Generated(Schema.NullOr(JsonDate)),
	deletedAt: M.GeneratedByApp(Schema.NullOr(JsonDate)),
}) {}

export const Insert = Model.insert
export const Update = Model.update
