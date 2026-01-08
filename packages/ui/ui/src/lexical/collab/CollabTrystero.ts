import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import type { SerializedEditorState } from "lexical";
import type { ActionSender, BaseRoomConfig, RelayConfig, Room, TargetPeers, TurnConfig } from "trystero";
import { joinRoom } from "trystero";
import {
  type CollabNetwork,
  type DebugListener,
  debugEventSyncMessage,
  type MessageListener,
  type OpenListener,
} from "./CollabNetwork";
import {
  isSyncMessageClient,
  isSyncMessageServer,
  type PeerMessage,
  type SyncMessageClient,
  type SyncMessageServer,
} from "./Messages";

type TrysteroSyncAction = {
  messageJSON: string;
};

// Probably spiritually equivalent to a WebRTC implementation but mostly exists
// so that the project can be demo'd without a websocket server or redis
// running forever.
export class CollabTrystero implements CollabNetwork {
  roomId: string;
  room?: undefined | Room;
  sendPeerMessage: ActionSender<TrysteroSyncAction>;
  openListeners: OpenListener[];
  messageListeners: MessageListener[];
  stream: PeerMessage[];
  streamMap: Map<string, number>;
  queuedMessages: SyncMessageClient[];
  lastEditorState: SerializedEditorState;
  lastId: string;
  alreadyInit: boolean;
  connected: boolean;
  config: BaseRoomConfig & RelayConfig & TurnConfig;
  debugListeners: DebugListener[];

