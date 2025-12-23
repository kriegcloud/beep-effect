import * as Str from "effect/String";
import { NODE_STATE_KEY, type SerializedEditorState, type SerializedLexicalNode } from "lexical";
export interface SerializedSyncNode extends SerializedLexicalNode {
  [NODE_STATE_KEY]: {
    syncId: string;
  };
}

export const isSerializedSyncNode = (node: SerializedLexicalNode): node is SerializedSyncNode => {
  return node.$ !== undefined && "syncId" in node.$;
};

export interface NodeMessageBase {
  streamId?: undefined | string;
  userId: string;
  node: SerializedSyncNode;
  previousId?: undefined | string;
  parentId?: undefined | string;
}

export interface CreatedMessage extends NodeMessageBase {
  type: "created";
}

export interface UpdatedMessage extends NodeMessageBase {
  type: "updated";
  previousNode: SerializedSyncNode;
}

export interface DestroyedMessage extends NodeMessageBase {
  type: "destroyed";
}

export interface InitMessage {
  lastId: string;
  firstId?: undefined | string;
  type: "init";
  editorState: SerializedEditorState;
}

export interface InitReceivedMessage {
  type: "init-received";
  userId: string;
  lastId: string;
}

export interface PersistDocumentMessage {
  type: "persist-document";
  lastId: string;
  editorState: SerializedEditorState;
}

export interface CursorMessage {
  type: "cursor";
  lastActivity: number; // Date.now()
  userId: string;
  anchorId: string;
  anchorOffset: number;
  focusId: string;
  focusOffset: number;
  streamId?: undefined | string;
}

export interface TypedMessage {
  type: string;
}

export const isTypedMessage = (message: any): message is TypedMessage => {
  return typeof message === "object" && "type" in message;
};

export type PeerMessage = CreatedMessage | UpdatedMessage | DestroyedMessage | CursorMessage;

export const isPeerMessage = (message: any): message is PeerMessage => {
  return isTypedMessage(message) && ["created", "updated", "destroyed", "cursor"].includes(message.type);
};

// Chunks of peer messages stored in Redis and processed between clients
export type SyncMessagePeerChunk = {
  type: "peer-chunk";
  messages: PeerMessage[];
};

export const isSyncMessagePeerChunk = (message: any): message is SyncMessagePeerChunk => {
  return isTypedMessage(message) && message.type === "peer-chunk";
};

// Messages clients expect the server to send
export type SyncMessageServer = InitMessage | SyncMessagePeerChunk;

export const isSyncMessageServer = (message: any): message is SyncMessageServer => {
  return isSyncMessagePeerChunk(message) || (isTypedMessage(message) && message.type === "init");
};

// Messages the server expects clients to send
export type SyncMessageClient = InitReceivedMessage | PersistDocumentMessage | SyncMessagePeerChunk;

export const isSyncMessageClient = (message: any): message is SyncMessageClient => {
  return (
    isSyncMessagePeerChunk(message) ||
    (isTypedMessage(message) && ["init-received", "persist-document"].includes(message.type))
  );
};

export const compareRedisStreamIds = (a: string, b: string): number => {
  return Number.parseInt(Str.split("-")(a)[0]) - Number.parseInt(Str.split("-")(b)[0]);
};
