import * as A from "effect/Array";
import * as Match from "effect/Match";
import type { SyncMessageClient, SyncMessageServer } from "./Messages";

export type MessageListener = (message: SyncMessageServer) => void;

export type OpenListener = () => void;

export interface DebugEvent {
  direction?: undefined | "up" | "down";
  type: string;
  message?: undefined | string;
  nestedMessages?: undefined | string[];
}

export type DebugListener = (event: DebugEvent) => void;

export interface CollabNetwork {
  isOpen(): boolean;

  close(): void;

  connect(): void;

  send(message: SyncMessageClient): void;

  registerMessageListener(listener: MessageListener): void;

  registerOpenListener(listener: OpenListener): void;

  registerDebugListener(listener: DebugListener): void;
}

type PeerMessage = Extract<SyncMessageClient | SyncMessageServer, { type: "peer-chunk" }>["messages"][number];

const formatPeerMessage = (pm: PeerMessage): string =>
  Match.value(pm).pipe(
    Match.when(
      { type: "created" },
      (p) =>
        `${p.userId} created: ${p.node.$.syncId}|previousId: ${p.previousId}|parentId: ${p.parentId}|streamId: ${p.streamId}`
    ),
    Match.when({ type: "destroyed" }, (p) => `${p.userId} destroyed: ${p.node.$.syncId}|streamId: ${p.streamId}`),
    Match.when({ type: "updated" }, (p) => `${p.userId} updated: ${p.node.$.syncId}|streamId: ${p.streamId}`),
    Match.when(
      { type: "cursor" },
      (p) =>
        `${p.userId} moved cursor|anchorId: ${p.anchorId}|anchorOffset: ${p.anchorOffset}|focusId: ${p.focusId}|focusOffset: ${p.focusOffset}|streamId: ${p.streamId}`
    ),
    Match.orElse((p) => `unknown message type: ${JSON.stringify(p)}`)
  );

export function debugEventSyncMessage(direction: "up" | "down", m: SyncMessageClient | SyncMessageServer): DebugEvent {
  const { message, nestedMessages } = Match.value(m).pipe(
    Match.when({ type: "init" }, (msg) => ({
      message: `lastId: ${msg.lastId}|firstId: ${msg.firstId}` as string | undefined,
      nestedMessages: [] as string[],
    })),
    Match.when({ type: "init-received" }, (msg) => ({
      message: `lastId: ${msg.lastId}` as string | undefined,
      nestedMessages: [] as string[],
    })),
    Match.when({ type: "peer-chunk" }, (msg) => ({
      message: undefined as string | undefined,
      nestedMessages: A.map(msg.messages, formatPeerMessage),
    })),
    Match.when({ type: "persist-document" }, (msg) => ({
      message: `lastId: ${msg.lastId}` as string | undefined,
      nestedMessages: [] as string[],
    })),
    Match.orElse((msg) => ({
      message: `unknown message type: ${JSON.stringify(msg)}` as string | undefined,
      nestedMessages: [] as string[],
    }))
  );

  return {
    type: m.type,
    direction,
    message,
    nestedMessages,
  };
}