  constructor(config: BaseRoomConfig & RelayConfig & TurnConfig, roomId: string) {
    this.config = config;
    this.roomId = roomId;
    this.openListeners = [];
    this.messageListeners = [];
    this.sendPeerMessage = async () => [];
    this.stream = [];
    this.streamMap = new Map();
    this.alreadyInit = false;
    this.connected = false;
    this.queuedMessages = [];
    this.debugListeners = [];
    // This probably would be fetched by a persistent DB.
    this.lastId = "0";
    this.lastEditorState = {
      root: {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    };
  }

  async connect() {
    await this.close();
    A.forEach(this.debugListeners, (f) => f({ type: "joining-room" }));
    this.room = joinRoom(this.config, this.roomId);
    this.connected = true;

    // Our only WebRTC call is to send peers messages as if we were a server.
    const [sendPeerMessage, getPeerMessage] = this.room.makeAction<TrysteroSyncAction>("peerMessage");
    this.sendPeerMessage = sendPeerMessage;

    // A peer joined, send them our version of the editorState.
    this.room.onPeerJoin((peerId) => {
      A.forEach(this.debugListeners, (f) => f({ type: "peer-joined", message: `peerId: ${peerId}` }));
      this.sendAsServer(
        {
          type: "init",
          editorState: this.lastEditorState,
          lastId: this.lastId,
          firstId: this.stream.length > 0 ? this.stream[0]?.streamId : undefined,
        },
        [peerId]
      );
    });

    // If we're the first peer in the room, send ourselves an init message
    // so the editor becomes editable without waiting for other peers.
    // Wait 2 seconds to give time for peer discovery before self-initializing.
    setTimeout(() => {
      if (this.connected && !this.alreadyInit && Object.keys(this.room?.getPeers() ?? {}).length === 0) {
        A.forEach(this.debugListeners, (f) =>
          f({ type: "self-init", message: "No peers found, initializing as first peer" })
        );
        this.alreadyInit = true;
        // Trigger message listeners with a self-init
        const initMessage: SyncMessageServer = {
          type: "init",
          editorState: this.lastEditorState,
          lastId: this.lastId,
          firstId: undefined,
        };
        A.forEach(this.messageListeners, (f) => f(initMessage));
        A.forEach(this.debugListeners, (f) => f(debugEventSyncMessage("down", initMessage)));
      }
    }, 2000);

    // Message listener.
    getPeerMessage((data, peerId) => {
      const message = JSON.parse(data.messageJSON);
      // A peer connected or reconnected.
      if (isSyncMessageClient(message) && message.type === "init-received") {
        console.log(`${peerId} wants to catch up from ${message.lastId} to ${this.lastId}`);
        // Peer reconnected and is on an "old" stream ID.
        // Send them a chunk of the remainder of our stream.
        if (message.lastId !== this.lastId) {
          const chunk = this.getStreamSince(message.lastId);
          if (chunk.length > 0) {
            this.sendAsServer(
              {
                type: "peer-chunk",
                messages: chunk,
              },
              [peerId]
            );
          }
        }
        return;
      }
      // Should be unreachable but nice safety.
      if (!isSyncMessageServer(message)) {
        console.error(`Peer sent non-server message: ${data.messageJSON}`);
        return;
      }
      // Peers spam us with their editor state when we connect, CollabInstance
      // isn't really prepared for that and assumes we reconnected.
      if (message.type === "init") {
        if (this.alreadyInit) {
          return;
        }
        this.alreadyInit = true;
      }
      // Finally, call into the actual CollabInstance.
      A.forEach(this.messageListeners, (f) => f(message));
      A.forEach(this.debugListeners, (f) => f(debugEventSyncMessage("down", message)));
    });

    A.forEach(this.openListeners, (f) => f());
    A.forEach(this.debugListeners, (f) => f({ type: "open" }));
  }

  isOpen() {
    return this.connected;
  }

  async close() {
    this.alreadyInit = false;
    await this.room?.leave();
    this.connected = false;
    A.forEach(this.debugListeners, (f) => f({ type: "close" }));
  }

  // Normally Redis creates stream IDs on insert, so we have to make some up.
  assignStreamIdsToMessage(message: SyncMessageClient): SyncMessageClient {
    return F.pipe(
      Match.value(message),
      Match.when({ type: "init-received" }, (m) => m),
      Match.when({ type: "persist-document" }, (m) => m),
      Match.when({ type: "peer-chunk" }, (m) => ({
        ...m,
        messages: F.pipe(
          m.messages,
          A.map((msg) => {
            const newMessage = structuredClone(msg);
            newMessage.streamId = (DateTime.toEpochMillis(DateTime.unsafeNow()) + Math.random()).toString();
            return newMessage;
          })
        ),
      })),
      Match.exhaustive
    );
  }

  send(rawMessage: SyncMessageClient) {
    const message = this.assignStreamIdsToMessage(rawMessage);
    // While I'm disconnected, store messages in a queue waiting for peers.
    if (!this.room || Object.keys(this.room.getPeers()).length === 0) {
      this.queuedMessages.push(message);
      return;
      // We're back baby, blast peers with our queued edits.
    }
    if (this.queuedMessages.length > 0) {
      const queue = this.queuedMessages;
      this.queuedMessages = [];
      A.forEach(queue, (m) => {
        if (m.type === "peer-chunk") {
          A.forEach(m.messages, (pm) => this.addToStream(pm));
        }
        this.send(m);
      });
    }

    F.pipe(
      Match.value(message),
      Match.when({ type: "persist-document" }, (m) => {
        this.lastEditorState = m.editorState;
        // no-op, but I guess might be valuable to other clients subjectively
        return "return" as const;
      }),
      Match.when({ type: "peer-chunk" }, (m) => {
        A.forEach(m.messages, (msg) => {
          this.addToStream(msg);
        });
        // Mimic websocket behavior of clients getting their own messages.
        A.forEach(this.messageListeners, (f) => f(m));
        return "continue" as const;
      }),
      Match.when({ type: "init-received" }, (m) => {
        m.lastId = this.lastId;
        return "continue" as const;
      }),
      Match.exhaustive
    );

    // Check if we should return early (for persist-document case)
    if (message.type === "persist-document") {
      return;
    }

    this.sendPeerMessage({ messageJSON: JSON.stringify(message) });
    A.forEach(this.debugListeners, (f) => f(debugEventSyncMessage("up", message)));
  }

  // Adds a message to our stream and map the stream ID to the stream index.
  addToStream(message: PeerMessage) {
    if (!message.streamId) {
      console.error(`Cannot add ${JSON.stringify(message)} to stream, no streamId`);
      return;
    }
    this.stream.push(message);
    this.streamMap.set(message.streamId, this.stream.length - 1);
    this.lastId = message.streamId;
  }

  // Gets stream messages since a given ID. Just like Redis?
  getStreamSince(streamId: string): PeerMessage[] {
    if (streamId === "0") {
      return this.stream;
    }
    const index = this.streamMap.get(streamId);
    if (index !== undefined) {
      return this.stream.slice(index);
    }
    console.error(`Don't know how to catch up from ${streamId}`);
    return [];
  }

  sendAsServer(message: SyncMessageServer, targetPeers?: undefined | TargetPeers) {
    this.sendPeerMessage({ messageJSON: JSON.stringify(message) }, targetPeers);
    A.forEach(this.debugListeners, (f) => f(debugEventSyncMessage("up", message)));
  }

  registerMessageListener(listener: MessageListener) {
    this.messageListeners.push(listener);
  }

  registerOpenListener(listener: OpenListener) {
    this.openListeners.push(listener);
  }

  registerDebugListener(listener: DebugListener) {
    this.debugListeners.push(listener);
  }
}
