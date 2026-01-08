import { $dfs, mergeRegister } from "@lexical/utils";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Order from "effect/Order";
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $getState,
  $isRangeSelection,
  $onUpdate,
  $setState,
  COMMAND_PRIORITY_CRITICAL,
  type EditorState,
  ElementNode,
  type LexicalEditor,
  type NodeKey,
  type NodeMutation,
  REDO_COMMAND,
  SKIP_DOM_SELECTION_TAG,
  TextNode,
  UNDO_COMMAND,
} from "lexical";
import { v7 as uuidv7 } from "uuid";
import type { CollabNetwork } from "./CollabNetwork";
import { $applyCreatedMessage, $createCreatedMessage, $reverseCreatedMessage } from "./create";
import { $updatePeerCursor, type CollabCursor, CURSOR_INACTIVITY_LIMIT } from "./cursor";
import { $applyDestroyedMessage, $createDestroyedMessage, $reverseDestroyedMessage } from "./destroy";
import { compareRedisStreamIds, isPeerMessage, type PeerMessage, type SyncMessageServer } from "./Messages";
import { $getNodeSyncId, SYNC_ID_UNSET, syncIdState } from "./nodeState";
import { $getNodeBySyncId, SyncIdMap } from "./SyncIdMap";
import { $applyUpdatedMessage, $createUpdatedMessage, $reverseUpdatedMessage } from "./update";

const SYNC_TAG = "SYNC_TAG";

const SYNC_UNDO_TAG = "SYNC_UNDO_TAG";

export type CursorListener = (cursors: Map<string, CollabCursor>) => void;

export type DesyncListener = () => void;

export class CollabInstance {
  syncIdMap: SyncIdMap;
  editor: LexicalEditor;
  network: CollabNetwork;
  tearDownListeners: () => void;
  reconnectInterval?: undefined | NodeJS.Timeout;
  persistInterval?: undefined | NodeJS.Timeout;
  cursorInterval?: undefined | NodeJS.Timeout;
  flushTimer?: undefined | NodeJS.Timeout;
  userId: string;
  lastId?: undefined | string;
  seenStreamIds: Map<string, boolean>;
  lastPersistedId?: undefined | string;
  messageStack: PeerMessage[];
  undoStack: PeerMessage[][];
  redoStack: PeerMessage[][];
  onCursorsChange: CursorListener;
  onDesync: DesyncListener;
  cursors: Map<string, CollabCursor>;
  lastCursorMessage?: undefined | PeerMessage;
  undoCommandRunning: boolean;
  shouldReconnect: boolean;

  constructor(
    userId: string,
    editor: LexicalEditor,
    network: CollabNetwork,
    onCursorsChange: CursorListener,
    onDesync: DesyncListener
  ) {
    // @todo Is it more idiomatic to use $getEditor everywhere?
    this.editor = editor;
    this.network = network;
    this.network.registerOpenListener(this.flushStack.bind(this));
    this.network.registerMessageListener(this.onMessage.bind(this));
    this.userId = userId;
    this.syncIdMap = new SyncIdMap();
    this.messageStack = [];
    this.undoStack = [];
    this.redoStack = [];
    this.cursors = new Map();
    this.onCursorsChange = onCursorsChange;
    this.onDesync = onDesync;
    this.undoCommandRunning = false;
    this.shouldReconnect = false;
    this.tearDownListeners = () => {};
    this.seenStreamIds = new Map();
  }

