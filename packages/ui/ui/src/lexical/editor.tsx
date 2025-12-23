"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { type InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { type DOMConversionMap, TextNode } from "lexical";
import { useMemo, useState } from "react";
import type { CollabCursor, DebugEvent } from "./collab";
import { CollaborationPlugin, CursorElement, type TrysteroNetworkProps } from "./plugins";
import ToolbarPlugin from "./plugins/Toolbar.plugin";
import TreeViewPlugin from "./plugins/TreeView.plugin";
import ExampleTheme from "./theme";

const placeholder = "Enter some rich text...";

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (output === null || output.forChild === undefined || output.after !== undefined || output.node !== null) {
            return output;
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorConfig: InitialConfigType = {
  editorState: null,
  editable: false,
  html: {
    import: constructImportMap(),
  },
  namespace: "React.js Demo",
  onError(error: Error) {
    throw error;
  },
  theme: ExampleTheme,
  // A commented out example of soft deleting, which may lead to less
  // conflicts. See `src/Collab/ImmortalTextNode.ts` for details.
  // nodes: [
  //     ImmortalTextNode,
  //     {
  //         replace: TextNode,
  //         with: (node: TextNode) => {
  //             return $createImmortalTextNode(node.getTextContent());
  //         },
  //         withKlass: ImmortalTextNode,
  //     }
  // ]
};

export function Editor() {
  const roomId = "beep_collab_room";
  const userId = useMemo(() => "user_" + Math.floor(Math.random() * 100), []);
  const [debug, setDebug] = useState<DebugEvent[]>([]);
  const [cursors, setCursors] = useState<Map<string, CollabCursor>>();
  const [connected, setConnected] = useState<boolean>();
  const [desynced, setDesynced] = useState(false);

  const network: TrysteroNetworkProps = useMemo(
    () => ({
      type: "trystero",
      config: { appId: "lexical_sync_demo", relayRedundancy: 2 },
      roomId,
    }),
    []
  );

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <CollaborationPlugin
          network={network}
          userId={userId}
          cursorListener={(cursors) => setCursors(new Map(cursors))}
          desyncListener={() => setDesynced(true)}
          debugListener={(e) => setDebug((prev) => [e, ...prev])}
          debugConnected={connected}
        />
        <>
          <div style={{ padding: "8px", background: "#f0f0f0", borderBottom: "1px solid #ddd", fontSize: "12px" }}>
            <strong>Room:</strong> {roomId} | <strong>User:</strong> {userId}
          </div>
          {desynced && (
            <div className="desync-warning">Your editor is too far behind the remote stream to catch up!</div>
          )}
          <button onClick={() => setConnected(connected === undefined ? false : !connected)}>
            {connected === true || connected === undefined ? "Disconnect" : "Connect"}
          </button>
          {cursors &&
            Array.from(cursors.entries()).map(([odlUserId, cursor]) => {
              return <CursorElement userId={odlUserId} cursor={cursor} key={odlUserId} />;
            })}
        </>
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
          <DebugPlugin events={debug} />
        </div>
      </div>
    </LexicalComposer>
  );
}

const DebugPlugin = (props: { events: DebugEvent[] }) => {
  return (
    <pre
      style={{
        maxHeight: "200px",
        overflow: "scroll",
        background: "#222",
        color: "white",
        padding: "5px",
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0, marginLeft: "10px" }}>
        {props.events.map((e, i) => (
          <li key={i}>
            {e.direction === "up" ? "↑ " : e.direction === "down" ? "↓ " : ""}
            {e.type}
            {e.message && `|${e.message}`}
            {e.nestedMessages !== undefined &&
              e.nestedMessages.length > 0 &&
              "\n  ↳ " + e.nestedMessages.join("\n  ↳ ")}
          </li>
        ))}
      </ul>
    </pre>
  );
};
