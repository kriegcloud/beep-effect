import { $getNodeByKey, type LexicalNode, type NodeKey } from "lexical";
import { SYNC_ID_UNSET } from "./nodeState";

export class SyncIdMap {
  syncIdToNodeKey: Map<string, NodeKey>;
  nodeKeyToSyncId: Map<NodeKey, string>;

  constructor() {
    this.syncIdToNodeKey = new Map();
    this.nodeKeyToSyncId = new Map();
  }

  set(syncId: string, nodeKey: NodeKey) {
    // Happens on init, expected.
    if (nodeKey === "root") {
      return;
    }
    if (syncId === SYNC_ID_UNSET) {
      console.error(`Attempted to set default value ${syncId} => ${nodeKey}`);
      return;
    }
    this.syncIdToNodeKey.set(syncId, nodeKey);
    this.nodeKeyToSyncId.set(nodeKey, syncId);
  }

  getNodeKey(syncId: string): string | undefined {
    return this.syncIdToNodeKey.get(syncId);
  }

  getSyncId(nodeKey: NodeKey): string | undefined {
    return this.nodeKeyToSyncId.get(nodeKey);
  }

  delete(syncId: string) {
    this.syncIdToNodeKey.delete(syncId);
  }
}

export const $getNodeBySyncId = (map: SyncIdMap, syncId: string): LexicalNode | undefined => {
  const nodeKey = map.getNodeKey(syncId);
  if (!nodeKey) {
    return;
  }
  const node = $getNodeByKey(nodeKey);
  if (!node) {
    return;
  }
  return node;
};