  // Splits text nodes into words.
  // This allows editors to collaborate on the same paragraph without conflict,
  // especially in cases where clients reconnect (OT has a hard time here).
  wordSplitTransform(node: TextNode): void {
    const text = node.getTextContent();
    if (text.length <= 1) {
      return;
    }
    const spaceIndex = text.indexOf(" ");
    if (spaceIndex === -1) {
      return;
    }
    const selection = $getSelection();
    const leftSide = text.substring(0, spaceIndex);
    const rightSide = text.substring(spaceIndex + 1);
    let spaceNode = $createTextNode(" ");
    if (!spaceNode.isUnmergeable()) {
      spaceNode.toggleUnmergeable();
    }
    const spaceNodeId = uuidv7();
    this.syncIdMap.set(spaceNode.getKey(), spaceNodeId);
    $setState(spaceNode, syncIdState, spaceNodeId);
    if (leftSide.length !== 0) {
      node.setTextContent(leftSide);
      node.insertAfter(spaceNode);
    } else {
      node.setTextContent(" ");
      spaceNode = node;
    }
    if (rightSide.length !== 0) {
      const rightSideNode = $createTextNode(rightSide);
      const rightSideNodeId = uuidv7();
      this.syncIdMap.set(rightSideNode.getKey(), rightSideNodeId);
      $setState(rightSideNode, syncIdState, rightSideNodeId);
      spaceNode.insertAfter(rightSideNode);
    }
    // "Fix" selection since we messed with nodes
    if ($isRangeSelection(selection) && selection.focus.getNode().getKey() === node.getKey()) {
      if (node.getTextContent().length < selection.focus.offset) {
        node.selectNext(
          selection.focus.offset - node.getTextContent().length,
          selection.focus.offset - node.getTextContent().length
        );
      }
    }
  }

  // Starts collaboration. Should be called once in a useEffect hook.
  start() {
    clearInterval(this.reconnectInterval);
    clearInterval(this.persistInterval);
    clearInterval(this.cursorInterval);
    clearTimeout(this.flushTimer);
    this.network.connect();
    this.tearDownListeners = mergeRegister(
      ...F.pipe(
        A.fromIterable(this.editor._nodes.entries()),
        A.filter(([k, _]) => k !== "root"),
        // Sort element nodes first, since they're likely parents
        // @todo this may imply that the nodes we track or the order should be
        // user controlled
        A.sort(
          Order.mapInput(Order.number, ([_, node]) =>
            ElementNode.prototype.isPrototypeOf(node.klass.prototype) ? 0 : 1
          )
        ),
        A.map(([_, n]) => this.editor.registerMutationListener(n.klass, this.onMutation.bind(this)))
      ),
      this.editor.registerNodeTransform(TextNode, this.wordSplitTransform.bind(this)),
      this.editor.registerCommand(UNDO_COMMAND, this.undoCommand.bind(this), COMMAND_PRIORITY_CRITICAL),
      this.editor.registerCommand(REDO_COMMAND, this.redoCommand.bind(this), COMMAND_PRIORITY_CRITICAL)
    );

    // Reconnect less frequently to avoid rate-limiting on relays
    this.reconnectInterval = setInterval(() => {
      if (!this.network.isOpen() && this.shouldReconnect) {
        console.error("connection closed, reconnecting...");
        this.network.connect();
      }
    }, 5000);

    this.persistInterval = setInterval(this.persist.bind(this), 1000);

    this.cursorInterval = setInterval(() => {
      this.sendCursor();
      this.cleanupInactiveCursors();
    }, 100);
  }

  // Stops collaboration and unbinds events from the editor.
  // Should only be called when component unmounts.
  stop() {
    clearInterval(this.reconnectInterval);
    clearInterval(this.persistInterval);
    clearInterval(this.cursorInterval);
    clearTimeout(this.flushTimer);
    this.network.close();
    this.tearDownListeners();
  }

  // Populates our UUID <=> NodeKey maps after initializing editor state.
  populateSyncIdMap() {
    this.editor.read(() => {
      A.forEach($dfs(), (dfsNode) => {
        if (dfsNode.node.getKey() === "root") {
          return;
        }
        this.syncIdMap.set($getState(dfsNode.node, syncIdState), dfsNode.node.getKey());
      });
    });
  }

  appendMessagesToStack(messages: PeerMessage[], updateTags: Set<string>) {
    if (!updateTags.has(SYNC_UNDO_TAG) && messages.find((m) => m.type !== "cursor")) {
      this.undoStack.push(messages);
    }
    this.messageStack.push(...messages);
  }

