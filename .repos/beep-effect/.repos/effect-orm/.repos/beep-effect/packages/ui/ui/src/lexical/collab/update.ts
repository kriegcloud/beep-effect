import { $getNodeByKey, type EditorState, type NodeKey } from "lexical";
import { $applyCreatedMessage, $createNodeMessageBase } from "./create";
import { exportNonLatestJSON } from "./exportNonLatestJSON";
import { isSerializedSyncNode, type UpdatedMessage } from "./Messages";
import { $getNodeSyncId } from "./nodeState";
import { $getNodeBySyncId, type SyncIdMap } from "./SyncIdMap";

export const $applyUpdatedMessage = (map: SyncIdMap, message: UpdatedMessage) => {
  if (!isSerializedSyncNode(message.node)) {
    console.error(`Node is of unknown type: ${JSON.stringify(message.node)}`);
    return;
  }
  const node = $getNodeBySyncId(map, message.node.$.syncId);
  if (!node) {
    console.error(`Update key not found: ${message.node.$.syncId}, attempting to create`);
    $applyCreatedMessage(map, message);
    return;
  }
  // Check if the node moved, which for some reason isn't performed as a
  // destroy -> create in Lexical
  const parent = node.getParent();
  const parentSyncId = parent ? $getNodeSyncId(parent) : undefined;
  if (parentSyncId && message.parentId && parentSyncId !== message.parentId) {
    map.delete(message.node.$.syncId);
    node.remove(true);
    $applyCreatedMessage(map, message);
  } else {
    node.updateFromJSON(message.node);
  }
};

export const $reverseUpdatedMessage = (map: SyncIdMap, message: UpdatedMessage) => {
  if (!isSerializedSyncNode(message.node)) {
    console.error(`Node is of unknown type: ${JSON.stringify(message.node)}`);
    return;
  }
  const nodeToUpdate = $getNodeBySyncId(map, message.node.$.syncId);
  if (nodeToUpdate) {
    nodeToUpdate.updateFromJSON(message.previousNode);
    return;
  }
};

export const $createUpdatedMessage = (
  map: SyncIdMap,
  prevEditorState: EditorState,
  nodeKey: NodeKey,
  userId: string
): UpdatedMessage | undefined => {
  const message = $createNodeMessageBase(map, nodeKey, userId);
  if (message) {
    const previousNode = $getNodeByKey(nodeKey, prevEditorState);
    return {
      type: "updated",
      // @ts-expect-error
      previousNode: previousNode ? exportNonLatestJSON(previousNode) : undefined,
      ...message,
    };
  }
  return;
};
