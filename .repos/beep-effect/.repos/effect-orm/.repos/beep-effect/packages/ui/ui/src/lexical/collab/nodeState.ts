import { $getState, createState, type LexicalNode } from "lexical";

export const SYNC_ID_UNSET = "SYNC_ID_UNSET";

export const syncIdState = createState("syncId", {
  parse: (v) => (typeof v === "string" ? v : SYNC_ID_UNSET),
});

export const $getNodeSyncId = (node: LexicalNode): string | undefined => {
  const syncId = $getState(node, syncIdState);
  if (syncId === SYNC_ID_UNSET) {
    return;
  }
  return syncId;
};
