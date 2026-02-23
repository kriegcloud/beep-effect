import { $getEditor } from "lexical";
import type { CursorMessage } from "./Messages";
import { $getNodeBySyncId, type SyncIdMap } from "./SyncIdMap";

export const CURSOR_INACTIVITY_LIMIT = 10; // seconds

export type CollabCursor = {
  lastActivity: number;
  anchorElement: HTMLElement;
  anchorOffset: number;
  focusElement: HTMLElement;
  focusOffset: number;
};

export const $updatePeerCursor = (
  map: SyncIdMap,
  cursors: Map<string, CollabCursor>,
  message: CursorMessage
): boolean => {
  const anchorKey = $getNodeBySyncId(map, message.anchorId)?.getKey();
  const focusKey = $getNodeBySyncId(map, message.focusId)?.getKey();
  if (!anchorKey || !focusKey) {
    return false;
  }
  const editor = $getEditor();
  const anchorElement = editor.getElementByKey(anchorKey);
  const focusElement = editor.getElementByKey(focusKey);
  if (!anchorElement || !focusElement || message.lastActivity < Date.now() - 1000 * CURSOR_INACTIVITY_LIMIT) {
    cursors.delete(message.userId);
  } else {
    cursors.set(message.userId, {
      anchorElement,
      focusElement,
      lastActivity: message.lastActivity,
      anchorOffset: message.anchorOffset,
      focusOffset: message.focusOffset,
    });
  }
  return true;
};
