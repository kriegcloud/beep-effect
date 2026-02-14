"use client";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  NodeContextMenuOption,
  NodeContextMenuPlugin,
  NodeContextMenuSeparator,
} from "@lexical/react/LexicalNodeContextMenuPlugin";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import {
  $getSelection,
  $isDecoratorNode,
  $isNodeSelection,
  $isRangeSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  type LexicalNode,
  PASTE_COMMAND,
} from "lexical";
import type { JSX } from "react";
import { useMemo } from "react";

export default function ContextMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const items = useMemo(() => {
    return [
      new NodeContextMenuOption(`Remove Link`, {
        $onSelect: () => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        },
        $showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon" />,
      }),
      new NodeContextMenuSeparator({
        $showOn: (node: LexicalNode) => $isLinkNode(node.getParent()),
      }),
      new NodeContextMenuOption(`Cut`, {
        $onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon page-break" />,
      }),
      new NodeContextMenuOption(`Copy`, {
        $onSelect: () => {
          editor.dispatchCommand(COPY_COMMAND, null);
        },
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon copy" />,
      }),
      new NodeContextMenuOption(`Paste`, {
        $onSelect: () => {
          F.pipe(
            Effect.tryPromise(() => navigator.clipboard.read()),
            Effect.flatMap((clipboardItems) =>
              Effect.gen(function* () {
                const maybeItem = A.head(clipboardItems);
                if (O.isNone(maybeItem)) {
                  return;
                }
                const item = maybeItem.value;

                const permission = yield* Effect.tryPromise(() =>
                  navigator.permissions.query({
                    // @ts-expect-error These types are incorrect.
                    name: "clipboard-read",
                  })
                );

                if (permission.state === "denied") {
                  alert("Not allowed to paste from clipboard.");
                  return;
                }

                const data = new DataTransfer();
                for (const type of item.types) {
                  const blob = yield* Effect.tryPromise(() => item.getType(type));
                  const dataString = yield* Effect.tryPromise(() => blob.text());
                  data.setData(type, dataString);
                }

                const event = new ClipboardEvent("paste", {
                  clipboardData: data,
                });

                editor.dispatchCommand(PASTE_COMMAND, event);
              })
            ),
            Effect.catchAll((error) => Effect.sync(() => console.error("Clipboard paste error:", error))),
            Effect.runPromise
          );
        },
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon paste" />,
      }),
      new NodeContextMenuOption(`Paste as Plain Text`, {
        $onSelect: () => {
          F.pipe(
            Effect.tryPromise(() =>
              navigator.permissions.query({
                // @ts-expect-error These types are incorrect.
                name: "clipboard-read",
              })
            ),
            Effect.flatMap((permission) =>
              Effect.gen(function* () {
                if (permission.state === "denied") {
                  alert("Not allowed to paste from clipboard.");
                  return;
                }

                const clipboardText = yield* Effect.tryPromise(() => navigator.clipboard.readText());

                const data = new DataTransfer();
                data.setData("text/plain", clipboardText);

                const event = new ClipboardEvent("paste", {
                  clipboardData: data,
                });
                editor.dispatchCommand(PASTE_COMMAND, event);
              })
            ),
            Effect.catchAll((error) => Effect.sync(() => console.error("Clipboard paste as plain text error:", error))),
            Effect.runPromise
          );
        },
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon" />,
      }),
      new NodeContextMenuSeparator(),
      new NodeContextMenuOption(`Delete Node`, {
        $onSelect: () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const currentNode = selection.anchor.getNode();
            const parents = currentNode.getParents();
            const maybeAncestor = A.get(parents, parents.length - 2);

            if (O.isSome(maybeAncestor)) {
              maybeAncestor.value.remove();
            }
          } else if ($isNodeSelection(selection)) {
            const selectedNodes = selection.getNodes();
            A.forEach(selectedNodes, (node) => {
              if ($isDecoratorNode(node)) {
                node.remove();
              }
            });
          }
        },
        disabled: false,
        icon: <i className="EditorTheme__contextMenuItemIcon clear" />,
      }),
    ];
  }, [editor]);

  return (
    <NodeContextMenuPlugin
      className="EditorTheme__contextMenu"
      itemClassName="EditorTheme__contextMenuItem"
      separatorClassName="EditorTheme__contextMenuSeparator"
      items={items}
    />
  );
}
