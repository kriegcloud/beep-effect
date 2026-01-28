"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@beep/todox/components/ui/dialog";
import { cn } from "@beep/todox/lib/utils";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getYChangeState,
  CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL,
  DIFF_VERSIONS_COMMAND__EXPERIMENTAL,
} from "@lexical/yjs";
import {
  $getNodeByKeyOrThrow,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
  TextNode,
} from "lexical";
import { useCallback, useEffect, useState } from "react";
import { snapshot as createSnapshot, PermanentUserData, type Snapshot, XmlElement } from "yjs";

interface Version {
  readonly name: string;
  readonly timestamp: number;
  readonly snapshot: Snapshot;
}

const COLORS = ["#4a90e288", "#bd10e088", "#d0021b88", "#8b572a88", "#41750588", "#f5a62388"];

type User = string; // username

export const SHOW_VERSIONS_COMMAND: LexicalCommand<void> = createCommand("SHOW_VERSIONS_COMMAND");

export function VersionsPlugin({ id }: { id: string }) {
  const [editor] = useLexicalComposerContext();
  const { name: username, yjsDocMap } = useCollaborationContext();
  const yDoc = yjsDocMap.get(id);

  const [isDiffMode, setIsDiffMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  const [pudInitialised, setPudInitialised] = useState(false);

  useEffect(
    () =>
      mergeRegister(
        editor.registerCommand(
          SHOW_VERSIONS_COMMAND,
          () => {
            setShowModal(true);
            return false;
          },
          COMMAND_PRIORITY_EDITOR
        ),
        editor.registerCommand(
          DIFF_VERSIONS_COMMAND__EXPERIMENTAL,
          () => {
            editor.setEditable(false);
            setIsDiffMode(true);
            return false;
          },
          COMMAND_PRIORITY_CRITICAL
        ),
        editor.registerCommand(
          CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL,
          () => {
            editor.setEditable(true);
            setIsDiffMode(false);
            return false;
          },
          COMMAND_PRIORITY_CRITICAL
        ),
        editor.registerEditableListener((isEditable) => {
          if (isEditable && isDiffMode) {
            editor.dispatchCommand(CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL, undefined);
          }
        })
      ),
    [editor, isDiffMode]
  );

  useEffect(() => {
    if (pudInitialised || !yDoc) {
      return;
    }

    const root = yDoc.get("root-v2", XmlElement);
    const handleChange: Parameters<typeof root.observeDeep>[0] = (_events, transaction) => {
      if (transaction.local) {
        // User's made a local change. Register PUD mapping.
        const permanentUserData = new PermanentUserData(yDoc);
        permanentUserData.setUserMapping(yDoc, yDoc.clientID, username);
        setPudInitialised(true);
      }
    };

    root.observeDeep(handleChange);
    return () => root.unobserveDeep(handleChange);
  }, [yDoc, username, pudInitialised]);

  useEffect(() => {
    if (!isDiffMode) {
      return;
    }
    return editor.registerMutationListener(
      TextNode,
      (nodes) => {
        const userToColor = new Map<User, string>();
        const getUserColor = (user: User): string => {
          if (userToColor.has(user)) {
            return userToColor.get(user)!;
          }
          const color = COLORS[userToColor.size % COLORS.length]!;
          userToColor.set(user, color);
          return color;
        };
        editor.getEditorState().read(() => {
          for (const [nodeKey, mutation] of nodes.entries()) {
            if (mutation === "destroyed") {
              continue;
            }
            const node = $getNodeByKeyOrThrow<TextNode>(nodeKey);
            const ychange = $getYChangeState<User>(node);
            const element = editor.getElementByKey(nodeKey);
            if (!ychange || !element) {
              continue;
            }
            const { type, user: changeUser } = ychange;
            if (!changeUser) {
              continue;
            }
            const color = getUserColor(changeUser);
            switch (type) {
              case "removed":
                element.style.color = color;
                element.style.textDecoration = "line-through";
                break;
              case "added":
                element.style.backgroundColor = color;
                break;
              default:
              // no change
            }
          }
        });
      },
      { skipInitialization: true }
    );
  }, [editor, isDiffMode]);

  const handleAddVersion = useCallback(() => {
    if (!yDoc) {
      return;
    }

    const now = Date.now();
    setVersions((prevVersions) => [
      ...prevVersions,
      {
        name: `Snapshot ${new Date(now).toLocaleString()}`,
        snapshot: createSnapshot(yDoc),
        timestamp: now,
      },
    ]);
  }, [setVersions, yDoc]);

  if (!showModal) {
    return null;
  }

  return (
    <VersionsModal
      versions={versions}
      isDiffMode={isDiffMode}
      onAddVersion={handleAddVersion}
      onClose={() => setShowModal(false)}
    />
  );
}

function VersionsModal({
  versions,
  isDiffMode,
  onAddVersion,
  onClose,
}: {
  readonly versions: Version[];
  readonly isDiffMode: boolean;
  readonly onAddVersion: () => void;
  readonly onClose: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 min-w-[320px]">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onAddVersion}>
              + Add snapshot
            </Button>
            {isDiffMode && (
              <Button
                variant="outline"
                onClick={() => {
                  editor.dispatchCommand(CLEAR_DIFF_VERSIONS_COMMAND__EXPERIMENTAL, undefined);
                  onClose();
                }}
              >
                Exit compare view
              </Button>
            )}
          </div>

          {/* Version list */}
          <div className="border border-border rounded max-h-[300px] overflow-y-auto">
            {versions.length === 0 ? (
              <button
                type="button"
                className="flex items-center justify-between bg-background border-none border-b border-border cursor-default text-muted-foreground italic py-3 px-4 w-full"
                disabled={true}
              >
                Add a snapshot to get started
              </button>
            ) : (
              versions.map((version, idx) => {
                const isSelected = selectedVersion === idx;

                return (
                  <button
                    type="button"
                    key={version.name}
                    onClick={() => setSelectedVersion(idx)}
                    className={cn(
                      "flex items-center justify-between bg-background border-none border-b border-border cursor-pointer py-3 px-4 w-full",
                      "hover:bg-muted disabled:text-muted-foreground disabled:italic disabled:cursor-default",
                      isSelected && "bg-blue-100 dark:bg-blue-900/30"
                    )}
                  >
                    Snapshot at {new Date(version.timestamp).toLocaleString()}
                  </button>
                );
              })
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              editor.dispatchCommand(DIFF_VERSIONS_COMMAND__EXPERIMENTAL, {
                prevSnapshot: versions[selectedVersion!]!.snapshot,
              });
              onClose();
            }}
            disabled={selectedVersion === null}
            className="self-center"
          >
            Show changes since selected version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
