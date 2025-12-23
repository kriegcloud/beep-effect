import { $getNodeByKey, type EditorState, type NodeKey } from "lexical";
import { $applyCreatedMessage } from "./create";
import { exportNonLatestJSON } from "./exportNonLatestJSON";
import type { DestroyedMessage } from "./Messages";
import { $getNodeBySyncId, type SyncIdMap } from "./SyncIdMap";

export const $applyDestroyedMessage = (map: SyncIdMap, message: DestroyedMessage) => {
  const node = $getNodeBySyncId(map, message.node.$.syncId);
  if (!node) {
    console.error(`Destroy key not found: ${message.node.$.syncId}`);
    return;
  }
  map.delete(message.node.$.syncId);
  node.remove(true);
};

export const $reverseDestroyedMessage = (map: SyncIdMap, message: DestroyedMessage) => {
  map.delete(message.node.$.syncId);
  $applyCreatedMessage(map, message);
};

export const $createDestroyedMessage = (
  map: SyncIdMap,
  prevEditorState: EditorState,
  nodeKey: NodeKey,
  userId: string
): DestroyedMessage | undefined => {
  const syncId = map.getSyncId(nodeKey);
  if (!syncId) {
    console.error(`Node key never mapped for destroy message: ${nodeKey}`);
    return;
  }
  map.delete(syncId);
  const node = $getNodeByKey(nodeKey, prevEditorState);
  if (!node) {
    console.error(`Destroyed node not found in previous editor state ${nodeKey}`);
    return;
  }
  return {
    type: "destroyed",
    userId: userId,
    // Storing the destroyed node's JSON supports undo, and probably
    // some conflict resolution in clients in the future.
    // @ts-expect-error
    node: exportNonLatestJSON(node),
    previousId: node.__prev ? map.getSyncId(node.__prev) : undefined,
    parentId: node.__parent ? map.getSyncId(node.__parent) : undefined,
  };
};
