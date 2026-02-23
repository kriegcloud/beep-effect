import { filesAtom, moveFilesAtom, selectedFilesAtom } from "@beep/shared-client/atom";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Banner } from "@beep/ui/components/banner";
import { Button } from "@beep/ui/components/button";
import { Dialog } from "@beep/ui/components/dialog";
import { cn } from "@beep/ui-core/utils";
import { Result, useAtom, useAtomValue } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import { Check, Folder, FolderOpen } from "lucide-react";
import React from "react";

type MoveFilesDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const MoveFilesDialog: React.FC<MoveFilesDialogProps> = ({ open, onOpenChange }) => {
  const selection = useAtomValue(selectedFilesAtom);
  const filesResult = useAtomValue(filesAtom);
  const [moveResult, moveFiles] = useAtom(moveFilesAtom, { mode: "promiseExit" });
  const [selectedDestination, setSelectedDestination] = React.useState<
    SharedEntityIds.FolderId.Type | null | undefined
  >(undefined);

  const folders = React.useMemo(
    () =>
      Result.match(filesResult, {
        onSuccess: ({ value: { folders } }) => folders,
        onFailure: () => [],
        onInitial: () => [],
      }),
    [filesResult]
  );

  const handleMove = () => {
    if (selectedDestination === undefined) return;

    moveFiles({
      fileIds: selection.fileIds,
      folderId: selectedDestination,
    }).then((result) => {
      if (result._tag === "Success") {
        onOpenChange(false);
        setSelectedDestination(undefined);
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedDestination(undefined);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Move {selection.fileIds.length} file(s)</Dialog.Title>
          <Dialog.Description>Select a destination folder to move your files to.</Dialog.Description>
        </Dialog.Header>

        <div className="space-y-3">
          {moveResult.waiting && (
            <Banner variant="loading">
              <Banner.Content>
                <Banner.Title>Moving {selection.fileIds.length} file(s)...</Banner.Title>
              </Banner.Content>
            </Banner>
          )}

          {!moveResult.waiting && Result.isFailure(moveResult) && (
            <Banner variant="destructive">
              <Banner.Content>
                <Banner.Title>Failed to move files</Banner.Title>
                <Banner.Description className="line-clamp-2 whitespace-pre-wrap">
                  {Cause.pretty(moveResult.cause)}
                </Banner.Description>
              </Banner.Content>
            </Banner>
          )}

          <div className="max-h-80 overflow-y-auto rounded-md border">
            <button
              type="button"
              onClick={() => setSelectedDestination(null)}
              className={cn(
                "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent border-b",
                selectedDestination === null && "bg-primary/10 border-l-4 border-l-primary"
              )}
            >
              <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 font-medium">Root (no folder)</span>
              {selectedDestination === null ? <Check className="h-5 w-5 text-primary" /> : null}
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedDestination(folder.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent border-b last:border-b-0",
                  selectedDestination === folder.id && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <Folder className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex-1">{folder.name}</span>
                {selectedDestination === folder.id ? <Check className="h-5 w-5 text-primary" /> : null}
              </button>
            ))}
          </div>
        </div>

        <Dialog.Footer>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={moveResult.waiting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleMove} disabled={selectedDestination === undefined || moveResult.waiting}>
            {moveResult.waiting ? "Moving..." : "Move"}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
