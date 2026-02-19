"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React from "react";
import type { BaseRoomConfig, RelayConfig, TurnConfig } from "trystero";
import { CollabInstance, type CursorListener, type DesyncListener } from "../collab/CollabInstance";
import type { DebugListener } from "../collab/CollabNetwork";
import { CollabTrystero } from "../collab/CollabTrystero";
import type { CollabCursor } from "../collab/cursor";

export interface TrysteroNetworkProps {
  type: "trystero";
  config: BaseRoomConfig & RelayConfig & TurnConfig;
  roomId: string;
}

interface IProps {
  network: TrysteroNetworkProps;
  userId: string;
  debugListener?: undefined | DebugListener;
  desyncListener: DesyncListener;
  cursorListener: CursorListener;
  debugConnected?: undefined | boolean;
}

export function CollaborationPlugin({
  userId,
  network,
  desyncListener,
  cursorListener,
  debugListener,
  debugConnected,
}: IProps) {
  const [editor] = useLexicalComposerContext();
  const collab = React.useRef<CollabInstance | null>(null);
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    // Prevent double-initialization from React Strict Mode
    if (isInitialized.current) {
      return;
    }
    isInitialized.current = true;

    editor.setEditable(false);
    collab.current = new CollabInstance(
      userId,
      editor,
      new CollabTrystero(network.config, network.roomId),
      cursorListener,
      desyncListener
    );
    if (debugListener) {
      collab.current.network.registerDebugListener(debugListener);
    }
    collab.current.start();

    return () => {
      collab.current?.stop();
      collab.current = null;
      isInitialized.current = false;
    };
  }, [editor, userId, network.config, network.roomId, cursorListener, desyncListener, debugListener]);

  React.useEffect(() => {
    if (debugConnected === true) {
      collab.current?.debugReconnect();
    } else if (debugConnected === false) {
      collab.current?.debugDisconnect();
    }
  }, [debugConnected]);

  return <></>;
}

export type CursorElementProps = {
  userId: string;
  cursor: CollabCursor;
};

// Note: you should probably copy this as styling is pretty app-specific.
export const CursorElement = ({ userId, cursor }: CursorElementProps) => {
  const rect: DOMRect | undefined = React.useMemo(() => {
    try {
      if (
        !cursor.anchorElement.firstChild ||
        cursor.anchorElement.firstChild.nodeType !== cursor.anchorElement.firstChild.TEXT_NODE
      ) {
        return;
      }
      if (
        !cursor.focusElement.firstChild ||
        cursor.focusElement.firstChild.nodeType !== cursor.focusElement.firstChild.TEXT_NODE
      ) {
        return;
      }
      const range = document.createRange();
      if (cursor.anchorElement.compareDocumentPosition(cursor.focusElement) === 2) {
        range.setEnd(cursor.anchorElement.firstChild, cursor.anchorOffset);
        range.setStart(cursor.focusElement.firstChild, cursor.focusOffset);
      } else {
        range.setStart(cursor.anchorElement.firstChild, cursor.anchorOffset);
        range.setEnd(cursor.focusElement.firstChild, cursor.focusOffset);
      }
      return range.getBoundingClientRect();
    } catch (_) {
      return undefined;
    }
  }, [cursor]);
  if (!rect) {
    return <></>;
  }
  return (
    <div
      className="collab-cursor"
      style={{
        position: "absolute",
        zIndex: 999,
        pointerEvents: "none",
        background: "rgba(93, 255, 59, 0.25)",
        left: `${rect.x + window.scrollX}px`,
        top: `${rect.y + window.scrollY}px`,
        width: `${rect.width > 2 ? rect.width : 2}px`,
        height: `${rect.height}px`,
      }}
    >
      <div
        className="collab-cursor-user"
        style={{
          position: "absolute",
          color: "black",
          padding: "2px 4px",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          background: "#d6ffce",
          fontSize: "12px",
          top: `${-1 * rect.height - 2}px`,
        }}
      >
        {userId}
      </div>
    </div>
  );
};
