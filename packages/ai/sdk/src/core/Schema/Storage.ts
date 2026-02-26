import * as S from "effect/Schema";
import {SDKMessage} from "./Message.js";
import {HookEvent} from "./Hooks.js";

export const ChatEventSource = S.Literals([
	"sdk",
	"replay",
	"external"
]);
export type ChatEventSource = typeof ChatEventSource.Type
export type ChatEventSourceEncoded = typeof ChatEventSource.Encoded

export class ChatEvent extends S.Class<ChatEvent>("ChatEvent")(
	{
		sessionId: S.String,
		sequence: S.Number,
		timestamp: S.Number,
		source: ChatEventSource,
		message: SDKMessage
	}) {
	static readonly make = (params: ChatEvent) => new ChatEvent(params)
}

export type ChatEventEncoded = typeof ChatEvent.Encoded

export class SessionMeta extends S.Class<SessionMeta>("SessionMeta")(
	{
		sessionId: S.String,
		createdAt: S.Number,
		updatedAt: S.Number
	}) {
	static readonly make = (params: SessionMeta) => new SessionMeta(params)
}

export type SessionMetaEncoded = typeof SessionMeta.Encoded

export const ArtifactEncoding = S.Literals([
	"utf8",
	"base64"
]);
export type ArtifactEncoding = typeof ArtifactEncoding.Type
export type ArtifactEncodingEncoded = typeof ArtifactEncoding.Encoded

export const ArtifactKind = S.Literals([
	"file",
	"tool_result",
	"summary",
	"image",
	"other"
]);
export type ArtifactKind = typeof ArtifactKind.Type
export type ArtifactKindEncoded = typeof ArtifactKind.Encoded

export class ArtifactRecord extends S.Class<ArtifactRecord>("ArtifactRecord")(
	{
		id: S.String,
		sessionId: S.String,
		kind: ArtifactKind,
		toolName: S.optional(S.String),
		toolUseId: S.optional(S.String),
		hookEvent: S.optional(HookEvent),
		contentType: S.optional(S.String),
		encoding: ArtifactEncoding,
		content: S.String,
		sizeBytes: S.optional(S.Number),
		createdAt: S.Number,
		metadata: S.optional(S.Record(
			S.String,
			S.Unknown
		))
	}) {
	static readonly make = (params: ArtifactRecord) => new ArtifactRecord(params)
}

export type ArtifactRecordEncoded = typeof ArtifactRecord.Encoded