  // Sends our stack of messages to the server.
  // This allows for flexible batches of messages and offline editing.
  flushStack() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      if (!this.network.isOpen() || this.messageStack.length === 0) {
        return;
      }
      const stack = this.messageStack;
      this.messageStack = [];
      // Flatten the stack to avoid sending duplicative messages.
      const messageMap: Map<string, [PeerMessage, number]> = new Map();
      const destroyedList: string[] = [];
      A.forEach(stack, (m, i) => {
        let existing: [PeerMessage, number] | undefined;
        Match.value(m).pipe(
          Match.when({ type: "cursor" }, (msg) => {
            messageMap.set("cursor", [msg, i]);
          }),
          // todo: remove all messages for children of destroyed nodes
          Match.when({ type: "destroyed" }, (msg) => {
            existing = messageMap.get(msg.node.$.syncId);
            // No reason to tell peers to delete a node we created.
            if (existing && existing[0].type === "created") {
              messageMap.delete(msg.node.$.syncId);
            } else {
              destroyedList.push(msg.node.$.syncId);
              messageMap.set(msg.node.$.syncId, [msg, i]);
            }
          }),
          Match.when({ type: "created" }, (msg) => {
            existing = messageMap.get(msg.node.$.syncId);
            if (existing && existing[0].type === "created") {
              // Better to just update the created message with updated node
              existing[0].node = msg.node;
              messageMap.set(msg.node.$.syncId, existing);
            } else if (!existing || (existing && existing[0].type !== "destroyed")) {
              messageMap.set(msg.node.$.syncId, [msg, i]);
            }
          }),
          Match.when({ type: "updated" }, (msg) => {
            existing = messageMap.get(msg.node.$.syncId);
            if (existing && existing[0].type === "created") {
              // Better to just update the created message with updated node
              existing[0].node = msg.node;
              messageMap.set(msg.node.$.syncId, existing);
            } else if (!existing || (existing && existing[0].type !== "destroyed")) {
              messageMap.set(msg.node.$.syncId, [msg, i]);
            }
          }),
          Match.exhaustive
        );
      });
      // Restore original order.
      const flatStack = F.pipe(
        A.fromIterable(messageMap.values()),
        A.sort(Order.mapInput(Order.number, (a: [PeerMessage, number]) => a[1])),
        A.map((a) => a[0]),
        A.filter(
          (m) =>
            m.type === "cursor" ||
            !m.parentId ||
            // Filter out nodes that would be deleted by their parent anyway.
            !A.contains(destroyedList, m.parentId) ||
            // Filter out identical updates.
            !(m.type === "updated" && m.node === m.previousNode)
        )
      );
      this.network.send({
        type: "peer-chunk",
        messages: flatStack,
      });
    }, 100);
  }

  // Responds to mutation events in nodes to send our mutations to peers.
  onMutation(
    nodes: Map<NodeKey, NodeMutation>,
    {
      updateTags,
      prevEditorState,
    }: {
      updateTags: Set<string>;
      dirtyLeaves: Set<string>;
      prevEditorState: EditorState;
    }
  ) {
    if (updateTags.has(SYNC_TAG) || updateTags.has("registerMutationListener") || updateTags.has("history-merge")) {
      return;
    }
    // Ensure every node has a (unique) UUID
    this.editor.update(
      () => {
        A.forEach(A.fromIterable(nodes.entries()), ([nodeKey, mutation]) => {
          Match.value(mutation).pipe(
            Match.when("created", () => {
              const node = $getNodeByKey(nodeKey);
              if (!node) {
                console.error(`Node not found ${nodeKey}`);
                return;
              }
              let syncId = $getState(node, syncIdState);
              const mappedNode = $getNodeBySyncId(this.syncIdMap, syncId);
              // Brand new node or cloned node.
              if (syncId === SYNC_ID_UNSET || (mappedNode && mappedNode.getKey() != node.getKey())) {
                syncId = uuidv7();
                this.syncIdMap.set(syncId, node.getKey());
                $setState(node.getWritable(), syncIdState, syncId);
                return;
              }
            }),
            Match.when("updated", () => {
              // No-op for updated mutations in this context
            }),
            Match.when("destroyed", () => {
              // No-op for destroyed mutations in this context
            }),
            Match.exhaustive
          );
        });
      },
      { tag: [SYNC_TAG, SKIP_DOM_SELECTION_TAG] }
    );
    this.editor.read(() => {
      const messages: PeerMessage[] = [];
      A.forEach(A.fromIterable(nodes.entries()), ([nodeKey, mutation]) => {
        const message = Match.value(mutation).pipe(
          Match.when("created", () => $createCreatedMessage(this.syncIdMap, nodeKey, this.userId)),
          Match.when("updated", () => $createUpdatedMessage(this.syncIdMap, prevEditorState, nodeKey, this.userId)),
          Match.when("destroyed", () => $createDestroyedMessage(this.syncIdMap, prevEditorState, nodeKey, this.userId)),
          Match.exhaustive
        );
        if (message) {
          messages.push(message);
        }
      });
      this.appendMessagesToStack(messages, updateTags);
      this.flushStack();
    });
  }

  // Responds to incoming websocket messages, often broadcast from peers.
  onMessage(serverMessage: SyncMessageServer) {
    this.editor.update(
      () => {
        // The server sends us this event every time we connect.
        if (serverMessage.type === "init") {
          // lastId being set implies that this is a re-connect
          if (this.lastId) {
            // Our last stream ID is older than the first message in the Redis
            // stream. We've been garbage collected!
            if (serverMessage.firstId && compareRedisStreamIds(serverMessage.firstId, this.lastId) > 0) {
              console.error(
                `Desync: the earliest stream ID on the server (${serverMessage.firstId}) is too far past our last seen ID (${this.lastId})`
              );
              this.shouldReconnect = false;
              this.network.close();
              // @todo I think there are strategies we could choose to take
              // here, but it does require some UI choices so punting for now.
              // example options the user could choose in a UI:
              //   1. Keep all the nodes I touched offline the same
              //   2. Override local changes with remote editor state
              this.onDesync();
              // Short circuit since we can't stream anyway.
              return;
            }
          } else {
            // This is our first time connecting.
            this.lastId = serverMessage.lastId;
            const editorState = this.editor.parseEditorState(serverMessage.editorState);
            // Avoids an exception in lexical.
            if (!editorState.isEmpty()) {
              this.editor.setEditorState(editorState, {
                tag: SYNC_TAG,
              });
            }
            this.editor.setEditable(true);
            $onUpdate(() => this.populateSyncIdMap());
          }
          // ACK the init to start streaming messages from lastId.
          this.network.send({
            type: "init-received",
            userId: this.userId,
            lastId: this.lastId,
          });
          return;
        }
        A.forEach(serverMessage.messages, (message) => {
          if (!isPeerMessage(message)) {
            console.error(`Non-peer message sent from server: ${JSON.stringify(message)}`);
            return;
          }
          if (message.streamId === undefined) {
            console.error(`Peer message does not contain stream ID: ${JSON.stringify(message)}`);
            return;
          }
          if (this.seenStreamIds.has(message.streamId)) {
            this.lastId = message.streamId;
            console.error(`Peer sent us a message we've already seen: ${JSON.stringify(message)}`);
            return;
          }
          // Ignore messages (probably) sent by us.
          if (message.userId === this.userId) {
            this.lastId = message.streamId;
            return;
          }
          this.applyMessage(message);
        });
      },
      { tag: [SYNC_TAG, SKIP_DOM_SELECTION_TAG] }
    );
  }

  // Applies peer mutations to local editor state.
  applyMessage(message: PeerMessage) {
    Match.value(message).pipe(
      Match.when({ type: "created" }, (msg) => {
        if (msg.streamId) {
          this.lastId = msg.streamId;
        }
        $applyCreatedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "updated" }, (msg) => {
        if (msg.streamId) {
          this.lastId = msg.streamId;
        }
        $applyUpdatedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "destroyed" }, (msg) => {
        if (msg.streamId) {
          this.lastId = msg.streamId;
        }
        $applyDestroyedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "cursor" }, (msg) => {
        if ($updatePeerCursor(this.syncIdMap, this.cursors, msg)) {
          this.onCursorsChange(this.cursors);
        }
      }),
      Match.exhaustive
    );
  }

  // Attempts to undo an applyMessage operation.
  reverseMessage(message: PeerMessage) {
    Match.value(message).pipe(
      Match.when({ type: "created" }, (msg) => {
        $reverseCreatedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "updated" }, (msg) => {
        $reverseUpdatedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "destroyed" }, (msg) => {
        $reverseDestroyedMessage(this.syncIdMap, msg);
      }),
      Match.when({ type: "cursor" }, () => {
        // no-op, although moving our own cursor back in time might be cool
      }),
      Match.exhaustive
    );
  }

  // Support undo by undoing our previous sends to the server.
  undoCommand() {
    const lastStack = this.undoStack.pop();
    if (!lastStack) {
      return true;
    }
    this.redoStack.push(lastStack);
    this.editor.update(
      () => {
        A.forEach(lastStack, (m) => this.reverseMessage(m));
      },
      { tag: [SYNC_UNDO_TAG, SKIP_DOM_SELECTION_TAG] }
    );
    return true;
  }

  // Support redo by attempting to re-apply the last undo'd stack.
  redoCommand() {
    const lastStack = this.redoStack.pop();
    if (!lastStack) {
      return true;
    }
    this.undoStack.push(lastStack);
    this.editor.update(
      () => {
        A.forEach(lastStack, (m) => this.applyMessage(m));
      },
      { tag: [SYNC_UNDO_TAG, SKIP_DOM_SELECTION_TAG] }
    );
    return true;
  }

  // Persists our editor state if possible.
  // @todo all clients don't _need_ to do this, but doesn't seem too harmful
  // and the server could use this to track desyncs between clients on the
  // same stream ID (lastId).
  persist() {
    if (this.network.isOpen() && this.lastId && (!this.lastPersistedId || this.lastId !== this.lastPersistedId)) {
      this.lastPersistedId = this.lastId;
      this.network.send({
        type: "persist-document",
        lastId: this.lastId,
        editorState: this.editor.getEditorState().toJSON(),
      });
    }
  }

  // Sends our local cursor position to peers.
  sendCursor() {
    if (!this.network.isOpen()) {
      return;
    }
    this.editor.read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorSyncId = $getNodeSyncId(selection.anchor.getNode());
        const focusSyncId = $getNodeSyncId(selection.focus.getNode());
        if (anchorSyncId && focusSyncId) {
          const message: PeerMessage = {
            type: "cursor",
            lastActivity: DateTime.toEpochMillis(DateTime.unsafeNow()),
            userId: this.userId,
            anchorId: anchorSyncId,
            anchorOffset: selection.anchor.offset,
            focusId: focusSyncId,
            focusOffset: selection.focus.offset,
          };
          if (
            this.lastCursorMessage &&
            JSON.stringify(message, (key, value) => (key === "lastActivity" ? 0 : value)) ===
              JSON.stringify(this.lastCursorMessage, (key, value) => (key === "lastActivity" ? 0 : value))
          ) {
            return;
          }
          this.lastCursorMessage = message;
          this.appendMessagesToStack([message], new Set());
          this.flushStack();
        }
      }
    });
  }

  // Removes peer cursors if left inactive.
  cleanupInactiveCursors() {
    let cursorsChanged = false;
    const now = DateTime.toEpochMillis(DateTime.unsafeNow());
    A.forEach(A.fromIterable(this.cursors.entries()), ([userId, cursor]) => {
      if (cursor.lastActivity < now - 1000 * CURSOR_INACTIVITY_LIMIT) {
        this.cursors.delete(userId);
        cursorsChanged = true;
      }
    });
    if (cursorsChanged) {
      this.onCursorsChange(this.cursors);
    }
  }

  // Debug utilities to test offline syncing.
  debugDisconnect() {
    this.shouldReconnect = false;
    this.network.close();
  }

  debugReconnect() {
    this.shouldReconnect = true;
  }
}
