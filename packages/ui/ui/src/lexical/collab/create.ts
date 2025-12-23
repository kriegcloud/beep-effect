import { $applyNodeReplacement, $getEditor, $getNodeByKey, $getRoot, $isElementNode, type NodeKey } from "lexical";
import { type CreatedMessage, isSerializedSyncNode, type NodeMessageBase } from "./Messages";
import { $getNodeSyncId } from "./nodeState";
import { $getNodeBySyncId, type SyncIdMap } from "./SyncIdMap";

export const $applyCreatedMessage = (map: SyncIdMap, message: NodeMessageBase) => {
  if (!isSerializedSyncNode(message.node)) {
    console.error(`Node is of unknown type: ${JSON.stringify(message.node)}`);
    return;
  }
  if ($getNodeBySyncId(map, message.node.$.syncId)) {
    console.error(`Trying to insert node that already exists: ${JSON.stringify(message.node)}`);
    return;
  }
  const editor = $getEditor();
  const nodeType = editor._nodes.get(message.node.type);
  if (nodeType === undefined) {
    console.error(`Editor cannot construct node type ${message.node.type}: ${JSON.stringify(message.node)}`);
    return;
  }
  const messageNode = $applyNodeReplacement(new nodeType.klass()).updateFromJSON(message.node);
  // @todo: Handle out of order inserts, maybe on the server
  if (message.previousId) {
    const previousNode = $getNodeBySyncId(map, message.previousId);
    if (!previousNode) {
      console.error(`Previous key not found: ${message.previousId}`);
      return;
    }
    previousNode.insertAfter(messageNode);
    map.set(message.node.$.syncId, messageNode.getKey());
  } else if (message.parentId) {
    const parentNode = $getNodeBySyncId(map, message.parentId);
    if (!parentNode) {
      console.error(`Parent key not found: ${message.parentId}`);
      return;
    }
    if (!$isElementNode(parentNode)) {
      console.error(`Parent is not an element node, can't append to ${message.parentId}`);
      return;
    }
    parentNode.append(messageNode);
    map.set(message.node.$.syncId, messageNode.getKey());
  } else {
    if (messageNode.getType() === "text") {
      console.error("text nodes cannot be appended to root");
      return;
    }
    $getRoot().append(messageNode);
    map.set(message.node.$.syncId, messageNode.getKey());
  }
};

export const $reverseCreatedMessage = (map: SyncIdMap, message: CreatedMessage) => {
  if (!isSerializedSyncNode(message.node)) {
    console.error(`Node is of unknown type: ${JSON.stringify(message.node)}`);
    return;
  }
  const nodeToDestroy = $getNodeBySyncId(map, message.node.$.syncId);
  if (!nodeToDestroy) {
    console.error("Attempted to reverse create operation but node does not exist");
    return;
  }
  map.delete(message.node.$.syncId);
  nodeToDestroy.remove(true);
};

export const $createCreatedMessage = (map: SyncIdMap, nodeKey: NodeKey, userId: string): CreatedMessage | undefined => {
  const message = $createNodeMessageBase(map, nodeKey, userId);
  if (message) {
    return {
      type: "created",
      ...message,
    };
  }
  return undefined;
};

export const $createNodeMessageBase = (
  map: SyncIdMap,
  nodeKey: NodeKey,
  userId: string
): NodeMessageBase | undefined => {
  const node = $getNodeByKey(nodeKey);
  if (!node) {
    console.error(`Node not found ${nodeKey}`);
    return;
  }
  const syncId = $getNodeSyncId(node);
  if (!syncId) {
    console.error(`Node does not have sync ID ${nodeKey}`);
    return;
  }
  map.set(syncId, nodeKey);
  const previous = node.getPreviousSibling();
  const parent = node.getParent();
  return {
    userId: userId,
    // @ts-expect-error
    node: node.exportJSON(),
    previousId: previous ? $getNodeSyncId(previous) : undefined,
    parentId: parent ? $getNodeSyncId(parent) : undefined,
  };
};
